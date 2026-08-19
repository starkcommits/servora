import frappe
from frappe import _
from frappe.model.workflow import apply_workflow
from razorpay_integration.api import get_razorpay_checkout_url


def _get_customer_for_user(user=None):
	if not user:
		user = frappe.session.user
	if user == "Guest":
		return None
	customer_name = frappe.db.get_value("Customer", {"user": user}, "name")
	if customer_name:
		return frappe.get_doc("Customer", customer_name)
	return None


@frappe.whitelist()
def get_or_create_cart():
	"""Fetch active Draft order for the logged-in customer, or create one if none exists."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to access your cart."), frappe.AuthenticationError)

	draft_orders = frappe.get_all(
		"Order",
		filters={"owner": frappe.session.user, "workflow_state": "Draft"},
		fields=["name"],
		order_by="creation desc",
		limit=1
	)

	if draft_orders:
		return frappe.get_doc("Order", draft_orders[0].name)

	# Create a new Draft order
	order = frappe.get_doc({
		"doctype": "Order",
		"items": []
	})
	order.insert(ignore_permissions=True)
	return order


@frappe.whitelist()
def add_to_cart(service_package, order_id=None):
	"""Add a unique service package to the customer's draft order."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to add items to cart."), frappe.AuthenticationError)

	if not frappe.db.exists("Service Package", service_package):
		frappe.throw(_("Service Package {0} does not exist.").format(service_package))

	package_doc = frappe.get_doc("Service Package", service_package)
	if not package_doc.is_active:
		frappe.throw(_("Service Package {0} is currently inactive.").format(service_package))

	order = None
	if order_id and frappe.db.exists("Order", order_id):
		order = frappe.get_doc("Order", order_id)
		if order.owner != frappe.session.user or order.workflow_state != "Draft":
			order = None

	if not order:
		order = get_or_create_cart()

	# Check uniqueness
	for item in order.items:
		if item.service_package == service_package:
			# Already in cart
			return order

	order.append("items", {
		"doctype": "Cart Item",
		"service_package": service_package
	})

	# Reset stale payment_mode value that no longer matches allowed options
	if order.payment_mode not in ("", "COD", "UPI"):
		order.payment_mode = ""

	order.save()
	return order


@frappe.whitelist()
def remove_from_cart(service_package, order_id=None):
	"""Remove a service package from the customer's draft order."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to modify your cart."), frappe.AuthenticationError)

	order = None
	if order_id and frappe.db.exists("Order", order_id):
		order = frappe.get_doc("Order", order_id)
	else:
		draft_orders = frappe.get_all(
			"Order",
			filters={"owner": frappe.session.user, "workflow_state": "Draft"},
			fields=["name"],
			order_by="creation desc",
			limit=1
		)
		if draft_orders:
			order = frappe.get_doc("Order", draft_orders[0].name)

	if not order or order.owner != frappe.session.user or order.workflow_state != "Draft":
		frappe.throw(_("Draft order not found."))

	# Filter out matching items
	order.items = [item for item in order.items if item.service_package != service_package and item.name != service_package]

	# Reset stale payment_mode value
	if order.payment_mode not in ("", "COD", "UPI"):
		order.payment_mode = ""

	order.save()
	return order


@frappe.whitelist()
def set_order_schedule(order_id, scheduled_at):
	"""Set the scheduled_at datetime for the draft order."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to schedule your order."), frappe.AuthenticationError)

	order = frappe.get_doc("Order", order_id)
	if order.owner != frappe.session.user:
		frappe.throw(_("You are not authorized to edit this order."), frappe.PermissionError)

	if order.workflow_state != "Draft":
		frappe.throw(_("Schedule can only be updated for Draft orders."))

	order.scheduled_at = scheduled_at
	order.save()
	return order


def _validate_customer_serviceability(user):
	customer = _get_customer_for_user(user)
	if not customer:
		frappe.throw(_("Customer profile not found."))
	
	current_addr = next((a for a in customer.address if a.is_current), None)
	if not current_addr and len(customer.address) > 0:
		current_addr = customer.address[0]

	if not current_addr:
		frappe.throw(_("Please add a service address before placing the order."))
	
	if not current_addr.pincode:
		frappe.throw(_("Please update your address with a valid pincode."))
		
	is_serviceable = frappe.db.get_value("Serviceable Pincode", {"pincode": current_addr.pincode, "is_active": 1}, "name")
	if not is_serviceable:
		frappe.throw(_("Sorry, your current address (Pincode: {0}) is outside our serviceable area. We are expanding soon!").format(current_addr.pincode))


@frappe.whitelist()
def confirm_cod_order(order_id):
	"""Place an order using Cash On Delivery and transition to Submitted (which triggers create_bookings)."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to place an order."), frappe.AuthenticationError)

	order = frappe.get_doc("Order", order_id)
	if order.owner != frappe.session.user:
		frappe.throw(_("You are not authorized to place this order."), frappe.PermissionError)

	if order.workflow_state != "Draft":
		frappe.throw(_("Order is already placed or not in Draft state."))

	if not order.items:
		frappe.throw(_("Your cart is empty."))

	if not order.scheduled_at:
		frappe.throw(_("Please select a service slot before placing the order."))

	_validate_customer_serviceability(order.owner)

	order.payment_mode = "COD"
	order.save()

	# Transition workflow state: Draft -> Submitted via 'Cash On Delivery'
	# This triggers order.create_bookings() which creates per-service Booking + Payment docs
	order = apply_workflow(order, "Cash On Delivery")

	return {
		"status": "success",
		"order_id": order.name,
		"workflow_state": order.workflow_state,
		"grand_total": order.grand_total,
		"scheduled_at": order.scheduled_at,
		"payment_mode": "COD"
	}


@frappe.whitelist()
def make_payment(order_id):
	"""Initiate UPI / Razorpay payment for a Draft or Payment Pending order."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to make a payment."), frappe.AuthenticationError)

	order = frappe.get_doc("Order", order_id)
	if order.owner != frappe.session.user:
		frappe.throw(_("You are not authorized to access this order."), frappe.PermissionError)

	if order.workflow_state not in ["Draft", "Payment Pending"]:
		frappe.throw(_("Payment can only be made for orders in Draft or Payment Pending state."))

	if not order.items:
		frappe.throw(_("Your cart is empty."))

	if not order.scheduled_at:
		frappe.throw(_("Please select a service slot."))

	_validate_customer_serviceability(order.owner)

	if order.workflow_state == "Draft":
		order.payment_mode = "UPI"
		order.save()
		order = apply_workflow(order, "Pay Now")

	# Check if a pending UPI payment already exists
	existing_payment = frappe.db.exists(
		"Payment",
		{
			"order_id": order.name,
			"payment_method": "UPI",
			"payment_status": "Pending"
		}
	)

	if existing_payment:
		payment = frappe.get_doc("Payment", existing_payment)
	else:
		payment = frappe.get_doc({
			"doctype": "Payment",
			"order_id": order.name,
			"amount": order.grand_total,
			"payment_method": "UPI",
			"payment_status": "Pending"
		})
		payment.insert(ignore_permissions=True)

	# Fetch customer info safely
	customer = _get_customer_for_user(order.owner)
	payer_name = f"{customer.get('first_name') or ''} {customer.get('last_name') or ''}".strip() if customer else order.owner
	if not payer_name:
		payer_name = "Servora Customer"
	payer_email = (customer.get("email") if customer else None) or order.owner or frappe.session.user

	# Generate Razorpay checkout URL
	payment_url = get_razorpay_checkout_url(
		amount=order.grand_total,
		title="Servora",
		description=f"Payment for Order {order.name}",
		payer_name=payer_name or "Servora Customer",
		payer_email=payer_email or frappe.session.user,
		doctype=order.doctype,
		name=order.name,
		order_id=order.name
	)

	return {
		"status": "success",
		"order_id": order.name,
		"payment_url": payment_url,
		"workflow_state": order.workflow_state,
		"grand_total": order.grand_total
	}


@frappe.whitelist()
def customer_confirm_order(order_id):
	"""Customer confirms completed service."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to confirm order."), frappe.AuthenticationError)

	order = frappe.get_doc("Order", order_id)
	if order.owner != frappe.session.user:
		frappe.throw(_("You are not authorized to confirm this order."), frappe.PermissionError)

	if order.workflow_state != "Completed":
		frappe.throw(_("Order must be in Completed state to confirm."))

	order = apply_workflow(order, "Customer Confirmed")
	return {
		"status": "success",
		"order_id": order.name,
		"workflow_state": order.workflow_state
	}


@frappe.whitelist()
def get_customer_profile():
	"""Get current customer profile with booking statistics."""
	if frappe.session.user == "Guest":
		return None

	customer = _get_customer_for_user()
	user = frappe.get_doc("User", frappe.session.user)

	# Stats are now based on Bookings (one per service), not Orders
	bookings = frappe.get_all(
		"Booking",
		filters={"customer_id": customer.name if customer else "__nonexistent__"},
		fields=["name", "workflow_state"]
	) if customer else []

	total_bookings = len(bookings)
	active_bookings = len([b for b in bookings if b.get("workflow_state") in [
		"Confirmed", "Assigned", "On The Way", "Started"
	]])
	completed_bookings = len([b for b in bookings if b.get("workflow_state") in [
		"Completed", "Customer Confirmed"
	]])
	saved_addresses_count = len(customer.address) if (customer and getattr(customer, "address", None)) else 0

	return {
		"user": {
			"name": user.name,
			"email": user.email,
			"first_name": user.first_name,
			"last_name": user.last_name,
			"mobile_no": user.mobile_no
		},
		"customer": customer.as_dict() if customer else None,
		"stats": {
			"total_bookings": total_bookings,
			"active_bookings": active_bookings,
			"completed_bookings": completed_bookings,
			"saved_addresses_count": saved_addresses_count
		}
	}


@frappe.whitelist()
def get_customer_bookings():
	"""Get all bookings for the logged-in customer."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to view bookings."), frappe.AuthenticationError)

	customer = _get_customer_for_user()
	if not customer:
		return []

	bookings = frappe.get_all(
		"Booking",
		filters={"customer_id": customer.name},
		fields=[
			"name", "order_id", "service_package", "workflow_state",
			"scheduled_at", "grand_total", "discounted_price", "platform_fee",
			"base_price", "paid", "creation"
		],
		order_by="creation desc",
		limit=200
	)

	# Enrich with service package name
	for b in bookings:
		pkg = frappe.db.get_value(
			"Service Package", b["service_package"],
			["pack_name", "package_image"], as_dict=True
		) if b.get("service_package") else None
		b["pack_name"] = pkg.pack_name if pkg else b.get("service_package", "")
		b["package_image"] = pkg.package_image if pkg else None

	return bookings


@frappe.whitelist()
def get_booking_details(booking_id):
	"""Get full details of a single booking including service execution."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to view booking details."), frappe.AuthenticationError)

	customer = _get_customer_for_user()
	if not customer:
		frappe.throw(_("Customer profile not found."))

	booking = frappe.get_doc("Booking", booking_id)
	if booking.customer_id != customer.name:
		frappe.throw(_("You are not authorized to view this booking."), frappe.PermissionError)

	# Get service package info
	pkg = frappe.db.get_value(
		"Service Package", booking.service_package,
		["pack_name", "package_image", "service_name"], as_dict=True
	) if booking.service_package else None

	# Get service execution record (for rating/review and photos)
	execution = frappe.get_all(
		"Service Execution",
		filters={"booking_id": booking.name},
		fields=[
			"name", "customer_rating", "customer_note",
			"before_photo1", "before_photo2", "before_photo3",
			"after_photo1", "after_photo2", "after_photo3"
		],
		limit=1
	)

	# Get payment info
	payment = frappe.get_all(
		"Payment",
		filters={"booking_id": booking.name},
		fields=["name", "payment_method", "payment_status", "amount"],
		limit=1
	)

	return {
		"booking": booking.as_dict(),
		"pack_name": pkg.pack_name if pkg else booking.service_package,
		"package_image": pkg.package_image if pkg else None,
		"service_name": pkg.service_name if pkg else None,
		"execution": execution[0] if execution else None,
		"payment": payment[0] if payment else None
	}


@frappe.whitelist()
def submit_booking_review(booking_id, rating, note=None):
	"""Submit customer rating and note for a completed booking's service execution."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to submit a review."), frappe.AuthenticationError)

	customer = _get_customer_for_user()
	if not customer:
		frappe.throw(_("Customer profile not found."))

	booking = frappe.get_doc("Booking", booking_id)
	if booking.customer_id != customer.name:
		frappe.throw(_("You are not authorized to review this booking."), frappe.PermissionError)

	execution = frappe.get_all(
		"Service Execution",
		filters={"booking_id": booking_id},
		fields=["name"],
		limit=1
	)

	if not execution:
		frappe.throw(_("Service execution record not found for this booking."))

	exec_doc = frappe.get_doc("Service Execution", execution[0].name)
	exec_doc.customer_rating = float(rating)
	if note:
		exec_doc.customer_note = note
	exec_doc.save(ignore_permissions=True)

	return {
		"status": "success",
		"execution_id": exec_doc.name,
		"rating": exec_doc.customer_rating
	}


@frappe.whitelist(allow_guest=True)
def get_available_slots(date=None):
	"""Return available service time slots."""
	return [
		{"id": "09:00", "label": "09:00 AM - 11:00 AM", "time": "09:00:00", "available": True},
		{"id": "11:00", "label": "11:00 AM - 01:00 PM", "time": "11:00:00", "available": True},
		{"id": "14:00", "label": "02:00 PM - 04:00 PM", "time": "14:00:00", "available": True},
		{"id": "16:00", "label": "04:00 PM - 06:00 PM", "time": "16:00:00", "available": True},
		{"id": "18:00", "label": "06:00 PM - 08:00 PM", "time": "18:00:00", "available": True},
		{"id": "20:00", "label": "08:00 PM - 10:00 PM", "time": "20:00:00", "available": True}
	]


@frappe.whitelist()
def save_customer_address(houseflat_no, location, pincode=None, saved_as="Home", is_current=1, address_id=None):
	"""Save or update customer address with pincode validation."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to manage addresses."), frappe.AuthenticationError)

	# Validate Pincode Serviceability
	if not pincode:
		frappe.throw(_("Pincode is required."))
	is_serviceable = frappe.db.get_value("Serviceable Pincode", {"pincode": str(pincode).strip(), "is_active": 1}, "name")
	if not is_serviceable:
		frappe.throw(_("Sorry, we currently do not serve the selected location (Pincode: {0}). We are expanding soon!").format(pincode))

	customer = _get_customer_for_user()
	if not customer:
		user_doc = frappe.get_doc("User", frappe.session.user)
		mobile = user_doc.mobile_no or user_doc.phone or frappe.session.user
		customer = frappe.get_doc({
			"doctype": "Customer",
			"user": frappe.session.user,
			"first_name": user_doc.first_name or "Customer",
			"last_name": user_doc.last_name or "",
			"email": user_doc.email,
			"mobile_number": mobile,
			"status": "Active"
		})
		customer.insert(ignore_permissions=True)

	is_current_val = int(is_current) if is_current is not None else 1

	if is_current_val == 1:
		for addr in customer.address:
			addr.is_current = 0

	target_addr = None
	if address_id:
		for addr in customer.address:
			if addr.name == address_id:
				target_addr = addr
				break

	if target_addr:
		target_addr.houseflat_no = houseflat_no
		target_addr.location = location
		target_addr.pincode = str(pincode).strip()
		target_addr.saved_as = saved_as or "Home"
		target_addr.is_current = is_current_val
	else:
		customer.append("address", {
			"doctype": "Customer Address",
			"houseflat_no": houseflat_no,
			"location": location,
			"pincode": str(pincode).strip(),
			"saved_as": saved_as or "Home",
			"is_current": is_current_val
		})

	# Ensure at least one address is current if list not empty
	has_current = any(addr.is_current == 1 for addr in customer.address)
	if not has_current and customer.address:
		customer.address[0].is_current = 1

	customer.save(ignore_permissions=True)
	return {
		"status": "success",
		"customer": customer.as_dict()
	}


@frappe.whitelist()
def set_current_customer_address(address_id):
	"""Set specific address as default/current."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to manage addresses."), frappe.AuthenticationError)

	customer = _get_customer_for_user()
	if not customer:
		frappe.throw(_("Customer profile not found."))

	found = False
	for addr in customer.address:
		if addr.name == address_id:
			addr.is_current = 1
			found = True
		else:
			addr.is_current = 0

	if not found:
		frappe.throw(_("Address {0} not found.").format(address_id))

	customer.save(ignore_permissions=True)
	return {
		"status": "success",
		"customer": customer.as_dict()
	}


@frappe.whitelist()
def delete_customer_address(address_id):
	"""Remove a saved address from customer profile."""
	if frappe.session.user == "Guest":
		frappe.throw(_("Please log in to manage addresses."), frappe.AuthenticationError)

	customer = _get_customer_for_user()
	if not customer:
		frappe.throw(_("Customer profile not found."))

	new_addresses = [addr for addr in customer.address if addr.name != address_id]
	customer.address = new_addresses

	# Ensure at least one is current if addresses remain
	has_current = any(addr.is_current == 1 for addr in customer.address)
	if not has_current and customer.address:
		customer.address[0].is_current = 1

	customer.save(ignore_permissions=True)
	return {
		"status": "success",
		"customer": customer.as_dict()
	}


def _clean_mobile(mobile_number):
	import re
	if not mobile_number:
		return ""
	cleaned = re.sub(r"[^\d]", "", str(mobile_number))
	if len(cleaned) > 10 and cleaned.startswith("91"):
		cleaned = cleaned[2:]
	return cleaned[-10:] if len(cleaned) >= 10 else cleaned


@frappe.whitelist(allow_guest=True)
def send_signup_otp(mobile_number):
	"""Send a 6-digit verification OTP (fixed/demo: 123456)."""
	clean_mobile = _clean_mobile(mobile_number)
	if len(clean_mobile) != 10:
		frappe.throw(_("Please enter a valid 10-digit mobile number."))

	existing_customer = frappe.db.get_value("Customer", {"mobile_number": clean_mobile}, ["name", "first_name"], as_dict=True)
	is_existing = bool(existing_customer)

	# Fixed/demo OTP for development/testing
	otp = "123456"
	frappe.cache().set_value(f"signup_otp_{clean_mobile}", otp, expires_in_sec=600)

	return {
		"status": "success",
		"mobile_number": clean_mobile,
		"is_existing": is_existing,
		"otp": otp,
		"message": f"OTP sent to +91 {clean_mobile}"
	}


@frappe.whitelist(allow_guest=True)
def verify_signup_otp(mobile_number, otp):
	"""Verify the OTP entered by user."""
	clean_mobile = _clean_mobile(mobile_number)
	clean_otp = str(otp).strip()

	cached_otp = frappe.cache().get_value(f"signup_otp_{clean_mobile}")
	if clean_otp in ["123456", "1234"] or (cached_otp and clean_otp == cached_otp):
		return {
			"status": "success",
			"verified": True,
			"mobile_number": clean_mobile
		}

	frappe.throw(_("Invalid OTP. Please enter the 6-digit verification OTP (123456)."))


@frappe.whitelist(allow_guest=True)
def complete_signup(mobile_number, otp, password, first_name=None, last_name=None):
	"""Complete signup: set password, create Customer & User, and establish session."""
	from frappe.utils.password import update_password

	clean_mobile = _clean_mobile(mobile_number)
	if len(clean_mobile) != 10:
		frappe.throw(_("Please enter a valid 10-digit mobile number."))

	if not password or len(password) < 6:
		frappe.throw(_("Password must be at least 6 characters long."))

	clean_otp = str(otp).strip()
	cached_otp = frappe.cache().get_value(f"signup_otp_{clean_mobile}")
	if clean_otp not in ["123456", "1234"] and clean_otp != cached_otp:
		frappe.throw(_("Invalid or expired OTP. Please try again."))

	email = f"{clean_mobile}@servio.com"

	customer_name = frappe.db.get_value("Customer", {"mobile_number": clean_mobile}, "name")
	if not customer_name:
		customer = frappe.get_doc({
			"doctype": "Customer",
			"mobile_number": clean_mobile,
			"first_name": first_name or "Customer",
			"last_name": last_name or "",
			"status": "Active"
		})
		customer.insert(ignore_permissions=True)
		user_name = customer.user
	else:
		customer = frappe.get_doc("Customer", customer_name)
		if first_name:
			customer.first_name = first_name
		if last_name is not None:
			customer.last_name = last_name
		customer.save(ignore_permissions=True)
		user_name = customer.user

	# Set/update password
	update_password(user_name, password)
	frappe.db.commit()

	# Auto login session
	if hasattr(frappe.local, "login_manager"):
		frappe.local.login_manager.login_as(user_name)

	return {
		"status": "success",
		"user": user_name,
		"mobile_number": clean_mobile,
		"customer_name": f"{customer.first_name} {customer.last_name or ''}".strip(),
		"message": "Account created and signed in successfully"
	}


@frappe.whitelist(allow_guest=True)
def resolve_login_user(identifier):
	"""Helper to resolve mobile number or email to username."""
	if not identifier:
		return {"username": ""}
	clean = identifier.strip()
	if "@" in clean:
		return {"username": clean}

	clean_mobile = _clean_mobile(clean)
	if len(clean_mobile) == 10:
		user_by_mobile = frappe.db.get_value("User", {"mobile_no": clean_mobile}, "name")
		if user_by_mobile:
			return {"username": user_by_mobile}
		customer_user = frappe.db.get_value("Customer", {"mobile_number": clean_mobile}, "user")
		if customer_user:
			return {"username": customer_user}
		return {"username": f"{clean_mobile}@servio.com"}

	return {"username": clean}
@frappe.whitelist(allow_guest=True)
def get_pwa_sw():
	"""Serve the Service Worker with the correct Service-Worker-Allowed header."""
	import os
	from werkzeug.wrappers import Response
	
	sw_path = frappe.get_app_path("servora", "public", "frontend", "sw.js")
	data = "/* Service Worker not found or not built yet */"
	if os.path.exists(sw_path):
		with open(sw_path, "r") as f:
			data = f.read()
			
	return Response(
		data,
		mimetype="application/javascript",
		headers={"Service-Worker-Allowed": "/"}
	)

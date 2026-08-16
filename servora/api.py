import frappe
from razorpay_integration.api import get_razorpay_checkout_url


@frappe.whitelist()
def place_order(method, order_id):
	order = frappe.get_doc("Order", order_id)

	if order.status == "Submitted":
		return {
			"status": "already_submitted",
			"order_id": order.name
		}

	if not order.items:
		frappe.throw("Your cart is empty.")

	if not order.scheduled_at:
		frappe.throw("Please select a service slot.")

	if method == "COD":

		order.payment_method = "COD"
		order.status = "Submitted"
		order.payment_status = "Pending"
		order.save(ignore_permissions=True)

		payment = frappe.get_doc({
			"doctype": "Payment",
			"order_id": order.name,
			"amount": order.grand_total,
			"payment_method": "COD",
			"payment_status": "Pending"
		})

		payment.insert(ignore_permissions=True)

		create_bookings(order)

		return {
			"status": "success",
			"order_id": order.name
		}

	elif method == "UPI":

		order.payment_method = "UPI"
		order.status = "Pending"
		order.payment_status = "Pending"
		order.save(ignore_permissions=True)

		payment_url = make_payment(order.name)

		return {
			"status": "payment_required",
			"order_id": order.name,
			"payment_url": payment_url
		}

	else:
		frappe.throw("Invalid payment method.")


@frappe.whitelist()
def make_payment(order_id):
	order = frappe.get_doc("Order", order_id)

	if order.status != "Pending":
		frappe.throw("Order is not pending for payment.")

	if not order.items:
		frappe.throw("Order does not contain any services.")

	if not order.scheduled_at:
		frappe.throw("Please select a service slot.")

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

	# Generate Razorpay checkout URL
	url = get_razorpay_checkout_url(
		amount=order.grand_total,
		title="Servora",
		description=f"Payment for Order {order.name}",
		payer_name=order.customer_name,
		payer_email=order.customer_id,
		doctype=order.doctype,
		name=order.name,
		order_id=order.name
	)

	return url


def create_bookings(order):
	for item in order.items:
		if item.booking_id:
			continue

		booking = frappe.get_doc({
			"doctype": "Booking",
			"order_id": order.name,
			"service_name": item.service_name,
			"service_package": item.service_package,
			"scheduled_at": order.scheduled_at,
			"workflow_state": "Pending"
		})

		booking.insert(ignore_permissions=True)

		item.booking_id = booking.name

	order.save(ignore_permissions=True)
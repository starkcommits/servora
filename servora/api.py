import frappe
from razorpay_integration.api import get_razorpay_checkout_url
from frappe.model.workflow import apply_workflow


@frappe.whitelist()
def make_payment(order_id):
	order = frappe.get_doc("Order", order_id)

    if order.workflow_state != "Draft":
        frappe.throw("Payment can only be made for orders in Draft state.")
    
    if not order.items:
		frappe.throw("Your cart is empty.")

	if not order.scheduled_at:
		frappe.throw("Please select a service slot.")
    
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

	# Generate Razorpay checkout URL
	return get_razorpay_checkout_url(
		amount=order.grand_total,
		title="Servora",
		description=f"Payment for Order {order.name}",
		payer_name=order.customer_name,
		payer_email=order.customer_id,
		doctype=order.doctype,
		name=order.name,
		order_id=order.name
	)
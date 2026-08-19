# Copyright (c) 2026, Servora and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Order(Document):
	def validate(self):
		self.calculate_totals()
		self.validate_package_uniqueness()

	def on_update(self):
		frappe.publish_realtime("order_updated", {"order_id": self.name}, user=self.owner)
		if self.has_value_changed("workflow_state"):
			if self.workflow_state == "Confirmed":
				self.create_bookings()

	def validate_package_uniqueness(self):
		seen_packages = set()
		for item in self.items:
			if item.service_package:
				if item.service_package in seen_packages:
					frappe.throw(f"Package {item.service_package} is already added to the order.")
				seen_packages.add(item.service_package)

	def calculate_totals(self):
		subtotal = 0

		for item in self.items:
			item.amount = item.discounted_price
			subtotal += item.amount

		self.subtotal = subtotal
		self.platform_fee = self.get_platform_fee()
		self.grand_total = subtotal + self.platform_fee
	
	def get_platform_fee(self):
		config = frappe.get_single("Global Config")

		return config.platform_fee or 0

	def create_bookings(self):

		for item in self.items:
			if not item.service_package:
				continue

			if frappe.db.exists(
				"Booking",
				{
					"order_id": self.name,
					"service_package": item.service_package
				}
			):
				continue

			allocated_ratio = item.discounted_price/self.subtotal
			platform_fee = round(self.platform_fee * allocated_ratio, 2)
			
			grand_total = item.discounted_price + platform_fee
			
			booking = frappe.get_doc({
				"doctype": "Booking",
				"service_package": item.service_package,
				"base_price": item.base_price,
				"discounted_price": item.discounted_price,
				"platform_fee": platform_fee,
				"grand_total": grand_total,
				"payment_mode": self.payment_mode,
				"paid": self.paid,
				"scheduled_at": self.scheduled_at,
				"customer_id": self.owner,
				"order_id": self.name
			})
			booking.insert(ignore_permissions=True)

			if self.payment_mode == "COD":
				frappe.get_doc({
					"doctype": "Payment",
					"order_id": self.name,
					"booking_id": booking.name,
					"customer_id": self.owner,
					"amount": booking.grand_total,
					"payment_method": "COD",
					"payment_status": "Pending"
				}).insert(ignore_permissions=True)
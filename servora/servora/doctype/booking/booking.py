# Copyright (c) 2026, Servora and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Booking(Document):
	def after_insert(self):
		frappe.get_doc({
			"doctype": "Service Execution",
			"booking_id": self.name,
			"customer_id": self.customer_id
		}).insert(ignore_permissions=True)

	def on_update(self):
		frappe.publish_realtime("booking_updated", {"booking_id": self.name}, user=self.customer_id)
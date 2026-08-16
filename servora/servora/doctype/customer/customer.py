# Copyright (c) 2026, Servora and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address


class Customer(Document):
	def validate(self):
		if self.email:
			validate_email_address(self.email, throw=True)

		if(self.mobile_number and not self.mobile_number.isdigit()):
			frappe.throw("Mobile number must contain only digits.")

	def before_insert(self):
		self.status = "Active"
		if frappe.db.exists("User", {"mobile_no": self.mobile_number}):
			frappe.throw(f"User with mobile number {self.mobile_number} already exists.")

		user = frappe.get_doc({
			"doctype": "User",
			"first_name": self.first_name,
			"last_name": self.last_name,
			"mobile_no": self.mobile_number,
			"email": self.email or f"{self.mobile_number}@servio.com",
			"module_profile": "Servora"
		})
		user.insert(ignore_permissions=True)
		user.add_roles("Customer")

		self.user = user.name


# Copyright (c) 2026, Servora and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Order(Document):
	def validate(self):
		self.calculate_totals()
		
	def calculate_totals(self):
		subtotal = 0

		for item in self.items:
			item.amount = item.discounted_price
			subtotal += item.amount

		self.platform_fee = self.get_platform_fee()
		self.grand_total = subtotal + self.platform_fee

	def get_platform_fee(self):
		config = frappe.get_single("Global Config")

		return config.platform_fee or 0


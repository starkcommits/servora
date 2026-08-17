# Copyright (c) 2026, Servora and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Order(Document):
	def validate(self):
		self.calculate_totals()
		self.validate_package_uniqueness()

	def on_update(self):
		if self.has_value_changed("workflow_state"):
			if self.workflow_state == "Started":
				self.db_set("start_time", frappe.utils.now())
			elif self.workflow_state == "Completed":
				self.db_set("finish_time", frappe.utils.now())

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

		self.platform_fee = self.get_platform_fee()
		self.grand_total = subtotal + self.platform_fee
	
	def get_platform_fee(self):
		config = frappe.get_single("Global Config")

		return config.platform_fee or 0
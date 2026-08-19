import frappe
import os
from werkzeug.wrappers import Response

def get_context(context):
	sw_path = frappe.get_app_path("servora", "public", "frontend", "sw.js")
	data = "/* Service Worker not found or not built yet */"
	if os.path.exists(sw_path):
		with open(sw_path, "r") as f:
			data = f.read()

	response = Response(
		data,
		mimetype="application/javascript",
		headers={"Service-Worker-Allowed": "/"}
	)
	raise frappe.exceptions.RequestException(response=response)

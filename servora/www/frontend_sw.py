import frappe
import os

def get_context(context):
    frappe.response["headers"] = {"Service-Worker-Allowed": "/"}
    frappe.response["mimetype"] = "application/javascript"
    
    sw_path = frappe.get_app_path("servora", "public", "frontend", "sw.js")
    if os.path.exists(sw_path):
        with open(sw_path, "r") as f:
            frappe.response["data"] = f.read()
    else:
        frappe.response["data"] = "/* SW not found */"
    return context

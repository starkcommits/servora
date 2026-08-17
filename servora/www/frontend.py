import frappe
import os

no_cache = 1

def get_context(context):
	context.csrf_token = frappe.session.csrf_token
	context.boot = frappe.as_json(frappe.sessions.get())

	# Discover latest assets from public/frontend/assets
	assets_dir = frappe.get_app_path("servora", "public", "frontend", "assets")
	js_file = ""
	css_file = ""

	if os.path.exists(assets_dir):
		for f in os.listdir(assets_dir):
			if f.endswith(".js") and not js_file:
				js_file = f"/assets/servora/frontend/assets/{f}"
			elif f.endswith(".css") and not css_file:
				css_file = f"/assets/servora/frontend/assets/{f}"

	context.js_file = js_file
	context.css_file = css_file
	return context

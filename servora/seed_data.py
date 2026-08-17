import frappe

def run():
	packages = [
		{
			"pack_name": "Deep Kitchen Cleaning",
			"service_name": "Kitchen Cleaning",
			"base_price": 1299.0,
			"discount_price": 1099.0,
			"description": "Complete grease removal, chimney, countertop, tile and cabinet deep degreasing and sanitization.",
			"is_active": 1
		},
		{
			"pack_name": "Express Kitchen Cleaning",
			"service_name": "Kitchen Cleaning",
			"base_price": 799.0,
			"discount_price": 699.0,
			"description": "Quick surface cleaning, sink polishing, stove top cleaning and floor wipe.",
			"is_active": 1
		},
		{
			"pack_name": "1 BHK Full Home Deep Cleaning",
			"service_name": "Living & Bedroom Cleaning",
			"base_price": 2499.0,
			"discount_price": 2199.0,
			"description": "Comprehensive cleaning of 1 bedroom, hall, kitchen, bathroom with specialized machines and eco-friendly chemicals.",
			"is_active": 1
		},
		{
			"pack_name": "2 BHK Full Home Deep Cleaning",
			"service_name": "Living & Bedroom Cleaning",
			"base_price": 3499.0,
			"discount_price": 2999.0,
			"description": "Intensive deep cleaning of 2 bedrooms, hall, kitchen, 2 bathrooms with vacuuming and sanitization.",
			"is_active": 1
		},
		{
			"pack_name": "3 BHK Full Home Deep Cleaning",
			"service_name": "Living & Bedroom Cleaning",
			"base_price": 4499.0,
			"discount_price": 3899.0,
			"description": "Extensive deep cleaning of 3 bedrooms, hall, kitchen, 3 bathrooms with sofa and carpet vacuuming.",
			"is_active": 1
		},
		{
			"pack_name": "1 BHK Full Home Painting",
			"service_name": "Full Home Painting",
			"base_price": 14999.0,
			"discount_price": 12999.0,
			"description": "Premium wall painting with 2 coats of emulsion paint, wall sanding, primer and masking tape protection.",
			"is_active": 1
		},
		{
			"pack_name": "2 BHK Full Home Painting",
			"service_name": "Full Home Painting",
			"base_price": 22999.0,
			"discount_price": 19999.0,
			"description": "Complete interior wall painting for 2 BHK with expert color consultation and furniture covering.",
			"is_active": 1
		},
		{
			"pack_name": "Single Accent Wall Painting",
			"service_name": "Few Walls & Rooms Painting",
			"base_price": 2499.0,
			"discount_price": 1999.0,
			"description": "Texture or stencil designer accent wall painting with luxury metallic or matte finish.",
			"is_active": 1
		},
		{
			"pack_name": "Single Room Painting",
			"service_name": "Few Walls & Rooms Painting",
			"base_price": 4999.0,
			"discount_price": 4299.0,
			"description": "2 coats interior premium paint for 4 walls and ceiling of a standard room.",
			"is_active": 1
		},
		{
			"pack_name": "General Pest & Cockroach Control",
			"service_name": "Ant & Bed Bugs Control",
			"base_price": 999.0,
			"discount_price": 799.0,
			"description": "Odorless gel baiting and spray treatment for cockroaches, ants and general insects with 60-day warranty.",
			"is_active": 1
		},
		{
			"pack_name": "Intense Bed Bugs Treatment",
			"service_name": "Ant & Bed Bugs Control",
			"base_price": 1499.0,
			"discount_price": 1299.0,
			"description": "2-visit heat and chemical eradication service with mattress and bed frame treatment.",
			"is_active": 1
		},
		{
			"pack_name": "Complete Termite Eradication (1 BHK)",
			"service_name": "Termite Control",
			"base_price": 3999.0,
			"discount_price": 3499.0,
			"description": "Drill-Fill-Seal chemical barrier treatment for woodwork and skirting with 1-year warranty.",
			"is_active": 1
		},
		{
			"pack_name": "Complete Termite Eradication (2 BHK)",
			"service_name": "Termite Control",
			"base_price": 5999.0,
			"discount_price": 4999.0,
			"description": "Comprehensive woodwork drill-fill-seal termite treatment with 2-year warranty.",
			"is_active": 1
		}
	]

	for pkg in packages:
		if not frappe.db.exists("Service Package", pkg["pack_name"]):
			doc = frappe.get_doc({
				"doctype": "Service Package",
				**pkg
			})
			doc.insert(ignore_permissions=True)
			print(f"Created package: {pkg['pack_name']}")
		else:
			print(f"Package already exists: {pkg['pack_name']}")

	frappe.db.commit()
	return "Seeding completed successfully."

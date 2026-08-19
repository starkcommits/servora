import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_field

def execute():
    # 1. Create Serviceable Pincode Doctype if it doesn't exist
    if not frappe.db.exists("DocType", "Serviceable Pincode"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "Serviceable Pincode",
            "module": "Servora",
            "custom": 0,
            "autoname": "field:pincode",
            "fields": [
                {
                    "fieldname": "pincode",
                    "fieldtype": "Data",
                    "label": "Pincode",
                    "reqd": 1,
                    "unique": 1,
                    "in_list_view": 1
                },
                {
                    "fieldname": "area_name",
                    "fieldtype": "Data",
                    "label": "Area Name",
                    "reqd": 1,
                    "in_list_view": 1
                },
                {
                    "fieldname": "city",
                    "fieldtype": "Data",
                    "label": "City",
                    "reqd": 1,
                    "in_list_view": 1
                },
                {
                    "fieldname": "state",
                    "fieldtype": "Data",
                    "label": "State",
                    "reqd": 1
                },
                {
                    "fieldname": "is_active",
                    "fieldtype": "Check",
                    "label": "Is Active",
                    "default": "1",
                    "in_list_view": 1
                }
            ],
            "permissions": [
                {
                    "role": "System Manager",
                    "read": 1,
                    "write": 1,
                    "create": 1,
                    "delete": 1
                },
                {
                    "role": "Guest",
                    "read": 1
                }
            ]
        })
        doc.insert(ignore_permissions=True)
        print("Created Doctype: Serviceable Pincode")

    # 2. Add Pincode to Customer Address Doctype
    # It might be better to just add it as a standard field by modifying the JSON, or add a custom field.
    # Since Customer Address is a custom doctype in Servora module, I can just modify its JSON or add a field directly.
    # Let's add it via custom field to be safe, or just insert into fields.
    if not frappe.db.exists("Custom Field", "Customer Address-pincode"):
        create_custom_field("Customer Address", {
            "fieldname": "pincode",
            "label": "Pincode",
            "fieldtype": "Data",
            "insert_after": "location"
        })
        print("Added custom field 'pincode' to Customer Address")

    # 3. Add seed records
    pincodes = [
        {"pincode": "201301", "area_name": "Sector 73, Noida", "city": "Noida", "state": "Uttar Pradesh"},
        {"pincode": "201307", "area_name": "Sector 73, Noida", "city": "Noida", "state": "Uttar Pradesh"}
    ]
    for p in pincodes:
        if not frappe.db.exists("Serviceable Pincode", p["pincode"]):
            doc = frappe.get_doc({
                "doctype": "Serviceable Pincode",
                **p
            })
            doc.insert(ignore_permissions=True)
            print(f"Added seed pincode: {p['pincode']}")

    frappe.db.commit()
    print("Done")

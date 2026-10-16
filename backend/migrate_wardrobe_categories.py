import os
import sys
from dotenv import load_dotenv

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv("backend/.env")
import certifi
import pymongo
from fashion_classifier import classify_fashion_image, determine_outfit_role, PRIMARY_CATEGORIES

def migrate_wardrobe():
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("ERROR: MONGO_URI not found")
        return

    client = pymongo.MongoClient(mongo_uri, tls=True, tlsCAFile=certifi.where())
    db = client["ai_stylist"]
    wardrobe_col = db["wardrobe"]

    items = list(wardrobe_col.find())
    print(f"Total wardrobe items to inspect: {len(items)}")

    updated_count = 0
    for it in items:
        item_id = it["_id"]
        old_cat = it.get("category")
        old_sub = it.get("sub_category")
        old_type = it.get("item_type")
        old_name = it.get("item_name")
        old_color = it.get("color")
        img_rel_path = it.get("image", "")

        if not img_rel_path:
            continue

        # Resolve local image path
        clean_rel = img_rel_path.lstrip("/")
        full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), clean_rel)
        if not os.path.exists(full_path):
            # Check if it was in backend/uploads directly
            basename = os.path.basename(img_rel_path)
            full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", basename)

        if not os.path.exists(full_path):
            print(f"[{item_id}] Image file not found: {img_rel_path}")
            continue

        try:
            with open(full_path, "rb") as f:
                img_bytes = f.read()

            pred = classify_fashion_image(img_bytes)

            new_cat = pred["category"]
            new_sub = pred["sub_category"]
            new_type = pred["item_type"]
            new_name = pred["item_name"]
            new_color = pred["color"]
            new_role = pred["outfit_role"]

            # Only update if there is a difference or category was non-standard
            needs_update = (
                old_cat != new_cat or
                old_sub != new_sub or
                old_type != new_type or
                old_cat not in PRIMARY_CATEGORIES or
                "dress" in str(old_type).lower() and new_cat != "Dresses & Gowns" or
                "shirt" in str(old_type).lower() and new_cat != "Tops"
            )

            if needs_update:
                update_fields = {
                    "category": new_cat,
                    "sub_category": new_sub,
                    "item_type": new_type,
                    "item_name": new_name,
                    "color": new_color,
                    "outfit_role": new_role,
                }
                # If old style or occasion was missing, fill them in
                if not it.get("style") or it.get("style") == "casual":
                    update_fields["style"] = pred["style"]
                if not it.get("occasion") or it.get("occasion") == "Casual":
                    update_fields["occasion"] = pred["occasion"][0].capitalize() if pred["occasion"] else "Casual"

                wardrobe_col.update_one({"_id": item_id}, {"$set": update_fields})
                updated_count += 1
                print(f"UPDATED [{item_id}]:")
                print(f"  Old: Cat={old_cat} | Sub={old_sub} | Type={old_type} | Name={old_name}")
                print(f"  New: Cat={new_cat} | Sub={new_sub} | Type={new_type} | Name={new_name} | Role={new_role}")
            else:
                print(f"OK [{item_id}]: Cat={old_cat} | Sub={old_sub} | Type={old_type}")

        except Exception as e:
            print(f"Error classifying {item_id}: {repr(e)}")

    print(f"\nMigration finished! Updated {updated_count} / {len(items)} items.")

if __name__ == "__main__":
    migrate_wardrobe()

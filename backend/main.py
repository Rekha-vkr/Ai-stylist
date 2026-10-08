"""
AI Stylist Backend (main.py)
FastAPI + MongoDB + Segformer clothing extraction + catalog image generator.

Run:
    uvicorn main:app --reload
"""

import os
import shutil
import uuid
import io

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
app = FastAPI(title="AI Stylist API")

import cv2
import numpy as np
import torch
import requests
from PIL import Image, ImageOps, ImageFilter
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from google import genai
from google.genai import types
load_dotenv()

PICWISH_API_KEY = os.getenv("PICWISH_API_KEY")

if not PICWISH_API_KEY:
    print("WARNING: PICWISH_API_KEY not found")

def test_picwish_clothing_segmentation(image_path):
    """
    Test PicWish clothing segmentation on one image.
    Does not modify the existing SegFormer pipeline.
    """

    if not PICWISH_API_KEY:
        print("PicWish API key is missing.")
        return None

    url = (
        "https://techhk.aoscdn.com"
        "/api/tasks/visual/clothing-segmentation"
    )

    headers = {
        "X-API-KEY": PICWISH_API_KEY
    }

    try:
        with open(image_path, "rb") as image_file:

            files = {
                "image_file": (
                    os.path.basename(image_path),
                    image_file,
                    "image/jpeg"
                )
            }

            data = {
                "sync": "1",
                "detail_mode": "1",
                "output_type": "1",
                "quality": "2",
                "class_type": "2"
            }

            print("Sending image to PicWish...")

            response = requests.post(
                url,
                headers=headers,
                files=files,
                data=data,
                timeout=120
            )

        print(
            "PicWish HTTP status:",
            response.status_code
        )

        result = response.json()

        print(
            "PicWish response:",
            result
        )

        if response.status_code != 200:
            print("PicWish request failed.")
            return None

        state = result.get("data", {}).get("state")

        if state != 1:
            print(
                "PicWish segmentation did not succeed."
            )
            return None
        class_masks = (
            result
            .get("data", {})
            .get("class_masks", {})
        )

        # Save PicWish masks locally for inspection
        for mask_name, mask_url in class_masks.items():

            try:
                mask_response = requests.get(
                    mask_url,
                    timeout=60
                )

                if mask_response.status_code == 200:

                    mask_filename = (
                        f"picwish_{mask_name}_"
                        f"{uuid.uuid4()}.png"
                    )

                    mask_path = os.path.join(
                        UPLOAD_DIR,
                        mask_filename
                    )

                    with open(mask_path, "wb") as f:
                        f.write(mask_response.content)

                    print(
                        f"PicWish {mask_name} mask saved:",
                        "/uploads/" + mask_filename
                    )

            except Exception as mask_error:

                print(
                    f"Could not save PicWish {mask_name} mask:",
                    repr(mask_error)
                )

        print(
            "PicWish detected mask classes:",
            list(class_masks.keys())
        )

        return result
    except Exception as e:
        print(
            "PicWish test failed:",
            repr(e)
        )
        return None
if not PICWISH_API_KEY:
    print("WARNING: PICWISH_API_KEY not found")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    print("WARNING: HF_TOKEN not found")
# =====================================================
# GEMINI AI CLOTHING ANALYSIS
# =====================================================

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found")

gemini_client = genai.Client(
    api_key=GEMINI_API_KEY
)


def analyze_clothing_with_ai(
    image_bytes: bytes,
    mime_type: str
):
    """
    Analyze a clean clothing image and detect
    structured wardrobe attributes.

    This does NOT modify or generate the image.
    """

    prompt = """
Analyze the clothing item in this image.

Identify ONLY attributes that can be reasonably
determined from the visible image.

Return ONLY valid JSON.

Use exactly this structure:

{
    "item_type": "",
    "category": "",
    "color": "",
    "secondary_colors": [],
    "pattern": "",
    "style": "",
    "occasion": [],
    "season": [],
    "material": "",
    "sleeve": "",
    "fit": "",
    "length": "",
    "confidence": 0.0
}

Rules:

1. item_type must be the specific clothing/accessory
   type when possible.

Examples:
shirt, t-shirt, blouse, top, pants, jeans,
trousers, skirt, dress, jacket, shoes, sneakers,
heels, sandals, bag, handbag, backpack, scarf,
hat, belt, sunglasses, etc.

2. category should be one broad category such as:
top, bottom, dress, footwear, bag, accessory.

3. Detect the main visible color.

4. secondary_colors should contain other clearly
   visible important colors.

5. Detect the pattern only when visible.
Examples:
solid, striped, checked, floral, printed,
polka-dot, geometric, textured.

6. style should describe the visible style.
Examples:
casual, formal, sporty, elegant, streetwear,
traditional, minimal, party.

7. occasion may contain multiple suitable occasions.
Examples:
casual, college, office, party, formal,
wedding, festive, travel, everyday.

8. season may contain:
summer, winter, spring, autumn, all-season.

9. Do not invent material if it cannot be determined.
Use "unknown" when necessary.

10. For sleeve, fit, and length, use "unknown"
when they cannot be determined.

11. confidence should be a number between 0 and 1
representing confidence in the overall identification.

12. Do not describe the background.

13. Do not generate or modify the clothing.

14. Do not recommend an outfit yet.

Return JSON only.
"""

    try:

        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type
                ),
                prompt
            ]
        )

        result_text = response.text.strip()

        # Remove markdown JSON fences if the model adds them.
        if result_text.startswith("```"):
            result_text = (
                result_text
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        import json

        result = json.loads(result_text)

        return result

    except Exception as e:

        print(
            "Gemini clothing analysis failed:",
            repr(e)
        )

        return None
hf_client = InferenceClient(
    provider="fal-ai",
    api_key=HF_TOKEN
)

# =====================================================
# AI WARDROBE UPLOAD
# =====================================================

@app.post("/wardrobe/ai-upload")
async def ai_upload_wardrobe(
    user_id: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # Read uploaded image
        image_bytes = await image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="Image is empty."
            )

        # Analyze image with Gemini
        ai_result = analyze_clothing_with_ai(
            image_bytes,
            image.content_type or "image/jpeg"
        )

        if not ai_result:
            raise HTTPException(
                status_code=500,
                detail="AI could not analyze the clothing image."
            )

        # Save the ORIGINAL uploaded image
        file_extension = os.path.splitext(
            image.filename
        )[1] or ".png"

        unique_filename = (
            str(uuid.uuid4()) + file_extension
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            unique_filename
        )

        with open(file_path, "wb") as buffer:
            buffer.write(image_bytes)

        image_path = f"/uploads/{unique_filename}"

        # Save AI analysis + original image to MongoDB
        new_clothing = {
            "user_id": user_id,

            "image": image_path,

            "item_type": ai_result.get(
                "item_type",
                "unknown"
            ),

            "category": ai_result.get(
                "category",
                "unknown"
            ),

            "color": ai_result.get(
                "color",
                "unknown"
            ),

            "secondary_colors": ai_result.get(
                "secondary_colors",
                []
            ),

            "pattern": ai_result.get(
                "pattern",
                "unknown"
            ),

            "style": ai_result.get(
                "style",
                "unknown"
            ),

            "occasion": ai_result.get(
                "occasion",
                []
            ),

            "season": ai_result.get(
                "season",
                []
            ),

            "material": ai_result.get(
                "material",
                "unknown"
            ),

            "sleeve": ai_result.get(
                "sleeve",
                "unknown"
            ),

            "fit": ai_result.get(
                "fit",
                "unknown"
            ),

            "length": ai_result.get(
                "length",
                "unknown"
            ),

            "confidence": ai_result.get(
                "confidence",
                0
            ),

            "created_at": datetime.utcnow()
        }

        result = db["wardrobe"].insert_one(
            new_clothing
        )

        return {
            "message": "Clothing analyzed and added successfully!",
            "clothing_id": str(result.inserted_id),
            "image": image_path,
            "attributes": ai_result
        }

    except HTTPException:
        raise

    except Exception as e:
        print(
            "AI wardrobe upload failed:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze and save clothing."
        )
def create_huggingface_catalog_image(
    extracted_image: Image.Image,
    detected_category: str
):
    """
    Use Hugging Face Qwen Image Edit to create
    a clean e-commerce catalog image.
    """

    if not HF_TOKEN:
        print("Hugging Face token is missing.")
        return None

    try:
        image_buffer = io.BytesIO()

        extracted_image.save(
            image_buffer,
            format="PNG"
        )

        image_bytes = image_buffer.getvalue()

        # -------------------------------------------------
        # SAVE EXACT IMAGE BEING SENT TO HUGGING FACE
        # -------------------------------------------------

        debug_name = (
            f"debug_hf_{detected_category.lower()}_"
            f"{uuid.uuid4()}.png"
        )

        extracted_image.save(
            os.path.join(UPLOAD_DIR, debug_name),
            format="PNG"
        )

        print(
            "HF INPUT IMAGE:",
            "/uploads/" + debug_name
        )

        # -------------------------------------------------
        # PROMPT
        # -------------------------------------------------

        if detected_category.lower() == "lower":

            prompt = """
Edit the supplied image into a professional e-commerce
catalog image of the SAME pair of pants.

The pants in the input are the exact product that must
be preserved.

STRICT REQUIREMENTS:
- Preserve the exact pants.
- Preserve the exact black color.
- Preserve the original silhouette and proportions.
- Preserve the waistband, both legs, hems, pockets,
  seams, stitching, folds, texture, buttons and zippers.
- Do NOT redesign, restyle, recolor, reshape, shorten
  or lengthen the pants.
- Do NOT turn the pants into shorts, leggings, a skirt
  or another type of clothing.
- Do NOT add any other clothing.
- Do NOT add a person, mannequin, hands, arms, legs
  or body parts.
- Remove the original background.
- Remove visible human body parts that are not part
  of the pants.
- If a small area of the pants is missing because of
  occlusion, reconstruct only that small missing area.
- Do NOT invent large portions of the pants.
- Keep the complete waistband and both pant legs visible.
- Keep the pants centered.
- Use a simple warm off-white studio background.
- Add only a subtle natural product shadow.
- Portrait 3:4 composition.
- No text.
- No watermark.

The final image must show ONLY the original pair of pants
as a clean e-commerce product photograph.
"""

        else:

            prompt = f"""
Create a professional e-commerce catalog product image
from the supplied {detected_category} garment.

IMPORTANT:
- Preserve the exact garment from the input.
- Preserve its original color.
- Preserve its pattern, texture, logos, buttons,
  stitching, seams, pockets, and other visible details.
- Do NOT redesign the garment.
- Do NOT change the garment style.
- Do NOT add another garment.
- Do NOT add a person or mannequin.
- Remove the original person's body and background.
- If small portions of the garment are missing because
  of segmentation or occlusion, reconstruct only those
  small missing areas.
- Keep the entire garment visible.
- Center the garment.
- Use a clean warm off-white studio background.
- Add a very subtle natural product shadow.
- Use a portrait 3:4 composition.
- No text.
- No watermark.

Category: {detected_category}
"""

        print(
            f"Sending {detected_category} to "
            "Hugging Face Qwen Image Edit..."
        )

        result = hf_client.image_to_image(
            image_bytes,
            prompt=prompt,
            model="Qwen/Qwen-Image-Edit"
        )

        if result is None:
            print(
                "Hugging Face returned no image."
            )
            return None

        print(
            f"Hugging Face catalog image generated "
            f"for {detected_category}."
        )

        return result.convert("RGB")

    except Exception as e:
        print(
            "Hugging Face catalog generation failed:",
            repr(e)
        )

        print(
            "HF error type:",
            type(e).__name__
        )

        return None
from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException
)
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from bson import ObjectId
from datetime import datetime

from pillow_heif import register_heif_opener

from transformers import (
    AutoImageProcessor,
    AutoModelForSemanticSegmentation
)

from database import db
from models.user import UserCreate, UserLogin
from pwdlib import PasswordHash


# =====================================================
# HEIC SUPPORT
# =====================================================

register_heif_opener()


# =====================================================
# FASTAPI APP
# =====================================================

@app.post("/test-picwish")
async def test_picwish(
    file: UploadFile = File(...)
):
    try:
        extension = os.path.splitext(
            file.filename or ""
        )[1].lower()

        if not extension:
            extension = ".jpg"

        test_name = (
            f"picwish_test_{uuid.uuid4()}{extension}"
        )

        test_path = os.path.join(
            UPLOAD_DIR,
            test_name
        )

        contents = await file.read()

        with open(test_path, "wb") as f:
            f.write(contents)

        print("Testing PicWish with:", test_path)

        result = test_picwish_clothing_segmentation(
            test_path
        )

        if result is None:
            raise HTTPException(
                status_code=500,
                detail="PicWish segmentation failed."
            )

        return {
            "message": "PicWish test completed.",
            "input_image": "/uploads/" + test_name,
            "picwish_result": result
        }

    except HTTPException:
        raise

    except Exception as e:
        print("PicWish endpoint error:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# =====================================================
# UPLOAD DIRECTORY
# =====================================================

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# PASSWORD HASHING
# =====================================================

password_hash = PasswordHash.recommended()


# =====================================================
# AI CLOTHING SEGMENTATION MODEL
# =====================================================

CLOTHING_MODEL = "mattmdjaga/segformer_b2_clothes"

print("Loading AI clothing segmentation model...")

image_processor = AutoImageProcessor.from_pretrained(
    CLOTHING_MODEL
)

clothing_model = (
    AutoModelForSemanticSegmentation.from_pretrained(
        CLOTHING_MODEL
    )
)

clothing_model.eval()

print("AI clothing segmentation model loaded successfully!")


# =====================================================
# CATALOG IMAGE SETTINGS
# =====================================================

CATALOG_BG        = (242, 239, 233)   # warm off-white
CATALOG_SIZE      = (900, 1200)       # 3:4 portrait
CATALOG_THUMB     = (450, 600)
CATALOG_PAD       = 0.06              # padding around garment
SHADOW_BLUR       = 25
SHADOW_OPACITY    = 0.35
SHADOW_OFFSET     = 12


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():
    return {"message": "AI Stylist Backend is running!"}


# =====================================================
# TEST DATABASE
# =====================================================

@app.get("/test-db")
def test_database():
    try:
        db.command("ping")
        return {"message": "MongoDB is connected!"}
    except Exception as e:
        return {"error": str(e)}


# =====================================================
# REGISTER USER
# =====================================================

@app.post("/register")
def register_user(user: UserCreate):

    existing_user = db["users"].find_one(
        {"email": user.email}
    )

    if existing_user:
        return {"error": "Email already registered"}

    hashed_password = password_hash.hash(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    result = db["users"].insert_one(new_user)

    return {
        "message": "User registered successfully!",
        "user_id": str(result.inserted_id)
    }


# =====================================================
# LOGIN USER
# =====================================================

@app.post("/login")
def login_user(user: UserLogin):

    existing_user = db["users"].find_one(
        {"email": user.email}
    )

    if not existing_user:
        return {"error": "Invalid email or password"}

    password_correct = password_hash.verify(
        user.password,
        existing_user["password"]
    )

    if not password_correct:
        return {"error": "Invalid email or password"}

    return {
        "message": "Login successful!",
        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"]
        }
    }


# =====================================================
# ADD CLOTHING TO WARDROBE
# =====================================================

@app.post("/wardrobe")
async def add_clothing(
    user_id: str = Form(...),
    item_name: str = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    occasion: str = Form(...),
    season: str = Form(...),
    style: str = Form(...),
    image: UploadFile = File(None)
):

    image_path = None

    if image:

        file_extension = os.path.splitext(
            image.filename
        )[1] or ".png"

        unique_filename = (
            str(uuid.uuid4()) + file_extension
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            unique_filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        image_path = f"/uploads/{unique_filename}"

    new_clothing = {
        "user_id": user_id,
        "item_name": item_name,
        "category": category,
        "color": color,
        "occasion": occasion,
        "season": season,
        "style": style,
        "image": image_path,
        "created_at": datetime.utcnow()
    }

    result = db["wardrobe"].insert_one(new_clothing)

    return {
        "message": "Clothing item added successfully!",
        "clothing_id": str(result.inserted_id),
        "image": image_path
    }


# =====================================================
# GET WARDROBE
# =====================================================

@app.get("/wardrobe")
def get_wardrobe(user_id: str):

    clothes = list(
        db["wardrobe"].find({"user_id": user_id})
    )

    for clothing in clothes:
        clothing["_id"] = str(clothing["_id"])

    return clothes


# =====================================================
# DELETE CLOTHING
# =====================================================

@app.delete("/wardrobe/{clothing_id}")
def delete_clothing(clothing_id: str, user_id: str):

    try:
        object_id = ObjectId(clothing_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid clothing ID."
        )

    clothing = db["wardrobe"].find_one(
        {
            "_id": object_id,
            "user_id": user_id
        }
    )

    if not clothing:
        raise HTTPException(
            status_code=404,
            detail="Clothing item not found."
        )

    image_path = clothing.get("image")

    if image_path:

        filename = os.path.basename(image_path)

        file_path = os.path.join(UPLOAD_DIR, filename)

        if os.path.exists(file_path):
            os.remove(file_path)

    result = db["wardrobe"].delete_one(
        {
            "_id": object_id,
            "user_id": user_id
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Clothing item could not be deleted."
        )

    return {
        "message": "Clothing item deleted successfully!",
        "clothing_id": clothing_id
    }


# =====================================================
# UPDATE WARDROBE ITEM
# =====================================================

@app.put("/wardrobe/{clothing_id}")
def update_clothing(
    clothing_id: str,
    user_id: str,
    item_name: str = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    occasion: str = Form(...),
    season: str = Form(...)
):

    try:
        object_id = ObjectId(clothing_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid clothing ID."
        )

    existing = db["wardrobe"].find_one(
        {
            "_id": object_id,
            "user_id": user_id
        }
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Clothing item not found."
        )

    db["wardrobe"].update_one(
        {"_id": object_id, "user_id": user_id},
        {
            "$set": {
                "item_name": item_name,
                "category": category,
                "color": color,
                "occasion": occasion,
                "season": season
            }
        }
    )

    return {
        "message": "Clothing item updated successfully!",
        "clothing_id": clothing_id
    }

@app.post("/thrift")
async def create_thrift_listing(
    user_id: str = Form(...),
    item_name: str = Form(...),
    category: str = Form(...),
    price: str = Form(""),
    listing_type: str = Form(...),
    description: str = Form(""),
    image: UploadFile = File(...)
):
    listing_type = listing_type.strip().lower()

    if listing_type not in ["sale", "exchange"]:
        raise HTTPException(
            status_code=400,
            detail="listing_type must be 'sale' or 'exchange'."
        )

    # Price is required for sale listings
    price_text = price.strip()

    if listing_type == "sale" and not price_text:
        raise HTTPException(
            status_code=400,
            detail="Price is required for sale listings."
        )

    price_value = None

    if price_text:
        try:
            price_value = float(price_text)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Price must be a valid number."
            )

        if price_value < 0:
            raise HTTPException(
                status_code=400,
                detail="Price cannot be negative."
            )

    # Save uploaded image
    file_extension = os.path.splitext(image.filename)[1] or ".png"
    unique_filename = str(uuid.uuid4()) + file_extension

    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_path = f"/uploads/{unique_filename}"

    # Create MongoDB document
    new_listing = {
        "user_id": user_id,
        "item_name": item_name.strip(),
        "category": category.strip(),
        "price": price_value,
        "listing_type": listing_type,
        "description": description.strip(),
        "image": image_path,
        "status": "active",
        "created_at": datetime.utcnow()
    }

    result = db["thrift_listings"].insert_one(new_listing)

    return {
        "message": "Thrift listing created successfully!",
        "listing_id": str(result.inserted_id),
        "image": image_path
    }
@app.get("/thrift")
def get_thrift_listings(
    search: str = "",
    category: str = "",
    listing_type: str = ""
):
    query = {}
    if search.strip():
        query["item_name"] = {
            "$regex": search.strip(),
            "$options": "i"
        }

    if category.strip():
        query["category"] = {
            "$regex": category.strip(),
            "$options": "i"
        }

    if listing_type.strip():
        listing_type = listing_type.strip().lower()

        if listing_type not in ["sale", "exchange"]:
            raise HTTPException(
                status_code=400,
                detail="listing_type must be 'sale' or 'exchange'."
            )

        query["listing_type"] = listing_type

    listings = list(
        db["thrift_listings"]
        .find(query)
        .sort("created_at", -1)
    )

    for listing in listings:
        listing["_id"] = str(listing["_id"])

    return listings
@app.post("/thrift/{listing_id}/save")
def save_thrift_listing(
    listing_id: str,
    user_id: str
):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid listing ID."
        )

    # Check that the listing exists
    listing = db["thrift_listings"].find_one({
        "_id": object_id
    })

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Thrift listing not found."
        )

    # Check if already saved
    existing_save = db["saved_thrift"].find_one({
        "user_id": user_id,
        "listing_id": object_id
    })

    if existing_save:
        return {
            "message": "Listing already saved.",
            "saved_id": str(existing_save["_id"])
        }

    new_save = {
        "user_id": user_id,
        "listing_id": object_id,
        "created_at": datetime.utcnow()
    }

    result = db["saved_thrift"].insert_one(new_save)

    return {
        "message": "Thrift listing saved successfully!",
        "saved_id": str(result.inserted_id)
    }
@app.delete("/thrift/{listing_id}/save")
def unsave_thrift_listing(
    listing_id: str,
    user_id: str
):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid listing ID."
        )

    result = db["saved_thrift"].delete_one({
        "user_id": user_id,
        "listing_id": object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Saved thrift item not found."
        )

    return {
        "message": "Thrift listing removed from saved items."
    }
@app.delete("/thrift/{listing_id}")
def delete_thrift_listing(
    listing_id: str,
    user_id: str
):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid listing ID."
        )

    listing = db["thrift_listings"].find_one({
        "_id": object_id
    })

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Thrift listing not found."
        )

    # Only the user who created the listing can delete it
    if listing["user_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own thrift listings."
        )

    # Delete the thrift listing
    db["thrift_listings"].delete_one({
        "_id": object_id
    })

    # Remove any saved records for this listing
    db["saved_thrift"].delete_many({
        "listing_id": object_id
    })

    return {
        "message": "Thrift listing deleted successfully."
    }
@app.get("/thrift/saved")
def get_saved_thrift_listings(
    user_id: str
):
    saved_items = list(
        db["saved_thrift"].find({
            "user_id": user_id
        })
    )

    listings = []

    for saved in saved_items:
        listing = db["thrift_listings"].find_one({
            "_id": saved["listing_id"]
        })

        if listing:
            listing["_id"] = str(listing["_id"])
            listings.append(listing)

    return listings
@app.post("/thrift/{listing_id}/outfit")
def add_thrift_to_outfit(
    listing_id: str,
    user_id: str
):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid listing ID."
        )

    # Check that the thrift listing exists
    listing = db["thrift_listings"].find_one({
        "_id": object_id
    })

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Thrift listing not found."
        )

    # Check if already added to outfit
    existing_item = db["thrift_outfits"].find_one({
        "user_id": user_id,
        "listing_id": object_id
    })

    if existing_item:
        return {
            "message": "Listing is already in your outfit.",
            "outfit_id": str(existing_item["_id"])
        }

    new_outfit_item = {
        "user_id": user_id,
        "listing_id": object_id,
        "created_at": datetime.utcnow()
    }

    result = db["thrift_outfits"].insert_one(
        new_outfit_item
    )

    return {
        "message": "Thrift item added to outfit successfully!",
        "outfit_id": str(result.inserted_id)
    }
@app.get("/thrift/outfit")
def get_thrift_outfit(user_id: str):
    outfit_items = list(
        db["thrift_outfits"].find({
            "user_id": user_id
        })
    )

    outfit = []

    for item in outfit_items:
        listing = db["thrift_listings"].find_one({
            "_id": item["listing_id"]
        })

        if listing:
            listing["_id"] = str(listing["_id"])
            outfit.append(listing)

    return outfit
# =====================================================
# OUTFIT RECOMMENDATION
# =====================================================

@app.get("/recommend-outfit")
def recommend_outfit(
    user_id: str,
    occasion: str
):

    clothes = list(
        db["wardrobe"].find({"user_id": user_id})
    )

    if not clothes:
        return {
            "message": "No wardrobe items found.",
            "outfit": []
        }

    occasion_lower = occasion.lower()

    # -------------------------------------------------
    # Filter by occasion
    # -------------------------------------------------

    occasion_items = []

    for item in clothes:

        item_occasion = str(
            item.get("occasion", "")
        ).lower()

        if (
            item_occasion == occasion_lower
            or item_occasion == "all"
            or item_occasion == ""
        ):
            occasion_items.append(item)

    if not occasion_items:
        occasion_items = clothes


    
    # -------------------------------------------------
    # Categorize wardrobe
    # -------------------------------------------------

    upper_items = []
    lower_items = []
    dress_items = []
    shoe_items = []

    for item in occasion_items:

        category = str(
            item.get("category", "")
        ).lower()

        if category in [
            "upper", "shirt", "tshirt",
            "t-shirt", "top", "blouse"
        ]:
            upper_items.append(item)

        elif category in [
            "lower", "pants", "trousers",
            "jeans", "skirt"
        ]:
            lower_items.append(item)

        elif category in ["dress", "gown"]:
            dress_items.append(item)

        elif category in ["shoe", "shoes", "footwear"]:
            shoe_items.append(item)


    # -------------------------------------------------
    # Score outfit combinations
    # -------------------------------------------------
    def score_item(item):
        score = 0

        item_occasion = str(
            item.get("occasion", "")
        ).lower()

        # Strong match for the requested occasion
        if item_occasion == occasion_lower:
            score += 50
        elif item_occasion == "all":
            score += 25
        elif item_occasion == "":
            score += 10

        return score



    def color_compatibility(first, second):
        color1 = str(
            first.get("color", "")
        ).lower()

        color2 = str(
            second.get("color", "")
        ).lower()

        if not color1 or not color2:
            return 0

        if color1 == color2:
            return 5

        neutral_colors = {
            "black",
            "white",
            "grey",
            "gray",
            "beige",
            "cream",
            "brown",
            "navy"
        }

        if color1 in neutral_colors or color2 in neutral_colors:
            return 15

        return 8


    best_outfit = []
    best_score = -1


    # Dress-based outfits
    if dress_items:

        for dress in dress_items:

            current_score = score_item(dress)

            if shoe_items:
                for shoe in shoe_items:

                    combination_score = (
                        current_score
                        + score_item(shoe)
                        + color_compatibility(dress, shoe)
                    )

                    if combination_score > best_score:
                        best_score = combination_score
                        best_outfit = [
                            dress,
                            shoe
                        ]

            elif current_score > best_score:

                best_score = current_score
                best_outfit = [dress]


    # Upper + lower outfits
    elif upper_items and lower_items:

        for upper in upper_items:

            for lower in lower_items:

                combination_score = (
                    score_item(upper)
                    + score_item(lower)
                    + color_compatibility(
                        upper,
                        lower
                    )
                )

                if shoe_items:

                    for shoe in shoe_items:

                        full_score = (
                            combination_score
                            + score_item(shoe)
                            + color_compatibility(
                                lower,
                                shoe
                            )
                        )

                        if full_score > best_score:

                            best_score = full_score

                            best_outfit = [
                                upper,
                                lower,
                                shoe
                            ]

                elif combination_score > best_score:

                    best_score = combination_score

                    best_outfit = [
                        upper,
                        lower
                    ]


    # Fallback if only one category exists
    elif upper_items:

        best_outfit = [
            max(
                upper_items,
                key=score_item
            )
        ]

    elif lower_items:

        best_outfit = [
            max(
                lower_items,
                key=score_item
            )
        ]


    outfit = best_outfit

    # -------------------------------------------------
    # Convert ObjectIds
    # -------------------------------------------------

    for item in outfit:
        item["_id"] = str(item["_id"])


    if outfit:
        recommendation = (
            f"Here is a outfit for your "
            f"{occasion} occasion using clothes "
            f"from your wardrobe."
        )
    else:
        recommendation = (
            "I couldn't create an outfit from "
            "your current wardrobe. "
            "Try adding more clothing items."
        )

    return {
        "message": recommendation,
        "occasion": occasion,
        "outfit": outfit
    }


# =====================================================
# CATALOG IMAGE HELPERS
# =====================================================

def create_catalog_image(
    garment_rgba: Image.Image,
    canvas_size=CATALOG_SIZE
) -> Image.Image:
    """
    Converts an already-isolated garment (RGBA, transparent background)
    into a clean catalog-style product image.

    Preserves the original garment pixels. Only adds:
    cropping, scaling, warm background, soft shadow.
    """

    garment = garment_rgba.convert("RGBA")

    # -------------------------------------------------
    # 1. Tight-crop to visible garment
    # -------------------------------------------------

    alpha = garment.getchannel("A").point(
        lambda p: 0 if p < 15 else p
    )

    bbox = alpha.getbbox()

    if bbox is None:
        raise ValueError("Garment mask is empty.")

    garment = garment.crop(bbox)

    # Gentle edge smoothing
    alpha = garment.getchannel("A").filter(
        ImageFilter.GaussianBlur(radius=1.0)
    )
    garment.putalpha(alpha)

    # -------------------------------------------------
    # 2. Scale to fit canvas with padding
    # -------------------------------------------------

    cw, ch = canvas_size

    scale = min(
        cw * (1 - 2 * CATALOG_PAD) / garment.width,
        ch * (1 - 2 * CATALOG_PAD) / garment.height
    )

    new_w = max(1, int(garment.width * scale))
    new_h = max(1, int(garment.height * scale))

    garment = garment.resize(
        (new_w, new_h),
        Image.Resampling.LANCZOS
    )

    # -------------------------------------------------
    # 3. Warm catalog background
    # -------------------------------------------------

    canvas = Image.new(
        "RGBA",
        canvas_size,
        CATALOG_BG + (255,)
    )

    # -------------------------------------------------
    # 4. Soft shadow
    # -------------------------------------------------

    shadow_alpha = garment.getchannel("A").point(
        lambda p: int(p * SHADOW_OPACITY)
    )

    shadow_layer = Image.new(
        "RGBA",
        garment.size,
        (60, 55, 50, 255)
    )
    shadow_layer.putalpha(shadow_alpha)

    shadow = shadow_layer.filter(
        ImageFilter.GaussianBlur(radius=SHADOW_BLUR)
    )

    # -------------------------------------------------
    # 5. Center: shadow first, garment on top
    # -------------------------------------------------

    x = (cw - new_w) // 2
    y = (ch - new_h) // 2

    canvas.alpha_composite(shadow, (x, y + SHADOW_OFFSET))
    canvas.alpha_composite(garment, (x, y))

    return canvas.convert("RGB")


def save_catalog_web(img: Image.Image, output_prefix: str):
    """
    Saves catalog image as WebP (primary) + JPG (fallback),
    plus a thumbnail pair.
    Returns (webp_filename, jpg_filename).
    """

    webp_path = output_prefix + ".webp"
    jpg_path = output_prefix + ".jpg"

    img.save(webp_path, quality=82, method=6)
    img.save(jpg_path, quality=85, optimize=True, progressive=True)

    thumb = img.resize(
        CATALOG_THUMB,
        Image.Resampling.LANCZOS
    )
    thumb.save(output_prefix + "_thumb.webp", quality=82, method=6)
    thumb.save(output_prefix + "_thumb.jpg", quality=85, optimize=True)

    return (
        os.path.basename(webp_path),
        os.path.basename(jpg_path)
    )
def create_mflux_masked_image(
    garment_rgba: Image.Image,
    reconstruction_mask: Image.Image
) -> Image.Image:
    """
    Creates the image supplied to FLUX Fill.

    Visible garment pixels remain untouched.
    The reconstruction area receives a soft continuation
    of nearby garment pixels, giving FLUX real fabric/color
    information instead of a flat black or solid-color region.
    """

    garment = garment_rgba.convert("RGB")

    image_array = np.array(garment).copy()
    original_array = image_array.copy()

    mask_array = np.array(
        reconstruction_mask.convert("L")
    )

    mask_binary = (
        mask_array > 128
    ).astype(np.uint8)

    # Expand the visible garment information slightly inward
    # so nearby fabric pixels can influence the missing region.
    kernel = np.ones((31, 31), np.uint8)

    nearby = cv2.dilate(
        1 - mask_binary,
        kernel,
        iterations=1
    )

    # Blur the original garment to create a soft texture/color
    # continuation without changing visible pixels.
    blurred = cv2.GaussianBlur(
        original_array,
        (0, 0),
        sigmaX=12,
        sigmaY=12
    )

    # Only use the blurred approximation inside the reconstruction area.
    image_array[
        mask_binary > 0
    ] = blurred[
        mask_binary > 0
    ]

    # Restore every visible pixel exactly.
    image_array[
        mask_binary == 0
    ] = original_array[
        mask_binary == 0
    ]

    return Image.fromarray(
        image_array,
        mode="RGB"
    )
def create_reconstruction_mask(
    garment_rgba: Image.Image,
    category: str
) -> Image.Image:
    """
    Creates a reconstruction mask for missing garment regions.

    BLACK = preserve existing garment pixels
    WHITE = region that may be reconstructed

    Only transparent gaps that are enclosed horizontally by
    visible garment pixels are marked for reconstruction.
    """

    garment_rgba = garment_rgba.convert("RGBA")

    alpha = np.array(
        garment_rgba.getchannel("A")
    )

    visible = (
        alpha > 15
    ).astype(np.uint8) * 255

    ys, xs = np.where(
        visible > 0
    )

    if len(xs) == 0:
        return Image.new(
            "L",
            garment_rgba.size,
            0
        )

    top = int(ys.min())
    bottom = int(ys.max())
    left = int(xs.min())
    right = int(xs.max())

    height = bottom - top + 1
    width = right - left + 1

    reconstruction = np.zeros_like(
        visible,
        dtype=np.uint8
    )

    if category.lower() == "upper":

        start_y = top + int(height * 0.15)
        end_y = top + int(height * 0.75)

        for y in range(
            start_y,
            min(end_y, bottom + 1)
        ):

            row = visible[y]

            visible_x = np.where(
                row > 0
            )[0]

            if len(visible_x) < 2:
                continue

            # Find continuous visible garment runs.
            runs = []

            run_start = int(visible_x[0])
            previous_x = int(visible_x[0])

            for x in visible_x[1:]:

                x = int(x)

                if x > previous_x + 1:
                    runs.append(
                        (
                            run_start,
                            previous_x
                        )
                    )

                    run_start = x

                previous_x = x

            runs.append(
                (
                    run_start,
                    previous_x
                )
            )

            # Look for transparent gaps between
            # two visible garment regions.
            for i in range(len(runs) - 1):

                first_end = runs[i][1]
                second_start = runs[i + 1][0]

                gap_start = first_end + 1
                gap_end = second_start - 1

                gap_width = (
                    gap_end - gap_start + 1
                )

                if gap_width <= 0:
                    continue

                # Ignore tiny natural gaps.
                if gap_width < max(
                    8,
                    int(width * 0.04)
                ):
                    continue

                # Ignore gaps that are too large to
                # confidently represent an occluded torso.
                if gap_width > int(width * 0.60):
                    continue

                reconstruction[
                    y,
                    gap_start:gap_end + 1
                ] = 255

    # Never reconstruct pixels that are already
    # visible garment pixels.
    reconstruction[
        visible > 0
    ] = 0

    return Image.fromarray(
        reconstruction,
        mode="L"
    )

# =====================================================
# GARMENT COLOR DETECTION
# =====================================================

def detect_garment_color(image: Image.Image, mask: Image.Image):
    """
    Estimate the dominant visible color of a garment
    using only pixels inside its segmentation mask.
    """

    image_rgb = np.array(image.convert("RGB"))
    mask_array = np.array(mask)

    pixels = image_rgb[mask_array > 128]

    if len(pixels) == 0:
        return "unknown"

    # Remove near-white pixels where possible
    filtered = pixels[np.sum(pixels, axis=1) < 735]

    if len(filtered) > 0:
        pixels = filtered

    mean_color = np.mean(pixels, axis=0)
    r, g, b = mean_color

    if r > 200 and g > 200 and b > 200:
        return "white"

    if r < 60 and g < 60 and b < 60:
        return "black"

    if abs(r - g) < 25 and abs(g - b) < 25:
        return "dark gray" if r < 130 else "gray"

    if r > g * 1.25 and r > b * 1.25:
        return "red"

    if r > 150 and g > 100 and b < 100:
        return "orange"

    if r > 150 and g > 130 and b < 130:
        return "yellow"

    if g > r * 1.2 and g > b * 1.1:
        return "green"

    if b > r * 1.2 and b > g * 1.1:
        return "blue"

    if r > 100 and b > 100 and r > g * 1.1:
        return "purple"

    return "multicolor"


# =====================================================
# AI CLOTHING EXTRACTION + CATALOG GENERATION
# =====================================================
@app.post("/extract-clothing")
async def extract_clothing(
    image: UploadFile = File(...),
    category: str = Form("auto")
):

    try:

        print("====================================")
        print("CLOTHING EXTRACTION STARTED")
        print("Filename:", image.filename)
        print("====================================")

        image_bytes = await image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="No image was uploaded."
            )


        # =================================================
        # 1. OPEN IMAGE
        # =================================================

        try:

            original_image = Image.open(
                io.BytesIO(image_bytes)
            )

            original_image.load()

            original_image = ImageOps.exif_transpose(
                original_image
            )

            original_image = original_image.convert("RGB")

        except Exception as e:

            raise HTTPException(
                status_code=400,
                detail=f"Could not decode image: {str(e)}"
            )


        # =================================================
        # 2. RUN CLOTHING SEGMENTATION
        # =================================================

        print("Running clothing segmentation...")

        inputs = image_processor(
            images=original_image,
            return_tensors="pt"
        )

        with torch.no_grad():
            outputs = clothing_model(**inputs)

        logits = outputs.logits

        logits = torch.nn.functional.interpolate(
            logits,
            size=original_image.size[::-1],
            mode="bilinear",
            align_corners=False
        )

        segmentation = logits.argmax(dim=1)[0]


        # =================================================
        # 3. CLOTHING CLASS DEFINITIONS
        # (SegFormer B2 Clothes label ids:
        #  4 = upper, 5 = skirt, 6 = pants, 7 = dress)
        # =================================================

        garment_classes = {

            4: "upper",
            5: "skirt",
            6: "pants",
            7: "dress",

            9: "shoes",
            10: "shoes",

            1: "hat",
            3: "sunglasses",
            8: "belt",
            16: "bag",
            17: "scarf"

        }

        category = category.lower().strip()

        category_classes = {
            "upper": [4],
            "shirt": [4],
            "tshirt": [4],
            "t-shirt": [4],
            "top": [4],
            "lower": [5, 6],
            "pants": [6],
            "trousers": [6],
            "jeans": [6],
            "shorts": [6],
            "skirt": [5],
            "dress": [7],
            "shoes": [9],
            "hat": [1],
            "sunglasses": [3],
            "belt": [8],
            "bag": [16],
            "scarf": [17],
        }


        # =================================================
        # 4. DETERMINE WHICH CLASSES TO EXTRACT
        # =================================================

        if category == "auto":

            detected_areas = {}

            for class_id in garment_classes:

                area = (
                    segmentation == class_id
                ).sum().item()

                detected_areas[class_id] = area

            print("AUTO DETECTED AREAS:", detected_areas)

            selected_classes = [

                class_id

                for class_id, area
                in detected_areas.items()

                if area > 1000

            ]


            # =================================================
            # GROUP RELATED SEGMENTATION CLASSES
            # =================================================

            # Ignore false dress detections when shoes clearly dominate.
            # This prevents shoe-only photos from becoming a Dress item.
            if 7 in selected_classes:

                shoe_area = (
                    detected_areas.get(9, 0)
                    + detected_areas.get(10, 0)
                )

                dress_area = detected_areas.get(7, 0)

                if shoe_area > dress_area:
                    selected_classes.remove(7)
                else:
                    selected_classes = [7]

            # Left shoe + right shoe = ONE wardrobe item.
            # Keep only class 9 as the representative shoe class.

            if 9 in selected_classes or 10 in selected_classes:

                selected_classes = [
                    class_id
                    for class_id in selected_classes
                    if class_id not in [9, 10]
                ]

                selected_classes.append(9)

            # If a dress is detected, treat it as ONE complete garment.
            # Do not split the dress into upper/lower pieces.
            if 7 in selected_classes:
                selected_classes = [7]

            if not selected_classes:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Could not detect "
                        "any clothing items."
                    )
                )

        else:

            if category not in category_classes:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Unsupported category. Use auto, "
                        "upper, lower, shirt, tshirt, top, "
                        "pants, jeans, skirt or dress."
                    )
                )

            selected_classes = category_classes[category]

        print("SELECTED CLOTHING CLASSES:", selected_classes)


        # =================================================
        # 5. EXTRACT EACH GARMENT
        # =================================================

        extracted_items = []

        for class_id in selected_classes:

            if class_id == 9:

                clothing_mask = (
                    (segmentation == 9)
                    |
                    (segmentation == 10)
                )

            else:

                clothing_mask = (
                    segmentation == class_id
                )

            mask = (
                clothing_mask
                .cpu()
                .numpy()
                .astype("uint8") * 255
            )

            if not np.any(mask):
                continue
            # =============================================
            # REFINE THE SEGMENTATION MASK
            # =============================================

            clean_mask = mask.copy()

            # -------------------------------------------------
            # PANTS-SPECIFIC MASK CLEANUP
            # -------------------------------------------------

            if class_id == 6:

                # Remove small noise first.
                small_kernel = cv2.getStructuringElement(
                    cv2.MORPH_ELLIPSE,
                    (5, 5)
                )

                clean_mask = cv2.morphologyEx(
                    clean_mask,
                    cv2.MORPH_OPEN,
                    small_kernel,
                    iterations=1
                )

                # Close only small gaps inside the pants.
                close_kernel = cv2.getStructuringElement(
                    cv2.MORPH_ELLIPSE,
                    (5, 5)
                )

                clean_mask = cv2.morphologyEx(
                    clean_mask,
                    cv2.MORPH_CLOSE,
                    close_kernel,
                    iterations=1
                )

            else:

                # Existing behavior for other garments.
                close_kernel = cv2.getStructuringElement(
                    cv2.MORPH_ELLIPSE,
                    (11, 11)
                )

                clean_mask = cv2.morphologyEx(
                    clean_mask,
                    cv2.MORPH_CLOSE,
                    close_kernel,
                    iterations=2
                )


            # -------------------------------------------------
            # FILL ENCLOSED HOLES
            # -------------------------------------------------

            flood_mask = clean_mask.copy()

            flood_fill_mask = np.zeros(
                (
                    flood_mask.shape[0] + 2,
                    flood_mask.shape[1] + 2
                ),
                np.uint8
            )

            cv2.floodFill(
                flood_mask,
                flood_fill_mask,
                (0, 0),
                255
            )

            flood_mask = cv2.bitwise_not(
                flood_mask
            )

            clean_mask = cv2.bitwise_or(
                clean_mask,
                flood_mask
            )


            # -------------------------------------------------
            # KEEP MAIN GARMENT COMPONENTS
            # -------------------------------------------------

            (
                num_labels,
                labels,
                stats,
                _
            ) = cv2.connectedComponentsWithStats(
                clean_mask,
                connectivity=8
            )

            if num_labels > 1:

                if class_id == 9:

                    # -----------------------------------------
                    # SHOES
                    # -----------------------------------------

                    shoe_kernel = cv2.getStructuringElement(
                        cv2.MORPH_ELLIPSE,
                        (41, 41)
                    )

                    clean_mask = cv2.dilate(
                        clean_mask,
                        shoe_kernel,
                        iterations=2
                    )

                    clean_mask = cv2.morphologyEx(
                        clean_mask,
                        cv2.MORPH_CLOSE,
                        shoe_kernel,
                        iterations=2
                    )

                    (
                        num_labels,
                        labels,
                        stats,
                        _
                    ) = cv2.connectedComponentsWithStats(
                        clean_mask,
                        connectivity=8
                    )

                    main_mask = np.zeros_like(
                        clean_mask
                    )

                    for label_id in range(
                        1,
                        num_labels
                    ):

                        area = stats[
                            label_id,
                            cv2.CC_STAT_AREA
                        ]

                        if area >= 500:

                            main_mask[
                                labels == label_id
                            ] = 255

                    clean_mask = main_mask

                else:

                    # -----------------------------------------
                    # OTHER GARMENTS
                    # -----------------------------------------

                    areas = stats[
                        1:,
                        cv2.CC_STAT_AREA
                    ]

                    if len(areas) > 0:

                        largest_area = int(
                            np.max(areas)
                        )

                        main_mask = np.zeros_like(
                            clean_mask
                        )

                        if class_id == 6:

                            # Pants: stricter filtering
                            minimum_area = (
                                largest_area * 0.03
                            )

                        else:

                            minimum_area = (
                                largest_area * 0.015
                            )

                        for label_id in range(
                            1,
                            num_labels
                        ):

                            area = stats[
                                label_id,
                                cv2.CC_STAT_AREA
                            ]

                            if area >= minimum_area:

                                main_mask[
                                    labels == label_id
                                ] = 255

                        clean_mask = main_mask


            # -------------------------------------------------
            # FINAL EDGE CLEANUP
            # -------------------------------------------------

            edge_kernel = cv2.getStructuringElement(
                cv2.MORPH_ELLIPSE,
                (5, 5)
            )

            clean_mask = cv2.morphologyEx(
                clean_mask,
                cv2.MORPH_CLOSE,
                edge_kernel,
                iterations=1
            )

            smooth_mask = cv2.GaussianBlur(
                clean_mask,
                (3, 3),
                0
            )

            mask_image = Image.fromarray(
                smooth_mask,
                mode="L"
            )

            bbox = mask_image.getbbox()


            if bbox is None:
                continue


            # =============================================
            # CROP REGION (with padding)
            # =============================================

            left, top, right, bottom = bbox

            width = right - left
            height = bottom - top

            padding_x = max(20, int(width * 0.10))
            padding_y = max(20, int(height * 0.10))

            left = max(0, left - padding_x)
            top = max(0, top - padding_y)
            right = min(original_image.width, right + padding_x)
            bottom = min(original_image.height, bottom + padding_y)

            original_rgba = original_image.convert("RGBA")


            # =============================================
            # EXTRACT GARMENT
            # =============================================

            if class_id == 9:

                # =============================================
                # SHOES EXTRACTION
                # =============================================

                crop = original_image.crop(
                    (left, top, right, bottom)
                ).convert("RGB")

                crop_np = np.array(crop)

                mask_np = np.array(
                    mask_image.crop(
                        (left, top, right, bottom)
                    )
                )

                grabcut_mask = np.full(
                    mask_np.shape,
                    cv2.GC_PR_BGD,
                    dtype=np.uint8
                )

                grabcut_mask[
                    mask_np > 100
                ] = cv2.GC_FGD

                shoe_seed_kernel = cv2.getStructuringElement(
                    cv2.MORPH_ELLIPSE,
                    (31, 31)
                )

                probable_fg = cv2.dilate(
                    (mask_np > 100).astype(np.uint8),
                    shoe_seed_kernel,
                    iterations=2
                )

                grabcut_mask[
                    probable_fg > 0
                ] = cv2.GC_PR_FGD

                grabcut_mask[
                    mask_np > 100
                ] = cv2.GC_FGD

                grabcut_mask[0, :] = cv2.GC_BGD
                grabcut_mask[-1, :] = cv2.GC_BGD
                grabcut_mask[:, 0] = cv2.GC_BGD
                grabcut_mask[:, -1] = cv2.GC_BGD

                bgd_model = np.zeros(
                    (1, 65),
                    np.float64
                )

                fgd_model = np.zeros(
                    (1, 65),
                    np.float64
                )

                cv2.grabCut(
                    crop_np,
                    grabcut_mask,
                    None,
                    bgd_model,
                    fgd_model,
                    5,
                    cv2.GC_INIT_WITH_MASK
                )

                final_mask = np.where(
                    (grabcut_mask == cv2.GC_FGD)
                    |
                    (grabcut_mask == cv2.GC_PR_FGD),
                    255,
                    0
                ).astype(np.uint8)

                final_mask = cv2.morphologyEx(
                    final_mask,
                    cv2.MORPH_CLOSE,
                    cv2.getStructuringElement(
                        cv2.MORPH_ELLIPSE,
                        (7, 7)
                    ),
                    iterations=1
                )

                extracted_crop = crop.convert("RGBA")

                extracted_crop.putalpha(
                    Image.fromarray(
                        final_mask,
                        mode="L"
                    )
                )

                extracted_image = extracted_crop


            elif class_id == 6:

                # =============================================
                # PANTS EXTRACTION
                # =============================================

                crop = original_image.crop(
                    (left, top, right, bottom)
                ).convert("RGB")

                crop_np = np.array(crop)

                mask_np = np.array(
                    mask_image.crop(
                        (left, top, right, bottom)
                    )
                )

                # Start as probable background.
                grabcut_mask = np.full(
                    mask_np.shape,
                    cv2.GC_PR_BGD,
                    dtype=np.uint8
                )

                # SegFormer pants pixels = definite foreground.
                grabcut_mask[
                    mask_np > 100
                ] = cv2.GC_FGD

                # Expand slightly to allow GrabCut to recover
                # the real visible pants boundary.
                pants_kernel = cv2.getStructuringElement(
                    cv2.MORPH_ELLIPSE,
                    (25, 25)
                )

                probable_fg = cv2.dilate(
                    (mask_np > 100).astype(np.uint8),
                    pants_kernel,
                    iterations=1
                )

                grabcut_mask[
                    probable_fg > 0
                ] = cv2.GC_PR_FGD

                # Keep SegFormer pixels as definite pants.
                grabcut_mask[
                    mask_np > 100
                ] = cv2.GC_FGD

                # Crop boundary = background.
                grabcut_mask[0, :] = cv2.GC_BGD
                grabcut_mask[-1, :] = cv2.GC_BGD
                grabcut_mask[:, 0] = cv2.GC_BGD
                grabcut_mask[:, -1] = cv2.GC_BGD

                bgd_model = np.zeros(
                    (1, 65),
                    np.float64
                )

                fgd_model = np.zeros(
                    (1, 65),
                    np.float64
                )

                cv2.grabCut(
                    crop_np,
                    grabcut_mask,
                    None,
                    bgd_model,
                    fgd_model,
                    5,
                    cv2.GC_INIT_WITH_MASK
                )

                final_mask = np.where(
                    (grabcut_mask == cv2.GC_FGD)
                    |
                    (grabcut_mask == cv2.GC_PR_FGD),
                    255,
                    0
                ).astype(np.uint8)

                # Smooth small jagged edges.
                final_mask = cv2.morphologyEx(
                    final_mask,
                    cv2.MORPH_CLOSE,
                    cv2.getStructuringElement(
                        cv2.MORPH_ELLIPSE,
                        (7, 7)
                    ),
                    iterations=1
                )

                final_mask = cv2.morphologyEx(
                    final_mask,
                    cv2.MORPH_OPEN,
                    cv2.getStructuringElement(
                        cv2.MORPH_ELLIPSE,
                        (3, 3)
                    ),
                    iterations=1
                )

                extracted_crop = crop.convert(
                    "RGBA"
                )

                extracted_crop.putalpha(
                    Image.fromarray(
                        final_mask,
                        mode="L"
                    )
                )

                extracted_image = extracted_crop


            else:

                # =============================================
                # NORMAL CLOTHING EXTRACTION
                # =============================================

                extracted_image = Image.new(
                    "RGBA",
                    original_rgba.size,
                    (255, 255, 255, 0)
                )

                extracted_image.paste(
                    original_rgba,
                    (0, 0),
                    mask_image
                )

                extracted_image = extracted_image.crop(
                    (left, top, right, bottom)
                )
            # =============================================
            # NORMALIZE CATEGORY NAME
            # =============================================

            if class_id == 4:
                detected_category = "Upper"
            elif class_id in [5, 6]:
                detected_category = "Lower"
            elif class_id == 7:
                detected_category = "Dress"
            elif class_id == 9:
                detected_category = "Shoes"
            elif class_id == 1:
                detected_category = "Hat"
            elif class_id == 3:
                detected_category = "Sunglasses"
            elif class_id == 8:
                detected_category = "Belt"
            elif class_id == 16:
                detected_category = "Bag"
            elif class_id == 17:
                detected_category = "Scarf"
            else:
                detected_category = "Clothing"

            # =============================================
            # SAVE THE SPLIT GARMENT (PNG, exact pixels)
            # =============================================

            cropped_filename = (
                "cropped_"
                + detected_category.lower()
                + "_"
                + str(uuid.uuid4())
                + ".png"
            )

            cropped_path = os.path.join(
                UPLOAD_DIR,
                cropped_filename
            )

            extracted_image.save(cropped_path, format="PNG")

            print("Split garment saved:", cropped_path)


            # =============================================
            # DETECT GARMENT COLOR
            # =============================================

            detected_color = detect_garment_color(
                original_image,
                mask_image
            )

            print("Detected color:", detected_color)
            # =============================================
            # CREATE WEBSITE-READY CATALOG IMAGE
            # =============================================

            catalog_basename = (
                "catalog_"
                + detected_category.lower()
                + "_"
                + str(uuid.uuid4())
            )

            catalog_prefix = os.path.join(
                UPLOAD_DIR,
                catalog_basename
            )
            try:

                # -----------------------------------------
                # TRY HUGGING FACE FIRST
                # -----------------------------------------

                print(
                    "Creating Hugging Face catalog image..."
                )

                catalog_img = create_huggingface_catalog_image(
                    extracted_image,
                    detected_category
                )

                # -----------------------------------------
                # FALLBACK TO LOCAL CATALOG GENERATOR
                # -----------------------------------------

                if catalog_img is None:

                    print(
                        "Hugging Face unavailable. "
                        "Using local catalog generator."
                    )

                    catalog_img = create_catalog_image(
                        extracted_image
                    )

                # -----------------------------------------
                # SAVE CATALOG IMAGE
                # -----------------------------------------

                webp_name, jpg_name = save_catalog_web(
                    catalog_img,
                    catalog_prefix
                )

                final_image_url = (
                    "/uploads/" + webp_name
                )

                print(
                    "Catalog image created:",
                    final_image_url
                )

            except Exception as catalog_error:

                print(
                    "Catalog conversion failed:",
                    str(catalog_error)
                )

                # Final fallback: raw extracted garment
                final_image_url = (
                    "/uploads/" + cropped_filename
                )


            # =============================================
            # COLLECT RESULT
            # =============================================

            extracted_items.append({

                "category": detected_category,

                "color": detected_color,

                "image": final_image_url

            })

            print("FINAL WARDROBE IMAGE:", final_image_url)


        # =================================================
        # 6. CHECK RESULTS
        # =================================================

        if not extracted_items:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not isolate any clothing "
                    "items from the image."
                )
            )

        print(
            "TOTAL GARMENTS EXTRACTED:",
            len(extracted_items)
        )


        # =================================================
        # 7. RETURN ALL GARMENTS
        # =================================================

        return {

            "message": (
                "AI clothing catalog images "
                "created successfully!"
            ),

            "items": extracted_items

        }


    except HTTPException:

        raise

    except Exception as e:

        print("CLOTHING EXTRACTION ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
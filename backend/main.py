import os
import shutil
import uuid
import io

import cv2
import numpy as np
import torch

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from bson import ObjectId
from datetime import datetime

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener
import asyncio

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

app = FastAPI(title="AI Stylist API")
# =====================================================
# LOCAL FLUX.2 KLEIN CONFIGURATION
# =====================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MFLUX_EXECUTABLE = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        ".venv-mflux",
        "bin",
        "mflux-generate-flux2-edit"
    )
)

print("MFLUX executable:", MFLUX_EXECUTABLE)

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

clothing_model = AutoModelForSemanticSegmentation.from_pretrained(
    CLOTHING_MODEL
)

clothing_model.eval()

print("AI clothing segmentation model loaded successfully!")


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():
    return {
        "message": "AI Stylist Backend is running!"
    }


# =====================================================
# TEST DATABASE
# =====================================================

@app.get("/test-db")
def test_database():

    try:
        db.command("ping")

        return {
            "message": "MongoDB is connected!"
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =====================================================
# REGISTER USER
# =====================================================

@app.post("/register")
def register_user(user: UserCreate):

    existing_user = db["users"].find_one(
        {"email": user.email}
    )

    if existing_user:
        return {
            "error": "Email already registered"
        }

    hashed_password = password_hash.hash(
        user.password
    )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    result = db["users"].insert_one(
        new_user
    )

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
        return {
            "error": "Invalid email or password"
        }

    password_correct = password_hash.verify(
        user.password,
        existing_user["password"]
    )

    if not password_correct:
        return {
            "error": "Invalid email or password"
        }

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
    image: UploadFile = File(None)
):

    image_path = None

    if image:

        file_extension = os.path.splitext(
            image.filename
        )[1]

        unique_filename = (
            str(uuid.uuid4()) + file_extension
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            unique_filename
        )

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                image.file,
                buffer
            )

        image_path = f"/uploads/{unique_filename}"

    new_clothing = {
        "user_id": user_id,
        "item_name": item_name,
        "category": category,
        "color": color,
        "occasion": occasion,
        "season": season,
        "image": image_path,
        "created_at": datetime.utcnow()
    }

    result = db["wardrobe"].insert_one(
        new_clothing
    )

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
        db["wardrobe"].find(
            {"user_id": user_id}
        )
    )

    for clothing in clothes:
        clothing["_id"] = str(
            clothing["_id"]
        )

    return clothes


# =====================================================
# CREATE PRODUCT CANVAS
# =====================================================
def create_product_canvas(
    garment_rgba: Image.Image,
    canvas_size: int = 1024
):
    """
    Creates a clean e-commerce/catalog style product image.

    This does NOT generate or hallucinate clothing.
    It only cleans the existing segmentation mask,
    preserves the original garment pixels, centers the item,
    and places it on a clean white catalog background.
    """

    garment_rgba = garment_rgba.convert("RGBA")

    # ---------------------------------------------------------
    # 1. Extract alpha mask
    # ---------------------------------------------------------

    alpha = np.array(
        garment_rgba.getchannel("A")
    )

    # Make the mask binary
    mask = np.where(
        alpha > 20,
        255,
        0
    ).astype(np.uint8)

    # ---------------------------------------------------------
    # 2. Remove tiny segmentation noise
    # ---------------------------------------------------------

    kernel_small = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (5, 5)
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_OPEN,
        kernel_small
    )

    # ---------------------------------------------------------
    # 3. Close small gaps / tears in the garment
    # ---------------------------------------------------------

    kernel_close = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (15, 15)
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_CLOSE,
        kernel_close
    )

    # ---------------------------------------------------------
    # 4. Keep the main garment contour
    # ---------------------------------------------------------

    contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        raise ValueError(
            "Could not find garment contour."
        )

    largest_contour = max(
        contours,
        key=cv2.contourArea
    )

    # Create a completely clean mask
    clean_mask = np.zeros_like(mask)

    cv2.drawContours(
        clean_mask,
        [largest_contour],
        -1,
        255,
        thickness=cv2.FILLED
    )

    # ---------------------------------------------------------
    # 5. Fill small internal holes
    # ---------------------------------------------------------

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

    flood_fill_masked = cv2.bitwise_not(
        flood_mask
    )

    clean_mask = (
        clean_mask |
        flood_fill_masked
    )

    # ---------------------------------------------------------
    # 6. Smooth the mask boundary
    # ---------------------------------------------------------

    smooth_kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (7, 7)
    )

    clean_mask = cv2.morphologyEx(
        clean_mask,
        cv2.MORPH_CLOSE,
        smooth_kernel
    )

    # Slight blur removes jagged pixel edges
    clean_mask = cv2.GaussianBlur(
        clean_mask,
        (5, 5),
        0
    )

    # ---------------------------------------------------------
    # 7. Put cleaned mask back onto original garment
    # ---------------------------------------------------------

    original_array = np.array(
        garment_rgba
    )

    original_array[:, :, 3] = clean_mask

    garment_rgba = Image.fromarray(
        original_array,
        mode="RGBA"
    )

    # ---------------------------------------------------------
    # 8. Crop tightly around garment
    # ---------------------------------------------------------

    bbox = garment_rgba.getchannel(
        "A"
    ).getbbox()

    if bbox is None:
        raise ValueError(
            "Garment mask is empty."
        )

    garment_rgba = garment_rgba.crop(
        bbox
    )

    # ---------------------------------------------------------
    # 9. Add catalog margins
    # ---------------------------------------------------------

    garment_width, garment_height = (
        garment_rgba.size
    )

    margin_x = int(
        canvas_size * 0.12
    )

    margin_y = int(
        canvas_size * 0.08
    )

    available_width = (
        canvas_size -
        (margin_x * 2)
    )

    available_height = (
        canvas_size -
        (margin_y * 2)
    )

    scale = min(
        available_width / garment_width,
        available_height / garment_height
    )

    new_width = max(
        1,
        int(garment_width * scale)
    )

    new_height = max(
        1,
        int(garment_height * scale)
    )

    garment_rgba = garment_rgba.resize(
        (
            new_width,
            new_height
        ),
        Image.Resampling.LANCZOS
    )

    # ---------------------------------------------------------
    # 10. Create pure white catalog background
    # ---------------------------------------------------------

    canvas = Image.new(
        "RGBA",
        (
            canvas_size,
            canvas_size
        ),
        (
            255,
            255,
            255,
            255
        )
    )

    # ---------------------------------------------------------
    # 11. Create subtle product shadow
    # ---------------------------------------------------------

    alpha = garment_rgba.getchannel(
        "A"
    )

    shadow = Image.new(
        "RGBA",
        garment_rgba.size,
        (
            0,
            0,
            0,
            0
        )
    )

    shadow_alpha = alpha.point(
        lambda p: int(p * 0.12)
    )

    shadow.putalpha(
        shadow_alpha
    )

    # Slightly blur shadow
    from PIL import ImageFilter

    shadow = shadow.filter(
        ImageFilter.GaussianBlur(
            radius=12
        )
    )

    # ---------------------------------------------------------
    # 12. Center garment
    # ---------------------------------------------------------

    x = (
        canvas_size -
        new_width
    ) // 2

    y = (
        canvas_size -
        new_height
    ) // 2

    # Put shadow slightly below garment
    canvas.alpha_composite(
        shadow,
        (
            x,
            y + 8
        )
    )

    # Put actual garment on top
    canvas.alpha_composite(
        garment_rgba,
        (
            x,
            y
        )
    )

    return canvas.convert(
        "RGB"
    )
    # =====================================================
# GENERATE AI CATALOG IMAGE WITH LOCAL FLUX
# =====================================================

async def generate_catalog_image(
    input_path: str,
    output_path: str
):
    prompt = """
Create a professional e-commerce catalog photograph
of the exact clothing item in the reference image.

Preserve the exact garment:
- garment type
- color
- fabric appearance
- pattern
- plaid/check pattern
- collar
- sleeve length
- cuffs
- pockets
- pocket placement
- buttons
- seams
- stitching
- proportions
- hem shape
- all visible design details

Remove:
- person
- body
- hands
- bed
- room
- furniture
- hanger
- background clutter

Show only the complete clothing item.

Place it centered on a clean pure white studio background.

The clothing must remain faithful to the reference image.

Do NOT redesign the garment.
Do NOT change the garment color.
Do NOT change the pattern.
Do NOT change sleeve length.
Do NOT add pockets.
Do NOT remove pockets.
Do NOT add buttons.
Do NOT remove buttons.
Do NOT invent logos or graphics.
Do NOT change the collar.
Do NOT change the garment proportions.

Create a realistic professional e-commerce catalog product photograph.
"""

    command = [
        MFLUX_EXECUTABLE,

        "--model",
        "mlx-community/flux2-klein-4b-4bit",

        "--low-ram",

        "--vae-tile-size",
        "256",

        "--image-paths",
        input_path,

        "--prompt",
        prompt,

        "--steps",
        "4",

        "--output",
        output_path
    ]

    print("====================================")
    print("STARTING LOCAL FLUX GENERATION")
    print("Input:", input_path)
    print("Output:", output_path)
    print("====================================")

    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )

    while True:

        line = await process.stdout.readline()

        if not line:
            break

        print(
            line.decode(
                "utf-8",
                errors="replace"
            ).rstrip()
        )

    return_code = await process.wait()

    if return_code != 0:

        raise RuntimeError(
            f"FLUX generation failed with exit code {return_code}"
        )

    if not os.path.exists(output_path):

        raise RuntimeError(
            "FLUX finished but the output image was not created."
        )

    print("FLUX catalog image created successfully.")

    return output_path
    # =====================================================
# AI CLOTHING EXTRACTION + PRODUCT IMAGE
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
        print("Content type:", image.content_type)
        print("====================================")

        # =================================================
        # 1. READ ORIGINAL IMAGE
        # =================================================

        image_bytes = await image.read()

        if not image_bytes:
            raise HTTPException(
                status_code=400,
                detail="No image was uploaded."
            )

        # =================================================
        # 2. OPEN IMAGE
        # =================================================

        try:

            original_image = Image.open(
                io.BytesIO(image_bytes)
            )

            print(
                "Original format:",
                original_image.format
            )

            print(
                "Original size:",
                original_image.size
            )

            original_image.load()

            # Correct phone camera orientation
            original_image = ImageOps.exif_transpose(
                original_image
            )

            original_image = original_image.convert(
                "RGB"
            )

        except Exception as e:

            raise HTTPException(
                status_code=400,
                detail=f"Could not decode image: {str(e)}"
            )

        # =================================================
        # 3. RUN CLOTHING SEGMENTATION
        # =================================================

        print("Running clothing segmentation...")

        inputs = image_processor(
            images=original_image,
            return_tensors="pt"
        )

        with torch.no_grad():

            outputs = clothing_model(
                **inputs
            )

        # =================================================
        # 4. RESIZE SEGMENTATION
        # =================================================

        logits = outputs.logits

        logits = torch.nn.functional.interpolate(
            logits,
            size=original_image.size[::-1],
            mode="bilinear",
            align_corners=False
        )

        segmentation = logits.argmax(
            dim=1
        )[0]

        # =================================================
        # 5. CLOTHING CLASSES
        # =================================================

        CATEGORY_CLASSES = {

            "upper": [4],

            "shirt": [4],

            "tshirt": [4],

            "t-shirt": [4],

            "top": [4],

            "dress": [7],

            "skirt": [5],

            "pants": [6],

            "trousers": [6],

            "shoes": [9, 10],

            "shoe": [9, 10]
        }

        category = category.lower().strip()

        # =================================================
        # 6. AUTO DETECTION
        # =================================================

        if category == "auto":

            garment_classes = {
                4: "upper",
                5: "skirt",
                6: "pants",
                7: "dress"
            }

            detected_areas = {}

            for class_id in garment_classes:

                area = (
                    segmentation == class_id
                ).sum().item()

                detected_areas[class_id] = area

            selected_class = max(
                detected_areas,
                key=detected_areas.get
            )

            selected_classes = [
                selected_class
            ]

            detected_category = (
                garment_classes[selected_class]
            )

            print(
                "AUTO DETECTED:",
                detected_category
            )

        else:

            if category not in CATEGORY_CLASSES:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Unsupported category. "
                        "Use auto, shirt, tshirt, "
                        "top, dress, skirt, pants "
                        "or shoes."
                    )
                )

            selected_classes = (
                CATEGORY_CLASSES[category]
            )

            detected_category = category

        # =================================================
        # 7. CREATE MASK
        # =================================================

        clothing_mask = torch.zeros_like(
            segmentation,
            dtype=torch.bool
        )

        for class_id in selected_classes:

            clothing_mask |= (
                segmentation == class_id
            )

        mask = (
            clothing_mask
            .cpu()
            .numpy()
            .astype("uint8")
            * 255
        )

        # =================================================
        # 8. CHECK MASK
        # =================================================

        if not np.any(mask):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not detect the "
                    "requested clothing item."
                )
            )

        # =================================================
        # 9. KEEP LARGEST CLOTHING REGION
        # =================================================

        num_labels, labels, stats, centroids = (
            cv2.connectedComponentsWithStats(
                mask,
                connectivity=8
            )
        )

        if num_labels > 1:

            largest_label = (
                1
                + np.argmax(
                    stats[
                        1:,
                        cv2.CC_STAT_AREA
                    ]
                )
            )

            clean_mask = np.zeros_like(
                mask
            )

            clean_mask[
                labels == largest_label
            ] = 255

        else:

            clean_mask = mask

        # =================================================
        # 10. CLEAN MASK
        # =================================================

        kernel = np.ones(
            (5, 5),
            np.uint8
        )

        clean_mask = cv2.morphologyEx(
            clean_mask,
            cv2.MORPH_CLOSE,
            kernel
        )

        clean_mask = cv2.morphologyEx(
            clean_mask,
            cv2.MORPH_OPEN,
            kernel
        )

        mask_image = Image.fromarray(
            clean_mask,
            mode="L"
        )

        # =================================================
        # 11. EXTRACT ORIGINAL CLOTHING
        # =================================================

        original_rgba = original_image.convert(
            "RGBA"
        )

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

        # =================================================
        # 12. CROP CLOTHING
        # =================================================

        bbox = mask_image.getbbox()

        if bbox is None:

            raise HTTPException(
                status_code=400,
                detail="Could not isolate clothing."
            )

        left, top, right, bottom = bbox

        width = right - left
        height = bottom - top

        padding_x = int(
            width * 0.08
        )

        padding_y = int(
            height * 0.08
        )

        left = max(
            0,
            left - padding_x
        )

        top = max(
            0,
            top - padding_y
        )

        right = min(
            original_rgba.width,
            right + padding_x
        )

        bottom = min(
            original_rgba.height,
            bottom + padding_y
        )

        extracted_image = extracted_image.crop(
            (
                left,
                top,
                right,
                bottom
            )
        )

        # =================================================
        # 13. CREATE AI CATALOG IMAGE
        # =================================================

        print(
            "Creating AI catalog image with FLUX.2 Klein..."
        )

        # Save the ORIGINAL image temporarily.
        # We intentionally use the original photo here,
        # rather than the segmented/torn-out garment.
        input_filename = (
            "flux_input_"
            + str(uuid.uuid4())
            + ".png"
        )

        input_path = os.path.join(
            UPLOAD_DIR,
            input_filename
        )

        original_image.save(
            input_path,
            format="PNG"
        )

        # Final catalog image
        unique_filename = (
            "product_"
            + str(uuid.uuid4())
            + ".png"
        )

        product_path = os.path.join(
            UPLOAD_DIR,
            unique_filename
        )

        try:

            await generate_catalog_image(
            input_path,
            product_path
            )

        finally:

            # Remove temporary input image
            if os.path.exists(input_path):

                os.remove(input_path)


            image_url = (
                "/uploads/"
                + unique_filename
            )

            print(
                "AI catalog image created:",
                product_path
            )

        # =================================================
        # 14. SAVE PRODUCT IMAGE
        # =================================================

        unique_filename = (
            "product_"
            + str(uuid.uuid4())
            + ".png"
        )

        product_path = os.path.join(
            UPLOAD_DIR,
            unique_filename
        )

        product_canvas.save(
            product_path,
            format="PNG"
        )

        image_url = (
            "/uploads/"
            + unique_filename
        )

        print(
            "Local product image created:",
            product_path
        )

        # =================================================
        # 15. RETURN RESULT
        # =================================================

        return {
            "message": (
            "AI clothing catalog image "
            "created successfully!"
        ),
        "category": detected_category,
        "image": image_url
        }
    except HTTPException:
        raise

    except Exception as e:

        print(
            "CLOTHING EXTRACTION ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =====================================================
# DELETE CLOTHING FROM WARDROBE
# =====================================================

@app.delete("/wardrobe/{clothing_id}")
def delete_clothing(
    clothing_id: str,
    user_id: str
):

    try:

        object_id = ObjectId(
            clothing_id
        )

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

    # =================================================
    # DELETE IMAGE FILE
    # =================================================

    image_path = clothing.get(
        "image"
    )

    if image_path:

        filename = os.path.basename(
            image_path
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        if os.path.exists(file_path):

            os.remove(file_path)

    # =================================================
    # DELETE DATABASE DOCUMENT
    # =================================================

    result = db["wardrobe"].delete_one(
        {
            "_id": object_id,
            "user_id": user_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail=(
                "Clothing item could not be deleted."
            )
        )

    return {
        "message": (
            "Clothing item deleted successfully!"
        ),
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

        object_id = ObjectId(
            clothing_id
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid clothing ID."
        )

    existing_clothing = db["wardrobe"].find_one(
        {
            "_id": object_id,
            "user_id": user_id
        }
    )

    if not existing_clothing:

        raise HTTPException(
            status_code=404,
            detail="Clothing item not found."
        )

    updated_data = {
        "item_name": item_name,
        "category": category,
        "color": color,
        "occasion": occasion,
        "season": season
    }

    db["wardrobe"].update_one(
        {
            "_id": object_id,
            "user_id": user_id
        },
        {
            "$set": updated_data
        }
    )

    return {
        "message": (
            "Clothing item updated successfully!"
        ),
        "clothing_id": clothing_id
    }
import os
import shutil
import uuid
import io
import asyncio

import cv2
import numpy as np
import torch

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

from PIL import Image, ImageOps, ImageFilter
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

app = FastAPI(
    title="AI Stylist API"
)


# =====================================================
# LOCAL FLUX.2 KLEIN CONFIGURATION
# =====================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MFLUX_EXECUTABLE = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        ".venv-mflux",
        "bin",
        "mflux-generate-flux2-edit"
    )
)

MFLUX_FILL_EXECUTABLE = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        ".venv-mflux",
        "bin",
        "mflux-generate-fill"
    )
)

print(
    "MFLUX executable:",
    MFLUX_EXECUTABLE
)


# =====================================================
# UPLOAD DIRECTORY
# =====================================================

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(
        directory=UPLOAD_DIR
    ),
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

CLOTHING_MODEL = (
    "mattmdjaga/segformer_b2_clothes"
)

print(
    "Loading AI clothing segmentation model..."
)

image_processor = (
    AutoImageProcessor.from_pretrained(
        CLOTHING_MODEL
    )
)

clothing_model = (
    AutoModelForSemanticSegmentation.from_pretrained(
        CLOTHING_MODEL
    )
)

clothing_model.eval()

print(
    "AI clothing segmentation model loaded successfully!"
)


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": (
            "AI Stylist Backend is running!"
        )
    }


# =====================================================
# TEST DATABASE
# =====================================================

@app.get("/test-db")
def test_database():

    try:

        db.command("ping")

        return {
            "message": (
                "MongoDB is connected!"
            )
        }

    except Exception as e:

        return {
            "error": str(e)
        }


# =====================================================
# REGISTER USER
# =====================================================

@app.post("/register")
def register_user(
    user: UserCreate
):

    existing_user = db["users"].find_one(
        {
            "email": user.email
        }
    )

    if existing_user:

        return {
            "error": (
                "Email already registered"
            )
        }

    hashed_password = (
        password_hash.hash(
            user.password
        )
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
        "message": (
            "User registered successfully!"
        ),
        "user_id": str(
            result.inserted_id
        )
    }


# =====================================================
# LOGIN USER
# =====================================================

@app.post("/login")
def login_user(
    user: UserLogin
):

    existing_user = db["users"].find_one(
        {
            "email": user.email
        }
    )

    if not existing_user:

        return {
            "error": (
                "Invalid email or password"
            )
        }

    password_correct = (
        password_hash.verify(
            user.password,
            existing_user["password"]
        )
    )

    if not password_correct:

        return {
            "error": (
                "Invalid email or password"
            )
        }

    return {
        "message": (
            "Login successful!"
        ),
        "user": {
            "id": str(
                existing_user["_id"]
            ),
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
        )[1]

        unique_filename = (
            str(uuid.uuid4())
            + file_extension
        )

        file_path = os.path.join(
            UPLOAD_DIR,
            unique_filename
        )

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                image.file,
                buffer
            )

        image_path = (
            f"/uploads/{unique_filename}"
        )

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

    result = db["wardrobe"].insert_one(
        new_clothing
    )

    return {
        "message": (
            "Clothing item added successfully!"
        ),
        "clothing_id": str(
            result.inserted_id
        ),
        "image": image_path
    }


# =====================================================
# GET WARDROBE
# =====================================================

@app.get("/wardrobe")
def get_wardrobe(
    user_id: str
):

    clothes = list(
        db["wardrobe"].find(
            {
                "user_id": user_id
            }
        )
    )

    for clothing in clothes:

        clothing["_id"] = str(
            clothing["_id"]
        )

    return clothes


# =====================================================
# OUTFIT RECOMMENDATION
# =====================================================

@app.get("/recommend-outfit")
def recommend_outfit(
    user_id: str,
    occasion: str,
    style: str
):

    clothes = list(
        db["wardrobe"].find(
            {
                "user_id": user_id
            }
        )
    )

    if not clothes:

        return {
            "message": (
                "No wardrobe items found."
            ),
            "outfit": []
        }

    occasion_lower = (
        occasion.lower()
    )

    style_lower = (
        style.lower()
    )


    # -------------------------------------------------
    # Filter by occasion
    # -------------------------------------------------

    occasion_items = []

    for item in clothes:

        item_occasion = str(
            item.get(
                "occasion",
                ""
            )
        ).lower()

        if (
            item_occasion == occasion_lower
            or item_occasion == "all"
            or item_occasion == ""
        ):

            occasion_items.append(
                item
            )


    # If no exact occasion matches,
    # use all wardrobe items.

    if not occasion_items:

        occasion_items = clothes


    # -------------------------------------------------
    # Filter by style
    # -------------------------------------------------

    style_items = []

    for item in occasion_items:

        item_style = str(
            item.get(
                "style",
                ""
            )
        ).lower()

        if (
            item_style == style_lower
            or item_style == "all"
            or item_style == ""
        ):

            style_items.append(
                item
            )


    # If no style matches,
    # keep occasion-filtered items.

    if style_items:

        occasion_items = (
            style_items
        )


    # -------------------------------------------------
    # Categorize wardrobe
    # -------------------------------------------------

    upper_items = []
    lower_items = []
    dress_items = []
    shoe_items = []

    for item in occasion_items:

        category = str(
            item.get(
                "category",
                ""
            )
        ).lower()

        if category in [
            "upper",
            "shirt",
            "tshirt",
            "t-shirt",
            "top",
            "blouse"
        ]:

            upper_items.append(
                item
            )

        elif category in [
            "lower",
            "pants",
            "trousers",
            "jeans",
            "skirt"
        ]:

            lower_items.append(
                item
            )

        elif category in [
            "dress",
            "gown"
        ]:

            dress_items.append(
                item
            )

        elif category in [
            "shoe",
            "shoes",
            "footwear"
        ]:

            shoe_items.append(
                item
            )


    # -------------------------------------------------
    # Build outfit
    # -------------------------------------------------

    outfit = []


    # Dress can form the main outfit.

    if dress_items:

        outfit.append(
            dress_items[0]
        )


    # Otherwise combine upper + lower.

    elif (
        upper_items
        and lower_items
    ):

        outfit.append(
            upper_items[0]
        )

        outfit.append(
            lower_items[0]
        )


    # If only upper exists.

    elif upper_items:

        outfit.append(
            upper_items[0]
        )


    # If only lower exists.

    elif lower_items:

        outfit.append(
            lower_items[0]
        )


    # Add shoes when available.

    if shoe_items:

        outfit.append(
            shoe_items[0]
        )


    # -------------------------------------------------
    # Convert MongoDB ObjectIds
    # -------------------------------------------------

    for item in outfit:

        item["_id"] = str(
            item["_id"]
        )


    # -------------------------------------------------
    # Explanation
    # -------------------------------------------------

    if outfit:

        recommendation = (
            f"Here is a {style} outfit for your "
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
        "style": style,
        "outfit": outfit
    }


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
# CREATE CLEAN CATALOG IMAGE WITHOUT AI GENERATION
# =====================================================
# =====================================================
# FLUX.2 KLEIN MASKED GARMENT RECONSTRUCTION
# =====================================================

def generate_masked_garment_with_flux(
    image_path: str,
    mask_path: str,
    output_path: str,
    prompt: str,
):
    """
    Uses local FLUX.2 Klein Fill to reconstruct ONLY
    the masked/occluded region.

    The visible garment is supplied as the original image.
    The mask determines what FLUX is allowed to regenerate.
    """

    import subprocess

    command = [
        MFLUX_FILL_EXECUTABLE,
        "--model",
        "flux2-klein-4b",
        "--image-path",
        image_path,
        "--masked-image-path",
        mask_path,
        "--prompt",
        prompt,
        "--output",
        output_path,
    ]

    print("Running FLUX.2 Klein masked reconstruction...")
    print("Prompt:", prompt)

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print("FLUX Fill failed:")
        print(result.stdout)
        print(result.stderr)
        raise RuntimeError(
            "FLUX.2 Klein masked reconstruction failed."
        )

    print("FLUX reconstruction completed:")
    print(output_path)

    return output_path
def create_reconstruction_mask(
    garment_rgba: Image.Image,
):
    """
    Creates a FLUX.2 Klein Fill mask matching the
    exact dimensions of the supplied garment image.

    BLACK (0)   = preserve original pixels
    WHITE (255) = FLUX may reconstruct
    """

    garment_rgba = garment_rgba.convert("RGBA")

    alpha = garment_rgba.getchannel("A")

    visible_mask = alpha.point(
        lambda p: 255 if p > 15 else 0
    )

    # Everything starts as reconstructable.
    reconstruction_mask = Image.new(
        "L",
        garment_rgba.size,
        255
    )

    # Visible garment is protected.
    reconstruction_mask.paste(
        0,
        mask=visible_mask
    )

    return reconstruction_mask
    """
    Creates a mask for FLUX.2 Klein Fill.

    WHITE (255) = FLUX may reconstruct
    BLACK (0)   = preserve the original pixels
    """

    garment_rgba = garment_rgba.convert("RGBA")

    alpha = garment_rgba.getchannel("A")

    # Anything already detected as garment is protected.
    visible_mask = alpha.point(
        lambda p: 255 if p > 15 else 0
    )

    # Start with everything hidden.
    reconstruction_mask = Image.new(
        "L",
        garment_rgba.size,
        255
    )

    # Protect the visible garment.
    reconstruction_mask.paste(
        0,
        mask=visible_mask
    )

    # Put the mask onto the same catalog canvas.
    final_mask = Image.new(
        "L",
        (canvas_size, canvas_size),
        255
    )

    bbox = visible_mask.getbbox()

    if bbox is None:
        raise ValueError("Garment mask is empty.")

    garment_width = bbox[2] - bbox[0]
    garment_height = bbox[3] - bbox[1]

    max_width = int(canvas_size * 0.72)
    max_height = int(canvas_size * 0.78)

    scale = min(
        max_width / garment_width,
        max_height / garment_height
    )

    new_width = max(1, int(garment_width * scale))
    new_height = max(1, int(garment_height * scale))

    visible_mask = visible_mask.crop(bbox)
    visible_mask = visible_mask.resize(
        (new_width, new_height),
        Image.Resampling.LANCZOS
    )

    x = (canvas_size - new_width) // 2
    y = (canvas_size - new_height) // 2

    # Black = protected visible garment.
    final_mask.paste(
        0,
        (x, y),
        visible_mask
    )

    return final_mask
def create_clean_catalog_image(
    garment_rgba: Image.Image,
    canvas_size: int = 1024
):
    """
    Creates the clean isolated catalog presentation
    from the already-segmented garment.

    IMPORTANT:
    - Does NOT use AI generation.
    - Does NOT redesign the garment.
    - Does NOT change the garment's colors or pattern.
    - Preserves the original garment pixels.
    - Only handles catalog presentation.
    """

    from PIL import ImageFilter

    garment_rgba = garment_rgba.convert("RGBA")

    # -------------------------------------------------
    # 1. Get the existing segmentation mask
    # -------------------------------------------------

    alpha = garment_rgba.getchannel("A")

    # Remove only almost-invisible pixels.
    alpha = alpha.point(
        lambda p: 0 if p < 15 else p
    )

    bbox = alpha.getbbox()

    if bbox is None:
        raise ValueError(
            "Garment mask is empty."
        )

    # -------------------------------------------------
    # 2. Crop tightly around the actual garment
    # -------------------------------------------------

    garment = garment_rgba.crop(bbox)

    alpha = garment.getchannel("A")

    # Very gentle edge smoothing.
    # This changes only the transparency edge,
    # not the garment's RGB pixels.
    alpha = alpha.filter(
        ImageFilter.GaussianBlur(
            radius=1.0
        )
    )

    garment.putalpha(alpha)

    # -------------------------------------------------
    # 3. Scale garment for catalog framing
    # -------------------------------------------------

    garment_width, garment_height = garment.size

    max_width = int(
        canvas_size * 0.72
    )

    max_height = int(
        canvas_size * 0.78
    )

    scale = min(
        max_width / garment_width,
        max_height / garment_height
    )

    new_width = max(
        1,
        int(garment_width * scale)
    )

    new_height = max(
        1,
        int(garment_height * scale)
    )

    garment = garment.resize(
        (
            new_width,
            new_height
        ),
        Image.Resampling.LANCZOS
    )

    # -------------------------------------------------
    # 4. Create clean studio background
    # -------------------------------------------------

    canvas = Image.new(
        "RGBA",
        (
            canvas_size,
            canvas_size
        ),
        (
            250,
            250,
            248,
            255
        )
    )

    # -------------------------------------------------
    # 5. Create subtle product shadow
    # -------------------------------------------------

    shadow = Image.new(
        "RGBA",
        garment.size,
        (
            0,
            0,
            0,
            0
        )
    )

    shadow_alpha = garment.getchannel(
        "A"
    ).point(
        lambda p: int(p * 0.14)
    )

    shadow.putalpha(
        shadow_alpha
    )

    shadow = shadow.filter(
        ImageFilter.GaussianBlur(
            radius=14
        )
    )

    # -------------------------------------------------
    # 6. Center garment
    # -------------------------------------------------

    x = (
        canvas_size -
        new_width
    ) // 2

    y = (
        canvas_size -
        new_height
    ) // 2

    # Shadow slightly below garment.
    canvas.alpha_composite(
        shadow,
        (
            x,
            y + 10
        )
    )

    # Exact garment on top.
    canvas.alpha_composite(
        garment,
        (
            x,
            y
        )
    )

    # -------------------------------------------------
    # 7. Return final catalog image
    # -------------------------------------------------

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

    print(
        "===================================="
    )

    print(
        "STARTING LOCAL FLUX GENERATION"
    )

    print(
        "Input:",
        input_path
    )

    print(
        "Output:",
        output_path
    )

    print(
        "===================================="
    )


    process = (
        await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )
    )


    while True:

        line = (
            await process.stdout.readline()
        )

        if not line:
            break

        print(
            line.decode(
                "utf-8",
                errors="replace"
            ).rstrip()
        )


    return_code = (
        await process.wait()
    )


    if return_code != 0:

        raise RuntimeError(
            "FLUX generation failed "
            f"with exit code {return_code}"
        )


    if not os.path.exists(
        output_path
    ):

        raise RuntimeError(
            "FLUX finished but the output "
            "image was not created."
        )


    print(
        "FLUX catalog image created successfully."
    )

    return output_path


# =====================================================
# GARMENT COLOR DETECTION
# =====================================================

def detect_garment_color(
    image: Image.Image,
    mask: Image.Image
):

    """
    Estimate the dominant visible color of a garment
    using only pixels inside its segmentation mask.
    """

    image_rgb = np.array(
        image.convert("RGB")
    )

    mask_array = np.array(
        mask
    )


    # -------------------------------------------------
    # Get only pixels inside garment mask
    # -------------------------------------------------

    pixels = image_rgb[
        mask_array > 128
    ]


    if len(pixels) == 0:

        return "unknown"


    # -------------------------------------------------
    # Remove extreme near-white pixels where possible
    # -------------------------------------------------

    filtered_pixels = pixels[
        np.sum(
            pixels,
            axis=1
        ) < 735
    ]


    if len(filtered_pixels) > 0:

        pixels = filtered_pixels


    # -------------------------------------------------
    # Calculate average color
    # -------------------------------------------------

    mean_color = np.mean(
        pixels,
        axis=0
    )

    r, g, b = mean_color


    # -------------------------------------------------
    # Color classification
    # -------------------------------------------------

    if (
        r > 200
        and g > 200
        and b > 200
    ):

        return "white"


    if (
        r < 60
        and g < 60
        and b < 60
    ):

        return "black"


    if (
        abs(r - g) < 25
        and abs(g - b) < 25
    ):

        if r < 130:

            return "dark gray"

        return "gray"


    if (
        r > g * 1.25
        and r > b * 1.25
    ):

        return "red"


    if (
        r > 150
        and g > 100
        and b < 100
    ):

        return "orange"


    if (
        r > 150
        and g > 130
        and b < 130
    ):

        return "yellow"


    if (
        g > r * 1.2
        and g > b * 1.1
    ):

        return "green"


    if (
        b > r * 1.2
        and b > g * 1.1
    ):

        return "blue"


    if (
        r > 100
        and b > 100
        and r > g * 1.1
    ):

        return "purple"


    return "multicolor"


# =====================================================
# AI CLOTHING EXTRACTION
# =====================================================

@app.post("/extract-clothing")
async def extract_clothing(
    image: UploadFile = File(...),
    category: str = Form("auto")
):

    try:

        print(
            "===================================="
        )

        print(
            "CLOTHING EXTRACTION STARTED"
        )

        print(
            "Filename:",
            image.filename
        )

        print(
            "Content type:",
            image.content_type
        )

        print(
            "===================================="
        )


        image_bytes = (
            await image.read()
        )


        if not image_bytes:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No image was uploaded."
                )
            )


        # =================================================
        # 1. OPEN IMAGE
        # =================================================

        try:

            original_image = Image.open(
                io.BytesIO(
                    image_bytes
                )
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


            original_image = (
                ImageOps.exif_transpose(
                    original_image
                )
            )


            original_image = (
                original_image.convert(
                    "RGB"
                )
            )


        except Exception as e:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not decode image: "
                    f"{str(e)}"
                )
            )


        # =================================================
        # 2. RUN CLOTHING SEGMENTATION
        # =================================================

        print(
            "Running clothing segmentation..."
        )


        inputs = image_processor(
            images=original_image,
            return_tensors="pt"
        )


        with torch.no_grad():

            outputs = clothing_model(
                **inputs
            )


        logits = outputs.logits


        logits = (
            torch.nn.functional.interpolate(
                logits,
                size=original_image.size[::-1],
                mode="bilinear",
                align_corners=False
            )
        )


        segmentation = (
            logits.argmax(dim=1)[0]
        )


        # =================================================
        # 3. CLOTHING CLASS DEFINITIONS
        # =================================================

        garment_classes = {

            4: "upper",

            5: "lower",

            6: "lower",

            7: "dress"

        }


        category = (
            category.lower()
            .strip()
        )


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


            "dress": [7]

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

                detected_areas[
                    class_id
                ] = area


            print(
                "AUTO DETECTED AREAS:",
                detected_areas
            )


            # Only keep meaningful clothing regions.

            selected_classes = [

                class_id

                for class_id, area
                in detected_areas.items()

                if area > 1000

            ]


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
                        "Unsupported category. "
                        "Use auto, upper, lower, "
                        "shirt, tshirt, t-shirt, "
                        "top, pants, trousers, "
                        "jeans, shorts, skirt "
                        "or dress."
                    )
                )


            selected_classes = (
                category_classes[
                    category
                ]
            )


        print(
            "SELECTED CLOTHING CLASSES:",
            selected_classes
        )


        # =================================================
        # 5. CREATE SEPARATE GARMENT MASKS
        # =================================================

        extracted_items = []


        for class_id in selected_classes:

            clothing_mask = (
                segmentation == class_id
            )


            mask = (
                clothing_mask
                .cpu()
                .numpy()
                .astype("uint8")
                * 255
            )


            if not np.any(mask):

                continue

            # =============================================
            # REFINE CLOTHING SEGMENTATION MASK
            # =============================================

            clean_mask = mask.copy()

            # ---------------------------------------------
            # 1. Close small gaps in the garment mask
            # ---------------------------------------------

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

            # ---------------------------------------------
            # 2. Fill enclosed holes inside the garment
            # ---------------------------------------------

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

            # ---------------------------------------------
            # 3. Remove very small isolated components
            # ---------------------------------------------

            num_labels, labels, stats, centroids = (
                cv2.connectedComponentsWithStats(
                    clean_mask,
                    connectivity=8
                )
            )

            if num_labels > 1:

                areas = stats[
                    1:,
                    cv2.CC_STAT_AREA
                ]

                largest_area = int(
                    np.max(areas)
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

                    # Keep meaningful garment pieces.
                    if (
                        area >= largest_area * 0.015
                    ):

                        main_mask[
                            labels == label_id
                        ] = 255

                clean_mask = main_mask

            # ---------------------------------------------
            # 4. Final edge cleanup
            # ---------------------------------------------

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

            # Very small blur for smooth catalog edges
            smooth_mask = cv2.GaussianBlur(
                clean_mask,
                (3, 3),
                0
            )

            mask_image = Image.fromarray(
                smooth_mask,
                mode="L"
            )

            # =============================================
            # KEEP THE MAIN GARMENT REGION
            # =============================================

            (
                num_labels,
                labels,
                stats,
                centroids
            ) = cv2.connectedComponentsWithStats(
                clean_mask,
                connectivity=8
            )


            if num_labels > 1:

                areas = stats[
                    1:,
                    cv2.CC_STAT_AREA
                ]


                largest_area = (
                    np.max(areas)
                )


                largest_label = (
                    1
                    + np.argmax(
                        areas
                    )
                )


                main_mask = (
                    np.zeros_like(
                        clean_mask
                    )
                )


                main_mask[
                    labels == largest_label
                ] = 255


                # Keep nearby meaningful components.

                for label_id in range(
                    1,
                    num_labels
                ):

                    area = stats[
                        label_id,
                        cv2.CC_STAT_AREA
                    ]


                    if (
                        area
                        > largest_area * 0.02
                        and label_id
                        != largest_label
                    ):

                        main_mask[
                            labels == label_id
                        ] = 255


                clean_mask = main_mask


            # =============================================
            # SMOOTH FINAL GARMENT EDGE
            # =============================================

            smooth_mask = (
                cv2.GaussianBlur(
                    clean_mask,
                    (5, 5),
                    0
                )
            )


            mask_image = Image.fromarray(
                smooth_mask,
                mode="L"
            )


            bbox = (
                mask_image.getbbox()
            )


            if bbox is None:

                continue


            # =============================================
            # CROP GARMENT
            # =============================================

            (
                left,
                top,
                right,
                bottom
            ) = bbox


            width = (
                right - left
            )


            height = (
                bottom - top
            )


            padding_x = max(
                20,
                int(
                    width * 0.10
                )
            )


            padding_y = max(
                20,
                int(
                    height * 0.10
                )
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
                original_image.width,
                right + padding_x
            )


            bottom = min(
                original_image.height,
                bottom + padding_y
            )


            original_rgba = (
                original_image.convert(
                    "RGBA"
                )
            )


            # =============================================
            # EXTRACT EXACT VISIBLE GARMENT
            # =============================================

            extracted_image = (
                Image.new(
                    "RGBA",
                    original_rgba.size,
                    (255, 255, 255, 0)
                )
            )


            extracted_image.paste(
                original_rgba,
                (0, 0),
                mask_image
            )


            extracted_image = (
                extracted_image.crop(
                    (
                        left,
                        top,
                        right,
                        bottom
                    )
                )
            )
            # =============================================
            # NORMALIZE CATEGORY
            # =============================================

            if class_id == 4:

                detected_category = "Upper"

            elif class_id in [5, 6]:

                detected_category = "Lower"

            elif class_id == 7:

                detected_category = "Dress"

            else:

                detected_category = "Clothing"


            # =============================================
            # SAVE THE SPLIT/CROPPED GARMENT
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

            extracted_image.save(
                cropped_path,
                format="PNG"
            )

            print(
                "Split garment saved:",
                cropped_path
            )


            # =============================================
            # DETECT GARMENT COLOR
            # =============================================

            detected_color = detect_garment_color(
                original_image,
                mask_image
            )

            print(
                "Detected color:",
                detected_color
            )
            # =============================================
            # CREATE FINAL CATALOG IMAGE
            # =============================================

            catalog_filename = (
                "catalog_"
                + detected_category.lower()
                + "_"
                + str(uuid.uuid4())
                + ".png"
            )

            catalog_path = os.path.join(
                UPLOAD_DIR,
                catalog_filename
            )

            print("Creating FLUX.2 Klein catalog image...")

            try:
                # -------------------------------------------------
                # 1. Create a clean RGB image for FLUX.
                # -------------------------------------------------
                flux_input_filename = (
                    "flux_input_" + str(uuid.uuid4()) + ".png"
                )
                flux_input_path = os.path.join(
                    UPLOAD_DIR,
                    flux_input_filename
                )

                flux_input = Image.new(
                    "RGB",
                    extracted_image.size,
                    (250, 250, 248)
                )

                flux_input.paste(
                    extracted_image.convert("RGB"),
                    mask=extracted_image.getchannel("A")
                )

                flux_input.save(
                    flux_input_path,
                    format="PNG"
                )

                # -------------------------------------------------
                # 2. Create the reconstruction mask.
                # -------------------------------------------------
                reconstruction_mask = create_reconstruction_mask(
                    extracted_image
                )

                mask_filename = (
                    "flux_mask_" + str(uuid.uuid4()) + ".png"
                )
                mask_path = os.path.join(
                    UPLOAD_DIR,
                    mask_filename
                )

                reconstruction_mask.save(
                    mask_path,
                    format="PNG"
                )

                # -------------------------------------------------
                # 3. Let FLUX reconstruct only the masked area.
                # -------------------------------------------------
                flux_output_filename = (
                    "flux_output_" + str(uuid.uuid4()) + ".png"
                )
                flux_output_path = os.path.join(
                    UPLOAD_DIR,
                    flux_output_filename
                )

                prompt = (
                    "Create a clean standalone clothing product photograph. "
                    "Preserve the visible garment exactly as supplied. "
                    "Reconstruct only the missing or occluded garment areas. "
                    "Do not change the garment's color, material, pattern, "
                    "shape, style, or design. "
                    "Do not add a person, hands, body, furniture, floor, "
                    "or background objects. "
                    "Show the complete garment centered on a clean warm-white "
                    "studio background with subtle natural shadow."
                )

                generate_masked_garment_with_flux(
                    image_path=flux_input_path,
                    mask_path=mask_path,
                    output_path=flux_output_path,
                    prompt=prompt,
                )

                # -------------------------------------------------
                # 4. Load FLUX result.
                # -------------------------------------------------
                flux_result = Image.open(
                    flux_output_path
                ).convert("RGB")

                # -------------------------------------------------
                # 5. Create final catalog presentation.
                # -------------------------------------------------
                catalog_image = create_clean_catalog_image(
                    extracted_image
                )

                # FLUX result is currently used as the generated
                # reconstruction source.
                # The visible extracted garment remains the source
                # of truth for the final catalog presentation.
                catalog_image.save(
                    catalog_path,
                    format="PNG"
                )

                final_image_url = "/uploads/" + catalog_filename

                print(
                    "FLUX.2 Klein catalog image created:",
                    catalog_path
                )

            except Exception as catalog_error:
                print(
                    "FLUX catalog generation failed:",
                    str(catalog_error)
                )

                final_image_url = "/uploads/" + cropped_filename

                print(
                    "Catalog image created:",
                    catalog_path
                )

            except Exception as catalog_error:

                print(
                    "Catalog conversion failed:",
                    str(catalog_error)
                )

                # If catalog formatting fails,
                # keep the original exact split garment.
                final_image_url = (
                    "/uploads/"
                    + cropped_filename
                )
            # =============================================
            # SAVE THE FINAL CATALOG IMAGE
            # =============================================

            extracted_items.append({

                "category":
                    detected_category,

                "color":
                    detected_color,

                "image":
                    final_image_url

            })

            print(
                "FINAL WARDROBE IMAGE:",
                final_image_url
            )
                

        # =================================================
        # 6. CHECK RESULTS
        # =================================================

        if not extracted_items:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not isolate any "
                    "clothing items from "
                    "the image."
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

            "items":
                extracted_items

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

@app.delete(
    "/wardrobe/{clothing_id}"
)
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
            detail=(
                "Invalid clothing ID."
            )
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
            detail=(
                "Clothing item not found."
            )
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


        if os.path.exists(
            file_path
        ):

            os.remove(
                file_path
            )


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
                "Clothing item could not "
                "be deleted."
            )
        )


    return {

        "message": (
            "Clothing item deleted "
            "successfully!"
        ),

        "clothing_id":
            clothing_id

    }


# =====================================================
# UPDATE WARDROBE ITEM
# =====================================================

@app.put(
    "/wardrobe/{clothing_id}"
)
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
            detail=(
                "Invalid clothing ID."
            )
        )


    existing_clothing = (
        db["wardrobe"].find_one(
            {
                "_id": object_id,
                "user_id": user_id
            }
        )
    )


    if not existing_clothing:

        raise HTTPException(
            status_code=404,
            detail=(
                "Clothing item not found."
            )
        )


    updated_data = {

        "item_name":
            item_name,

        "category":
            category,

        "color":
            color,

        "occasion":
            occasion,

        "season":
            season

    }


    db["wardrobe"].update_one(
        {
            "_id": object_id,
            "user_id": user_id
        },
        {
            "$set":
                updated_data
        }
    )


    return {

        "message": (
            "Clothing item updated "
            "successfully!"
        ),

        "clothing_id":
            clothing_id

    }
import os
import shutil
import uuid

from fastapi import FastAPI, UploadFile, File, Form,HTTPException
from bson import ObjectId
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware
from database import db
from models.user import UserCreate, UserLogin,ClothingCreate
from pwdlib import PasswordHash
from datetime import datetime

app = FastAPI(title="AI Stylist API")
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

    # Find user using email
    existing_user = db["users"].find_one(
        {"email": user.email}
    )

    # User doesn't exist
    if not existing_user:

        return {
            "error": "Invalid email or password"
        }

    # Verify password
    password_correct = password_hash.verify(
        user.password,
        existing_user["password"]
    )

    # Password is incorrect
    if not password_correct:

        return {
            "error": "Invalid email or password"
        }

    # Login successful
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
    user_id:str=Form(...),
    item_name: str = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    occasion: str = Form(...),
    season: str = Form(...),
    image: UploadFile = File(None)
):

    image_path = None

    if image:
        file_extension = os.path.splitext(image.filename)[1]

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
        "user_id":user_id,
        "item_name": item_name,
        "category": category,
        "color": color,
        "occasion": occasion,
        "season": season,
        "image": image_path,
        "created_at":datetime.utcnow()
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
        db["wardrobe"].find({"user_id": user_id})
    )

    for clothing in clothes:
        clothing["_id"] = str(clothing["_id"])

    return clothes

# =====================================================
# DELETE CLOTHING FROM WARDROBE
# =====================================================

@app.delete("/wardrobe/{clothing_id}")
def delete_clothing(clothing_id: str,user_id:str):

    # Check whether the ID is a valid MongoDB ObjectId
    try:
        object_id = ObjectId(clothing_id)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid clothing ID."
        )

    # Find the clothing item
    clothing = db["wardrobe"].find_one(
        {"_id": object_id,
        "user_id": user_id}
    )

    # Clothing item doesn't exist
    if not clothing:
        raise HTTPException(
            status_code=404,
            detail="Clothing item not found."
        )

    # Delete the uploaded image if it exists
    image_path = clothing.get("image")

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

    # Delete clothing from MongoDB
    result = db["wardrobe"].delete_one(
        {"_id": object_id}
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
    # UPDATE WARDROBE ITEM
@app.put("/wardrobe/{clothing_id}")
def update_clothing(
    clothing_id: str,
    user_id:str,
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

    existing_clothing = db["wardrobe"].find_one(
        {"_id": object_id,"user_id":user_id}
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
        {"_id": object_id},
        {"$set": updated_data}
    )

    return {
        "message": "Clothing item updated successfully!",
        "clothing_id": clothing_id
    }
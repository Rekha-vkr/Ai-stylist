from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import db
from models.user import UserCreate, UserLogin,ClothingCreate
from pwdlib import PasswordHash


app = FastAPI(title="AI Stylist API")


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
def add_clothing(clothing: ClothingCreate):

    new_clothing = {
        "item_name": clothing.item_name,
        "category": clothing.category,
        "color": clothing.color,
        "occasion": clothing.occasion,
        "season": clothing.season
    }

    result = db["wardrobe"].insert_one(new_clothing)

    return {
        "message": "Clothing item added successfully!",
        "clothing_id": str(result.inserted_id)
    }
    # =====================================================
# GET WARDROBE
# =====================================================

@app.get("/wardrobe")
def get_wardrobe():

    clothes = list(db["wardrobe"].find())

    for clothing in clothes:
        clothing["_id"] = str(clothing["_id"])

    return clothes
from fastapi import FastAPI
from database import db
from models.user import UserCreate
from pwdlib import PasswordHash
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Stylist API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

password_hash = PasswordHash.recommended()


@app.get("/")
def home():
    return {"message": "AI Stylist Backend is running!"}


@app.get("/test-db")
def test_database():
    try:
        db.command("ping")
        return {"message": "MongoDB is connected!"}
    except Exception as e:
        return {"error": str(e)}


@app.post("/register")
def register_user(user: UserCreate):
    existing_user = db["users"].find_one({"email": user.email})

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
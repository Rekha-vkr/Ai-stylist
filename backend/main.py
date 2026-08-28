from fastapi import FastAPI, HTTPException
from database import db
from models.user import UserCreate
from passlib.context import CryptContext

app = FastAPI(title="AI Stylist API")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    # Check if email already exists
    existing_user = db.users.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create user document
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    # Save user to MongoDB
    result = db.users.insert_one(new_user)

    return {
        "message": "User registered successfully!",
        "user_id": str(result.inserted_id)
    }
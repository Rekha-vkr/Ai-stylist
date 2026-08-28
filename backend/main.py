from fastapi import FastAPI
from database import db

app = FastAPI(title="AI Stylist API")


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
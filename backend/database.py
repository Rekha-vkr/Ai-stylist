import os
from pathlib import Path
import certifi
from pymongo import MongoClient
from pymongo.errors import OperationFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Ensure .env is loaded from backend directory or project root
backend_env = Path(__file__).resolve().parent / ".env"
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
else:
    load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("❌ [MongoDB Error] MONGO_URI environment variable is missing. Check your backend/.env file.")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000
)

try:
    client.admin.command("ping")
    print("MongoDB connected successfully!")
except OperationFailure as e:
    print("\n" + "=" * 60)
    print("❌ [MongoDB Authentication Error] bad auth : authentication failed")
    print("The username or password in MONGO_URI is rejected by MongoDB Atlas.")
    print("Please check your MongoDB Atlas dashboard -> Database Access -> Database Users.")
    print("Ensure the user exists and the password in backend/.env matches.")
    print("=" * 60 + "\n")
    raise
except ServerSelectionTimeoutError as e:
    print("\n" + "=" * 60)
    print("❌ [MongoDB Connection Timeout] Could not reach MongoDB Atlas cluster.")
    print("Please check your network and Atlas Network Access (IP Whitelist).")
    print("=" * 60 + "\n")
    raise

db = client["ai_stylist"]

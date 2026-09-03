from pydantic import BaseModel, EmailStr


# =====================================================
# USER MODELS
# =====================================================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =====================================================
# WARDROBE MODEL
# =====================================================

class ClothingCreate(BaseModel):
    item_name: str
    category: str
    color: str
    occasion: str
    season: str
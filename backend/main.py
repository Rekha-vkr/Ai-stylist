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
import json
import concurrent.futures
from datetime import datetime
import cv2
import numpy as np
import torch
import requests
from PIL import Image, ImageOps, ImageFilter
from pillow_heif import register_heif_opener
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from google import genai
from google.genai import types
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoImageProcessor, AutoModelForSemanticSegmentation
from bson import ObjectId
from pwdlib import PasswordHash
from database import db
from models.user import UserCreate, UserLogin
from fashion_classifier import classify_fashion_image, build_gemini_vision_prompt, normalize_fashion_category, determine_outfit_role, PRIMARY_CATEGORIES, CATEGORY_INDIAN_ETHNIC, CATEGORY_JEWELRY, CATEGORY_FOOTWEAR, CATEGORY_HATS_HEADWEAR, CATEGORY_BAGS, CATEGORY_TOPS, CATEGORY_PANTS, CATEGORY_DRESSES_GOWNS, CATEGORY_ACCESSORIES, CATEGORY_OTHERS
load_dotenv()
register_heif_opener()
app = FastAPI(title='AI Stylist API')
UPLOAD_DIR = 'uploads'
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=UPLOAD_DIR), name='uploads')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
password_hash = PasswordHash.recommended()
CLOTHING_MODEL = 'mattmdjaga/segformer_b2_clothes'
print('Loading AI clothing segmentation model...')
try:
    image_processor = AutoImageProcessor.from_pretrained(CLOTHING_MODEL, local_files_only=True)
    clothing_model = AutoModelForSemanticSegmentation.from_pretrained(CLOTHING_MODEL, local_files_only=True)
except Exception:
    image_processor = AutoImageProcessor.from_pretrained(CLOTHING_MODEL)
    clothing_model = AutoModelForSemanticSegmentation.from_pretrained(CLOTHING_MODEL)
clothing_model.eval()
print('AI clothing segmentation model loaded successfully!')
CATALOG_BG = (242, 239, 233)
CATALOG_SIZE = (900, 1200)
CATALOG_THUMB = (450, 600)
CATALOG_PAD = 0.06
SHADOW_BLUR = 25
SHADOW_OPACITY = 0.35
SHADOW_OFFSET = 12
PICWISH_API_KEY = os.getenv('PICWISH_API_KEY')
if not PICWISH_API_KEY:
    print('WARNING: PICWISH_API_KEY not found')


GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
HF_TOKEN = os.getenv('HF_TOKEN')
if not HF_TOKEN:
    print('WARNING: HF_TOKEN not found')
if not GEMINI_API_KEY:
    print('WARNING: GEMINI_API_KEY not found')
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

def clean_item_title(color: str, pattern: str, raw_type: str, category: str='') -> str:
    """
    Builds a clean, non-repetitive, elegant item title.
    Prevents duplicates like 'blue denim pant denim denim'.
    """
    color_s = str(color or '').strip()
    pattern_s = str(pattern or '').strip()
    type_s = str(raw_type or '').strip()
    cat_s = str(category or '').strip()
    if not type_s or type_s.lower() in ['unknown', 'clothing', 'item', 'none', '']:
        type_s = cat_s or 'Garment'
    seen_words = set()
    cleaned_tokens = []

    def add_token(word):
        w = word.strip()
        if not w:
            return
        wl = w.lower()
        if wl in ['solid', 'plain', 'unknown', 'none']:
            return
        if wl in seen_words:
            return
        seen_words.add(wl)
        cleaned_tokens.append(w.capitalize())
    for part in [color_s, pattern_s, type_s]:
        for token in part.split():
            add_token(token)
    result = ' '.join(cleaned_tokens).strip()
    return result if result else type_s.title() if type_s else 'Fashion Piece'

def fallback_clothing_analysis(image_bytes: bytes) -> dict:
    """
    Intelligent local analyzer that uses Marqo FashionCLIP zero-shot vision
    model across all master categories and subcategories when Gemini vision is unreachable.
    """
    return classify_fashion_image(image_bytes)

def analyze_clothing_with_ai(image_bytes: bytes, mime_type: str):
    """
    Analyze a clothing image and detect structured wardrobe attributes:
    item_type, category, color, occasion, season, style, etc.
    Powered by Marqo FashionCLIP zero-shot vision engine + optional Gemini Vision enrichment.
    """
    local_pred = classify_fashion_image(image_bytes)
    if not GEMINI_API_KEY:
        return local_pred
    prompt = build_gemini_vision_prompt()
    import concurrent.futures
    optimized_bytes = image_bytes
    try:
        from PIL import Image
        import io
        pil_im = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        pil_im.thumbnail((420, 420), Image.Resampling.LANCZOS)
        out_buf = io.BytesIO()
        pil_im.save(out_buf, format='JPEG', quality=75)
        optimized_bytes = out_buf.getvalue()
        mime_type = 'image/jpeg'
    except Exception as opt_err:
        print('Image payload optimization notice:', repr(opt_err))

    def _call_gemini():
        candidate_models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        last_err = None
        for mod in candidate_models:
            try:
                response = gemini_client.models.generate_content(model=mod, contents=[types.Part.from_bytes(data=optimized_bytes, mime_type=mime_type), prompt], config=types.GenerateContentConfig(temperature=0.1))
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_err = e
                print(f'Gemini model {mod} notice: {repr(e)}')
                continue
        raise last_err or Exception('All Gemini models failed or quota exhausted')
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_call_gemini)
            result_text = future.result(timeout=8.0)
        if '```' in result_text:
            result_text = result_text.replace('```json', '').replace('```', '').strip()
        import json
        gemini_result = json.loads(result_text)
        norm_cat, norm_subcat, norm_type = normalize_fashion_category(raw_category=str(gemini_result.get('category', '')), raw_type=str(gemini_result.get('item_type', '')), item_name=str(gemini_result.get('item_name', '')), raw_description=str(gemini_result.get('details', '')))
        final_cat = norm_cat if norm_cat in PRIMARY_CATEGORIES and norm_cat != CATEGORY_OTHERS else local_pred['category']
        final_subcat = norm_subcat or local_pred['sub_category']
        final_type = norm_type or local_pred['item_type']
        merged = dict(local_pred)
        merged['category'] = final_cat
        merged['sub_category'] = final_subcat
        merged['item_type'] = final_type
        if gemini_result.get('color') and gemini_result.get('color').lower() not in ['classic', 'unknown', 'none']:
            merged['color'] = gemini_result['color'].title()
        if gemini_result.get('secondary_colors'):
            merged['secondary_colors'] = gemini_result['secondary_colors']
        if gemini_result.get('pattern'):
            merged['pattern'] = gemini_result['pattern']
        if gemini_result.get('material'):
            merged['material'] = gemini_result['material']
        if gemini_result.get('sleeve'):
            merged['sleeve'] = gemini_result['sleeve']
        if gemini_result.get('fit'):
            merged['fit'] = gemini_result['fit']
        if gemini_result.get('length'):
            merged['length'] = gemini_result['length']
        if gemini_result.get('gender'):
            merged['gender'] = gemini_result['gender']
        if gemini_result.get('style'):
            merged['style'] = gemini_result['style']
        if gemini_result.get('occasion'):
            merged['occasion'] = gemini_result['occasion']
        if gemini_result.get('season'):
            merged['season'] = gemini_result['season']
        merged['item_name'] = clean_item_title(merged['color'], merged['pattern'], merged['item_type'], merged['category'])
        merged['outfit_role'] = determine_outfit_role(merged['category'], merged['sub_category'], merged['item_type'])
        return merged
    except Exception as e:
        print('Gemini vision unavailable/failed, using Marqo FashionCLIP output:', repr(e))
        return local_pred
hf_client = InferenceClient(provider='fal-ai', api_key=HF_TOKEN)


# =====================================================
# [POST] /wardrobe/ai-upload
# =====================================================
@app.post('/wardrobe/ai-upload')
async def ai_upload_wardrobe(user_id: str=Form(...), image: UploadFile=File(...)):
    try:
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail='Image is empty.')
        ai_result = analyze_clothing_with_ai(image_bytes, image.content_type or 'image/jpeg')
        if not ai_result:
            ai_result = fallback_clothing_analysis(image_bytes)
        file_extension = os.path.splitext(image.filename)[1] or '.png'
        unique_filename = f'wardrobe_{uuid.uuid4()}{file_extension}'
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, 'wb') as buffer:
            buffer.write(image_bytes)
        image_path = f'/uploads/{unique_filename}'
        std_cat, fallback_subcat, fallback_type = normalize_fashion_category(raw_category=str(ai_result.get('category', '')), raw_type=str(ai_result.get('item_type', '')), item_name=str(ai_result.get('item_name', '')), raw_description=str(ai_result.get('details', '')))
        std_category = std_cat
        std_subcategory = str(ai_result.get('sub_category') or fallback_subcat).strip()
        std_item_type = str(ai_result.get('item_type') or fallback_type).strip()
        raw_color = str(ai_result.get('color', 'Classic')).strip()
        std_color = raw_color.title() if raw_color.lower() not in ['unknown', 'none', ''] else 'Classic'
        raw_occasions = ai_result.get('occasion', [])
        if isinstance(raw_occasions, str):
            raw_occasions = [raw_occasions]
        raw_occ_str = ' '.join([str(o).lower() for o in raw_occasions])
        if 'college' in raw_occ_str or 'campus' in raw_occ_str:
            std_occasion = 'College'
        elif 'party' in raw_occ_str or 'club' in raw_occ_str or 'night' in raw_occ_str:
            std_occasion = 'Party'
        elif 'wedding' in raw_occ_str or 'festive' in raw_occ_str or 'ceremony' in raw_occ_str or ('traditional' in raw_occ_str):
            std_occasion = 'Wedding'
        elif 'formal' in raw_occ_str or 'office' in raw_occ_str or 'work' in raw_occ_str or ('business' in raw_occ_str):
            std_occasion = 'Formal'
        elif 'travel' in raw_occ_str or 'vacation' in raw_occ_str or 'trip' in raw_occ_str:
            std_occasion = 'Travel'
        else:
            std_occasion = 'Casual'
        raw_seasons = ai_result.get('season', [])
        if isinstance(raw_seasons, str):
            raw_seasons = [raw_seasons]
        raw_sea_str = ' '.join([str(s).lower() for s in raw_seasons])
        if 'summer' in raw_sea_str or 'spring' in raw_sea_str:
            std_season = 'Summer'
        elif 'winter' in raw_sea_str or 'autumn' in raw_sea_str or 'fall' in raw_sea_str:
            std_season = 'Winter'
        elif 'rain' in raw_sea_str or 'monsoon' in raw_sea_str:
            std_season = 'Rainy'
        else:
            std_season = 'All Season'
        raw_style = str(ai_result.get('style', 'Casual')).strip()
        std_style = raw_style.title() if raw_style.lower() not in ['unknown', 'none', ''] else 'Casual'
        if std_style not in ['Casual', 'Elegant', 'Traditional', 'Trendy', 'Minimal', 'Royal', 'Festive', 'Boho', 'Glam', 'Streetwear', 'Formal']:
            std_style = 'Casual'
        pattern = str(ai_result.get('pattern', '')).strip().title()
        ai_name = str(ai_result.get('item_name', '')).strip()
        if ai_name and len(ai_name.split()) >= 2 and (not any((w in ai_name.lower() for w in ['unknown', 'garment', 'piece']))):
            item_name = clean_item_title('', '', ai_name, '')
        else:
            item_name = clean_item_title(std_color, pattern, std_item_type or std_subcategory, std_category)
        outfit_role = determine_outfit_role(std_category, std_subcategory, std_item_type)
        new_clothing = {'user_id': user_id, 'item_name': item_name, 'category': std_category, 'sub_category': std_subcategory, 'color': std_color, 'occasion': std_occasion, 'season': std_season, 'style': std_style, 'image': image_path, 'item_type': std_item_type, 'secondary_colors': ai_result.get('secondary_colors', []), 'pattern': ai_result.get('pattern', 'solid'), 'occasions': raw_occasions, 'seasons': raw_seasons, 'material': ai_result.get('material', 'unknown'), 'gender': ai_result.get('gender', 'Unisex'), 'sleeve': ai_result.get('sleeve', 'unknown'), 'fit': ai_result.get('fit', 'unknown'), 'length': ai_result.get('length', 'unknown'), 'confidence': ai_result.get('confidence', 0.98), 'outfit_role': outfit_role, 'created_at': datetime.utcnow()}
        result = db['wardrobe'].insert_one(new_clothing)
        new_clothing['_id'] = str(result.inserted_id)
        return {'message': 'Garment recognized and added to your wardrobe successfully!', 'clothing_id': str(result.inserted_id), 'item': new_clothing, 'image': image_path, 'attributes': {'item_name': item_name, 'category': std_category, 'color': std_color, 'occasion': std_occasion, 'season': std_season, 'style': std_style, 'pattern': ai_result.get('pattern', 'solid'), 'confidence': ai_result.get('confidence', 0.95)}}
    except HTTPException:
        raise
    except Exception as e:
        print('AI wardrobe upload failed:', repr(e))
        raise HTTPException(status_code=500, detail='Failed to analyze and save clothing.')

def create_huggingface_catalog_image(extracted_image: Image.Image, detected_category: str):
    """
    Use Hugging Face Qwen Image Edit to create
    a clean e-commerce catalog image.
    """
    if not HF_TOKEN:
        print('Hugging Face token is missing.')
        return None
    try:
        image_buffer = io.BytesIO()
        extracted_image.save(image_buffer, format='PNG')
        image_bytes = image_buffer.getvalue()
        debug_name = f'debug_hf_{detected_category.lower()}_{uuid.uuid4()}.png'
        extracted_image.save(os.path.join(UPLOAD_DIR, debug_name), format='PNG')
        print('HF INPUT IMAGE:', '/uploads/' + debug_name)
        if detected_category.lower() == 'lower':
            prompt = '\nEdit the supplied image into a professional e-commerce\ncatalog image of the SAME pair of pants.\n\nThe pants in the input are the exact product that must\nbe preserved.\n\nSTRICT REQUIREMENTS:\n- Preserve the exact pants.\n- Preserve the exact black color.\n- Preserve the original silhouette and proportions.\n- Preserve the waistband, both legs, hems, pockets,\n  seams, stitching, folds, texture, buttons and zippers.\n- Do NOT redesign, restyle, recolor, reshape, shorten\n  or lengthen the pants.\n- Do NOT turn the pants into shorts, leggings, a skirt\n  or another type of clothing.\n- Do NOT add any other clothing.\n- Do NOT add a person, mannequin, hands, arms, legs\n  or body parts.\n- Remove the original background.\n- Remove visible human body parts that are not part\n  of the pants.\n- If a small area of the pants is missing because of\n  occlusion, reconstruct only that small missing area.\n- Do NOT invent large portions of the pants.\n- Keep the complete waistband and both pant legs visible.\n- Keep the pants centered.\n- Use a simple warm off-white studio background.\n- Add only a subtle natural product shadow.\n- Portrait 3:4 composition.\n- No text.\n- No watermark.\n\nThe final image must show ONLY the original pair of pants\nas a clean e-commerce product photograph.\n'
        else:
            prompt = f"\nCreate a professional e-commerce catalog product image\nfrom the supplied {detected_category} garment.\n\nIMPORTANT:\n- Preserve the exact garment from the input.\n- Preserve its original color.\n- Preserve its pattern, texture, logos, buttons,\n  stitching, seams, pockets, and other visible details.\n- Do NOT redesign the garment.\n- Do NOT change the garment style.\n- Do NOT add another garment.\n- Do NOT add a person or mannequin.\n- Remove the original person's body and background.\n- If small portions of the garment are missing because\n  of segmentation or occlusion, reconstruct only those\n  small missing areas.\n- Keep the entire garment visible.\n- Center the garment.\n- Use a clean warm off-white studio background.\n- Add a very subtle natural product shadow.\n- Use a portrait 3:4 composition.\n- No text.\n- No watermark.\n\nCategory: {detected_category}\n"
        print(f'Sending {detected_category} to Hugging Face Qwen Image Edit...')
        import concurrent.futures

        def _call_hf():
            return hf_client.image_to_image(image_bytes, prompt=prompt, model='Qwen/Qwen-Image-Edit')
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_call_hf)
            try:
                result = future.result(timeout=5.0)
            except Exception as hf_err:
                print('Hugging Face image edit timed out after 5s or failed:', repr(hf_err))
                result = None
        if result is None:
            print('Hugging Face returned no image (or timed out). Using local catalog generator.')
            return None
        print(f'Hugging Face catalog image generated for {detected_category}.')
        return result.convert('RGB')
    except Exception as e:
        print('Hugging Face catalog generation failed:', repr(e))
        print('HF error type:', type(e).__name__)
        return None

# =====================================================
# [GET] /
# =====================================================
@app.get('/')
def home():
    return {'message': 'AI Stylist Backend is running!'}


# =====================================================
# [GET] /test-db
# =====================================================
@app.get('/test-db')
def test_database():
    try:
        db.command('ping')
        return {'message': 'MongoDB is connected!'}
    except Exception as e:
        return {'error': str(e)}


# =====================================================
# [POST] /register
# =====================================================
@app.post('/register')
def register_user(user: UserCreate):
    existing_user = db['users'].find_one({'email': user.email})
    if existing_user:
        return {'error': 'Email already registered'}
    hashed_password = password_hash.hash(user.password)
    new_user = {'name': user.name, 'email': user.email, 'password': hashed_password}
    result = db['users'].insert_one(new_user)
    return {'message': 'User registered successfully!', 'user_id': str(result.inserted_id)}


# =====================================================
# [POST] /login
# =====================================================
@app.post('/login')
def login_user(user: UserLogin):
    existing_user = db['users'].find_one({'email': user.email})
    if not existing_user:
        return {'error': 'Invalid email or password'}
    password_correct = password_hash.verify(user.password, existing_user['password'])
    if not password_correct:
        return {'error': 'Invalid email or password'}
    return {'message': 'Login successful!', 'user': {'id': str(existing_user['_id']), 'name': existing_user['name'], 'email': existing_user['email']}}


# =====================================================
# [POST] /wardrobe
# =====================================================
@app.post('/wardrobe')
async def add_clothing(user_id: str=Form(...), item_name: str=Form(...), category: str=Form(...), color: str=Form(...), occasion: str=Form(...), season: str=Form(...), style: str=Form(...), image: UploadFile=File(None)):
    image_path = None
    if image:
        file_extension = os.path.splitext(image.filename)[1] or '.png'
        unique_filename = str(uuid.uuid4()) + file_extension
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_path = f'/uploads/{unique_filename}'
    norm_cat, norm_subcat, norm_type = normalize_fashion_category(raw_category=category, raw_type='', item_name=item_name)
    role = determine_outfit_role(norm_cat, norm_subcat, norm_type)
    new_clothing = {'user_id': user_id, 'item_name': item_name, 'category': norm_cat, 'sub_category': norm_subcat, 'color': color, 'occasion': occasion, 'season': season, 'style': style, 'image': image_path, 'item_type': norm_type, 'outfit_role': role, 'created_at': datetime.utcnow()}
    result = db['wardrobe'].insert_one(new_clothing)
    return {'message': 'Clothing item added successfully!', 'clothing_id': str(result.inserted_id), 'image': image_path}


# =====================================================
# [GET] /wardrobe
# =====================================================
@app.get('/wardrobe')
def get_wardrobe(user_id: str):
    clothes = list(db['wardrobe'].find({'user_id': user_id}))
    for clothing in clothes:
        auto_correct_wardrobe_item(clothing)
        clothing['_id'] = str(clothing['_id'])
    return clothes


# =====================================================
# [DELETE] /wardrobe/{clothing_id}
# =====================================================
@app.delete('/wardrobe/{clothing_id}')
def delete_clothing(clothing_id: str, user_id: str):
    try:
        object_id = ObjectId(clothing_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid clothing ID.')
    clothing = db['wardrobe'].find_one({'_id': object_id, 'user_id': user_id})
    if not clothing:
        raise HTTPException(status_code=404, detail='Clothing item not found.')
    image_path = clothing.get('image')
    if image_path:
        filename = os.path.basename(image_path)
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    result = db['wardrobe'].delete_one({'_id': object_id, 'user_id': user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Clothing item could not be deleted.')
    return {'message': 'Clothing item deleted successfully!', 'clothing_id': clothing_id}


# =====================================================
# [PUT] /wardrobe/{clothing_id}
# =====================================================
@app.put('/wardrobe/{clothing_id}')
def update_clothing(clothing_id: str, user_id: str, item_name: str=Form(...), category: str=Form(...), color: str=Form(...), occasion: str=Form(...), season: str=Form(...)):
    try:
        object_id = ObjectId(clothing_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid clothing ID.')
    existing = db['wardrobe'].find_one({'_id': object_id, 'user_id': user_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Clothing item not found.')
    norm_cat, norm_subcat, norm_type = normalize_fashion_category(raw_category=category, raw_type=existing.get('item_type', ''), item_name=item_name)
    role = determine_outfit_role(norm_cat, norm_subcat, norm_type)
    db['wardrobe'].update_one({'_id': object_id, 'user_id': user_id}, {'$set': {'item_name': item_name, 'category': norm_cat, 'sub_category': norm_subcat, 'color': color, 'occasion': occasion, 'season': season, 'item_type': norm_type, 'outfit_role': role}})
    return {'message': 'Clothing item updated successfully!', 'clothing_id': clothing_id}


# =====================================================
# [POST] /thrift
# =====================================================
@app.post('/thrift')
async def create_thrift_listing(user_id: str=Form(...), item_name: str=Form(...), category: str=Form(...), price: str=Form(''), listing_type: str=Form(...), description: str=Form(''), image: UploadFile=File(...)):
    listing_type = listing_type.strip().lower()
    if listing_type not in ['sale', 'exchange']:
        raise HTTPException(status_code=400, detail="listing_type must be 'sale' or 'exchange'.")
    price_text = price.strip()
    if listing_type == 'sale' and (not price_text):
        raise HTTPException(status_code=400, detail='Price is required for sale listings.')
    price_value = None
    if price_text:
        try:
            price_value = float(price_text)
        except ValueError:
            raise HTTPException(status_code=400, detail='Price must be a valid number.')
        if price_value < 0:
            raise HTTPException(status_code=400, detail='Price cannot be negative.')
    file_extension = os.path.splitext(image.filename)[1] or '.png'
    unique_filename = str(uuid.uuid4()) + file_extension
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(image.file, buffer)
    image_path = f'/uploads/{unique_filename}'
    new_listing = {'user_id': user_id, 'item_name': item_name.strip(), 'category': category.strip(), 'price': price_value, 'listing_type': listing_type, 'description': description.strip(), 'image': image_path, 'status': 'active', 'created_at': datetime.utcnow()}
    result = db['thrift_listings'].insert_one(new_listing)
    return {'message': 'Thrift listing created successfully!', 'listing_id': str(result.inserted_id), 'image': image_path}


# =====================================================
# [GET] /thrift
# =====================================================
@app.get('/thrift')
def get_thrift_listings(search: str='', category: str='', listing_type: str=''):
    query = {}
    if search.strip():
        query['item_name'] = {'$regex': search.strip(), '$options': 'i'}
    if category.strip():
        query['category'] = {'$regex': category.strip(), '$options': 'i'}
    if listing_type.strip():
        listing_type = listing_type.strip().lower()
        if listing_type not in ['sale', 'exchange']:
            raise HTTPException(status_code=400, detail="listing_type must be 'sale' or 'exchange'.")
        query['listing_type'] = listing_type
    listings = list(db['thrift_listings'].find(query).sort('created_at', -1))
    for listing in listings:
        listing['_id'] = str(listing['_id'])
    return listings


# =====================================================
# [POST] /thrift/{listing_id}/save
# =====================================================
@app.post('/thrift/{listing_id}/save')
def save_thrift_listing(listing_id: str, user_id: str):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid listing ID.')
    listing = db['thrift_listings'].find_one({'_id': object_id})
    if not listing:
        raise HTTPException(status_code=404, detail='Thrift listing not found.')
    existing_save = db['saved_thrift'].find_one({'user_id': user_id, 'listing_id': object_id})
    if existing_save:
        return {'message': 'Listing already saved.', 'saved_id': str(existing_save['_id'])}
    new_save = {'user_id': user_id, 'listing_id': object_id, 'created_at': datetime.utcnow()}
    result = db['saved_thrift'].insert_one(new_save)
    return {'message': 'Thrift listing saved successfully!', 'saved_id': str(result.inserted_id)}


# =====================================================
# [DELETE] /thrift/{listing_id}/save
# =====================================================
@app.delete('/thrift/{listing_id}/save')
def unsave_thrift_listing(listing_id: str, user_id: str):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid listing ID.')
    result = db['saved_thrift'].delete_one({'user_id': user_id, 'listing_id': object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Saved thrift item not found.')
    return {'message': 'Thrift listing removed from saved items.'}


# =====================================================
# [DELETE] /thrift/{listing_id}
# =====================================================
@app.delete('/thrift/{listing_id}')
def delete_thrift_listing(listing_id: str, user_id: str):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid listing ID.')
    listing = db['thrift_listings'].find_one({'_id': object_id})
    if not listing:
        raise HTTPException(status_code=404, detail='Thrift listing not found.')
    if listing['user_id'] != user_id:
        raise HTTPException(status_code=403, detail='You can only delete your own thrift listings.')
    db['thrift_listings'].delete_one({'_id': object_id})
    db['saved_thrift'].delete_many({'listing_id': object_id})
    return {'message': 'Thrift listing deleted successfully.'}


# =====================================================
# [GET] /thrift/saved
# =====================================================
@app.get('/thrift/saved')
def get_saved_thrift_listings(user_id: str):
    saved_items = list(db['saved_thrift'].find({'user_id': user_id}))
    listings = []
    for saved in saved_items:
        listing = db['thrift_listings'].find_one({'_id': saved['listing_id']})
        if listing:
            listing['_id'] = str(listing['_id'])
            listings.append(listing)
    return listings


# =====================================================
# [POST] /thrift/{listing_id}/outfit
# =====================================================
@app.post('/thrift/{listing_id}/outfit')
def add_thrift_to_outfit(listing_id: str, user_id: str):
    try:
        object_id = ObjectId(listing_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid listing ID.')
    listing = db['thrift_listings'].find_one({'_id': object_id})
    if not listing:
        raise HTTPException(status_code=404, detail='Thrift listing not found.')
    existing_item = db['thrift_outfits'].find_one({'user_id': user_id, 'listing_id': object_id})
    if existing_item:
        return {'message': 'Listing is already in your outfit.', 'outfit_id': str(existing_item['_id'])}
    new_outfit_item = {'user_id': user_id, 'listing_id': object_id, 'created_at': datetime.utcnow()}
    result = db['thrift_outfits'].insert_one(new_outfit_item)
    return {'message': 'Thrift item added to outfit successfully!', 'outfit_id': str(result.inserted_id)}


# =====================================================
# [GET] /thrift/outfit
# =====================================================
@app.get('/thrift/outfit')
def get_thrift_outfit(user_id: str):
    outfit_items = list(db['thrift_outfits'].find({'user_id': user_id}))
    outfit = []
    for item in outfit_items:
        listing = db['thrift_listings'].find_one({'_id': item['listing_id']})
        if listing:
            listing['_id'] = str(listing['_id'])
            outfit.append(listing)
    return outfit
NEUTRAL_COLORS = {'black', 'white', 'grey', 'gray', 'beige', 'cream', 'brown', 'tan', 'navy', 'khaki', 'off-white', 'charcoal', 'denim', 'ivory', 'nude', 'camel'}
COMPLEMENTARY_PAIRS = [('blue', 'orange'), ('blue', 'tan'), ('blue', 'brown'), ('blue', 'white'), ('navy', 'white'), ('navy', 'beige'), ('navy', 'pink'), ('navy', 'burgundy'), ('black', 'white'), ('black', 'red'), ('black', 'pink'), ('black', 'grey'), ('pink', 'grey'), ('pink', 'white'), ('pink', 'navy'), ('green', 'beige'), ('olive', 'cream'), ('olive', 'white'), ('yellow', 'navy'), ('maroon', 'gold'), ('red', 'black'), ('red', 'white'), ('burgundy', 'cream'), ('brown', 'cream')]

def auto_correct_wardrobe_item(item):
    """
    Ensures items in MongoDB have accurate master categories, subcategories,
    and outfit roles according to the Master Fashion Taxonomy.
    """
    cat = str(item.get('category', '')).strip()
    subcat = str(item.get('sub_category', '')).strip()
    name = str(item.get('item_name', '')).strip()
    itype = str(item.get('item_type', '')).strip()
    correct_cat, correct_subcat, correct_type = normalize_fashion_category(raw_category=cat, raw_type=itype, item_name=name)
    updated = False
    if cat != correct_cat or not subcat or cat not in PRIMARY_CATEGORIES:
        item['category'] = correct_cat
        item['sub_category'] = correct_subcat
        if not item.get('item_type'):
            item['item_type'] = correct_type
        item['outfit_role'] = determine_outfit_role(correct_cat, correct_subcat, item.get('item_type', ''))
        updated = True
    if updated:
        try:
            update_data = {'category': item['category'], 'sub_category': item.get('sub_category', ''), 'item_name': item['item_name'], 'item_type': item.get('item_type', item['category'].lower()), 'outfit_role': item.get('outfit_role', 'top')}
            if 'color' in item:
                update_data['color'] = item['color']
            if 'occasion' in item:
                update_data['occasion'] = item['occasion']
            if 'style' in item:
                update_data['style'] = item['style']
            if 'season' in item:
                update_data['season'] = item['season']
            obj_id = item['_id']
            if isinstance(obj_id, str):
                from bson import ObjectId
                obj_id = ObjectId(obj_id)
            db['wardrobe'].update_one({'_id': obj_id}, {'$set': update_data})
        except Exception as db_err:
            print('Auto-correct wardrobe persistence notice:', repr(db_err))
    return item

def classify_wardrobe_item(item):
    cat = str(item.get('category', '')).strip()
    subcat = str(item.get('sub_category', '')).strip()
    itype = str(item.get('item_type', '')).strip()
    name = str(item.get('item_name', '')).strip()
    role = determine_outfit_role(cat, subcat, f'{itype} {name}')
    if role in ['footwear', 'bottom', 'top']:
        return role
    if role == 'one_piece':
        return 'one_piece'
    return 'accessory'

def evaluate_color_pair(c1_raw, c2_raw):
    c1 = str(c1_raw or '').lower().strip()
    c2 = str(c2_raw or '').lower().strip()
    if not c1 or not c2:
        return 12
    if c1 == c2:
        return 20
    is_n1 = any((n in c1 for n in NEUTRAL_COLORS))
    is_n2 = any((n in c2 for n in NEUTRAL_COLORS))
    if is_n1 and is_n2:
        return 30
    if is_n1 or is_n2:
        return 28
    for p1, p2 in COMPLEMENTARY_PAIRS:
        if p1 in c1 and p2 in c2 or (p2 in c1 and p1 in c2):
            return 32
    return 14

def score_item_for_occasion(item, occasion_lower):
    item_occ = str(item.get('occasion', '')).lower()
    item_cat = str(item.get('category', '')).lower()
    item_name = str(item.get('item_name', '')).lower()
    item_type = str(item.get('item_type', '')).lower()
    item_style = str(item.get('style', '')).lower()
    item_mat = str(item.get('material', '')).lower()
    item_len = str(item.get('length', '')).lower()
    combined_text = f'{item_name} {item_cat} {item_type} {item_style} {item_mat} {item_len}'
    score = 0
    if occasion_lower in item_occ:
        score += 45
    elif 'all' in item_occ or not item_occ:
        score += 20
    if occasion_lower == 'wedding':
        if any((k in combined_text for k in ['saree', 'sari', 'kanchipuram', 'banarasi', 'silk saree', 'half saree', 'langa voni', 'dhavani', 'lehenga', 'ghagra', 'chaniya', 'anarkali', 'gown', 'evening gown', 'ballgown', 'grand gown'])):
            score += 150
        elif any((k in combined_text for k in ['maxi', 'floor-length', 'floor'])) or ('dress' in combined_text and any((m in combined_text for m in ['silk', 'satin', 'velvet', 'organza', 'chiffon', 'brocade', 'sequin', 'shimmer', 'embellish', 'embroidered']))):
            score += 110
        elif any((k in combined_text for k in ['short', 'mini', 'casual', 'sundress', 't-shirt dress', 'tshirt dress'])):
            score -= 250
        elif 'dress' in combined_text:
            score += 20
        if any((k in combined_text for k in ['heel', 'stilettos', 'stiletto', 'pump', 'wedge', 'embellished heel', 'strappy heel', 'aquazzura', 'jutti', 'mojari', 'kolhapuri', 'embellished sandal'])):
            score += 90
        elif any((k in combined_text for k in ['sneaker', 'trainer', 'running', 'combat boot', 'work boot', 'flip-flop', 'canvas'])):
            score -= 350
        if any((k in combined_text for k in ['jewel', 'necklace', 'choker', 'earring', 'jhumka', 'bangle', 'bracelet', 'ring', 'tikka', 'maang tikka', 'pendant', 'clutch', 'potli'])):
            score += 90
        elif any((k in combined_text for k in ['backpack', 'gym bag', 'tote canvas', 'hobo', 'crossbody'])):
            score -= 350
        if any((k in combined_text for k in ['peplum', 'corset', 'silk blouse', 'sharara', 'palazzo', 'ethnic'])):
            score += 50
        if any((k in combined_text for k in ['t-shirt', 'tshirt', 'tee', 'hoodie', 'sweatshirt', 'tank top'])):
            score -= 300
        if any((k in combined_text for k in ['jeans', 'denim', 'distressed', 'shorts', 'sweatpants', 'jogger', 'cargo'])):
            score -= 300
        if any((k in item_style for k in ['traditional', 'elegant', 'glam', 'royal'])):
            score += 45
    elif occasion_lower == 'college':
        if any((k in combined_text for k in ['t-shirt', 'tshirt', 'tee', 'polo', 'casual shirt', 'shirt', 'jeans', 'denim', 'pant', 'cargo', 'sneaker', 'backpack', 'tote'])):
            score += 45
        if any((k in combined_text for k in ['saree', 'gown', 'heavy', 'wedding', 'lehenga', 'anarkali', 'stilettos', 'bridal'])):
            score -= 90
        if any((k in item_style for k in ['casual', 'minimal', 'trendy', 'streetwear'])):
            score += 25
    elif occasion_lower == 'party':
        if any((k in combined_text for k in ['party', 'cocktail', 'shimmer', 'sequin', 'satin', 'slip dress', 'peplum', 'corset', 'crop top', 'skirt', 'heel', 'stilettos', 'chic', 'glam'])):
            score += 65
        if any((k in combined_text for k in ['gym', 'sweatpants', 'jogger', 'flip-flop', 'canvas bag'])):
            score -= 70
        if any((k in item_style for k in ['trendy', 'elegant', 'glam', 'party'])):
            score += 30
    elif occasion_lower == 'formal':
        if any((k in combined_text for k in ['formal shirt', 'button-down', 'button down', 'dress shirt', 'blazer', 'suit', 'trouser', 'slacks', 'pleated trouser', 'pencil skirt', 'formal'])):
            score += 95
        elif any((k in combined_text for k in ['shirt', 'blouse', 'chinos'])):
            score += 45
        if any((k in combined_text for k in ['loafer', 'oxford', 'derby', 'pump', 'heel', 'dress shoe', 'clean flat'])):
            score += 80
        if any((k in combined_text for k in ['t-shirt', 'tshirt', 'tee', 'crop top', 'tank top', 'hoodie', 'sweatshirt'])):
            score -= 280
        if any((k in combined_text for k in ['jeans', 'denim', 'ripped', 'distressed', 'shorts', 'jogger', 'cargo', 'sweatpant'])):
            score -= 280
        if any((k in combined_text for k in ['sneaker', 'trainer', 'running', 'combat boot', 'flip-flop', 'canvas', 'crocs'])):
            score -= 300
        if any((k in item_style for k in ['formal', 'minimal', 'elegant', 'preppy'])):
            score += 35
    elif occasion_lower in ['casual', 'travel']:
        if any((k in combined_text for k in ['t-shirt', 'shirt', 'jeans', 'sneaker', 'flat', 'bag', 'pant', 'jogger', 'hoodie', 'denim'])):
            score += 45
        if any((k in combined_text for k in ['gown', 'saree', 'lehenga', 'stilettos'])):
            score -= 80
    return score

def generate_stylist_analysis(outfit, occasion, style_pref=''):
    top_item = next((i for i in outfit if i.get('outfit_role') == 'Top'), None)
    bottom_item = next((i for i in outfit if i.get('outfit_role') == 'Bottom'), None)
    shoes_item = next((i for i in outfit if i.get('outfit_role') == 'Footwear'), None)
    acc_item = next((i for i in outfit if i.get('outfit_role') == 'Accessory'), None)
    dress_item = next((i for i in outfit if i.get('outfit_role') == 'One-Piece'), None)
    color_palette = [i.get('color') for i in outfit if i.get('color')]
    is_wedding_traditional = occasion.lower() == 'wedding' or 'traditional' in (style_pref or '').lower()
    if gemini_client and GEMINI_API_KEY:
        items_str = '\n'.join([f'- [{i.get('outfit_role', 'Piece')}]: {i.get('item_name', '')} (Color: {i.get('color', 'N/A')}, Category: {i.get('category', 'N/A')})' for i in outfit])
        if is_wedding_traditional:
            wedding_rules = 'CRITICAL TRADITIONAL / INDIAN WEDDING RULES:\n- This is a formal Indian Wedding / Traditional Festive occasion.\n- Celebrate authentic Haute Couture, bridal splendor, Sabyasachi / Manish Malhotra aesthetics, royal silhouettes, silk, zardozi embroidery, and rich festive jewel tones.\n- NEVER justify sneakers, athletic shoes, combat boots, or casual backpacks for weddings. Traditional attire requires heels, royal juttis/mojaris, luxury jewelry, or an embroidered potli/clutch.\n- If footwear or accessories are absent from the set, provide an expert stylist tip recommending champagne/gold heels, embroidered juttis, heritage kundan/polki jewelry, and an embellished potli clutch.'
        else:
            wedding_rules = ''
        prompt = f"""You are a luxury Vogue celebrity fashion stylist.\nClient Occasion: {occasion.upper()}\nStyle Vibe: {style_pref or 'Effortless Chic'}\nOutfit Pieces:\n{items_str}\n\n{wedding_rules}\n\nAnalyze this coordinated set and explain why it is perfect for the occasion, analyzing color harmony and style.\nReturn ONLY valid JSON matching this schema:\n{{\n  "headline": "A short, chic lookbook title with an emoji or heart (e.g. 'Royal Grandeur & Haute Couture Splendor ✨')",\n  "occasion_fit": "A thoughtful 2-3 sentence explanation of why this outfit set works brilliantly for {occasion}.",\n  "color_harmony": "A 2-3 sentence analysis of how these specific colors complement each other and balance the look.",\n  "style_notes": "A 2-sentence note on the silhouette, fit, and proportions between the pieces.",\n  "styling_tips": "1-2 actionable tips on how to wear it (e.g. jewelry coordination, draping, footwear, clutch, hair/makeup)."\n}}\n"""
        candidate_models = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.1-pro-preview']
        for model_name in candidate_models:
            try:
                response = gemini_client.models.generate_content(model=model_name, contents=prompt, config=types.GenerateContentConfig(temperature=0.2))
                text = response.text.strip()
                if '```' in text:
                    text = text.replace('```json', '').replace('```', '').strip()
                import json
                parsed = json.loads(text)
                if 'occasion_fit' in parsed and 'color_harmony' in parsed:
                    return {'headline': parsed.get('headline', f'Curated Look for {occasion} ♡'), 'occasion_fit': parsed.get('occasion_fit', ''), 'color_harmony': parsed.get('color_harmony', ''), 'style_notes': parsed.get('style_notes', ''), 'styling_tips': parsed.get('styling_tips', '')}
            except Exception as gemini_err:
                print(f'Gemini stylist analysis notice ({model_name}):', repr(gemini_err))
                continue
    occ_lower = occasion.lower()
    top_name = top_item.get('item_name', 'top') if top_item else dress_item.get('item_name', 'dress') if dress_item else 'piece'
    top_color = top_item.get('color', '') if top_item else dress_item.get('color', '') if dress_item else ''
    bottom_name = bottom_item.get('item_name', 'bottoms') if bottom_item else ''
    bottom_color = bottom_item.get('color', '') if bottom_item else ''
    shoes_name = shoes_item.get('item_name', 'footwear') if shoes_item else ''
    shoes_color = shoes_item.get('color', '') if shoes_item else ''
    acc_name = acc_item.get('item_name', 'accessory') if acc_item else ''
    if is_wedding_traditional:
        is_grand = any((k in top_name.lower() for k in ['gown', 'saree', 'sari', 'lehenga', 'anarkali', 'grand']))
        if is_grand:
            headline = 'Regal Heritage & Haute Couture Splendor ✨'
            occ_fit = f'For a grand Indian wedding celebration, the magnificent {(top_color.title() + ' ' if top_color else '')}{top_name} radiates authentic royal poise and celebratory grandeur. Its sweeping silhouette, opulent craftsmanship, and celebratory presence make it an unforgettable showstopper for the Sangeet, Wedding Ceremony, or Reception.'
            if shoes_item:
                occ_fit += f' Complemented by {(shoes_color.title() + ' ' if shoes_color else '')}{shoes_name}, it elevates your stance with graceful stateliness.'
            else:
                occ_fit += ' Pair with metallic champagne stilettos or royal embroidered juttis to complete the regal stance.'
            color_harm = f'The luxurious palette of {(', '.join(color_palette) if color_palette else 'rich celebratory jewel tones')} creates warm luminescence and royal charm under celebratory chandeliers.'
            style_notes = 'Sweeping floor-length lines and contoured couture tailoring establish a majestic, photo-ready profile that flatters effortlessly.'
            if acc_item:
                style_tips = f'Pro-Tip: Coordinate with {acc_name}, opt for an elegant updo with fresh jasmine/roses, and add glowing festive makeup.'
            else:
                style_tips = 'Pro-Tip: Crown this look with a statement polki or kundan choker, chandelier jhumkas, and carry an embroidered raw-silk potli clutch.'
        elif dress_item:
            headline = 'Celebratory Wedding Grace ✨'
            occ_fit = f'For this wedding celebration, the refined {(top_color.title() + ' ' if top_color else '')}{top_name} brings festive poise and celebratory charm. It captures the spirit of the occasion with grace and understated beauty.'
            if shoes_item:
                occ_fit += f' Paired with {(shoes_color.title() + ' ' if shoes_color else '')}{shoes_name}, it creates a poised ceremonial profile.'
            else:
                occ_fit += ' Style with embellished block heels or golden juttis to anchor the look.'
            color_harm = f'Harmonious festive tones in {(', '.join(color_palette) if color_palette else 'classic hues')} balance romantic flair with celebratory glow.'
            style_notes = 'Balanced proportions maintain effortless comfort while accentuating graceful movement across ceremonial spaces.'
            style_tips = 'Pro-Tip: Add delicate gold jewelry, a structured clutch, and glowing beauty accents to finish the look.'
        else:
            headline = 'Distinguished Wedding Splendor ✨'
            occ_fit = f'For a wedding occasion, the refined {(top_color.title() + ' ' if top_color else '')}{top_name} paired with {(bottom_color.title() + ' ' if bottom_color else '')}{bottom_name} creates a distinguished, celebratory presence.'
            if shoes_item:
                occ_fit += f' Finished with {shoes_name}, this set achieves formal harmony.'
            color_harm = 'Luminous and harmonious hues reflect celebratory ambient lighting gracefully.'
            style_notes = 'Structured tailoring and elevated cut lines deliver a poised silhouette.'
            style_tips = 'Pro-Tip: Pair with heritage accessories and polished evening footwear to complete the festive elegance.'
    elif occ_lower == 'college':
        headline = 'Effortless Campus Chic ♡'
        if top_item and bottom_item:
            occ_fit = f'For a busy college day, comfort, durability, and effortless style are paramount. The {(top_color.title() + ' ' if top_color else '')}{top_name} offers relaxed breathability for lectures and study sessions, while the {(bottom_color.title() + ' ' if bottom_color else '')}{bottom_name} provides practical ease of movement across campus.'
            if shoes_item:
                occ_fit += f' Anchored by {(shoes_color.title() + ' ' if shoes_color else '')}{shoes_name}, you stay comfortable during long walks while maintaining a trendy streetwear aesthetic.'
        elif dress_item:
            occ_fit = f'For an easygoing college day, the {(top_color.title() + ' ' if top_color else '')}{top_name} delivers breezy, one-step styling that feels light, comfortable, and effortlessly put-together.'
        else:
            occ_fit = 'Selected for campus ease, this piece provides an approachable, comfortable look suited for daily college routines.'
        color_harm = f'The palette combines {top_color or 'neutral'} and {bottom_color or 'complementary'} tones to create a balanced, unfussy aesthetic. The contrast keeps the outfit crisp and fresh without requiring complicated coordination.'
        style_notes = 'A relaxed-proportioned upper paired with clean-lined bottoms establishes a flattering, casual silhouette suited for all-day campus wear.'
        style_tips = 'Pro-Tip: Try a relaxed half-tuck at the waistband. Carry a canvas tote or backpack, and keep jewellery minimal for a breezy student vibe.'
    elif occ_lower == 'formal':
        headline = 'Tailored Executive Poise 💼'
        occ_fit = f'In a professional or formal environment, clean tailoring and sharp lines project competence and poise. The {(top_color.title() + ' ' if top_color else '')}{top_name} delivers structured polish, while the {(bottom_color.title() + ' ' if bottom_color else '')}{bottom_name} creates an authoritative, streamlined presence.'
        if shoes_item:
            occ_fit += f' Polished {shoes_name} ties the professional look together seamlessly.'
        color_harm = 'Subdued, professional color tones project quiet luxury and timeless sophistication without unnecessary visual distraction.'
        style_notes = "Structured shoulders and tailored leg contours balance the body's natural lines, creating a composed and empowered silhouette."
        style_tips = 'Pro-Tip: Ensure a crisp press, wear a classic wristwatch or minimalist necklace, and carry a structured handbag for an impeccable boardroom presence.'
    elif occ_lower == 'party':
        headline = 'Glamorous Evening Chic 🍸'
        occ_fit = f'For an evening party or festive night out, this look brings dynamic energy and magnetic charm. The eye-catching {top_name} catches the light, complemented by dance-ready confidence.'
        if shoes_item:
            occ_fit += f' Elevated by {shoes_name}, it creates an alluring party-ready silhouette.'
        color_harm = 'Bold contrast or rich evening undertones create an alluring, camera-ready palette that stands out effortlessly in social settings.'
        style_notes = 'Flattering contours and playful cut lines accentuate movement, striking the perfect balance between high-end glam and wearable comfort.'
        style_tips = 'Pro-Tip: Add a bold lip, subtle metallic accents, and a compact clutch to elevate the after-dark energy.'
    else:
        headline = f'Effortless {occasion.title()} Ease 🌿'
        occ_fit = f'For {occasion}, ease of wear and functional style are essential. The harmonious combination of {top_name} with {bottom_name or 'complementary pieces'} provides a versatile, effortlessly chic uniform.'
        if shoes_item:
            occ_fit += f' Supported by comfortable {shoes_name}, you stay ready for any spontaneous plan.'
        color_harm = 'Calming tones with subtle grounding neutrals evoke a relaxed, unhurried modern aesthetic.'
        style_notes = 'Breathable, balanced tailoring allows natural movement while retaining a clean, contemporary profile.'
        style_tips = 'Pro-Tip: Layer with lightweight outerwear or sunglasses, and roll the cuffs slightly for an easy off-duty aesthetic.'
    return {'headline': headline, 'occasion_fit': occ_fit, 'color_harmony': color_harm, 'style_notes': style_notes, 'styling_tips': style_tips}


# =====================================================
# [GET] /recommend-outfit
# =====================================================
@app.get('/recommend-outfit')
def recommend_outfit(user_id: str, occasion: str, style: str='', variation: int=0, exclude_ids: str=''):
    clothes = list(db['wardrobe'].find({'user_id': user_id}))
    if not clothes:
        return {'message': 'No wardrobe items found. Add clothes to your wardrobe first!', 'outfit': [], 'occasion': occasion, 'style': style or 'Curated Chic', 'variation': 0, 'total_variations': 0, 'has_alternatives': False, 'analysis': None}
    for clothing in clothes:
        auto_correct_wardrobe_item(clothing)
    occasion_lower = occasion.lower()
    style_lower = style.lower()
    is_wedding_or_traditional = occasion_lower == 'wedding' or 'traditional' in style_lower
    tops = []
    bottoms = []
    one_pieces = []
    footwear = []
    accessories = []
    for item in clothes:
        role = classify_wardrobe_item(item)
        if role == 'top':
            tops.append(item)
        elif role == 'bottom':
            bottoms.append(item)
        elif role == 'one_piece':
            one_pieces.append(item)
        elif role == 'footwear':
            footwear.append(item)
        elif role == 'accessory':
            accessories.append(item)
    if is_wedding_or_traditional:
        allowed_fw = [f for f in footwear if any((w in f'{f.get('category', '')} {f.get('item_name', '')} {f.get('item_type', '')}'.lower() for w in ['heel', 'stilettos', 'stiletto', 'pump', 'wedge', 'platform heel', 'jutti', 'mojari', 'kolhapuri', 'sandal', 'aquazzura', 'heels', 'sandals'])) and (not any((b in f'{f.get('category', '')} {f.get('item_name', '')} {f.get('item_type', '')}'.lower() for b in ['sneaker', 'sneakers', 'trainer', 'running', 'combat boot', 'work boot', 'flip-flop', 'canvas'])))]
        sorted_footwear = sorted(allowed_fw, key=lambda f: score_item_for_occasion(f, occasion_lower), reverse=True)
        f_choices = sorted_footwear[:3] if sorted_footwear else [None]
    elif occasion_lower == 'formal':
        allowed_fw = [f for f in footwear if any((w in f'{f.get('category', '')} {f.get('item_name', '')} {f.get('item_type', '')}'.lower() for w in ['loafer', 'oxford', 'derby', 'pump', 'heel', 'dress shoe', 'clean flat', 'flats', 'stilettos'])) and (not any((b in f'{f.get('category', '')} {f.get('item_name', '')} {f.get('item_type', '')}'.lower() for b in ['sneaker', 'sneakers', 'trainer', 'running', 'combat boot', 'flip-flop', 'canvas', 'crocs'])))]
        sorted_footwear = sorted(allowed_fw if allowed_fw else footwear, key=lambda f: score_item_for_occasion(f, occasion_lower), reverse=True)
        f_choices = sorted_footwear[:3] if sorted_footwear else [None]
    else:
        sorted_footwear = sorted(footwear, key=lambda f: score_item_for_occasion(f, occasion_lower), reverse=True)
        f_choices = sorted_footwear[:3] if sorted_footwear else [None]
    if is_wedding_or_traditional:
        allowed_acc = [a for a in accessories if any((w in f'{a.get('category', '')} {a.get('item_name', '')} {a.get('item_type', '')}'.lower() for w in ['jewel', 'necklace', 'choker', 'earring', 'jhumka', 'bangle', 'bracelet', 'ring', 'tikka', 'maang tikka', 'pendant', 'clutch', 'potli', 'evening bag', 'jewelry', 'clutches'])) and (not any((b in f'{a.get('category', '')} {a.get('item_name', '')} {a.get('item_type', '')}'.lower() for b in ['hobo', 'backpack', 'gym', 'canvas tote', 'tote canvas', 'crossbody nylon', 'belt bag'])))]
        sorted_accessories = sorted(allowed_acc, key=lambda a: score_item_for_occasion(a, occasion_lower), reverse=True)
        a_choices = sorted_accessories[:2] if sorted_accessories else [None]
    else:
        sorted_accessories = sorted(accessories, key=lambda a: score_item_for_occasion(a, occasion_lower), reverse=True)
        a_choices = sorted_accessories[:2] if sorted_accessories else [None]
    core_looks = {}
    for top in tops:
        top_text = f'{top.get('category', '')} {top.get('item_name', '')} {top.get('item_type', '')}'.lower()
        if is_wedding_or_traditional and any((w in top_text for w in ['t-shirt', 'tshirt', 'tee', 'hoodie', 'tank top', 'casual shirt'])):
            continue
        if occasion_lower == 'formal' and any((w in top_text for w in ['t-shirt', 'tshirt', 'tee', 'crop top', 'tank top', 'hoodie', 'sweatshirt', 'graphic'])):
            continue
        for bottom in bottoms:
            bot_text = f'{bottom.get('category', '')} {bottom.get('item_name', '')} {bottom.get('item_type', '')}'.lower()
            if is_wedding_or_traditional and any((w in bot_text for w in ['jean', 'denim', 'short', 'cargo', 'jogger', 'sweatpant'])):
                continue
            if occasion_lower == 'formal' and any((w in bot_text for w in ['jean', 'denim', 'short', 'cargo', 'jogger', 'sweatpant'])):
                continue
            base_score = score_item_for_occasion(top, occasion_lower) + score_item_for_occasion(bottom, occasion_lower) + evaluate_color_pair(top.get('color'), bottom.get('color')) + 30
            if occasion_lower in ['college', 'casual', 'travel']:
                base_score += 40
            elif occasion_lower == 'formal':
                if any((w in top_text for w in ['formal', 'button-down', 'blazer', 'suit'])) or any((w in bot_text for w in ['trouser', 'slacks', 'pleated'])):
                    base_score += 65
            key = (str(top.get('_id')), str(bottom.get('_id')))
            core_looks[key] = {'core_items': [top, bottom], 'score': base_score, 'type': 'separates', 'color_ref': bottom.get('color') or top.get('color')}
    for piece in one_pieces:
        p_text = f'{piece.get('category', '')} {piece.get('item_name', '')} {piece.get('item_type', '')}'.lower()
        if is_wedding_or_traditional and any((w in p_text for w in ['short', 'mini', 'casual', 'sundress', 't-shirt dress', 'ruched tie-strap mini'])):
            continue
        base_score = score_item_for_occasion(piece, occasion_lower) + 30
        if is_wedding_or_traditional:
            if any((k in p_text for k in ['saree', 'sari', 'half saree', 'lehenga', 'anarkali', 'gown', 'ballgown', 'evening gown'])):
                base_score += 180
            elif any((k in p_text for k in ['maxi', 'floor'])):
                base_score += 90
        elif occasion_lower in ['party']:
            base_score += 55
        key = (str(piece.get('_id')),)
        core_looks[key] = {'core_items': [piece], 'score': base_score, 'type': 'one_piece', 'color_ref': piece.get('color')}
    distinct_candidates = []
    for key, look in core_looks.items():
        items = list(look['core_items'])
        total_score = look['score']
        color_ref = look['color_ref']
        best_f = None
        best_f_score = -9999
        for f in f_choices:
            if not f:
                continue
            f_score = score_item_for_occasion(f, occasion_lower) + evaluate_color_pair(color_ref, f.get('color'))
            if f_score > best_f_score:
                best_f_score = f_score
                best_f = f
        if best_f:
            items.append(best_f)
            total_score += best_f_score + 35
        best_a = None
        best_a_score = -9999
        for a in a_choices:
            if not a:
                continue
            a_score = score_item_for_occasion(a, occasion_lower) + evaluate_color_pair(color_ref, a.get('color'))
            if a_score > best_a_score:
                best_a_score = a_score
                best_a = a
        if best_a:
            items.append(best_a)
            total_score += best_a_score + 25
        distinct_candidates.append({'items': items, 'score': total_score, 'type': look['type'], 'core_keys': set(key)})
    if not distinct_candidates:
        if one_pieces:
            best_op = max(one_pieces, key=lambda p: score_item_for_occasion(p, occasion_lower))
            chosen = [best_op]
            if f_choices and f_choices[0]:
                chosen.append(f_choices[0])
            if a_choices and a_choices[0]:
                chosen.append(a_choices[0])
            distinct_candidates.append({'items': chosen, 'score': 25, 'type': 'one_piece', 'core_keys': {str(best_op.get('_id'))}})
        elif tops and (not is_wedding_or_traditional):
            chosen_set = [max(tops, key=lambda t: score_item_for_occasion(t, occasion_lower))]
            if sorted_footwear:
                chosen_set.append(sorted_footwear[0])
            distinct_candidates.append({'items': chosen_set, 'score': 15, 'type': 'top_only', 'core_keys': {str(chosen_set[0].get('_id'))}})
        elif bottoms and (not is_wedding_or_traditional):
            chosen_set = [max(bottoms, key=lambda b: score_item_for_occasion(b, occasion_lower))]
            if sorted_footwear:
                chosen_set.append(sorted_footwear[0])
            distinct_candidates.append({'items': chosen_set, 'score': 15, 'type': 'bottom_only', 'core_keys': {str(chosen_set[0].get('_id'))}})
        elif clothes:
            distinct_candidates.append({'items': [clothes[0]], 'score': 5, 'type': 'raw', 'core_keys': {str(clothes[0].get('_id'))}})
    if not distinct_candidates:
        return {'message': "Couldn't generate an outfit from your wardrobe. Try adding more tops, bottoms, or shoes!", 'outfit': [], 'occasion': occasion, 'style': style or 'Curated Chic', 'variation': 0, 'total_variations': 0, 'has_alternatives': False, 'analysis': None}
    distinct_candidates.sort(key=lambda c: c['score'], reverse=True)
    final_pool = distinct_candidates
    if exclude_ids:
        exclude_set = set((k.strip() for k in exclude_ids.split(',') if k.strip()))
        alt_pool = [c for c in distinct_candidates if not c['core_keys'] & exclude_set]
        if alt_pool:
            final_pool = alt_pool
    total_variations = len(final_pool)
    chosen_candidate = final_pool[variation % total_variations]
    outfit = chosen_candidate['items']
    for item in outfit:
        item['_id'] = str(item['_id'])
        role = classify_wardrobe_item(item)
        if role == 'top':
            item['outfit_role'] = 'Top'
        elif role == 'bottom':
            item['outfit_role'] = 'Bottom'
        elif role == 'one_piece':
            item['outfit_role'] = 'One-Piece'
        elif role == 'footwear':
            item['outfit_role'] = 'Footwear'
        elif role == 'accessory':
            item['outfit_role'] = 'Accessory'
        else:
            item['outfit_role'] = 'Piece'
    analysis = generate_stylist_analysis(outfit, occasion, style)
    color_palette = [item.get('color') for item in outfit if item.get('color')]
    history_record = {'user_id': user_id, 'occasion': occasion, 'style': style or 'Curated Chic', 'variation': variation, 'total_variations': total_variations, 'headline': analysis.get('headline', f'Curated Look for {occasion} ♡'), 'analysis': analysis, 'color_palette': color_palette, 'outfit': [{'_id': str(i.get('_id')), 'item_name': i.get('item_name'), 'category': i.get('category'), 'color': i.get('color'), 'image': i.get('image'), 'outfit_role': i.get('outfit_role', 'Piece')} for i in outfit], 'created_at': datetime.utcnow()}
    try:
        db['recommendation_history'].insert_one(history_record)
    except Exception as hist_err:
        print('Recommendation history recording notice:', repr(hist_err))
    return {'message': analysis.get('headline', f'Curated Look for {occasion} ♡'), 'occasion': occasion, 'style': style or 'Curated Chic', 'variation': variation, 'total_variations': total_variations, 'has_alternatives': total_variations > 1, 'color_palette': color_palette, 'analysis': analysis, 'outfit': outfit}


# =====================================================
# [GET] /stylist/history
# =====================================================
@app.get('/stylist/history')
def get_stylist_history(user_id: str, limit: int=12):
    """
    Returns past recommended outfits for the user.
    """
    try:
        records = list(db['recommendation_history'].find({'user_id': user_id}).sort('created_at', -1).limit(limit))
        for r in records:
            r['_id'] = str(r['_id'])
            if isinstance(r.get('created_at'), datetime):
                r['created_at'] = r['created_at'].isoformat()
        return {'history': records}
    except Exception as e:
        print('Error fetching stylist history:', repr(e))
        return {'history': [], 'error': str(e)}


# =====================================================
# [DELETE] /stylist/history/{history_id}
# =====================================================
@app.delete('/stylist/history/{history_id}')
def delete_stylist_history(history_id: str, user_id: str=''):
    """
    Deletes a specific past recommendation look from history.
    """
    try:
        from bson import ObjectId
        query = {'_id': ObjectId(history_id)}
        if user_id:
            query['user_id'] = user_id
        result = db['recommendation_history'].delete_one(query)
        if result.deleted_count == 0:
            return {'message': 'Record not found'}
        return {'message': 'Curated look removed from your history.'}
    except Exception as e:
        return {'message': 'Failed to remove look', 'error': str(e)}

def detect_garment_color(image: Image.Image, mask: Image.Image):
    """
    Estimate the dominant visible color of a garment
    using only pixels inside its segmentation mask.
    """
    image_rgb = np.array(image.convert('RGB'))
    mask_array = np.array(mask)
    pixels = image_rgb[mask_array > 128]
    if len(pixels) == 0:
        return 'unknown'
    filtered = pixels[np.sum(pixels, axis=1) < 735]
    if len(filtered) > 0:
        pixels = filtered
    mean_color = np.mean(pixels, axis=0)
    r, g, b = mean_color
    if r > 200 and g > 200 and (b > 200):
        return 'white'
    if r < 60 and g < 60 and (b < 60):
        return 'black'
    if abs(r - g) < 25 and abs(g - b) < 25:
        return 'dark gray' if r < 130 else 'gray'
    if r > g * 1.25 and r > b * 1.25:
        return 'red'
    if r > 150 and g > 100 and (b < 100):
        return 'orange'
    if r > 150 and g > 130 and (b < 130):
        return 'yellow'
    if g > r * 1.2 and g > b * 1.1:
        return 'green'
    if b > r * 1.2 and b > g * 1.1:
        return 'blue'
    if r > 100 and b > 100 and (r > g * 1.1):
        return 'purple'
    return 'multicolor'


# =====================================================
# [POST] /extract-clothing
# =====================================================
@app.post('/extract-clothing')
async def extract_clothing(image: UploadFile=File(...), category: str=Form('auto')):
    try:
        print('====================================')
        print('CLOTHING EXTRACTION STARTED')
        print('Filename:', image.filename)
        print('====================================')
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail='No image was uploaded.')
        try:
            original_image = Image.open(io.BytesIO(image_bytes))
            original_image.load()
            original_image = ImageOps.exif_transpose(original_image)
            original_image = original_image.convert('RGB')
        except Exception as e:
            raise HTTPException(status_code=400, detail=f'Could not decode image: {str(e)}')
        print('Running clothing segmentation...')
        inputs = image_processor(images=original_image, return_tensors='pt')
        with torch.no_grad():
            outputs = clothing_model(**inputs)
        logits = outputs.logits
        logits = torch.nn.functional.interpolate(logits, size=original_image.size[::-1], mode='bilinear', align_corners=False)
        segmentation = logits.argmax(dim=1)[0]
        garment_classes = {4: 'upper', 5: 'skirt', 6: 'pants', 7: 'dress', 9: 'shoes', 10: 'shoes', 1: 'hat', 3: 'sunglasses', 8: 'belt', 16: 'bag', 17: 'scarf'}
        category = category.lower().strip()
        category_classes = {'upper': [4], 'shirt': [4], 'tshirt': [4], 't-shirt': [4], 'top': [4], 'lower': [5, 6], 'pants': [6], 'trousers': [6], 'jeans': [6], 'shorts': [6], 'skirt': [5], 'dress': [7], 'shoes': [9], 'hat': [1], 'sunglasses': [3], 'belt': [8], 'bag': [16], 'scarf': [17]}
        if category == 'auto':
            detected_areas = {}
            for class_id in garment_classes:
                area = (segmentation == class_id).sum().item()
                detected_areas[class_id] = area
            print('AUTO DETECTED AREAS:', detected_areas)
            selected_classes = [class_id for class_id, area in detected_areas.items() if area > 1000]
            if 7 in selected_classes:
                shoe_area = detected_areas.get(9, 0) + detected_areas.get(10, 0)
                dress_area = detected_areas.get(7, 0)
                if shoe_area > dress_area:
                    selected_classes.remove(7)
                else:
                    selected_classes = [7]
            if 9 in selected_classes or 10 in selected_classes:
                selected_classes = [class_id for class_id in selected_classes if class_id not in [9, 10]]
                selected_classes.append(9)
            if 7 in selected_classes:
                selected_classes = [7]
            if not selected_classes:
                raise HTTPException(status_code=400, detail='Could not detect any clothing items.')
        else:
            if category not in category_classes:
                raise HTTPException(status_code=400, detail='Unsupported category. Use auto, upper, lower, shirt, tshirt, top, pants, jeans, skirt or dress.')
            selected_classes = category_classes[category]
        print('SELECTED CLOTHING CLASSES:', selected_classes)
        extracted_items = []
        for class_id in selected_classes:
            if class_id == 9:
                clothing_mask = (segmentation == 9) | (segmentation == 10)
            else:
                clothing_mask = segmentation == class_id
            mask = clothing_mask.cpu().numpy().astype('uint8') * 255
            if not np.any(mask):
                continue
            clean_mask = mask.copy()
            if class_id == 6:
                small_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
                clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_OPEN, small_kernel, iterations=1)
                close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
                clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, close_kernel, iterations=1)
            else:
                close_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
                clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, close_kernel, iterations=2)
            flood_mask = clean_mask.copy()
            flood_fill_mask = np.zeros((flood_mask.shape[0] + 2, flood_mask.shape[1] + 2), np.uint8)
            cv2.floodFill(flood_mask, flood_fill_mask, (0, 0), 255)
            flood_mask = cv2.bitwise_not(flood_mask)
            clean_mask = cv2.bitwise_or(clean_mask, flood_mask)
            num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(clean_mask, connectivity=8)
            if num_labels > 1:
                if class_id == 9:
                    shoe_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41))
                    clean_mask = cv2.dilate(clean_mask, shoe_kernel, iterations=2)
                    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, shoe_kernel, iterations=2)
                    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(clean_mask, connectivity=8)
                    main_mask = np.zeros_like(clean_mask)
                    for label_id in range(1, num_labels):
                        area = stats[label_id, cv2.CC_STAT_AREA]
                        if area >= 500:
                            main_mask[labels == label_id] = 255
                    clean_mask = main_mask
                else:
                    areas = stats[1:, cv2.CC_STAT_AREA]
                    if len(areas) > 0:
                        largest_area = int(np.max(areas))
                        main_mask = np.zeros_like(clean_mask)
                        if class_id == 6:
                            minimum_area = largest_area * 0.03
                        else:
                            minimum_area = largest_area * 0.015
                        for label_id in range(1, num_labels):
                            area = stats[label_id, cv2.CC_STAT_AREA]
                            if area >= minimum_area:
                                main_mask[labels == label_id] = 255
                        clean_mask = main_mask
            edge_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, edge_kernel, iterations=1)
            smooth_mask = cv2.GaussianBlur(clean_mask, (3, 3), 0)
            mask_image = Image.fromarray(smooth_mask, mode='L')
            bbox = mask_image.getbbox()
            if bbox is None:
                continue
            left, top, right, bottom = bbox
            width = right - left
            height = bottom - top
            padding_x = max(20, int(width * 0.1))
            padding_y = max(20, int(height * 0.1))
            left = max(0, left - padding_x)
            top = max(0, top - padding_y)
            right = min(original_image.width, right + padding_x)
            bottom = min(original_image.height, bottom + padding_y)
            original_rgba = original_image.convert('RGBA')
            if class_id == 9:
                crop = original_image.crop((left, top, right, bottom)).convert('RGB')
                crop_np = np.array(crop)
                mask_np = np.array(mask_image.crop((left, top, right, bottom)))
                grabcut_mask = np.full(mask_np.shape, cv2.GC_PR_BGD, dtype=np.uint8)
                grabcut_mask[mask_np > 100] = cv2.GC_FGD
                shoe_seed_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
                probable_fg = cv2.dilate((mask_np > 100).astype(np.uint8), shoe_seed_kernel, iterations=2)
                grabcut_mask[probable_fg > 0] = cv2.GC_PR_FGD
                grabcut_mask[mask_np > 100] = cv2.GC_FGD
                grabcut_mask[0, :] = cv2.GC_BGD
                grabcut_mask[-1, :] = cv2.GC_BGD
                grabcut_mask[:, 0] = cv2.GC_BGD
                grabcut_mask[:, -1] = cv2.GC_BGD
                bgd_model = np.zeros((1, 65), np.float64)
                fgd_model = np.zeros((1, 65), np.float64)
                cv2.grabCut(crop_np, grabcut_mask, None, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_MASK)
                final_mask = np.where((grabcut_mask == cv2.GC_FGD) | (grabcut_mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
                final_mask = cv2.morphologyEx(final_mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)), iterations=1)
                extracted_crop = crop.convert('RGBA')
                extracted_crop.putalpha(Image.fromarray(final_mask, mode='L'))
                extracted_image = extracted_crop
            elif class_id == 6:
                crop = original_image.crop((left, top, right, bottom)).convert('RGB')
                crop_np = np.array(crop)
                mask_np = np.array(mask_image.crop((left, top, right, bottom)))
                grabcut_mask = np.full(mask_np.shape, cv2.GC_PR_BGD, dtype=np.uint8)
                grabcut_mask[mask_np > 100] = cv2.GC_FGD
                pants_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
                probable_fg = cv2.dilate((mask_np > 100).astype(np.uint8), pants_kernel, iterations=1)
                grabcut_mask[probable_fg > 0] = cv2.GC_PR_FGD
                grabcut_mask[mask_np > 100] = cv2.GC_FGD
                grabcut_mask[0, :] = cv2.GC_BGD
                grabcut_mask[-1, :] = cv2.GC_BGD
                grabcut_mask[:, 0] = cv2.GC_BGD
                grabcut_mask[:, -1] = cv2.GC_BGD
                bgd_model = np.zeros((1, 65), np.float64)
                fgd_model = np.zeros((1, 65), np.float64)
                cv2.grabCut(crop_np, grabcut_mask, None, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_MASK)
                final_mask = np.where((grabcut_mask == cv2.GC_FGD) | (grabcut_mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
                final_mask = cv2.morphologyEx(final_mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)), iterations=1)
                final_mask = cv2.morphologyEx(final_mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=1)
                extracted_crop = crop.convert('RGBA')
                extracted_crop.putalpha(Image.fromarray(final_mask, mode='L'))
                extracted_image = extracted_crop
            else:
                extracted_image = Image.new('RGBA', original_rgba.size, (255, 255, 255, 0))
                extracted_image.paste(original_rgba, (0, 0), mask_image)
                extracted_image = extracted_image.crop((left, top, right, bottom))
            if class_id == 4:
                detected_category = 'Upper'
            elif class_id in [5, 6]:
                detected_category = 'Lower'
            elif class_id == 7:
                detected_category = 'Dress'
            elif class_id == 9:
                detected_category = 'Shoes'
            elif class_id == 1:
                detected_category = 'Hat'
            elif class_id == 3:
                detected_category = 'Sunglasses'
            elif class_id == 8:
                detected_category = 'Belt'
            elif class_id == 16:
                detected_category = 'Bag'
            elif class_id == 17:
                detected_category = 'Scarf'
            else:
                detected_category = 'Clothing'
            cropped_filename = 'cropped_' + detected_category.lower() + '_' + str(uuid.uuid4()) + '.png'
            cropped_path = os.path.join(UPLOAD_DIR, cropped_filename)
            extracted_image.save(cropped_path, format='PNG')
            print('Split garment saved:', cropped_path)
            detected_color = detect_garment_color(original_image, mask_image)
            print('Detected color:', detected_color)
            catalog_basename = 'catalog_' + detected_category.lower() + '_' + str(uuid.uuid4())
            catalog_prefix = os.path.join(UPLOAD_DIR, catalog_basename)
            try:
                print('Creating Hugging Face catalog image...')
                catalog_img = create_huggingface_catalog_image(extracted_image, detected_category)
                if catalog_img is None:
                    print('Hugging Face unavailable. Using local catalog generator.')
                    catalog_img = create_catalog_image(extracted_image)
                webp_name, jpg_name = save_catalog_web(catalog_img, catalog_prefix)
                final_image_url = '/uploads/' + webp_name
                print('Catalog image created:', final_image_url)
            except Exception as catalog_error:
                print('Catalog conversion failed:', str(catalog_error))
                final_image_url = '/uploads/' + cropped_filename
                print('FINAL GARMENT IMAGE:', final_image_url)
            extracted_items.append({'category': detected_category, 'color': detected_color, 'image': final_image_url})
            print('FINAL WARDROBE IMAGE:', final_image_url)
        if not extracted_items:
            raise HTTPException(status_code=400, detail='Could not isolate any clothing items from the image.')
        print('TOTAL GARMENTS EXTRACTED:', len(extracted_items))
        return {'message': 'AI clothing catalog images created successfully!', 'items': extracted_items}
    except HTTPException:
        raise
    except Exception as e:
        print('CLOTHING EXTRACTION ERROR:', str(e))
        raise HTTPException(status_code=500, detail=str(e))

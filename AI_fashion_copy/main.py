import sqlite3

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from fastapi.middleware.cors import CORSMiddleware
import re
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from pydantic import BaseModel

cache_store = {}

load_dotenv()

app = FastAPI()

SECRET_KEY = "change_this_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

users_db = {}

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def init_db():
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

class UserAuth(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(user: UserAuth):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()

    hashed = hash_password(user.password)

    try:
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (user.email, hashed)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="User already exists")

    conn.close()
    return {"message": "User created"}

@app.post("/login")
def login(user: UserAuth):
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()

    cursor.execute("SELECT email, password FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()

    conn.close()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    stored_email, stored_password = db_user

    if not verify_password(user.password, stored_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": stored_email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
templates = Jinja2Templates(directory="templates")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ProductInput(BaseModel):
    productName: str
    features: str
    audience: str
    brandVoice: str

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# -------------------------
# GENERATE (Micro Format)
# -------------------------

@app.post("/generate")
def generate(data: ProductInput):

    # 1️⃣ Description
    description_prompt = f"""
You are an elite ecommerce copywriter.

Write:ß
- Emotional headline (max 12 words)
- 2–3 persuasive paragraphs
- 4–6 benefit bullets
- 1 urgency line

Tone: {data.brandVoice}
Audience: {data.audience}
Product: {data.productName}
Features: {data.features}

Max 220 words. No fluff.
"""

    description = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": description_prompt}],
        temperature=0.4,
    ).choices[0].message.content.strip()

    # 2️⃣ Ads
    ads_prompt = f"""
Write 3 high-converting ad variations.
Under 20 words each.
Tone: {data.brandVoice}
Audience: {data.audience}
Product: {data.productName}
"""

    ads_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": ads_prompt}],
        temperature=0.7,
    )

    ads_text = ads_response.choices[0].message.content.strip()
    ads_list = [ad.strip("-• ").strip() for ad in ads_text.split("\n") if ad.strip()]

    # 3️⃣ Email
    email_prompt = f"""
Write:
- Subject under 8 words
- Body under 120 words

Tone: {data.brandVoice}
Audience: {data.audience}
Product: {data.productName}
"""

    email_text = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": email_prompt}],
        temperature=0.5,
    ).choices[0].message.content.strip()

    lines = email_text.split("\n")
    email_subject = lines[0].replace("Subject:", "").strip()
    email_body = "\n".join(lines[1:]).strip()

    return {
        "product_description": description,
        "ads": ads_list[:3],
        "email_subject": email_subject,
        "email_body": email_body
    }
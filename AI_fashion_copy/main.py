from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import hashlib
from fastapi.middleware.cors import CORSMiddleware
import re

cache_store = {}

load_dotenv()

app = FastAPI()

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

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate")
async def generate_copy(data: ProductInput):
    try:
        prompt = f"""
You are a senior ecommerce conversion copywriter specializing in Shopify fashion brands.

Return STRICT JSON:

{{
  "product_description": "...",
  "ads": ["ad 1", "ad 2", "ad 3"],
  "email_subject": "...",
  "email_body": "..."
}}

Product Name: {data.productName}
Features: {data.features}
Target Audience: {data.audience}

Make it emotional, benefit-driven, premium.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert ecommerce copywriter."},
                {"role": "user", "content": prompt},
            ],
        )

        raw_output = response.choices[0].message.content

        # Remove markdown formatting if model adds it
        cleaned = re.sub(r"```json|```", "", raw_output).strip()

        try:
            parsed_output = json.loads(cleaned)
        except Exception as e:
            print("JSON Parse Error:", e)
            print("RAW OUTPUT:", raw_output)
            return {"error": "Invalid JSON returned by model"}

        return parsed_output

    except Exception as e:
        print("SERVER ERROR:", str(e))
        return {"error": str(e)}
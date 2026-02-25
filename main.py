from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
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

Write:
1. High-converting product description
2. 3 Instagram ad variations
3. 1 short email campaign (subject + body)

Product Name: {data.productName}
Features: {data.features}
Target Audience: {data.audience}

Make it emotional, benefit-driven, premium, and persuasive.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert ecommerce copywriter."},
                {"role": "user", "content": prompt},
            ],
        )

        return JSONResponse({
            "output": response.choices[0].message.content
        })

    except Exception as e:
        return JSONResponse({
            "error": str(e)
        }, status_code=500)
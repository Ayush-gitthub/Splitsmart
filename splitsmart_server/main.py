<<<<<<< HEAD
from fastapi import FastAPI
from src.api.api import api_router

app = FastAPI(
    title="SplitSmart API",
    description="The backend for the SplitSmart expense splitting application.",
    version="0.1.0",
)

# Include the main router with a prefix
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the SplitSmart API!"}
=======
# main.py
import base64
import openai
import os
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
load_dotenv()
# --- Configuration ---
# Ensure your OPENAI_API_KEY is set in your environment variables
client = openai.OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

if not client.api_key:
    raise RuntimeError("OPENAI_API_KEY environment variable not set.")

app = FastAPI(title="Smart Bill Splitter API")

# --- Pydantic Models for Response Validation ---
class LineItem(BaseModel):
    item_name: str = Field(..., description="Name of the purchased item")
    quantity: int = Field(..., description="Quantity of the item")
    unit_price: float = Field(..., description="Price per unit of the item")
    total_price: float = Field(..., description="Total price for this line item")

class TaxOrCharge(BaseModel):
    tax_name: str = Field(..., description="Name of the tax or service charge")
    tax_amount: float = Field(..., description="Amount of the tax or charge")

class BillScanResponse(BaseModel):
    line_items: List[LineItem]
    taxes_and_charges: List[TaxOrCharge]
    grand_total: float

# --- The Bulletproof System Prompt ---
SYSTEM_PROMPT = """
You are an expert AI data extractor. Your only task is to analyze an image of a bill and extract its contents into a specific JSON format.
You must adhere to the following rules:
1. Extract every line item, tax/charge, and the grand total.
2. Your response must be ONLY the JSON object. Do not include any introductory text, explanations, or markdown like ```json. Just the raw JSON.
3. The JSON schema must be exactly as follows:
{
  "line_items": [{"item_name": "string", "quantity": "integer", "unit_price": "float", "total_price": "float"}],
  "taxes_and_charges": [{"tax_name": "string", "tax_amount": "float"}],
  "grand_total": "float"
}
"""

@app.post("/scan-bill/", response_model=BillScanResponse)
async def scan_bill(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    image_contents = await file.read()
    base64_image = base64.b64encode(image_contents).decode('utf-8')

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            # This is the most important change. It forces the model to output JSON.
            response_format={"type": "json_object"},  
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file.content_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.1,  # <--- NEW: Lower temperature for deterministic output
            max_tokens=1000
        )
        print(response)
        response_content = response.choices[0].message.content
        print(response)
        print(response_content)
        # The response_content is now guaranteed to be a JSON string
        bill_data = json.loads(response_content)
        
        # Pydantic validates the structure of the JSON
        validated_data = BillScanResponse(**bill_data)
        
        return validated_data

    except json.JSONDecodeError as e:
        # This error is less likely now but good to keep
        raise HTTPException(status_code=500, detail=f"AI returned malformed JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
>>>>>>> 360d70f2203c8f276630a0b2d9c94aa975576dfd

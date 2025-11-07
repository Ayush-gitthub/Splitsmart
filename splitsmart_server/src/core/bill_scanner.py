import base64
import openai
import json
from src.core.config import settings # We use our central config for the API key

# Initialize the client using the key from our settings
client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

# The same proven system prompt from your prototype
SYSTEM_PROMPT = """
You are an expert AI data extractor. Your only task is to analyze an image of a bill and extract its contents into a specific JSON format.
You must adhere to the following rules:
1. Extract every line item, tax/charge, and the grand total. If a value is not present, use an empty list or a value of 0.
2. Your response must be ONLY the JSON object. Do not include any introductory text, explanations, or markdown like ```json. Just the raw JSON.
3. The JSON schema must be exactly as follows:
{
  "line_items": [{"item_name": "string", "quantity": "integer", "unit_price": "float", "total_price": "float"}],
  "taxes_and_charges": [{"tax_name": "string", "tax_amount": "float"}],
  "grand_total": "float"
}
"""

async def scan_bill_image(image_contents: bytes, content_type: str) -> dict:
    """
    Takes image bytes, sends them to GPT-4o, and returns the structured data as a dictionary.
    """
    base64_image = base64.b64encode(image_contents).decode('utf-8')

    response = await client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{content_type};base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        temperature=0.1,
        max_tokens=1500
    )
    
    response_content = response.choices[0].message.content
    return json.loads(response_content)
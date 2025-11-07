from pydantic import BaseModel, Field
from typing import List

# These are the exact models from your prototype.
# They define the structure of the JSON we expect from the AI.

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
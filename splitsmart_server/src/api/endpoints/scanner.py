from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status

from src.api import deps
from src.db import models
from src.core import bill_scanner
from src.schemas import scanner as scanner_schema

router = APIRouter()

@router.post("/scan-bill", response_model=scanner_schema.BillScanResponse)
async def scan_bill_endpoint(
    *,
    file: UploadFile = File(...),
    # This dependency ensures that only logged-in users can use the scanner.
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Accepts an image file of a bill, processes it with the AI model,
    and returns the structured itemized data.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file type. Please upload an image."
        )
    
    try:
        image_contents = await file.read()
        # Call our decoupled core logic function
        scanned_data = await bill_scanner.scan_bill_image(
            image_contents=image_contents, content_type=file.content_type
        )
        # Pydantic automatically validates the AI's response against our schema
        return scanned_data
    except Exception as e:
        # Catch any potential errors from the AI or processing
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to process bill image: {str(e)}"
        )
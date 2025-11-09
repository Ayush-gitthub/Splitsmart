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
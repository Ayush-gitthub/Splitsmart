from fastapi import APIRouter

from src.api.endpoints import auth, users, groups , expenses , scanner, payments

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(expenses.router, tags=["expenses"]) 
api_router.include_router(scanner.router, tags=["scanner"])
api_router.include_router(payments.router, tags=["payments"])
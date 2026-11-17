from fastapi import APIRouter
from backend.app.api.v1 import (
    auth,
    admin,
    dashboard,
    billing,
    products,
    categories,
    shops,
    routes,
    purchases,
    ledger,
    reports,
    settings,
    data_transfer,
    backup,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Sessions"])
api_router.include_router(admin.router, prefix="/admin", tags=["Master Admin Operations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(billing.router, prefix="/billing", tags=["Billing & Invoices"])
api_router.include_router(products.router, prefix="/products", tags=["Products & Inventory"])
api_router.include_router(categories.router, prefix="/categories", tags=["Product Categories"])
api_router.include_router(shops.router, prefix="/shops", tags=["Shops & Udhar"])
api_router.include_router(routes.router, prefix="/routes", tags=["Delivery Routes"])
api_router.include_router(purchases.router, prefix="/purchases", tags=["Purchases & Suppliers"])
api_router.include_router(ledger.router, prefix="/ledger", tags=["Payments & Ledger"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Profits"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings & Governance"])
api_router.include_router(data_transfer.router, prefix="/data-transfer", tags=["Data Import & Export"])
api_router.include_router(backup.router, prefix="/backup", tags=["Database Backup & Restore"])

from pydantic import BaseModel, ConfigDict
from typing import Optional

class SystemSettingsBase(BaseModel):
    store_name: str
    tagline: Optional[str] = None
    branch_name: str
    gstin: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    currency_symbol: str = "₹"
    tax_rate_default: float = 0.0
    bill_header: str
    bill_footer: str
    terms_and_conditions: str
    show_logo: bool = True
    show_barcode: bool = True
    show_qr: bool = True
    upi_id: Optional[str] = None
    upi_payee_name: Optional[str] = "MyBilling Wholesale"
    enable_sound: bool = True
    playful_mode: bool = True
    template_50mm_header: Optional[str] = "INVOICE / BILL"
    template_50mm_footer: Optional[str] = "Thank you! Visit again."
    template_50mm_show_logo: Optional[bool] = False
    template_50mm_show_qr: Optional[bool] = True
    template_50mm_font_size: Optional[int] = 8
    template_80mm_header: Optional[str] = "CASH MEMO / INVOICE"
    template_80mm_footer: Optional[str] = "Thank you for your business!"
    template_80mm_show_logo: Optional[bool] = True
    template_80mm_show_qr: Optional[bool] = True
    template_80mm_font_size: Optional[int] = 9
    template_a4_header: Optional[str] = "INVOICE / CASH MEMO"
    template_a4_footer: Optional[str] = "Thank you for your business! All squared away, Boss."
    template_a4_show_logo: Optional[bool] = True
    template_a4_show_qr: Optional[bool] = True
    template_a4_font_size: Optional[int] = 10

class SystemSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    tagline: Optional[str] = None
    branch_name: Optional[str] = None
    gstin: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    currency_symbol: Optional[str] = None
    tax_rate_default: Optional[float] = None
    bill_header: Optional[str] = None
    bill_footer: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    show_logo: Optional[bool] = None
    show_barcode: Optional[bool] = None
    show_qr: Optional[bool] = None
    upi_id: Optional[str] = None
    upi_payee_name: Optional[str] = None
    enable_sound: Optional[bool] = None
    playful_mode: Optional[bool] = None
    template_50mm_header: Optional[str] = None
    template_50mm_footer: Optional[str] = None
    template_50mm_show_logo: Optional[bool] = None
    template_50mm_show_qr: Optional[bool] = None
    template_50mm_font_size: Optional[int] = None
    template_80mm_header: Optional[str] = None
    template_80mm_footer: Optional[str] = None
    template_80mm_show_logo: Optional[bool] = None
    template_80mm_show_qr: Optional[bool] = None
    template_80mm_font_size: Optional[int] = None
    template_a4_header: Optional[str] = None
    template_a4_footer: Optional[str] = None
    template_a4_show_logo: Optional[bool] = None
    template_a4_show_qr: Optional[bool] = None
    template_a4_font_size: Optional[int] = None

class SystemSettingsResponse(SystemSettingsBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

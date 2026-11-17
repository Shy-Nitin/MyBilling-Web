from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from backend.app.core.database import Base

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, default=1, index=True)
    store_name = Column(String(200), default="MyBilling Wholesale & Retail")
    tagline = Column(String(200), default="Executive Precision ERP")
    branch_name = Column(String(100), default="Wholesale Branch #1")
    gstin = Column(String(50), default="27AABCS1429B1Z0")
    phone = Column(String(50), default="+91 98200 12345")
    email = Column(String(100), default="billing@mybilling.corp")
    address = Column(String(300), default="Shop #4-B, APMC Market Yard, Phase II, Mumbai 400703")
    currency_symbol = Column(String(10), default="₹")
    tax_rate_default = Column(Float, default=0.0)
    bill_header = Column(String(200), default="INVOICE / CASH MEMO")
    bill_footer = Column(String(300), default="Thank you for your business! All squared away, Boss.")
    terms_and_conditions = Column(Text, default="1. Goods once sold will not be returned without original invoice.\n2. Subject to local jurisdiction.")
    show_logo = Column(Boolean, default=True)
    show_barcode = Column(Boolean, default=True)
    show_qr = Column(Boolean, default=True)
    upi_id = Column(String(100), default="mybilling@okhdfcbank")
    upi_payee_name = Column(String(150), default="MyBilling Wholesale")
    enable_sound = Column(Boolean, default=True)
    playful_mode = Column(Boolean, default=True)

    # Independent template customizations for 50mm, 80mm, A4
    template_50mm_header = Column(String(200), default="INVOICE / BILL")
    template_50mm_footer = Column(String(300), default="Thank you! Visit again.")
    template_50mm_show_logo = Column(Boolean, default=False)
    template_50mm_show_qr = Column(Boolean, default=True)
    template_50mm_font_size = Column(Integer, default=8)

    template_80mm_header = Column(String(200), default="CASH MEMO / INVOICE")
    template_80mm_footer = Column(String(300), default="Thank you for your business!")
    template_80mm_show_logo = Column(Boolean, default=True)
    template_80mm_show_qr = Column(Boolean, default=True)
    template_80mm_font_size = Column(Integer, default=9)

    template_a4_header = Column(String(200), default="TAX INVOICE / CASH MEMO")
    template_a4_footer = Column(String(300), default="Thank you for your business! All squared away, Boss.")
    template_a4_show_logo = Column(Boolean, default=True)
    template_a4_show_qr = Column(Boolean, default=True)
    template_a4_font_size = Column(Integer, default=10)

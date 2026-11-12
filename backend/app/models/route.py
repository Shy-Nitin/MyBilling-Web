from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from backend.app.core.database import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    code = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

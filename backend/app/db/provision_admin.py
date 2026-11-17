"""
Master Admin Provisioning Utility
Usage:
  python -m backend.app.db.provision_admin --email admin@domain.com --name "Admin Name" --business "HQ" --password "SecurePassword123"
  or configure environment variables:
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_BUSINESS
"""

import sys
import os
import argparse
from backend.app.core.database import SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.user import User

def provision_admin(email: str, name: str, business: str, password: str):
    db = SessionLocal()
    try:
        email_clean = email.strip().lower()
        user = db.query(User).filter(User.email == email_clean).first()
        if user:
            user.role = "master_admin"
            user.password_hash = get_password_hash(password)
            user.full_name = name
            user.business_name = business
            user.is_active = True
            db.commit()
            print(f"Existing account for {email_clean} promoted to Master Admin.")
        else:
            admin = User(
                email=email_clean,
                password_hash=get_password_hash(password),
                full_name=name,
                business_name=business,
                role="master_admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"Master Admin created successfully for {email_clean}.")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Provision a Master Admin account.")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", "admin@mybilling.com"))
    parser.add_argument("--name", default=os.getenv("ADMIN_NAME", "System Administrator"))
    parser.add_argument("--business", default=os.getenv("ADMIN_BUSINESS", "MyBilling Enterprise"))
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", "AdminSecret@2026"))

    args = parser.parse_args()
    provision_admin(args.email, args.name, args.business, args.password)

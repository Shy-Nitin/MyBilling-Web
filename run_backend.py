import os
import sys
import uvicorn

if __name__ == "__main__":
    # Ensure project root is in sys.path
    root_dir = os.path.dirname(os.path.abspath(__file__))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)

    print("=" * 60)
    print("  Starting MyBilling ERP Backend Server...")
    print("  API Base:  http://127.0.0.1:8000/api/v1")
    print("  Docs:      http://127.0.0.1:8000/docs")
    print("=" * 60)

    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)

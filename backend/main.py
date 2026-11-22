import sys
import os
import types

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)

# 1. If running in local development from repo root, add parent to sys.path
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# 2. In Vercel deployment, the backend root directory is deployed directly as /var/task.
# Therefore, the parent folder 'backend' does not exist in the filesystem.
# Ensure a 'backend' package exists in sys.modules pointing to this directory so that
# all internal absolute imports ('from backend.app...') resolve seamlessly.
if "backend" not in sys.modules:
    try:
        import backend
    except ImportError:
        backend_pkg = types.ModuleType("backend")
        backend_pkg.__path__ = [current_dir]
        backend_pkg.__file__ = os.path.join(current_dir, "__init__.py")
        sys.modules["backend"] = backend_pkg

from backend.app.main import app

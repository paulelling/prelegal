import os
import tempfile

os.environ.setdefault("OPENROUTER_API_KEY", "test_key")
os.environ.setdefault("DB_PATH", os.path.join(tempfile.gettempdir(), "test_prelegal.db"))

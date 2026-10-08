import os
import tempfile

import pytest

os.environ.setdefault("OPENROUTER_API_KEY", "test_key")
os.environ.setdefault("DB_PATH", os.path.join(tempfile.gettempdir(), "test_prelegal.db"))


@pytest.fixture(autouse=True)
def clean_db():
    """Wipe the test DB before each test so every test starts with a clean slate."""
    db_path = os.environ.get("DB_PATH", "")
    if db_path and os.path.exists(db_path):
        os.remove(db_path)
    yield

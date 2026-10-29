import os
import uuid
from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import settings

class StorageProvider(ABC):
    @abstractmethod
    async def save_bytes(self, content: bytes, extension: str) -> str:
        """Saves bytes and returns an opaque storage_key."""
        pass

    @abstractmethod
    async def get_bytes(self, storage_key: str) -> Optional[bytes]:
        """Retrieves bytes for a storage_key."""
        pass

    @abstractmethod
    async def delete(self, storage_key: str) -> bool:
        """Deletes object by storage_key."""
        pass

    @abstractmethod
    def get_absolute_path(self, storage_key: str) -> Optional[str]:
        """Returns safe internal absolute path for local processors if applicable."""
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = os.path.abspath(base_dir or settings.STORAGE_DIR)
        os.makedirs(self.base_dir, exist_ok=True)
        os.makedirs(os.path.join(self.base_dir, "uploads"), exist_ok=True)
        os.makedirs(os.path.join(self.base_dir, "thumbnails"), exist_ok=True)

    def _safe_path(self, storage_key: str) -> str:
        # Prevent directory traversal attacks
        clean_key = os.path.basename(storage_key.replace("\\", "/"))
        return os.path.join(self.base_dir, "uploads", clean_key)

    async def save_bytes(self, content: bytes, extension: str) -> str:
        ext = extension.lstrip(".").lower()
        if not ext:
            ext = "bin"
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        target_path = self._safe_path(unique_filename)
        with open(target_path, "wb") as f:
            f.write(content)
        return unique_filename

    async def get_bytes(self, storage_key: str) -> Optional[bytes]:
        path = self._safe_path(storage_key)
        if not os.path.exists(path):
            return None
        with open(path, "rb") as f:
            return f.read()

    async def delete(self, storage_key: str) -> bool:
        path = self._safe_path(storage_key)
        if os.path.exists(path):
            try:
                os.remove(path)
                return True
            except OSError:
                return False
        return False

    def get_absolute_path(self, storage_key: str) -> Optional[str]:
        path = self._safe_path(storage_key)
        return path if os.path.exists(path) else None

def get_storage_provider() -> StorageProvider:
    return LocalStorageProvider()


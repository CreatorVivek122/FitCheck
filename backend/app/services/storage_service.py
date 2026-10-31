import os
import uuid
import logging
from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("fitcheck.storage")

ALLOWED_STORAGE_NAMESPACES = {"uploads", "originals", "thumbnails"}

class StorageProvider(ABC):
    @abstractmethod
    async def save_bytes(self, content: bytes, extension: str, kind: str = "uploads") -> str:
        """Saves bytes and returns an opaque relative storage_key."""
        pass

    @abstractmethod
    async def get_bytes(self, storage_key: str) -> Optional[bytes]:
        """Retrieves bytes for a storage_key, or None if not found."""
        pass

    @abstractmethod
    async def delete(self, storage_key: str) -> bool:
        """Deletes object by storage_key. Returns True on successful removal or if already missing."""
        pass

    @abstractmethod
    async def exists(self, storage_key: str) -> bool:
        """Checks whether the object exists in storage."""
        pass

    @abstractmethod
    def get_absolute_path(self, storage_key: str) -> Optional[str]:
        """Returns safe internal absolute path for local processors if applicable."""
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = os.path.abspath(base_dir or settings.STORAGE_DIR)
        os.makedirs(self.base_dir, exist_ok=True)
        for ns in ALLOWED_STORAGE_NAMESPACES:
            os.makedirs(os.path.join(self.base_dir, ns), exist_ok=True)

    def _safe_path(self, storage_key: str) -> str:
        """
        Validates and resolves storage_key into a safe filesystem path strictly within base_dir.
        Supports both namespaced keys (e.g. 'uploads/uuid.jpg', 'thumbnails/uuid.jpg')
        and legacy bare keys (e.g. 'uuid.jpg') for backward compatibility with existing rows.
        """
        if not storage_key or not isinstance(storage_key, str):
            raise ValueError("Storage key must be a non-empty string.")

        if "\0" in storage_key:
            raise ValueError("Invalid storage key: null byte detected.")

        # Reject absolute paths or Windows drive letters
        if os.path.isabs(storage_key) or storage_key.startswith(("/", "\\")) or (len(storage_key) > 1 and storage_key[1] == ":"):
            raise ValueError("Invalid storage key: absolute path not allowed.")

        norm_key = storage_key.replace("\\", "/").strip("/")
        segments = [s.strip() for s in norm_key.split("/") if s.strip()]

        if not segments:
            raise ValueError("Invalid storage key: empty path.")

        # Prevent traversal
        for seg in segments:
            if seg in ("..", ".") or ":" in seg:
                raise ValueError("Invalid storage key: directory traversal attempted.")

        if len(segments) == 1:
            # Legacy key backward compatibility: check 'uploads', then 'thumbnails'
            legacy_filename = os.path.basename(segments[0])
            candidate_upload = os.path.join(self.base_dir, "uploads", legacy_filename)
            if os.path.exists(candidate_upload):
                return candidate_upload
            candidate_thumb = os.path.join(self.base_dir, "thumbnails", legacy_filename)
            if os.path.exists(candidate_thumb):
                return candidate_thumb
            return candidate_upload

        # Namespaced key
        namespace = segments[0]
        if namespace not in ALLOWED_STORAGE_NAMESPACES:
            raise ValueError(f"Invalid storage namespace '{namespace}'. Allowed: {ALLOWED_STORAGE_NAMESPACES}")

        clean_subpath = [os.path.basename(s) for s in segments]
        candidate_path = os.path.abspath(os.path.join(self.base_dir, *clean_subpath))

        # Enforce that candidate_path strictly remains within self.base_dir
        if not (candidate_path == self.base_dir or candidate_path.startswith(self.base_dir + os.sep)):
            raise ValueError("Resolved path is outside storage base directory.")

        return candidate_path

    async def save_bytes(self, content: bytes, extension: str, kind: str = "uploads") -> str:
        if kind not in ALLOWED_STORAGE_NAMESPACES:
            raise ValueError(f"Invalid storage kind '{kind}'. Allowed kinds: {sorted(ALLOWED_STORAGE_NAMESPACES)}")

        ext = extension.lstrip(".").lower()
        if not ext:
            ext = "bin"

        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        storage_key = f"{kind}/{unique_filename}"
        target_path = self._safe_path(storage_key)

        os.makedirs(os.path.dirname(target_path), exist_ok=True)

        # Atomic write via temporary file in the same directory
        temp_path = f"{target_path}.{uuid.uuid4().hex}.tmp"
        try:
            with open(temp_path, "wb") as f:
                f.write(content)
            os.replace(temp_path, target_path)
        except Exception as e:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass
            logger.error(f"Failed to write bytes to storage: {e}")
            raise e

        return storage_key

    async def get_bytes(self, storage_key: str) -> Optional[bytes]:
        try:
            path = self._safe_path(storage_key)
        except ValueError as ve:
            logger.warning(f"Rejected invalid storage key '{storage_key}': {ve}")
            return None

        if not os.path.exists(path) or not os.path.isfile(path):
            return None

        try:
            with open(path, "rb") as f:
                return f.read()
        except OSError as e:
            logger.error(f"Error reading file '{path}': {e}")
            return None

    async def delete(self, storage_key: str) -> bool:
        try:
            path = self._safe_path(storage_key)
        except ValueError as ve:
            logger.warning(f"Rejected invalid storage key for deletion '{storage_key}': {ve}")
            return False

        if not os.path.exists(path):
            # Idempotent cleanup: object is already gone
            return True

        try:
            os.remove(path)
            return True
        except OSError as e:
            logger.error(f"Failed to delete storage file '{path}': {e}")
            return False

    async def exists(self, storage_key: str) -> bool:
        try:
            path = self._safe_path(storage_key)
            return os.path.isfile(path)
        except ValueError:
            return False

    def get_absolute_path(self, storage_key: str) -> Optional[str]:
        try:
            path = self._safe_path(storage_key)
            return path if os.path.exists(path) else None
        except ValueError:
            return None

def get_storage_provider() -> StorageProvider:
    storage_type = (settings.STORAGE_TYPE or "local").lower()
    if storage_type == "local":
        return LocalStorageProvider()
    raise ValueError(f"Unsupported STORAGE_TYPE: '{settings.STORAGE_TYPE}'. FitCheck currently supports 'local' storage.")

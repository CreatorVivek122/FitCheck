import io
import hashlib
from typing import Tuple
from PIL import Image, ImageOps
from app.core.config import settings
from app.core.errors import (
    ImageTooLargeError,
    InvalidImageFormatError,
    ImageProcessingError
)
from app.services.storage_service import StorageProvider

# Decompression bomb safeguard
Image.MAX_IMAGE_PIXELS = 25_000_000

class UploadService:
    def __init__(self, storage: StorageProvider):
        self.storage = storage

    def validate_and_process(self, raw_bytes: bytes, filename: str) -> Tuple[bytes, bytes, int, int, str, str]:
        """
        Validates the raw image bytes:
        - Checks size limits
        - Verifies true magic bytes via Pillow decode
        - Fixes EXIF rotation
        - Strips private EXIF / GPS metadata
        - Normalizes dimensions (max 2048x2048)
        - Generates thumbnail
        Returns:
            (normalized_bytes, thumb_bytes, width, height, mime_type, sha256_checksum)
        """
        if len(raw_bytes) > settings.MAX_UPLOAD_BYTES:
            raise ImageTooLargeError()

        if len(raw_bytes) < 100:
            raise ImageProcessingError("File is too small to be a valid image.")

        try:
            pil_img = Image.open(io.BytesIO(raw_bytes))
            # Verify structure
            pil_img.verify()
            # Reopen for actual processing as verify closes some internal buffers
            pil_img = Image.open(io.BytesIO(raw_bytes))
            pil_img.load()
        except Exception:
            raise InvalidImageFormatError("Failed to decode image. Please provide a valid JPG, PNG, or WEBP.")

        detected_format = (pil_img.format or "").upper()
        if detected_format not in ("JPEG", "JPG", "PNG", "WEBP"):
            raise InvalidImageFormatError(f"Format {detected_format} is not supported. Use JPG, PNG, or WEBP.")

        # Re-orient based on EXIF before stripping
        try:
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception:
            pass

        # Convert to RGB (dropping CMYK, transparency alpha conversion to white for consistent color analysis)
        if pil_img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", pil_img.size, (255, 255, 255))
            if pil_img.mode == "P":
                pil_img = pil_img.convert("RGBA")
            background.paste(pil_img, mask=pil_img.split()[-1] if pil_img.mode == "RGBA" else None)
            pil_img = background
        elif pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")

        orig_w, orig_h = pil_img.size
        if orig_w < settings.MIN_IMAGE_DIMENSION or orig_h < settings.MIN_IMAGE_DIMENSION:
            raise ImageProcessingError(f"Image too small ({orig_w}x{orig_h}px). Minimum is {settings.MIN_IMAGE_DIMENSION}px.")

        # Downscale if excessively large for fast inference
        max_dim = 2048
        if orig_w > max_dim or orig_h > max_dim:
            pil_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        norm_w, norm_h = pil_img.size

        # Save stripped normalized copy
        norm_buffer = io.BytesIO()
        pil_img.save(norm_buffer, format="JPEG", quality=90, optimize=True)
        normalized_bytes = norm_buffer.getvalue()

        # Generate thumbnail (400px aspect-preserved)
        thumb_img = pil_img.copy()
        thumb_img.thumbnail((400, 600), Image.Resampling.LANCZOS)
        thumb_buffer = io.BytesIO()
        thumb_img.save(thumb_buffer, format="JPEG", quality=82, optimize=True)
        thumb_bytes = thumb_buffer.getvalue()

        # Checksum
        sha256 = hashlib.sha256(normalized_bytes).hexdigest()

        return normalized_bytes, thumb_bytes, norm_w, norm_h, "image/jpeg", sha256


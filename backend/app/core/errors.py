import uuid
from typing import Optional
from fastapi import Request
from fastapi.responses import JSONResponse

class FitCheckException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        retryable: bool = False,
        request_id: Optional[str] = None
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.retryable = retryable
        self.request_id = request_id or str(uuid.uuid4())

    def to_dict(self):
        return {
            "error": {
                "code": self.code,
                "message": self.message,
                "request_id": self.request_id,
                "retryable": self.retryable,
            }
        }

class NotFoundError(FitCheckException):
    def __init__(self, message: str = "Requested resource not found"):
        super().__init__(code="NOT_FOUND", message=message, status_code=404)

class ValidationError(FitCheckException):
    def __init__(self, message: str = "Invalid input data"):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=422)

class ConflictError(FitCheckException):
    def __init__(self, message: str = "Resource conflict detected"):
        super().__init__(code="CONFLICT", message=message, status_code=409)

class ImageTooLargeError(FitCheckException):
    def __init__(self, message: str = "This image exceeds the 10 MB maximum allowed limit."):
        super().__init__(code="IMAGE_TOO_LARGE", message=message, status_code=413)

class InvalidImageFormatError(FitCheckException):
    def __init__(self, message: str = "Unsupported image format. Please use JPG, PNG, or WEBP."):
        super().__init__(code="INVALID_IMAGE_FORMAT", message=message, status_code=415)

class ImageProcessingError(FitCheckException):
    def __init__(self, message: str = "Failed to process image file. The image may be corrupt."):
        super().__init__(code="IMAGE_PROCESSING_FAILED", message=message, status_code=400)

class RateLimitExceededError(FitCheckException):
    def __init__(self, message: str = "Too many requests. Please wait a moment before trying again."):
        super().__init__(code="RATE_LIMIT_EXCEEDED", message=message, status_code=429, retryable=True)

class AIInferenceError(FitCheckException):
    def __init__(self, message: str = "Vision analysis could not be completed at this time."):
        super().__init__(code="AI_INFERENCE_FAILED", message=message, status_code=503, retryable=True)

async def fitcheck_exception_handler(request: Request, exc: FitCheckException):
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict())

async def generic_exception_handler(request: Request, exc: Exception):
    req_id = str(uuid.uuid4())
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "request_id": req_id,
                "retryable": True
            }
        }
    )


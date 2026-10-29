from typing import Optional, Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar("T")

class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: Optional[str] = None
    retryable: bool = False

class ErrorEnvelope(BaseModel):
    error: ErrorDetail

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    has_more: bool


import logging
import json
import time
from typing import Any, Dict

class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_obj["request_id"] = getattr(record, "request_id")
        if hasattr(record, "user_id"):
            log_obj["user_id"] = getattr(record, "user_id")
        if hasattr(record, "analysis_id"):
            log_obj["analysis_id"] = getattr(record, "analysis_id")
        if hasattr(record, "duration_ms"):
            log_obj["duration_ms"] = getattr(record, "duration_ms")
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj)

def setup_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredFormatter())
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]
    # Quiet noisy external libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

logger = logging.getLogger("fitcheck")


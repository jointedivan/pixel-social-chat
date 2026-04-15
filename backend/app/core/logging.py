import logging
import sys
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)

logger = logging.getLogger("pixel_social")


def log_request(method: str, path: str, status_code: int, duration_ms: float | None = None):
    """Логирует HTTP запрос"""
    duration = f" ({duration_ms:.1f}ms)" if duration_ms else ""
    logger.info(f"{method} {path} -> {status_code}{duration}")


def log_error(error: Exception, context: str = ""):
    """Логирует ошибку с контекстом"""
    context_str = f" [{context}]" if context else ""
    logger.error(f"ERROR{context_str}: {type(error).__name__}: {error}", exc_info=True)


def log_warning(message: str, context: str = ""):
    """Логирует предупреждение"""
    context_str = f" [{context}]" if context else ""
    logger.warning(f"WARN{context_str}: {message}")


def log_info(message: str, context: str = ""):
    """Логирует информацию"""
    context_str = f" [{context}]" if context else ""
    logger.info(f"INFO{context_str}: {message}")

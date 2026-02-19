"""
Application-wide logging configuration.

Sets up logging format and handlers for the application.
"""

import logging
import sys

from app.core.config import settings

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Set up root logger
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=LOG_FORMAT,
    datefmt=DATE_FORMAT,
    handlers=[logging.StreamHandler(sys.stdout)],
)

# Get logger for this module
logger = logging.getLogger(__name__)

# Suppress noisy loggers
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


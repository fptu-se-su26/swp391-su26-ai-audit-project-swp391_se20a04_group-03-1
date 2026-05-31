import os
import sys
import time
import requests
from datetime import datetime

# Ensure the project root (computer-vison/) is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.config import BACKEND_URL, COOLDOWN_PERIOD

# In-memory registry to store the last timestamp a code/plate was successfully sent
# Format: { "TEXT_VALUE": timestamp }
_cooldown_registry = {}

def clean_expired_cooldowns():
    """Removes expired cooldown entries to prevent memory growth over time."""
    now = time.time()
    expired_keys = [
        key for key, timestamp in _cooldown_registry.items()
        if now - timestamp >= COOLDOWN_PERIOD
    ]
    for key in expired_keys:
        del _cooldown_registry[key]

def send_scan_event(text: str, scan_type: str, confidence: float, gate_type: str = "in") -> bool:
    """
    Sends a detected plate or container text to the NodeJS backend.
    Includes cooldown checks to prevent sending the same value continuously.
    
    Args:
        text (str): Recognized string (license plate or container ID).
        scan_type (str): Type of scanning ('plate' or 'container').
        confidence (float): Confidence score of OCR detection (0.0 to 1.0).
        gate_type (str): The gate type where it was scanned ('in' or 'out').
        
    Returns:
        bool: True if the request was sent and succeeded, False otherwise (or if throttled).
    """
    if not text or not text.strip():
        return False
        
    # Standardize text (uppercase, stripped of extra whitespace)
    normalized_text = text.strip().upper()
    now = time.time()
    
    # 1. Clean up old entries periodically
    clean_expired_cooldowns()
    
    # 2. Check Cooldown Registry
    if normalized_text in _cooldown_registry:
        elapsed = now - _cooldown_registry[normalized_text]
        if elapsed < COOLDOWN_PERIOD:
            # Throttled by cooldown, skip sending to avoid duplicate event spamming
            return False
            
    # 3. Build Webhook Payload
    payload = {
        "text": normalized_text,
        "type": scan_type,
        "confidence": round(confidence, 4),
        "status": gate_type, # sent to backend as status indicating gate type
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    print(f"[API Client] Sending event: {payload}")
    
    # 4. Perform POST Request
    try:
        response = requests.post(
            BACKEND_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=3.0  # short timeout to prevent blocking the frame processing loop
        )
        
        if response.status_code in (200, 201):
            print(f"[API Client] Success: Received {response.status_code} from backend")
            # Update sent registry on success to start cooldown
            _cooldown_registry[normalized_text] = now
            return True
        else:
            print(f"[API Client] Warning: Backend returned status code {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        # Gracefully handle server offline or network timeouts without throwing exceptions
        print(f"[API Client] Connection Error: Could not connect to NodeJS backend at {BACKEND_URL}. Exception: {e}")
        return False

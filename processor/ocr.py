import datetime
import re
from typing import Dict, Any

def perform_ocr(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Simulates OCR processing on a document.
    Attempts to decode content as text to count words and extract simple tags based on content keywords.
    If binary or empty, simulates word count and applies basic extension-based tagging.
    """
    # 1. Attempt to decode text
    text = ""
    is_binary = False
    try:
        # Decode with ignore to handle files with minor non-UTF-8 characters gracefully
        text = file_content.decode("utf-8", errors="ignore")
    except Exception:
        is_binary = True

    # 2. Calculate word count
    if is_binary or not text.strip():
        # Simulate word count for binary/empty files using file size as a proxy
        word_count = max(1, len(file_content) // 6)
    else:
        # Extract alphanumeric words and count them
        words = re.findall(r'\b\w+\b', text)
        word_count = len(words)

    # 3. Tag extraction logic
    tags = []
    
    # Extension-based tags
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext:
        tags.append(ext)
        
    # Content-based tags (case-insensitive keyword matching)
    content_lower = text.lower()
    keyword_mapping = {
        "invoice": ["invoice", "bill", "payment", "amount", "total", "tax"],
        "receipt": ["receipt", "transaction", "purchase", "store", "merchant"],
        "report": ["report", "quarterly", "annual", "summary", "analysis", "forecast"],
        "resume": ["resume", "cv", "experience", "education", "skills", "employment"],
        "contract": ["contract", "agreement", "lease", "terms", "signature", "party"],
    }
    
    for tag_name, keywords in keyword_mapping.items():
        if any(kw in content_lower for kw in keywords):
            tags.append(tag_name)
            
    # Default tags if none found
    if not tags:
        tags.append("document")
        
    # Ensure tags are unique
    tags = sorted(list(set(tags)))

    return {
        "filename": filename,
        "date": datetime.datetime.utcnow().isoformat() + "Z",
        "tags": tags,
        "word_count": word_count
    }

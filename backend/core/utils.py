import re
from pathlib import Path


def sanitize_filename(filename: str) -> str:
    name = Path(filename).name
    name = re.sub(r'[\r\n"\\]', "", name)
    name = re.sub(r"[^\w.\- ]", "_", name).strip()
    return (name[:255] if name else "download")

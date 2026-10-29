import re
from typing import List, Tuple

BANNED_THEMES = [
    r"\b(fat|skinny|ugly|unattractive|flattering\s+for\s+your\s+body|hides?\s+your\s+body|slimming|makes\s+you\s+look\s+(fat|thin|short|tall))\b",
    r"\b(weight|body\s+shape|diet|workout|body\s+type|race|ethnicity|religion|gender\s+identity)\b",
]

class SafetyService:
    def __init__(self):
        self.banned_regexes = [re.compile(pattern, re.IGNORECASE) for pattern in BANNED_THEMES]

    def sanitize_text(self, text: str) -> str:
        """
        Removes any harmful body-evaluating phrases or replaces them with styling-focused alternatives.
        """
        sanitized = text
        for rx in self.banned_regexes:
            sanitized = rx.sub("[styling aspect]", sanitized)
        return sanitized

    def validate_report_content(self, items: List[str]) -> List[str]:
        """
        Filters and cleans bullet points for what_works, improvements, and ideas.
        """
        cleaned = []
        for item in items:
            if not item or len(item.strip()) < 5:
                continue
            safe_item = self.sanitize_text(item.strip())
            cleaned.append(safe_item)
        return cleaned

    def check_safety(self, text: str) -> Tuple[bool, str]:
        """
        Returns (is_safe, reason).
        """
        for rx in self.banned_regexes:
            if rx.search(text):
                return False, "Output contained inappropriate body or identity evaluation."
        return True, "Safe"

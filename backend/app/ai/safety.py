MEDICAL_KEYWORDS = [
    "diagnose", "medication", "prescribe", "blood report", "deficiency",
    "supplement", "injury", "medical condition", "doctor",
]


def check_safety(message: str, response: str) -> str:
    """Append safety disclaimer when medical topics are detected."""
    combined = (message + " " + response).lower()
    if any(kw in combined for kw in MEDICAL_KEYWORDS):
        disclaimer = (
            "\n\n---\n*Disclaimer: FITMAN provides informational guidance only and is not a substitute "
            "for professional medical advice. Please consult a qualified healthcare provider or registered "
            "dietitian for medical concerns, injuries, or supplement decisions.*"
        )
        if disclaimer.strip() not in response:
            return response + disclaimer
    return response


def validate_no_diagnosis(response: str) -> str:
    forbidden = ["you have ", "you are diagnosed", "take this medication", "you should take"]
    lower = response.lower()
    for phrase in forbidden:
        if phrase in lower:
            return response.replace(phrase, "Consider discussing with a professional regarding ")
    return response

from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv
import requests
from io import BytesIO
from PIL import Image
import json
import re
import base64

load_dotenv()

meal_api = Blueprint('meal_api', __name__)

OPEN_ROUTER_API_KEY = os.getenv('OPEN_ROUTER_API_KEY')
OPEN_ROUTER_MODEL = 'openai/gpt-4o-mini'
OPEN_ROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

MEAL_ANALYSIS_PROMPT = """You are a nutrition expert specializing in pregnancy health and maternal nutrition.

Analyze this meal image and provide:
1. List of detected food items
2. Estimated nutritional content (approximate percentages of daily recommended values for pregnant women)
3. Nutrient gaps (missing essential nutrients for pregnancy)
4. Recommendations to improve nutritional value

Format your response as JSON with this structure:
{
  "foods_detected": ["item1", "item2", ...],
  "nutrients": {
    "protein": {"value": 45, "status": "good|adequate|low"},
    "iron": {"value": 30, "status": "good|adequate|low"},
    "calcium": {"value": 50, "status": "good|adequate|low"},
    "folate": {"value": 60, "status": "good|adequate|low"},
    "vitamin_d": {"value": 20, "status": "good|adequate|low"},
    "vitamin_b12": {"value": 40, "status": "good|adequate|low"},
    "vitamin_b6": {"value": 35, "status": "good|adequate|low"},
    "vitamin_c": {"value": 55, "status": "good|adequate|low"},
    "fiber": {"value": 35, "status": "good|adequate|low"},
    "zinc": {"value": 40, "status": "good|adequate|low"},
    "iodine": {"value": 25, "status": "good|adequate|low"},
    "magnesium": {"value": 38, "status": "good|adequate|low"},
    "phosphorus": {"value": 45, "status": "good|adequate|low"},
    "omega_3_dha": {"value": 30, "status": "good|adequate|low"}
  },
  "nutrient_gaps": ["nutrient1", "nutrient2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "overall_assessment": "Brief assessment message",
  "safety_notes": "Any food safety concerns or allergies to consider"
}

Daily recommended values for PREGNANT WOMEN (Critical Nutrients):
- Protein: 71g (muscle & fetal growth)
- Iron: 27mg (prevent anemia, oxygen transport)
- Calcium: 1000mg (baby's bone development)
- Folate: 600mcg (neural tube development, prevent birth defects)
- Vitamin D: 600-800 IU (calcium absorption, immune function)
- Vitamin B12: 2.6mcg (nerve function, DNA synthesis)
- Vitamin B6: 1.9mg (brain development, hormone regulation)
- Vitamin C: 85mg (collagen formation, immune support)
- Fiber: 28g (digestion, blood sugar control)
- Zinc: 11mg (immune function, fetal growth)
- Iodine: 220mcg (thyroid function, brain development)
- Magnesium: 350-400mg (muscle function, energy production)
- Phosphorus: 700mg (bone & teeth development)
- Omega-3 (DHA): 200-300mg (fetal brain & eye development)"""

REQUIRED_NUTRIENTS = [
    "protein", "iron", "calcium", "folate", "vitamin_d", "vitamin_b12",
    "vitamin_b6", "vitamin_c", "fiber", "zinc", "iodine", "magnesium",
    "phosphorus", "omega_3_dha",
]


def _default_nutrients():
    return {n: {"value": 0, "status": "low"} for n in REQUIRED_NUTRIENTS}


def _fallback_analysis(message):
    return {
        "foods_detected": ["Unable to clearly identify specific foods"],
        "nutrients": _default_nutrients(),
        "nutrient_gaps": ["All key nutrients"],
        "recommendations": ["Please upload a clear, well-lit photo of your meal for better analysis"],
        "overall_assessment": message,
        "safety_notes": "No specific food safety concerns could be assessed from this image"
    }


def _parse_meal_analysis(response_text):
    cleaned = response_text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    json_start = cleaned.find("{")
    json_end = cleaned.rfind("}") + 1
    if json_start == -1 or json_end <= json_start:
        return None
    try:
        return json.loads(cleaned[json_start:json_end])
    except json.JSONDecodeError:
        return None


def _normalize_analysis(analysis):
    if not isinstance(analysis, dict):
        return None
    if not isinstance(analysis.get("foods_detected"), list) or not analysis["foods_detected"]:
        analysis["foods_detected"] = ["Unable to clearly identify specific foods"]
    nutrients = analysis.get("nutrients") if isinstance(analysis.get("nutrients"), dict) else {}
    normalized = _default_nutrients()
    for nutrient in REQUIRED_NUTRIENTS:
        val = nutrients.get(nutrient, {})
        if not isinstance(val, dict):
            val = {"value": val}
        try:
            nv = int(float(val.get("value", 0)))
        except (TypeError, ValueError):
            nv = 0
        status = val.get("status")
        if status not in {"good", "adequate", "low"}:
            status = "good" if nv >= 60 else "adequate" if nv >= 30 else "low"
        normalized[nutrient] = {"value": max(0, min(nv, 100)), "status": status}
    analysis["nutrients"] = normalized
    for key in ["nutrient_gaps", "recommendations"]:
        if not isinstance(analysis.get(key), list):
            analysis[key] = []
    if not isinstance(analysis.get("overall_assessment"), str):
        analysis["overall_assessment"] = "Meal analysis completed."
    if not isinstance(analysis.get("safety_notes"), str):
        analysis["safety_notes"] = "No specific food safety concerns identified."
    return analysis


@meal_api.route('/analyze', methods=['POST'])
def analyze_meal():
    try:
        if not OPEN_ROUTER_API_KEY:
            return jsonify({
                "error": "OpenRouter API key is missing. Add OPEN_ROUTER_API_KEY to backend/.env and restart.",
                "success": False
            }), 503

        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No selected image"}), 400
        if not image_file.content_type.startswith('image/'):
            return jsonify({"error": "File must be an image"}), 400

        image_data = image_file.read()
        try:
            pil_image = Image.open(BytesIO(image_data))
            pil_image.verify()
        except Exception as e:
            return jsonify({"error": f"Invalid image: {str(e)}"}), 400

        mime_type = image_file.content_type or "image/jpeg"
        image_b64 = base64.b64encode(image_data).decode('utf-8')

        payload = {
            "model": OPEN_ROUTER_MODEL,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": MEAL_ANALYSIS_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_b64}"}}
                ]
            }],
            "max_tokens": 1200
        }

        resp = requests.post(
            OPEN_ROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPEN_ROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=60
        )
        resp.raise_for_status()
        response_text = resp.json()["choices"][0]["message"]["content"]

        analysis = _normalize_analysis(_parse_meal_analysis(response_text))
        if not analysis:
            analysis = _fallback_analysis("The meal scan finished, but the analysis response could not be parsed.")

        return jsonify({"success": True, "analysis": analysis}), 200

    except Exception as e:
        error_message = str(e)
        status_code = 502
        if "401" in error_message:
            error_message = "OpenRouter API key is invalid. Check OPEN_ROUTER_API_KEY in backend/.env."
            status_code = 503
        elif "429" in error_message or "quota" in error_message.lower():
            error_message = "OpenRouter rate limit reached. Try again later."
        return jsonify({"error": error_message, "success": False}), status_code


@meal_api.route('/nutrient-gap', methods=['POST'])
def get_nutrient_gap():
    try:
        data = request.json
        meals = data.get('meals', [])
        if not meals:
            return jsonify({"error": "No meal data provided"}), 400

        aggregated = {n: 0 for n in REQUIRED_NUTRIENTS}
        for meal in meals:
            nutrients = meal.get('nutrients', {})
            for key in aggregated:
                aggregated[key] += nutrients.get(key, {}).get('value', 0)

        gaps = {}
        recommendations = []
        for nutrient in REQUIRED_NUTRIENTS:
            current = aggregated[nutrient]
            gap = max(0, 100 - current)
            gaps[nutrient] = {
                "current": current, "gap": gap, "target": 100,
                "status": "complete" if gap == 0 else ("low" if gap > 30 else "moderate")
            }
            if gap > 30:
                recommendations.append(f"You need more {nutrient.replace('_', ' ')} ({gap:.0f}% daily value)")

        return jsonify({"success": True, "daily_totals": aggregated, "nutrient_gaps": gaps, "recommendations": recommendations}), 200

    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500


@meal_api.route('/health', methods=['GET'])
def health_check():
    api_key_exists = bool(OPEN_ROUTER_API_KEY)
    return jsonify({
        "status": "healthy" if api_key_exists else "api_key_missing",
        "openrouter_configured": api_key_exists,
        "model": OPEN_ROUTER_MODEL
    }), 200
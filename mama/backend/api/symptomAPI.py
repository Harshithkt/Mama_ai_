from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

symptom_api = Blueprint('symptom_api', __name__)

# Initialize Groq client helper to allow reloading without server restart
client = None
def get_groq_client():
    global client
    if client is None:
        load_dotenv(override=True)
        api_key = os.getenv('GROQ_API_KEY')
        if api_key:
            client = Groq(api_key=api_key)
    return client

# Available Groq models (as of April 2026)
AVAILABLE_MODELS = [
    "llama-3.3-70b-versatile",  # Recommended model
    "llama-3.1-8b-instant",  # Faster, smaller model
]

SYSTEM_PROMPT = """You are Dr. MamaAI, a pregnancy health assistant for mothers in India.

Rules:
- Be concise. Max 4-5 lines per response.
- Use simple language, no medical jargon.
- Use bullet points only when listing 3+ items.
- Always end with the JSON block below.
- Classify severity: SAFE (monitor at home), WARNING (see ASHA soon), EMERGENCY (go to hospital now).

Emergency signs: severe bleeding, convulsions, chest pain, loss of consciousness, high fever >103°F.
Warning signs: persistent headache, moderate bleeding, severe swelling, persistent vomiting.

End every response with:
{"riskLevel": "SAFE|WARNING|EMERGENCY", "recommendation": "one line action"}"""

@symptom_api.route('/chat', methods=['POST'])
def analyze_symptoms():
    """
    Analyzes symptoms using Groq API
    Expected JSON: {
        "message": "user's symptom description",
        "conversationHistory": [optional array of previous messages]
    }
    """
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        conversation_history = data.get('conversationHistory', [])
        
        # Build messages for Groq
        messages = [
            {"role": msg["type"] if msg["type"] in ["user", "assistant"] else "user", 
             "content": msg["text"]} 
            for msg in conversation_history
        ]
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Get model from environment or use default
        model_name = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
        
        try:
            active_client = get_groq_client()
            if not active_client:
                return jsonify({
                    "error": "Groq API key is missing. Add GROQ_API_KEY to backend/.env and save.",
                    "success": False
                }), 503
                
            # Call Groq API
            response = active_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    *messages
                ],
                temperature=0.7,
                max_tokens=500,
                top_p=0.9
            )
            
            bot_response = response.choices[0].message.content
            
        except Exception as api_error:
            error_msg = str(api_error)
            # If model not found, provide helpful error
            if "model" in error_msg.lower() or "does not exist" in error_msg.lower():
                return jsonify({
                    "error": f"Model '{model_name}' not available. Please update GROQ_MODEL in .env. Available models: {', '.join(AVAILABLE_MODELS)}",
                    "success": False
                }), 500
            raise
        
        # Extract risk level and recommendation from response
        risk_level = "SAFE"
        recommendation = "Monitor symptoms and consult healthcare provider if condition worsens"
        
        # Parse the JSON from response
        import re
        json_match = re.search(r'\{.*?"riskLevel".*?"recommendation".*?\}', bot_response, re.DOTALL)
        if json_match:
            try:
                import json
                response_data = json.loads(json_match.group())
                risk_level = response_data.get("riskLevel", "SAFE").upper()
                recommendation = response_data.get("recommendation", recommendation)
                # Remove JSON from display text
                bot_response = bot_response[:json_match.start()].strip()
            except:
                pass
        
        return jsonify({
            "message": bot_response,
            "riskLevel": risk_level,
            "recommendation": recommendation,
            "success": True
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500

@symptom_api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    api_key_exists = bool(os.getenv('GROQ_API_KEY'))
    model_configured = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')
    return jsonify({
        "status": "healthy" if api_key_exists else "api_key_missing",
        "groq_configured": api_key_exists,
        "model": model_configured,
        "available_models": AVAILABLE_MODELS
    }), 200

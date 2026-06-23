from flask import Flask, jsonify, request
from flask_cors import CORS
from api.symptomAPI import symptom_api
from api.mealAPI import meal_api
from api.eyelidAPI import eyelid_api
from api.reportAPI import report_api
from api.emergencyAPI import emergency_api
import os
from dotenv import load_dotenv
import requests

import firebase_admin
from firebase_admin import credentials

load_dotenv()

app = Flask(__name__)
CORS(app)

if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

# Register blueprints
app.register_blueprint(symptom_api, url_prefix='/api/symptoms')
app.register_blueprint(meal_api, url_prefix='/api/meals')
app.register_blueprint(eyelid_api, url_prefix='/api/eyelid')
app.register_blueprint(report_api, url_prefix='/api/report')
app.register_blueprint(emergency_api, url_prefix='/api/emergency')

@app.route('/')
def home():
    return jsonify({"message": "MamaAI Backend is running."})

@app.route('/api/translate', methods=['POST'])
def translate_text():
    try:
        data = request.json
        text = data.get('text', '')
        target_language = data.get('targetLanguage', 'en')
        
        if not text:
            return jsonify({"error": "No text to translate"}), 400
        
        # Using MyMemory Translation API (free, no key required)
        url = "https://api.mymemory.translated.net/get"
        params = {
            'q': text,
            'langpair': f'en|{target_language}'
        }
        
        response = requests.get(url, params=params, timeout=10)
        result = response.json()
        
        if result.get('responseStatus') == 200:
            translated_text = result['responseData']['translatedText']
            return jsonify({
                "success": True,
                "translatedText": translated_text,
                "originalText": text,
                "targetLanguage": target_language
            }), 200
        else:
            return jsonify({
                "success": False,
                "translatedText": text,  # Return original if translation fails
                "error": "Translation service unavailable"
            }), 200
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "translatedText": data.get('text', '')
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

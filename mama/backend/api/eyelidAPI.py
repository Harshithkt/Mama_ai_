from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
import base64

load_dotenv()

eyelid_api = Blueprint('eyelid_api', __name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/eye_seg_model.pt/best')

try:
    from ultralytics import YOLO
    model = YOLO(MODEL_PATH, task='segment')
    MODEL_LOADED = True
except Exception as e:
    print(f"Warning: Could not load eye model: {e}")
    model = None
    MODEL_LOADED = False

def analyze_pallor(image_array):
    """
    Improved algorithm to analyze eyelid pallor (paleness) for hemoglobin estimation
    Uses HSV color space focusing on saturation (indicator of color intensity/blood)
    Returns estimated Hb value and risk level
    """
    try:
        # Convert to HSV for better color analysis
        hsv = cv2.cvtColor(image_array, cv2.COLOR_RGB2HSV)
        
        # Extract individual channels
        h = hsv[:,:,0]  # Hue
        s = hsv[:,:,1]  # Saturation (KEY: lower saturation = more pallor/anemia)
        v = hsv[:,:,2]  # Value (brightness)
        
        # Extract RGB channels
        r = image_array[:,:,0]
        g = image_array[:,:,1]
        b = image_array[:,:,2]
        
        # Calculate multiple indicators of hemoglobin
        mean_saturation = np.mean(s)
        mean_value = np.mean(v)
        mean_red = np.mean(r)
        mean_green = np.mean(g)
        
        # Conjunctiva appears pinkish-red when healthy
        # Red-to-Green ratio indicates hemoglobin presence
        rg_ratio = mean_red / (mean_green + 1)  # +1 to avoid division by zero
        
        # IMPROVED ESTIMATION using multiple factors:
        # 1. Saturation is the PRIMARY indicator (low saturation = pale/anemic)
        # 2. Red channel indicates hemoglobin concentration
        # 3. Red-Green ratio shows color shift (anemia shifts toward pale/washed out)
        
        # More sophisticated Hb estimation
        # Saturation ranges 0-255: higher = more color (more hemoglobin)
        # Normal conjunctiva: saturation ~150-200, R-G ratio ~1.1-1.3
        # Anemic conjunctiva: saturation ~80-120, R-G ratio ~0.95-1.05
        
        saturation_factor = (mean_saturation / 255)  # 0-1
        rg_factor = (rg_ratio - 0.8) / 0.5  # Normalize to 0-1 range
        
        # Weighted combination (Saturation is more reliable)
        combined_factor = (saturation_factor * 0.7) + (rg_factor * 0.3)
        combined_factor = np.clip(combined_factor, 0, 1)  # Constrain to 0-1
        
        # Map to hemoglobin scale: 5-14 g/dL
        estimated_hb = 5 + (combined_factor * 9)
        estimated_hb = round(estimated_hb, 1)
        
        # IMPROVED thresholds for PREGNANCY
        # WHO standard: Hb >= 11 g/dL for pregnancy (not just >= 11)
        if estimated_hb >= 11.5:
            risk_level = "Normal"
            risk_category = "safe"
            color = "text-successGreen"
            border_color = "border-successGreen"
            recommendation_note = "Hemoglobin level adequate for pregnancy"
        elif estimated_hb >= 10:
            risk_level = "Mild Anemia - WARNING"
            risk_category = "warning"
            color = "text-warningOrange"
            border_color = "border-warningOrange"
            recommendation_note = "Borderline hemoglobin - increase iron intake"
        elif estimated_hb >= 8:
            risk_level = "Moderate Anemia - HIGH RISK"
            risk_category = "warning"
            color = "text-dangerRed"
            border_color = "border-dangerRed"
            recommendation_note = "Significant anemia detected - medical consultation needed"
        else:
            risk_level = "Severe Anemia - EMERGENCY"
            risk_category = "emergency"
            color = "text-dangerRed"
            border_color = "border-dangerRed"
            recommendation_note = "Severe anemia - seek immediate medical attention"
        
        return {
            "hb": estimated_hb,
            "risk": risk_level,
            "risk_category": risk_category,
            "color": color,
            "border_color": border_color,
            "recommendation_note": recommendation_note,
            "debug_info": {
                "saturation": round(mean_saturation, 1),
                "red_value": round(mean_red, 1),
                "rg_ratio": round(rg_ratio, 2),
                "saturation_factor": round(saturation_factor, 2),
                "combined_factor": round(combined_factor, 2)
            }
        }
    except Exception as e:
        return {
            "error": f"Analysis error: {str(e)}",
            "hb": 0,
            "risk": "Unable to analyze"
        }

@eyelid_api.route('/scan', methods=['POST'])
def scan_eyelid():
    """
    Scan eyelid image to estimate hemoglobin levels
    Expected: multipart/form-data with 'image' file
    """
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image_file = request.files['image']
        
        if image_file.filename == '':
            return jsonify({"error": "No selected image"}), 400
        
        # Validate image
        if not image_file.content_type.startswith('image/'):
            return jsonify({"error": "File must be an image"}), 400
        
        # Read image data
        image_data = image_file.read()
        
        # Convert to OpenCV format
        nparr = np.frombuffer(image_data, np.uint8)
        image_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image_cv is None:
            return jsonify({"error": "Invalid image file"}), 400
        
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB)
        
        # Resize to standard size for analysis
        height, width = image_rgb.shape[:2]
        if height > 480 or width > 640:
            image_rgb = cv2.resize(image_rgb, (640, 480))
        
        # Analyze pallor
        analysis = analyze_pallor(image_rgb)
        
        if "error" in analysis and len(analysis) == 2:
            return jsonify(analysis), 500
        
        # Generate recommendations based on Hb level
        recommendations = []
        
        if analysis['hb'] < 9:
            recommendations.extend([
                "Seek medical consultation - possible severe anemia",
                "Increase iron-rich foods: spinach, jaggery, dates, liver",
                "Take IFA supplements (Iron-Folic Acid) daily",
                "Consume vitamin C with meals to improve iron absorption",
                "Rest and avoid strenuous activities"
            ])
        elif analysis['hb'] < 11:
            recommendations.extend([
                "Monitor hemoglobin levels regularly",
                "Increase iron intake: pulses, beans, greens, whole grains",
                "Take IFA supplements as prescribed",
                "Eat fruits rich in vitamin C: orange, amla, guava",
                "Get adequate rest and sleep"
            ])
        else:
            recommendations.extend([
                "Continue healthy diet rich in iron and folate",
                "Maintain regular prenatal check-ups",
                "Stay hydrated and exercise moderately",
                "Take vitamin supplements as prescribed"
            ])
        
        return jsonify({
            "success": True,
            "analysis": {
                "hb": analysis['hb'],
                "risk": analysis['risk'],
                "risk_category": analysis['risk_category'],
                "color": analysis['color'],
                "border_color": analysis['border_color'],
                "recommendation_note": analysis['recommendation_note'],
                "recommendations": recommendations,
                "disclaimer": "This is an AI estimate and not a medical diagnosis. Please consult a healthcare provider for confirmed hemoglobin testing.",
                "safety_notes": "For best accuracy: ensure good lighting, pull lower eyelid gently, and use consistent camera angle."
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@eyelid_api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": MODEL_LOADED,
        "service": "eyelid_scan"
    }), 200

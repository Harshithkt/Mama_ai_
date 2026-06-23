from flask import Blueprint, jsonify, request
import os
from groq import Groq
from dotenv import load_dotenv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from firebase_admin import firestore
from datetime import datetime

load_dotenv()

report_api = Blueprint('report_api', __name__)
client = None
def get_groq_client():
    global client
    if client is None:
        load_dotenv(override=True)
        api_key = os.getenv('GROQ_API_KEY')
        if api_key:
            client = Groq(api_key=api_key)
    return client
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


@report_api.route('/<user_id>', methods=['GET'])
def get_report(user_id):
    return jsonify({"hb_trend": [9.8, 10.1, 10.4, 11.2], "kicks_avg": 12})


@report_api.route('/generate', methods=['POST'])
def generate_report():
    data = request.get_json()

    eyelid = data.get('eyelid', {})
    symptoms = data.get('symptoms', [])
    meals = data.get('meals', [])
    kicks = data.get('kicks', {})

    # Build context string from all subpage data
    context_parts = []

    if eyelid:
        context_parts.append(
            f"Eyelid Anemia Scan: Estimated Hemoglobin = {eyelid.get('hb', 'N/A')} g/dL, "
            f"Risk = {eyelid.get('risk', 'N/A')}. "
            f"Recommendations: {', '.join(eyelid.get('recommendations', []))}"
        )

    if symptoms:
        symptom_text = " | ".join(
            f"[{m['type'].upper()}]: {m['text']}" for m in symptoms
        )
        context_parts.append(f"Symptom Chat History: {symptom_text}")

    if meals:
        for i, meal in enumerate(meals, 1):
            foods = ', '.join(meal.get('foods_detected', []))
            gaps = ', '.join(meal.get('nutrient_gaps', []))
            context_parts.append(
                f"Meal {i}: Foods = {foods}. Nutrient Gaps = {gaps or 'None'}. "
                f"Assessment = {meal.get('overall_assessment', '')}"
            )

    if kicks:
        context_parts.append(
            f"Fetal Kick Counter: Today's kicks = {kicks.get('today', 'N/A')}, "
            f"Weekly average = {kicks.get('weekly_avg', 'N/A')} kicks/day."
        )

    if not context_parts:
        context_parts.append("No health data has been logged by the patient yet. Instruct the patient to log symptoms, meals, and fetal kicks in the application for clinical tracking.")

    health_summary = "\n".join(context_parts)

    prompt = f"""You are a maternal health AI assistant. Based on the following pregnancy health data collected from a mobile app, generate a concise, structured medical summary report for the attending doctor or ASHA worker.

Health Data:
{health_summary}

Generate a report with these sections:
1. Patient Health Summary
2. Key Findings (bullet points)
3. Nutritional Status
4. Fetal Activity Assessment
5. Risk Flags (if any)
6. Recommended Actions for Doctor

Keep it professional, clear, and under 400 words."""

    try:
        active_client = get_groq_client()
        if not active_client:
            return jsonify({"success": False, "error": "Groq API key is missing. Add GROQ_API_KEY to backend/.env and save."}), 503
            
        response = active_client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.3,
        )
        report_text = response.choices[0].message.content
        return jsonify({"success": True, "report": report_text})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@report_api.route('/send-to-asha', methods=['POST'])
def send_report_to_asha():
    data = request.get_json()
    html_content = data.get('htmlContent', '')
    mother_name = data.get('motherName', 'Mother')

    if not html_content:
        return jsonify({"success": False, "error": "No report content provided"}), 400

    sender_email = os.getenv('EMAIL_SENDER', '').strip()
    sender_password = os.getenv('EMAIL_PASSWORD', '').strip()

    if not sender_password:
        return jsonify({"success": False, "error": "Email not configured in backend/.env"}), 503

    # Fetch all ASHA worker emails from Firestore
    try:
        db = firestore.client()
        asha_docs = db.collection('users').where('role', '==', 'asha').stream()
        asha_workers = [
            {'name': d.to_dict().get('name', 'ASHA Worker'), 'email': d.to_dict().get('email')}
            for d in asha_docs if d.to_dict().get('email')
        ]
    except Exception as e:
        return jsonify({"success": False, "error": f"Firestore error: {str(e)}"}), 500

    if not asha_workers:
        return jsonify({"success": False, "error": "No ASHA workers with email found"}), 404

    # Build PDF-ready HTML attachment
    filename = f"MamaAI_Report_{datetime.now().strftime('%Y-%m-%d')}.html"
    attachment_bytes = html_content.encode('utf-8')

    results = []
    for asha in asha_workers:
        try:
            msg = MIMEMultipart('mixed')
            msg['Subject'] = f"MamaAI Health Report — {mother_name}"
            msg['From'] = sender_email
            msg['To'] = asha['email']

            body = MIMEText(
                f"Dear {asha['name']},\n\n"
                f"Please find attached the AI-generated health summary report for {mother_name}.\n"
                f"Open the attached HTML file in a browser and use Print → Save as PDF to get the PDF.\n\n"
                f"Generated by MamaAI on {datetime.now().strftime('%d %b %Y, %H:%M')}\n"
                f"For clinical use only — not a substitute for professional medical advice.",
                'plain'
            )
            msg.attach(body)

            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment_bytes)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
            msg.attach(part)

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender_email, sender_password)
                server.send_message(msg)

            results.append({'email': asha['email'], 'status': 'sent'})
        except Exception as e:
            results.append({'email': asha['email'], 'status': 'failed', 'error': str(e)})

    sent = sum(1 for r in results if r['status'] == 'sent')
    return jsonify({
        "success": sent > 0,
        "message": f"Report sent to {sent} ASHA worker(s)",
        "results": results
    }), 200 if sent > 0 else 502

from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from datetime import datetime
from html import escape

load_dotenv()

emergency_api = Blueprint('emergency_api', __name__)

def get_db():
    """Get Firestore database instance"""
    return firestore.client()

@emergency_api.route('/alert', methods=['POST'])
def send_emergency_alert():
    """
    Send emergency SOS alert to ASHA workers and update emergency log
    Expected JSON: {
        "userId": "mother_uid",
        "userName": "mother_name",
        "location": "current location",
        "symptoms": "critical symptoms description"
    }
    """
    try:
        db = get_db()
        data = request.get_json(silent=True) or {}
        user_id = data.get('userId')
        user_name = data.get('userName', 'Unknown Mother')
        location = data.get('location', 'Location not specified')
        symptoms = data.get('symptoms', 'Critical emergency')
        
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
        
        # Get user profile
        user_doc = db.collection('users').document(user_id).get()
        mother_data = user_doc.to_dict() if user_doc.exists else {}
        
        # Get all ASHA workers
        asha_workers = []
        asha_docs = db.collection('users').where('role', '==', 'asha').stream()
        for doc in asha_docs:
            asha_data = doc.to_dict()
            if asha_data.get('email'):
                asha_workers.append({
                    'name': asha_data.get('name', 'ASHA Worker'),
                    'email': asha_data.get('email'),
                    'phone': asha_data.get('phone', '')
                })

        if not asha_workers:
            return jsonify({
                "success": False,
                "error": "No ASHA workers with email addresses were found in Firestore.",
                "emailResults": []
            }), 404
        
        # Create emergency log in Firebase
        emergency_log = {
            'motherId': user_id,
            'motherName': user_name,
            'location': location,
            'symptoms': symptoms,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'status': 'active',
            'ashaNotified': len(asha_workers)
        }
        
        try:
            emergency_ref = db.collection('emergencies').add(emergency_log)
            # Handle both return types (tuple or reference)
            if isinstance(emergency_ref, tuple):
                emergency_id = emergency_ref[1].id
            else:
                emergency_id = emergency_ref[1]
        except Exception as ref_error:
            print(f"Error creating emergency ref: {ref_error}")
            emergency_id = "unknown"
        
        # Send email alerts to ASHA workers
        email_results = []
        for asha in asha_workers:
            email_results.append(
                send_alert_email(asha['email'], asha['name'], user_name, location, symptoms)
            )
        
        sent_count = len([r for r in email_results if r['status'] == 'sent'])
        failed_count = len([r for r in email_results if r['status'] == 'failed'])
        skipped_count = len([r for r in email_results if r['status'] == 'skipped'])

        return jsonify({
            "success": sent_count > 0,
            "message": f"Emergency alert sent to {sent_count} ASHA workers",
            "emergencyId": emergency_id,
            "ashaFound": len(asha_workers),
            "sentCount": sent_count,
            "failedCount": failed_count,
            "skippedCount": skipped_count,
            "emailResults": email_results
        }), 200 if sent_count > 0 else 502
        
    except Exception as e:
        print(f"Emergency alert error: {e}")
        return jsonify({"error": str(e), "success": False}), 500


def send_alert_email(to_email, asha_name, mother_name, location, symptoms):
    """Send emergency alert email to ASHA worker"""
    try:
        sender_email = os.getenv('EMAIL_SENDER', 'mamaai.health@gmail.com').strip()
        sender_password = os.getenv('EMAIL_PASSWORD', '').replace(' ', '').strip()
        
        if not sender_password:
            print(f"[EMAIL SKIPPED] EMAIL_PASSWORD is not configured. Would send to {to_email}.")
            return {
                "email": to_email,
                "status": "skipped",
                "error": "EMAIL_PASSWORD is not configured in backend/.env"
            }
        
        safe_asha_name = escape(str(asha_name))
        safe_mother_name = escape(str(mother_name))
        safe_location = escape(str(location))
        safe_symptoms = escape(str(symptoms))
        alert_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        subject = f"CRITICAL: Emergency Alert from {mother_name}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #fff;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 30px; border-left: 6px solid #ef4444;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #ef4444; font-size: 28px; margin: 0;">CRITICAL EMERGENCY ALERT</h1>
                    </div>
                    
                    <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                        <h2 style="color: #fff; margin-top: 0;">Mother Information</h2>
                        <p><strong>Name:</strong> {safe_mother_name}</p>
                        <p><strong>Location:</strong> {safe_location}</p>
                        <p><strong>Critical Symptoms:</strong> {safe_symptoms}</p>
                        <p><strong>Alert Time:</strong> {alert_time}</p>
                    </div>
                    
                    <div style="background-color: #7c2d12; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                        <h3 style="color: #fca5a5; margin-top: 0;">IMMEDIATE ACTION REQUIRED</h3>
                        <p style="font-size: 14px;">Dear {safe_asha_name}, please contact the mother immediately and provide emergency medical support.</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <p style="font-size: 12px; color: #94a3b8;">This is an automated alert from MamaAI Emergency System</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Create email
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = to_email
        
        msg.attach(MIMEText(html_content, 'html'))
        msg.attach(MIMEText(
            f"CRITICAL EMERGENCY ALERT\n\n"
            f"Dear {asha_name},\n\n"
            f"Mother: {mother_name}\n"
            f"Location: {location}\n"
            f"Symptoms: {symptoms}\n"
            f"Alert Time: {alert_time}\n\n"
            f"Please contact the mother immediately and provide emergency medical support.",
            'plain'
        ))
        
        # Send email
        print(f"[SENDING EMAIL] From: {sender_email}, To: {to_email}")
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender_email, sender_password)
                server.send_message(msg)
            print(f"[EMAIL SENT] Successfully sent to {to_email}")
            return {
                "email": to_email,
                "status": "sent"
            }
        except smtplib.SMTPAuthenticationError as auth_err:
            print(f"[EMAIL ERROR] Authentication failed: {auth_err}")
            return {
                "email": to_email,
                "status": "failed",
                "error": "Gmail authentication failed. Use a Gmail App Password for EMAIL_PASSWORD, not your normal Gmail password."
            }
        except smtplib.SMTPException as smtp_err:
            print(f"[EMAIL ERROR] SMTP error: {smtp_err}")
            return {
                "email": to_email,
                "status": "failed",
                "error": str(smtp_err)
            }
        except Exception as send_err:
            print(f"[EMAIL ERROR] Failed to send: {send_err}")
            return {
                "email": to_email,
                "status": "failed",
                "error": str(send_err)
            }
        
    except Exception as e:
        print(f"[EMAIL ERROR] Exception in send_alert_email: {type(e).__name__}: {e}")
        return {
            "email": to_email,
            "status": "failed",
            "error": str(e)
        }


@emergency_api.route('/health', methods=['GET'])
def emergency_health():
    """Check emergency email configuration and ASHA recipient count"""
    try:
        db = get_db()
        asha_count = 0
        asha_with_email_count = 0

        asha_docs = db.collection('users').where('role', '==', 'asha').stream()
        for doc in asha_docs:
            asha_count += 1
            if doc.to_dict().get('email'):
                asha_with_email_count += 1

        return jsonify({
            "success": True,
            "emailSenderConfigured": bool(os.getenv('EMAIL_SENDER', '').strip()),
            "emailPasswordConfigured": bool(os.getenv('EMAIL_PASSWORD', '').strip()),
            "ashaCount": asha_count,
            "ashaWithEmailCount": asha_with_email_count
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@emergency_api.route('/history', methods=['GET'])
def get_emergency_history():
    """Get emergency history for current user"""
    try:
        db = get_db()
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
        
        emergencies = []
        emergency_docs = db.collection('emergencies').where('motherId', '==', user_id).order_by('timestamp', direction='DESCENDING').limit(10).stream()
        
        for doc in emergency_docs:
            emergencies.append({
                'id': doc.id,
                **doc.to_dict()
            })
        
        return jsonify({
            "success": True,
            "emergencies": emergencies
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500


@emergency_api.route('/resolve', methods=['POST'])
def resolve_emergency():
    """Mark emergency as resolved"""
    try:
        db = get_db()
        data = request.json
        emergency_id = data.get('emergencyId')
        
        if not emergency_id:
            return jsonify({"error": "Emergency ID required"}), 400
        
        db.collection('emergencies').document(emergency_id).update({
            'status': 'resolved',
            'resolvedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({
            "success": True,
            "message": "Emergency marked as resolved"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500

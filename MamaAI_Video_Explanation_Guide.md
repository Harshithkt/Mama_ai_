# MamaAI: Project Video Explanation Guide & Script

This guide outlines a scene-by-scene script and screen-recording workflow for a **3-to-5 minute video explanation** of MamaAI. It is structured to help you present a credible, technical, and high-impact demonstration of the MVP's features, architecture, and real-world clinical value.

---

## 🎥 Video Overview
* **Target Length:** 3:23 Minutes
* **Tone:** Professional, technical, evidence-based, and empathetic
* **Key Visuals to Show:**
  * Redesigned terracotta/cream landing page
  * Eyelid scan photo upload & instant hemoglobin output
  * Meal scan nutrition breakdown and daily gap charts
  * Multilingual symptom chat (with translation and risk flags)
  * Real-time ASHA worker central dashboard sync
  * Gmail SMTP emergency alert email received in inbox

---

## 🎬 Scene-by-Scene Script & Storyboard

### Scene 1: The Problem & The MamaAI Hook
* **Duration:** `0:00 - 0:30`
* **Visual on Screen:** 
  * Start on the redesigned **MamaAI Landing Page** (warm terracotta/cream theme). 
  * Scroll down slightly to show the **CSS-based Maternal Dashboard Mockup** showing simulated vitals, anemia levels, and fetal kick alerts.
* **Screen Action:** Move the cursor naturally over the visual callouts and hover over the "Explore Features" section.
* **Speaker Script (Voiceover):**
  > "Every mother deserves smart, continuous care. Yet, in rural India, gestational anemia and nutrition gaps often go undetected. 
  > 
  > **MamaAI** bridges the gap between rural mothers, ASHA workers, and clinical doctors. Let's see how our MVP pairs accessible smartphone diagnostics with advanced generative AI."

---

### Scene 2: Non-Invasive Anemia Screening (Eyelid Scan)
* **Duration:** `0:30 - 1:15`
* **Visual on Screen:** 
  * Click on **"Try Demo"** to navigate to the user dashboard. 
  * Navigate to the **Eyelid Anemia Scanner** tab.
* **Screen Action:** 
  * Click the photo upload box and select the sample eyelid image (`test_eyelid.jpg` located in your backend folder).
  * Click **"Scan Eyelid"**. Show the loading state, and then display the results card: **Estimated Hemoglobin (e.g., 10.2 g/dL)**, **WHO Category (Mild Anemia - WARNING)**, and the list of recommended actions.
* **Speaker Script (Voiceover):**
  > "We begin with non-invasive anemia screening. In the MamaAI dashboard, a user uploads a photo of the inner lower eyelid. Under the hood, OpenCV analyzes the image, extracting saturation and Red-to-Green channel ratios to estimate hemoglobin levels. 
  > 
  > Here, the eyelid scan estimates hemoglobin at 10.2 g/dL. The platform tags this as Mild Anemia, maps it against WHO guidelines, and recommends daily Iron-Folic Acid supplementation."

---

### Scene 3: Maternal Nutrition & Daily Gaps (Meal Scanner)
* **Duration:** `1:15 - 1:55`
* **Visual on Screen:** 
  * Navigate to the **Maternal Meal Scanner & Tracker** tab.
* **Screen Action:**
  * Upload a meal image (such as the `test_meal_real.jpg` showing rice and dal).
  * Click **"Analyze Meal"**. 
  * Point out the list of identified foods, the daily value percentages (Protein, Iron, Calcium, Folate), and the dynamic **Nutrient Gaps bar charts** showing remaining goals.
* **Speaker Script (Voiceover):**
  > "To track maternal nutrition, the mother snaps a photo of her meal. This image is sent to GPT-4o-mini, which estimates micro-nutrients against daily pregnancy allowances. 
  > 
  > The backend parses the response, updates the nutrient gap charts, and alerts her to any deficits—like the 85% iron deficit in this rice-and-dal meal, guiding her on how to supplement."

---

### Scene 4: Native Language Symptom Checker & SOS Trigger
* **Duration:** `1:55 - 2:35`
* **Visual on Screen:** 
  * Click on the **AI Symptom Analyzer** chat tab.
* **Screen Action:**
  * Type a symptom in Hindi: *"मुझे चक्कर आ रहे हैं और बहुत थकान महसूस हो रही है"* (I'm feeling dizzy and very tired) and press send.
  * Show the immediate response: the text is translated to English via the MyMemory API, processed by Llama 3.3 on Groq, and returns an empathetic reply with a highlighted **WARNING badge**.
  * Now, click the bright red **"SOS Emergency"** button at the top of the screen. Type *“Severe swelling and blurred vision”* and click send. Show the success notification.
* **Speaker Script (Voiceover):**
  > "For local symptom checking, mothers type or speak in regional dialects like Hindi. The input is translated via MyMemory API, triaged by Llama 3.3 on Groq, and flagged with a safety level. 
  > 
  > When the mother triggers the SOS button, MamaAI creates an emergency log in Firestore and sends a high-priority alert email with her exact location and symptoms to the nearest ASHA worker."

---

### Scene 5: The Clinician (ASHA Worker) Portal & Sync
* **Duration:** `2:35 - 3:05`
* **Visual on Screen:** 
  * Log out or refresh. Enter a mock clinician email containing "asha" (e.g. `asha@mamaai.org`) and access the dashboard.
* **Screen Action:**
  * Show the **ASHA Worker Portal** listing active patients, warning indicators, and recent SOS events.
  * Show the patient detail page displaying the mother's estimated hemoglobin trend line, historical kick charts, and consolidated records.
* **Speaker Script (Voiceover):**
  > "Logging in as an ASHA worker opens the clinician dashboard. Since Firestore syncs in real-time, the worker instantly sees high-priority patient flags. 
  > 
  > She can view estimated hemoglobin trends, meal logs, and fetal kicks, or generate a clinical PDF summary report to share with doctors."

---

### Scene 6: Architecture, Value Beyond ChatGPT, & Outro
* **Duration:** `3:05 - 3:23`
* **Visual on Screen:** 
  * Show a quick slide of your **Technical Architecture Diagram** (from the submission document) or show the raw backend terminal running Flask and the frontend running npm.
* **Speaker Script (Voiceover):**
  > "MamaAI integrates computer vision, LLM nutrition tracking, localized chat, and SMTP SOS notifications into an offline-resilient, React and Flask architecture. 
  > 
  > We are bridging the gap in maternal healthcare, one scan at a time."

---

## 🛠️ Tips for a Great Recording
1. **Prepare Your Media:** Place your sample images (`test_eyelid.jpg` and a meal photo) on your desktop for quick dragging/uploading.
2. **Clear the Database/Cache:** Do a quick check-in log, kick log, and scan prior to recording to ensure the charts and trends display a realistic, populated history in your demonstration.
3. **Capture the Alert Email:** Have your Gmail tab open on the side to show the high-priority SMTP email alert that ASHA workers receive when the SOS is clicked.
4. **Resolution:** Record in full 1080p, and zoom in slightly on your browser window (`Cmd +` or `Ctrl +`) to ensure small text and numbers (like estimated Hb values) are highly legible on video.

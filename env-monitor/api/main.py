from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Offline Environmental Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    language: str = "en"
    role: str = "Public"

class ChatResponse(BaseModel):
    reply: str

def detect_intent(query: str, lang: str):
    q = query.lower()
    
    # Simple rule based engine (Offline)
    intents = {
        "greeting": ["hello", "hi", "hey", "namaste", "kem cho", "pranam"],
        "safety": ["safe", "danger", "poor", "surakshit", "khatra", "salamati", "jokhmi", "kharaab"],
        "action": ["what to do", "help", "action", "kya karu", "madad", "shu karvu", "sahayata"],
        "pollution": ["pollution", "gas", "smoke", "pradushan", "dhuwa", "gas leak", "dhumado"],
        "complaint": ["report", "complaint", "issue", "shikayat", "fariyad", "samasiya", "taklif"],
        "status": ["status", "sensor", "dashboard", "halat", "sthiti"],
        "emergency": ["emergency", "fire", "leak", "urgent", "aapatkalin", "taatkaleen"],
        "health": ["symptom", "cough", "headache", "asthma", "breathing", "health", "hospital", "swasthya", "khaasi", "bimaari", "davakhana", "shwas"],
        "contact": ["number", "contact", "phone", "helpline", "call", "sampark", "phone kara"],
        "weather": ["weather", "wind", "rain", "temperature", "climate", "mausam", "hawa", "vaatavaran", "pavan"],
        "rules": ["law", "rule", "policy", "legal", "fine", "penalty", "kanoon", "niyam", "dand"],
        "praise": ["good", "great", "thanks", "thank you", "dhanyawad", "shukriya", "aabhar", "saru"]
    }

    for intent, keywords in intents.items():
        if any(kw in q for kw in keywords):
            return intent
            
    return "unknown"

def generate_response(intent: str, role: str, lang: str):
    # Role-based & language-based response mapping
    responses = {
        "en": {
            "greeting": "Hello! I am your EcoSentinel AI Assistant. How can I help you regarding environmental safety?",
            "safety": "⚠️ Air quality is poor in industrial zones. Avoid going outside without proper masks.",
            "action": "Based on current readings, I recommend staying indoors and closing all windows immediately.",
            "pollution": "🚨 Sensor nodes have detected abnormal PM2.5 and SO2 levels nearby.",
            "complaint": "Please submit a complaint with location details. Our inspectors are on standby.",
            "status": "All active sensors are currently broadcasting data to the dashboard in real-time.",
            "emergency": "If this is a severe emergency, please alert local emergency services and submit a prioritized complaint.",
            "health": "If experiencing cough, eye irritation, or breathing issues, stay hydrated and consult a doctor immediately.",
            "contact": "You can reach GSPCB emergency helplines at 1800-XXX-XXXX.",
            "weather": "Wind patterns currently indicate dispersal from the Ankleshwar industrial zone towards residential areas.",
            "rules": "Violating Section 21 of the Air Act 1981 carries a fine of ₹1 Lakh or facility shutdown.",
            "praise": "You're welcome! Stay safe and vigilant.",
            "unknown": "I am your safety assistant. Please ask me about air quality, safety, or how to report an issue."
        },
        "hi": {
            "greeting": "नमस्ते! मैं आपका इकोसेंटिनल एआई सहायक हूँ। मैं पर्यावरण सुरक्षा के संबंध में आपकी कैसे मदद कर सकता हूँ?",
            "safety": "⚠️ औद्योगिक क्षेत्रों में वायु गुणवत्ता खराब है। उचित मास्क के बिना बाहर जाने से बचें।",
            "action": "वर्तमान रीडिंग के आधार पर, मैं तुरंत अंदर रहने और सभी खिड़कियां बंद करने की सलाह देता हूं।",
            "pollution": "🚨 सेंसर नोड्स ने असामान्य PM2.5 और SO2 स्तरों का पता लगाया है।",
            "complaint": "कृपया स्थान विवरण के साथ शिकायत दर्ज करें। हमारे निरीक्षक तैयार हैं।",
            "status": "सभी सक्रिय सेंसर वर्तमान में वास्तविक समय में डैशबोर्ड पर डेटा प्रसारित कर रहे हैं।",
            "emergency": "यदि यह कोई गंभीर आपात स्थिति है, तो कृपया स्थानीय आपातकालीन सेवाओं को सचेत करें और एक उच्च प्राथमिकता वाली शिकायत दर्ज करें।",
            "health": "यदि खांसी, आंखों में जलन या सांस लेने में समस्या हो रही है, तो खुद को हाइड्रेटेड रखें और तुरंत डॉक्टर से सलाह लें।",
            "contact": "आप 1800-XXX-XXXX पर GSPCB आपातकालीन हेल्पलाइन तक पहुंच सकते हैं।",
            "weather": "हवा के पैटर्न वर्तमान में अंकलेश्वर औद्योगिक क्षेत्र से रिहायशी इलाकों की ओर फैलाव का संकेत देते हैं।",
            "rules": "वायु अधिनियम 1981 की धारा 21 का उल्लंघन करने पर ₹1 लाख का जुर्माना या सुविधा बंद होने का प्रावधान है।",
            "praise": "आपका स्वागत है! सुरक्षित और सतर्क रहें।",
            "unknown": "मैं आपका सुरक्षा सहायक हूं। कृपया मुझे वायु गुणवत्ता, सुरक्षा या समस्या की रिपोर्ट करने के बारे में पूछें।"
        },
        "gu": {
            "greeting": "નમસ્તે! હું તમારો ઇકોસેન્ટિનલ AI સહાયક છું. પર્યાવરણ સલામતી અંગે હું તમને કેવી રીતે મદદ કરી શકું?",
            "safety": "⚠️ ઔદ્યોગિક વિસ્તારોમાં હવાની ગુણવત્તા નબળી છે. યોગ્ય માસ્કના ઉપયોગ વિના બહાર જવાનું ટાળો.",
            "action": "હાલના રીડિંગ્સના આધારે, હું તરત જ ઘરની અંદર રહેવાની અને બધી બારીઓ બંધ કરવાની સલાહ આપું છું.",
            "pollution": "🚨 સેન્સર નોડ્સ દ્વારા અસામાન્ય PM2.5 અને SO2 સ્તર વ્યાખ્યાયિત થયા છે.",
            "complaint": "કૃપા કરીને સ્થાનની વિગતો સાથે ફરિયાદ નોંધાવો. અમારા નિરીક્ષકો તૈયાર છે.",
            "status": "બધા સક્રિય સેન્સર હાલમાં રીઅલ-ટાઇમમાં ડેશબોર્ડ પર ડેટા પ્રસારિત કરી રહ્યાં છે.",
            "emergency": "જો આ ગંભીર કટોકટી હોય, તો કૃપા કરીને સ્થાનિક કટોકટી સેવાઓને ચેતવણી આપો અને પ્રાથમિકતાવાળી ફરિયાદ સબમિટ કરો.",
            "health": "જો ઉધરસ, આંખમાં બળતરા અથવા શ્વાસ લેવામાં તકલીફ થતી હોય, તો હાઇડ્રેટેડ રહો અને તાત્કાલિક ડૉક્ટરની સલાહ લો.",
            "contact": "તમે GSPCB ઇમરજન્સી હેલ્પલાઇન 1800-XXX-XXXX પર સંપર્ક કરી શકો છો.",
            "weather": "પવનની પેટર્ન હાલમાં અંકલેશ્વર ઔદ્યોગિક ઝોનથી રહેણાંક વિસ્તારો તરફ ફેલાવ સૂચવે છે.",
            "rules": "વાયુ અધિનિયમ 1981 ની કલમ 21 નું ઉલ્લંઘન કરવા બદલ ₹1 લાખનો દંડ અથવા સુવિધા બંધ થઈ શકે છે.",
            "praise": "તમારું સ્વાગત છે! સુરક્ષિત અને સાવચેત રહો.",
            "unknown": "હું તમારો સુરક્ષા સહાયક છું. કૃપા કરીને હવાની ગુણવત્તા, સલામતી અથવા ફરિયાદ વિશે પૂછો."
        }
    }

    # Map lang
    lang_code = "en"
    if "hi" in lang.lower() or "hindi" in lang.lower():
        lang_code = "hi"
    elif "gu" in lang.lower() or "gujarati" in lang.lower():
        lang_code = "gu"

    base_reply = responses[lang_code].get(intent, responses[lang_code]["unknown"])

    # Role specific additions
    if role == "Sarpanch" and intent == "complaint":
        if lang_code == "en":
            base_reply += " As Village Admin, you can auto-route this to the GSPCB dashboard directly."
        elif lang_code == "hi":
            base_reply += " सरपंच के रूप में, आप इसे सीधे GSPCB डैशबोर्ड पर ऑटो-रूट कर सकते हैं।"
        else:
            base_reply += " સરપંચ તરીકે, તમે આ ફરિયાદ સીધી GSPCB ડેશબોર્ડ પર ઓટો-રૂટ કરી શકો છો."
            
    if role == "Inspector" and intent == "pollution":
        if lang_code == "en":
            base_reply += " I suggest generating an emergency Form-A notice immediately."
        elif lang_code == "hi":
            base_reply += " मैं तुरंत आपातकालीन फॉर्म-ए नोटिस जारी करने का सुझाव देता हूं।"
        else:
            base_reply += " હું તાત્કાલિક કટોકટી ફોર્મ-A નોટિસ જનરેટ કરવાનું સૂચન કરું છું."

    return base_reply

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    intent = detect_intent(req.query, req.language)
    reply = generate_response(intent, req.role, req.language)
    return ChatResponse(reply=reply)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

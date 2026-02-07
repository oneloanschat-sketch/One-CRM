import React, { useState } from 'react';
import { Link as LinkIcon, Server, Copy, Check, Code, Play, Send, MessageCircle, Zap } from 'lucide-react';

interface IntegrationSettingsProps {
    onTestWebhook: (data?: any) => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ onTestWebhook }) => {
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [activeTab, setActiveTab] = useState<'node' | 'python' | 'whatsapp'>('whatsapp');
    
    // Manual Simulation State
    const [manualData, setManualData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        amount: ''
    });
    
    // Get the current base URL dynamically
    const baseUrl = window.location.origin;
    const webhookUrl = `${baseUrl}/api/webhook`;

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleManualSimulate = () => {
        if (!manualData.firstName || !manualData.phone) return;
        
        onTestWebhook({
            firstName: manualData.firstName,
            lastName: manualData.lastName || '',
            phone: manualData.phone,
            amount: manualData.amount || 0
        });
    };

    const nodeSnippet = `
// קוד עבור בוט ב-Node.js / JavaScript
const sendLeadToCRM = async (leadData) => {
  try {
    const response = await fetch('${webhookUrl}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: leadData.firstName, // חובה
        lastName: leadData.lastName,   // אופציונלי
        phone: leadData.phone,         // חובה - מזהה ייחודי
        email: leadData.email,
        requestedAmount: leadData.amount,
        notes: "הגיע דרך הצ'אט בוט",
        source: "WhatsApp Bot"
      })
    });
    
    if (response.ok) {
      console.log('Lead saved successfully');
    }
  } catch (error) {
    console.error('Error sending lead:', error);
  }
};
`;

    const pythonSnippet = `
# קוד עבור בוט ב-Python
import requests
import json

def send_lead_to_crm(lead_data):
    url = "${webhookUrl}"
    payload = {
        "firstName": lead_data.get("first_name"), # חובה
        "lastName": lead_data.get("last_name"),   # אופציונלי
        "phone": lead_data.get("phone"),          # חובה
        "email": lead_data.get("email"),
        "requestedAmount": lead_data.get("amount"),
        "notes": "הגיע דרך הצ'אט בוט",
        "source": "WhatsApp Bot"
    }
    
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            print("Lead saved successfully")
    except Exception as e:
        print(f"Error sending lead: {e}")
`;

    const whatsappSnippet = `
// הגדרה עבור Make (Integromat) / Zapier / n8n
// שלב 1: צור מודול מסוג "HTTP Request"
// שלב 2: הגדר את הפעולה כ-POST
// שלב 3: הדבק את ה-URL למעלה

// שלב 4: בתוכן הגוף (Body / JSON), הדבק את המבנה הבא:
{
  "firstName": "{{1.contact_name}}",  // למשוך מהוואטסאפ
  "phone": "{{1.phone_number}}",      // למשוך מהוואטסאפ
  "lastName": "",
  "requestedAmount": 0,
  "notes": "הודעה שהתקבלה: {{1.message_body}}"
}

// המערכת תבצע אוטומטית:
// 1. אם הטלפון קיים -> תעדכן את התיק ותוסיף את ההודעה להערות.
// 2. אם הטלפון חדש -> תפתח תיק ליד חדש.
`;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600 shadow-sm">
                    <MessageCircle size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">חיבור וואטסאפ ובוטים</h2>
                    <p className="text-slate-500">כך מחברים סוכן אוטומטי למערכת ה-CRM</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Side: Instructions & URL */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                        <div className="flex items-center gap-2 mb-4">
                            <Server className="text-green-600" size={24} />
                            <h3 className="text-lg font-bold text-slate-800">שלב 1: כתובת ה-Webhook</h3>
                        </div>
                        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                            זו הכתובת אליה הבוט (או Make/Zapier) צריך לשלוח את המידע.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 flex items-center justify-between group hover:border-blue-300 transition-colors">
                            <code className="text-sm font-mono text-green-700 break-all px-2 select-all" dir="ltr">
                                {webhookUrl}
                            </code>
                            <button 
                                onClick={handleCopyUrl}
                                className="text-slate-400 hover:text-green-600 shrink-0 p-2 hover:bg-white rounded-lg transition-all"
                                title="העתק כתובת"
                            >
                                {copiedUrl ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-4 mt-4">
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Play size={16} className="text-green-600" />
                                בדיקת חיבור (סימולציה)
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="שם פרטי *" 
                                        className="p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-200 outline-none"
                                        value={manualData.firstName}
                                        onChange={(e) => setManualData({...manualData, firstName: e.target.value})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="שם משפחה" 
                                        className="p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-200 outline-none"
                                        value={manualData.lastName}
                                        onChange={(e) => setManualData({...manualData, lastName: e.target.value})}
                                    />
                                    <input 
                                        type="tel" 
                                        placeholder="טלפון *" 
                                        className="p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-200 outline-none"
                                        value={manualData.phone}
                                        onChange={(e) => setManualData({...manualData, phone: e.target.value})}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="סכום מבוקש" 
                                        className="p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-200 outline-none"
                                        value={manualData.amount}
                                        onChange={(e) => setManualData({...manualData, amount: e.target.value})}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <button 
                                        onClick={() => onTestWebhook()} 
                                        className="text-xs text-slate-400 underline hover:text-slate-600"
                                    >
                                        שלח נתונים אקראיים
                                    </button>
                                    <button 
                                        onClick={handleManualSimulate}
                                        disabled={!manualData.firstName || !manualData.phone}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <Send size={14} />
                                        שלח ל-CRM
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                         <div className="flex items-center gap-2 mb-4">
                            <LinkIcon className="text-blue-500" size={24} />
                            <h3 className="text-lg font-bold text-slate-800">מבנה המידע (JSON)</h3>
                        </div>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs md:text-sm shadow-inner" dir="ltr">
<pre>{`{
  "firstName": "שם הלקוח",   // (חובה)
  "phone": "050-0000000",   // (חובה - המפתח לזיהוי)
  "notes": "הודעה מהוואטסאפ" // (אופציונלי)
}`}</pre>
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Snippets */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Code className="text-slate-500" size={24} />
                        <h3 className="text-lg font-bold text-slate-800">שלב 2: הגדרת הבוט</h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">
                        בחר את השיטה בה אתה עובד כדי לראות את ההגדרות המתאימות:
                    </p>

                    <div className="flex gap-2 mb-4 border-b border-slate-100 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('whatsapp')}
                            className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'whatsapp' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Zap size={16} />
                            אוטומציה (Make/Zapier)
                        </button>
                        <button 
                            onClick={() => setActiveTab('node')}
                            className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'node' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Node.js
                        </button>
                        <button 
                            onClick={() => setActiveTab('python')}
                            className={`pb-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'python' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Python
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg shadow-slate-200/50">
                        <div className="flex justify-between items-center px-4 py-2 bg-slate-900 text-slate-400 text-xs">
                             <div className="flex gap-1.5">
                                 <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                             </div>
                             <span>
                                 {activeTab === 'whatsapp' ? 'Make / Zapier Config' : activeTab === 'node' ? 'bot.js' : 'bot.py'}
                             </span>
                        </div>
                        <div className="flex-1 p-4 overflow-auto custom-scrollbar">
                            <pre className="text-xs md:text-sm font-mono text-green-400 whitespace-pre-wrap" dir="ltr">
                                {activeTab === 'whatsapp' ? whatsappSnippet : activeTab === 'node' ? nodeSnippet : pythonSnippet}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
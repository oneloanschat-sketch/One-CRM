import React, { useState } from 'react';
import { Bot, Link as LinkIcon, Server, Copy, Check, Code, Play, Send } from 'lucide-react';

interface IntegrationSettingsProps {
    onTestWebhook: (data?: any) => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ onTestWebhook }) => {
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [activeTab, setActiveTab] = useState<'node' | 'python'>('node');
    
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

        // Reset form slightly to show action taken, but keep data for ease
        // setManualData({ firstName: '', lastName: '', phone: '', amount: '' });
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
        source: "Chatbot"
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
        "source": "Chatbot"
    }
    
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            print("Lead saved successfully")
    except Exception as e:
        print(f"Error sending lead: {e}")
`;

    return (
        <div className="p-6 space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                    <Bot size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">הגדרות חיבור לבוט (Integration)</h2>
                    <p className="text-slate-500">כך מחברים את הצ'אט בוט שלך למערכת ה-CRM</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Side: Instructions & URL */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                        <div className="flex items-center gap-2 mb-4">
                            <Server className="text-purple-500" size={24} />
                            <h3 className="text-lg font-bold text-slate-800">שלב 1: כתובת ה-Webhook</h3>
                        </div>
                        <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                            זו הכתובת שהבוט צריך לשלוח אליה את המידע (HTTP POST).
                        </p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 flex items-center justify-between">
                            <code className="text-sm font-mono text-purple-600 break-all px-2" dir="ltr">
                                {webhookUrl}
                            </code>
                            <button 
                                onClick={handleCopyUrl}
                                className="text-slate-400 hover:text-purple-600 shrink-0"
                                title="העתק כתובת"
                            >
                                {copiedUrl ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                            </button>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-4 mt-4">
                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Play size={16} className="text-purple-600" />
                                סימולטור ידני (בדיקת Webhook)
                            </h4>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="שם פרטי *" 
                                        className="p-2 border rounded-lg text-sm bg-white"
                                        value={manualData.firstName}
                                        onChange={(e) => setManualData({...manualData, firstName: e.target.value})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="שם משפחה" 
                                        className="p-2 border rounded-lg text-sm bg-white"
                                        value={manualData.lastName}
                                        onChange={(e) => setManualData({...manualData, lastName: e.target.value})}
                                    />
                                    <input 
                                        type="tel" 
                                        placeholder="טלפון *" 
                                        className="p-2 border rounded-lg text-sm bg-white"
                                        value={manualData.phone}
                                        onChange={(e) => setManualData({...manualData, phone: e.target.value})}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="סכום מבוקש" 
                                        className="p-2 border rounded-lg text-sm bg-white"
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
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={14} />
                                        שלח ל-Webhook
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                         <div className="flex items-center gap-2 mb-4">
                            <LinkIcon className="text-green-500" size={24} />
                            <h3 className="text-lg font-bold text-slate-800">מבנה המידע (JSON)</h3>
                        </div>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs md:text-sm" dir="ltr">
<pre>{`{
  "firstName": "שם הלקוח",   // (חובה)
  "phone": "050-0000000",   // (חובה)
  "lastName": "משפחה",
  "email": "mail@test.com",
  "requestedAmount": 1000000,
  "notes": "הערות מהשיחה"
}`}</pre>
                        </div>
                    </div>
                </div>

                {/* Right Side: Code Snippets */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Code className="text-blue-500" size={24} />
                        <h3 className="text-lg font-bold text-slate-800">שלב 2: העתק קוד לבוט</h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">
                        בחר את השפה בה כתוב הבוט שלך והעתק את הפונקציה:
                    </p>

                    <div className="flex gap-2 mb-4 border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('node')}
                            className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'node' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                        >
                            Node.js (JS)
                        </button>
                        <button 
                            onClick={() => setActiveTab('python')}
                            className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'python' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                        >
                            Python
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 bg-slate-900 text-slate-400 text-xs">
                             <div className="flex gap-1.5">
                                 <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                             </div>
                             <span>{activeTab === 'node' ? 'bot.js' : 'bot.py'}</span>
                        </div>
                        <div className="flex-1 p-4 overflow-auto custom-scrollbar">
                            <pre className="text-xs md:text-sm font-mono text-green-400 whitespace-pre-wrap" dir="ltr">
                                {activeTab === 'node' ? nodeSnippet : pythonSnippet}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
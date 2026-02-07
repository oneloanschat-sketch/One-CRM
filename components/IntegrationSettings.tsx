import React from 'react';
import { Bot, Link as LinkIcon, Server, Copy, Check } from 'lucide-react';

interface IntegrationSettingsProps {
    onTestWebhook: () => void;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ onTestWebhook }) => {
    const [copied, setCopied] = React.useState(false);
    
    // Get the current base URL
    const baseUrl = window.location.origin;
    const webhookUrl = `${baseUrl}/api/webhook`;

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-6 space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                    <Bot size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">הגדרות וחיבורים (Integrations)</h2>
                    <p className="text-slate-500">ניהול חיבורים לצ'אט-בוטים, אוטומציות ומערכות חיצוניות</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Option 1: Webhook (Optimal) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                    <div className="flex items-center gap-2 mb-4">
                        <Server className="text-purple-500" size={24} />
                        <h3 className="text-lg font-bold text-slate-800">אפשרות מומלצת: Webhook</h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                        העבר למפתח הבוט את הכתובת הבאה ואת מבנה ה-JSON. הבוט ישלח הודעת POST לכתובת זו בכל פעם שלקוח חדש פונה בוואטסאפ.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">כתובת ה-Webhook (Endpoint)</p>
                        <div className="flex items-center justify-between">
                            <code className="text-sm font-mono text-purple-600 break-all" dir="ltr">
                                {webhookUrl}
                            </code>
                            <button 
                                onClick={handleCopy}
                                className="text-slate-400 hover:text-purple-600"
                                title="העתק כתובת"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm mb-4" dir="ltr">
                        <pre>{`POST /api/webhook
Content-Type: application/json

{
  "firstName": "ישראל",
  "lastName": "ישראלי",
  "phone": "050-1234567",
  "email": "israel@example.com",
  "requestedAmount": 1200000,
  "source": "whatsapp_bot"
}`}</pre>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500">לחיצה כאן תשלח פקודת POST אמיתית לשרת לבדיקה</p>
                            <button 
                                onClick={onTestWebhook}
                                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                            >
                                בדוק קליטה (Simulate)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Option 2: Magic Link */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 mb-4">
                        <LinkIcon className="text-green-500" size={24} />
                        <h3 className="text-lg font-bold text-slate-800">אפשרות ב': חיבור מהיר (ללא שרת)</h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                        אם לא ניתן לחבר Webhook ישיר, הבוט יכול לשלוח ליועץ קישור "חכם".
                        <br/>
                        בלחיצה על הקישור, הלקוח ייווצר במערכת.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                         <code className="text-xs font-mono text-blue-600 break-all" dir="ltr">
                            {baseUrl}/?action=add&fname=[NAME]&phone=[PHONE]...
                        </code>
                    </div>
                </div>

            </div>
        </div>
    );
};
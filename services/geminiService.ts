import { GoogleGenAI } from "@google/genai";
import { Client } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeClientRisk = async (client: Client): Promise<string> => {
  try {
    const prompt = `
      תנתח את הלקוח הבא עבור חברת "אדמתנו ביתנו" (מומחים למשכנתאות ופיננסים בחברה הערבית).
      
      פרטי הלקוח:
      שם: ${client.firstName} ${client.lastName}
      הכנסה חודשית: ${client.monthlyIncome} ש"ח
      סכום משכנתא מבוקש: ${client.requestedAmount} ש"ח
      דירוג אשראי (מתוך 1000): ${client.creditScore}
      סטטוס נוכחי: ${client.status}

      תן לי הערכה קצרה (עד 3 משפטים) לגבי הסיכוי לאישור המשכנתא, והמלצה אחת לפעולה עבור יועץ המשכנתאות.
      כתוב בעברית מקצועית.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "לא התקבל ניתוח. נסה שנית.";
  } catch (error) {
    console.error("Error analyzing client with Gemini:", error);
    return "שגיאה בחיבור לשרת הבינה המלאכותית.";
  }
};
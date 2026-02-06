# One Mortgages CRM

מערכת CRM מתקדמת לניהול לקוחות משכנתא, כולל מעקב מסמכים, ניתוח סיכונים מבוסס AI ודשבורד ניהולי.

## טכנולוגיות
- **React 19**
- **Tailwind CSS** (לעיצוב)
- **Google Gemini API** (לניתוח תיקים)
- **Recharts** (לגרפים)
- **Vite** (Build Tool)

## הוראות הפעלה (מקומי)

1. התקן את הספריות:
   ```bash
   npm install
   ```

2. צור קובץ `.env` והכנס את מפתח ה-API שלך:
   ```
   API_KEY=your_google_gemini_api_key_here
   ```

3. הרץ את השרת:
   ```bash
   npm run dev
   ```

## העלאה לענן (Deployment)

### אפשרות א': Vercel (מומלץ ומהיר)

1. **אתחול Git:**
   פתח את הטרמינל בתיקיית הפרויקט והרץ:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **העלאה ל-GitHub:**
   צור Repository חדש ב-GitHub ודחוף (Push) את הקוד.

3. **חיבור ל-Vercel:**
   - היכנס לאתר [Vercel.com](https://vercel.com).
   - לחץ על **Add New Project**.
   - בחר את ה-Repository שיצרת ב-GitHub.
   - בהגדרות ה-Environment Variables, הוסף את המפתח: `API_KEY`.
   - לחץ על **Deploy**.

### אפשרות ב': Render

1. בצע את שלבים 1 ו-2 (העלאה ל-GitHub).
2. היכנס ל-[Render.com](https://render.com).
3. לחץ על **New +** ואז בחר **Static Site**.
4. חבר את ה-GitHub Repository שלך.
5. **הגדרות:**
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - תחת **Environment Variables**, הוסף את `API_KEY` עם המפתח שלך.
6. לחץ **Create Static Site**.

*טיפ: הפרויקט כולל קובץ `render.yaml`. אם תבחר ב-Render באופציה "Blueprints", הוא ימשוך את ההגדרות משם אוטומטית.*
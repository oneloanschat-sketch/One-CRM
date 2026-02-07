import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for directory path in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use process.env.PORT for Render/Heroku, otherwise 3000
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// --- Request Logger Middleware ---
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
     console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Helper to generate a date X hours ago
const hoursAgo = (hours) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

// Helper to generate date string YYYY-MM-DD X days ago
const daysAgoDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

// --- Mock Database (In-Memory) ---
let clients = [
  {
    id: '1001',
    firstName: 'ישראל',
    lastName: 'ישראלי',
    phone: '050-1234567',
    email: 'israel@example.com',
    requestedAmount: 1500000,
    status: 'בתהליך',
    monthlyIncome: 18000,
    creditScore: 820,
    joinedDate: daysAgoDate(2),
    createdAt: hoursAgo(48),
    notes: 'לקוח מחפש משכנתא לדירה ראשונה בראשון לציון.',
    documents: [
      { id: 'd1', name: 'תעודת זהות', type: 'PDF', isSigned: true, uploadDate: daysAgoDate(1) },
      { id: 'd2', name: 'תלושי שכר (3 חודשים)', type: 'PDF', isSigned: false, uploadDate: daysAgoDate(1) },
    ],
    reminders: [
      { id: 'r1', dueDate: '2023-11-20', dueTime: '10:00', note: 'להתקשר לבדוק סטטוס מסמכים', isCompleted: false }
    ]
  },
  {
    id: '1002',
    firstName: 'שרה',
    lastName: 'כהן',
    phone: '052-9876543',
    email: 'sara@example.com',
    requestedAmount: 850000,
    status: 'אושר',
    monthlyIncome: 12500,
    creditScore: 750,
    joinedDate: daysAgoDate(30),
    createdAt: hoursAgo(720),
    notes: 'משכנתא לשיפוץ. אישור עקרוני התקבל.',
    documents: [
      { id: 'd3', name: 'אישור בעלות', type: 'PDF', isSigned: true, uploadDate: daysAgoDate(29) },
    ],
    reminders: []
  },
  {
    id: '1003',
    firstName: 'דוד',
    lastName: 'לוי',
    phone: '054-5555555',
    email: 'david@example.com',
    requestedAmount: 2200000,
    status: 'חדש',
    monthlyIncome: 25000,
    creditScore: 680,
    joinedDate: daysAgoDate(0), 
    createdAt: hoursAgo(3.5), 
    notes: 'פנייה חדשה מאתר האינטרנט.',
    documents: [],
    reminders: []
  },
  {
    id: '1004',
    firstName: 'דניאל',
    lastName: 'גולן',
    phone: '052-2223334',
    email: 'dani@example.com',
    requestedAmount: 1800000,
    status: 'חדש',
    monthlyIncome: 21000,
    creditScore: 710,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(0.5), 
    notes: 'ליד טרי מהפייסבוק.',
    documents: [],
    reminders: []
  },
  {
    id: '1005',
    firstName: 'מיכל',
    lastName: 'אברהם',
    phone: '053-1112222',
    email: 'michal@test.com',
    requestedAmount: 3200000,
    status: 'בתהליך',
    monthlyIncome: 35000,
    creditScore: 850,
    joinedDate: daysAgoDate(5),
    createdAt: hoursAgo(120),
    notes: 'זוג הייטקיסטים, מחפשים משכנתא לפנטהאוז.',
    documents: [],
    reminders: []
  },
  {
    id: '1006',
    firstName: 'רועי',
    lastName: 'ניר',
    phone: '054-9998887',
    email: 'roi@test.com',
    requestedAmount: 900000,
    status: 'נדחה',
    monthlyIncome: 9000,
    creditScore: 540,
    joinedDate: daysAgoDate(15),
    createdAt: hoursAgo(360),
    notes: 'BDI שלילי, לא ניתן לקדם כרגע.',
    documents: [],
    reminders: []
  },
  {
    id: '1007',
    firstName: 'ענת',
    lastName: 'שחר',
    phone: '050-7776665',
    email: 'anat@test.com',
    requestedAmount: 1400000,
    status: 'שולם',
    monthlyIncome: 16000,
    creditScore: 780,
    joinedDate: daysAgoDate(45),
    createdAt: hoursAgo(1080),
    notes: 'תיק נסגר בהצלחה! משכנתא שולמה.',
    documents: [],
    reminders: []
  },
  {
    id: '1008',
    firstName: 'איתי',
    lastName: 'ברק',
    phone: '052-3334445',
    email: 'itay@test.com',
    requestedAmount: 2500000,
    status: 'אושר',
    monthlyIncome: 28000,
    creditScore: 810,
    joinedDate: daysAgoDate(10),
    createdAt: hoursAgo(240),
    notes: 'אישור עקרוני מבנק לאומי.',
    documents: [],
    reminders: []
  },
  {
    id: '1009',
    firstName: 'נועה',
    lastName: 'פרידמן',
    phone: '053-5554443',
    email: 'noa@test.com',
    requestedAmount: 1100000,
    status: 'חדש',
    monthlyIncome: 14000,
    creditScore: 690,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(5),
    notes: 'השאירה פרטים בבוט, לא חזרנו עדיין.',
    documents: [],
    reminders: []
  },
  {
    id: '1010',
    firstName: 'גיא',
    lastName: 'זוהר',
    phone: '054-2221119',
    email: 'guy@test.com',
    requestedAmount: 1650000,
    status: 'בתהליך',
    monthlyIncome: 19500,
    creditScore: 740,
    joinedDate: daysAgoDate(8),
    createdAt: hoursAgo(192),
    notes: 'שלח חלק מהמסמכים, חסר עובר ושב.',
    documents: [],
    reminders: []
  },
  {
    id: '1011',
    firstName: 'אורית',
    lastName: 'וקנין',
    phone: '050-8884441',
    email: 'orit@test.com',
    requestedAmount: 750000,
    status: 'אושר',
    monthlyIncome: 11000,
    creditScore: 720,
    joinedDate: daysAgoDate(20),
    createdAt: hoursAgo(480),
    notes: 'מחזור משכנתא.',
    documents: [],
    reminders: []
  },
  {
    id: '1012',
    firstName: 'ירון',
    lastName: 'בלום',
    phone: '052-6667778',
    email: 'yaron@test.com',
    requestedAmount: 4000000,
    status: 'חדש',
    monthlyIncome: 45000,
    creditScore: 880,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(0.1),
    notes: 'לקוח VIP, השאיר פרטים עכשיו.',
    documents: [],
    reminders: []
  },
  {
    id: '1013',
    firstName: 'מאיה',
    lastName: 'רום',
    phone: '053-9991113',
    email: 'maya@test.com',
    requestedAmount: 1300000,
    status: 'חדש',
    monthlyIncome: 15500,
    creditScore: 0,
    joinedDate: daysAgoDate(1),
    createdAt: hoursAgo(26), 
    notes: 'ליד שנשכח, דחוף לטיפול.',
    documents: [],
    reminders: []
  },
  {
    id: '1014',
    firstName: 'אלון',
    lastName: 'מזרחי',
    phone: '054-1231234',
    email: 'alon@test.com',
    requestedAmount: 1900000,
    status: 'בתהליך',
    monthlyIncome: 20000,
    creditScore: 760,
    joinedDate: daysAgoDate(3),
    createdAt: hoursAgo(72),
    notes: '',
    documents: [],
    reminders: []
  },
  {
    id: '1015',
    firstName: 'תמר',
    lastName: 'גל',
    phone: '050-4567890',
    email: 'tamar@test.com',
    requestedAmount: 2100000,
    status: 'חדש',
    monthlyIncome: 23000,
    creditScore: 790,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(1.5),
    notes: 'מעוניינת בגרירת משכנתא.',
    documents: [],
    reminders: []
  },
  {
    id: '1016',
    firstName: 'בן',
    lastName: 'ארי',
    phone: '052-8765432',
    email: 'ben@test.com',
    requestedAmount: 1250000,
    status: 'אושר',
    monthlyIncome: 13500,
    creditScore: 730,
    joinedDate: daysAgoDate(12),
    createdAt: hoursAgo(288),
    notes: 'קיבל אישור עקרוני מבנק מזרחי.',
    documents: [],
    reminders: []
  },
  {
    id: '1017',
    firstName: 'שירה',
    lastName: 'לב',
    phone: '054-3456789',
    email: 'shira@test.com',
    requestedAmount: 1750000,
    status: 'בתהליך',
    monthlyIncome: 19000,
    creditScore: 755,
    joinedDate: daysAgoDate(6),
    createdAt: hoursAgo(144),
    notes: 'חסרים תלושי שכר של הבעל.',
    documents: [],
    reminders: []
  },
  {
    id: '1018',
    firstName: 'יוני',
    lastName: 'סלע',
    phone: '053-9871234',
    email: 'yoni@test.com',
    requestedAmount: 880000,
    status: 'שולם',
    monthlyIncome: 12000,
    creditScore: 715,
    joinedDate: daysAgoDate(60),
    createdAt: hoursAgo(1440),
    notes: 'משכנתא לדירה להשקעה בבאר שבע.',
    documents: [],
    reminders: []
  },
  {
    id: '1019',
    firstName: 'דנה',
    lastName: 'מור',
    phone: '050-1122334',
    email: 'dana@test.com',
    requestedAmount: 2800000,
    status: 'חדש',
    monthlyIncome: 31000,
    creditScore: 840,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(4),
    notes: 'פנייה דחופה, צריכה אישור תוך 48 שעות.',
    documents: [],
    reminders: []
  },
  {
    id: '1020',
    firstName: 'אסף',
    lastName: 'טל',
    phone: '052-4455667',
    email: 'asaf@test.com',
    requestedAmount: 1550000,
    status: 'בתהליך',
    monthlyIncome: 17500,
    creditScore: 725,
    joinedDate: daysAgoDate(4),
    createdAt: hoursAgo(96),
    notes: 'בתהליך שמאות.',
    documents: [],
    reminders: []
  },
  // --- Even More Clients (Total 30) ---
  {
    id: '1021',
    firstName: 'ניר',
    lastName: 'שדה',
    phone: '052-1112233',
    email: 'nir@test.com',
    requestedAmount: 1850000,
    status: 'אושר',
    monthlyIncome: 22000,
    creditScore: 780,
    joinedDate: daysAgoDate(25),
    createdAt: hoursAgo(600),
    notes: 'משכנתא לנכס להשקעה בחיפה.',
    documents: [],
    reminders: []
  },
  {
    id: '1022',
    firstName: 'גלית',
    lastName: 'מור',
    phone: '054-6669999',
    email: 'galit@test.com',
    requestedAmount: 600000,
    status: 'נדחה',
    monthlyIncome: 7500,
    creditScore: 520,
    joinedDate: daysAgoDate(5),
    createdAt: hoursAgo(120),
    notes: 'הכנסה לא מספקת ביחס להחזר החודשי.',
    documents: [],
    reminders: []
  },
  {
    id: '1023',
    firstName: 'אמיר',
    lastName: 'פרץ',
    phone: '050-9998877',
    email: 'amir@test.com',
    requestedAmount: 1450000,
    status: 'חדש',
    monthlyIncome: 16500,
    creditScore: 710,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(2),
    notes: 'פנה דרך הפייסבוק, מתעניין במשכנתא הפוכה.',
    documents: [],
    reminders: []
  },
  {
    id: '1024',
    firstName: 'רונית',
    lastName: 'אלבז',
    phone: '053-4445566',
    email: 'ronit@test.com',
    requestedAmount: 1100000,
    status: 'שולם',
    monthlyIncome: 14000,
    creditScore: 760,
    joinedDate: daysAgoDate(90),
    createdAt: hoursAgo(2160),
    notes: 'תיק סגור, הלקוחה מרוצה.',
    documents: [],
    reminders: []
  },
  {
    id: '1025',
    firstName: 'קובי',
    lastName: 'מלכה',
    phone: '052-7771111',
    email: 'kobi@test.com',
    requestedAmount: 2400000,
    status: 'בתהליך',
    monthlyIncome: 29000,
    creditScore: 815,
    joinedDate: daysAgoDate(7),
    createdAt: hoursAgo(168),
    notes: 'ממתינים לתוצאות שמאות.',
    documents: [],
    reminders: []
  },
  {
    id: '1026',
    firstName: 'הילה',
    lastName: 'רון',
    phone: '054-2228888',
    email: 'hila@test.com',
    requestedAmount: 1600000,
    status: 'אושר',
    monthlyIncome: 19500,
    creditScore: 795,
    joinedDate: daysAgoDate(14),
    createdAt: hoursAgo(336),
    notes: 'לקראת חתימות בבנק.',
    documents: [],
    reminders: []
  },
  {
    id: '1027',
    firstName: 'מתן',
    lastName: 'כהן',
    phone: '050-3336666',
    email: 'matan@test.com',
    requestedAmount: 3800000,
    status: 'חדש',
    monthlyIncome: 42000,
    creditScore: 890,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(0.2),
    notes: 'לקוח פרימיום, מעוניין בווילה בסביון.',
    documents: [],
    reminders: []
  },
  {
    id: '1028',
    firstName: 'ליאור',
    lastName: 'אשכנזי',
    phone: '053-1110000',
    email: 'lior@test.com',
    requestedAmount: 950000,
    status: 'נדחה',
    monthlyIncome: 10000,
    creditScore: 580,
    joinedDate: daysAgoDate(3),
    createdAt: hoursAgo(72),
    notes: 'היסטוריית אשראי בעייתית (צ׳קים חוזרים).',
    documents: [],
    reminders: []
  },
  {
    id: '1029',
    firstName: 'קרן',
    lastName: 'פלג',
    phone: '052-5559999',
    email: 'keren@test.com',
    requestedAmount: 1300000,
    status: 'בתהליך',
    monthlyIncome: 15000,
    creditScore: 740,
    joinedDate: daysAgoDate(10),
    createdAt: hoursAgo(240),
    notes: 'בודקים אפשרות לגרייס חלקי.',
    documents: [],
    reminders: []
  },
  {
    id: '1030',
    firstName: 'אבי',
    lastName: 'ביטון',
    phone: '054-8887777',
    email: 'avi@test.com',
    requestedAmount: 1950000,
    status: 'שולם',
    monthlyIncome: 21000,
    creditScore: 805,
    joinedDate: daysAgoDate(55),
    createdAt: hoursAgo(1320),
    notes: 'מחזור משכנתא בוצע בהצלחה.',
    documents: [],
    reminders: []
  }
];

// --- API Routes ---

app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.post('/api/clients', (req, res) => {
  const newClient = req.body;
  if (!newClient.id) {
    newClient.id = Date.now().toString();
  }
  // Ensure createdAt exists
  if (!newClient.createdAt) {
      newClient.createdAt = new Date().toISOString();
  }
  
  clients.unshift(newClient);
  res.status(201).json(newClient);
});

app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updatedData };
    res.json(clients[index]);
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});

app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    const deletedClient = clients[index];
    clients.splice(index, 1);
    console.log(`>>> Client Deleted: ${deletedClient.firstName} (ID: ${id})`);
    res.json({ message: 'Client deleted', id });
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});

// GET: Webhook status check
app.get('/api/webhook', (req, res) => {
  res.status(200).send('Webhook is active. Send POST request with JSON data.');
});

// POST: Webhook for WhatsApp Bot (Smart UPSERT Logic)
app.post('/api/webhook', (req, res) => {
  console.log('--- Webhook Request Received ---');
  console.log('Headers:', JSON.stringify(req.headers['content-type']));
  console.log('Body:', JSON.stringify(req.body));

  const { firstName, lastName, phone, email, requestedAmount, source, notes } = req.body;
  
  // Basic Validation
  if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Error: Empty body received');
      return res.status(400).json({ status: 'error', message: 'No data received. Ensure Content-Type is application/json' });
  }

  if (!phone) {
      console.error('Error: Missing phone number');
      return res.status(400).json({ status: 'error', message: 'Missing phone number (required field)' });
  }

  // Normalize phone (remove dashes just for comparison)
  const cleanPhone = phone.toString().replace(/\D/g, '');

  // 1. Check if client exists by phone (checking both raw and clean versions)
  const existingClientIndex = clients.findIndex(c => c.phone === phone || c.phone.replace(/\D/g, '') === cleanPhone);

  if (existingClientIndex !== -1) {
      // --- UPDATE EXISTING CLIENT ---
      const existingClient = clients[existingClientIndex];
      const timeStr = new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'});
      const dateStr = new Date().toLocaleDateString('he-IL');
      
      const updateNote = `\n[${dateStr} ${timeStr}] עדכון מהבוט: ${notes || 'הלקוח יצר קשר נוסף'}`;
      
      const updatedClient = {
          ...existingClient,
          // Update fields only if provided and not empty
          email: email || existingClient.email,
          requestedAmount: requestedAmount ? Number(requestedAmount) : existingClient.requestedAmount,
          firstName: firstName || existingClient.firstName,
          lastName: lastName || existingClient.lastName,
          notes: existingClient.notes + updateNote
      };

      // Move to top of list
      clients.splice(existingClientIndex, 1);
      clients.unshift(updatedClient);

      console.log(`>>> Client Updated: ${updatedClient.firstName} (ID: ${updatedClient.id})`);
      return res.status(200).json({ status: 'updated', clientId: updatedClient.id, message: 'Client found and updated' });

  } else {
      // --- CREATE NEW CLIENT ---
      const newClient = {
          id: Date.now().toString(),
          firstName: firstName || 'לקוח',
          lastName: lastName || 'חדש',
          phone: phone, // Keep original format
          email: email || '',
          requestedAmount: Number(requestedAmount) || 0,
          status: 'חדש',
          monthlyIncome: 0,
          creditScore: 0,
          joinedDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(), // TIMESTAMP FOR KPI
          notes: notes ? `ליד חדש מהבוט: ${notes}` : `ליד נקלט אוטומטית ממקור: ${source || 'Bot'}`,
          documents: [],
          reminders: []
      };

      clients.unshift(newClient);
      console.log(`>>> New Client Created: ${firstName} (ID: ${newClient.id})`);
      return res.status(200).json({ status: 'created', clientId: newClient.id, message: 'New client created' });
  }
});

// --- SERVE STATIC FILES (PRODUCTION) ---
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- Keep Alive Mechanism for Render ---
const keepAlive = () => {
    // Ping every 14 minutes (Render sleeps after 15 minutes of inactivity)
    // 14 * 60 * 1000 = 840000 ms
    const interval = 14 * 60 * 1000; 
    
    // Attempt to use the external URL if defined (Render sets this), otherwise localhost
    // Note: Hitting localhost usually keeps the process active in simple container setups, 
    // but hitting the public URL is safer if network ingress is the sleep trigger.
    const url = process.env.RENDER_EXTERNAL_URL 
        ? `${process.env.RENDER_EXTERNAL_URL}/api/webhook`
        : `http://127.0.0.1:${PORT}/api/webhook`;

    console.log(`[KeepAlive] Setup: Pinging ${url} every 14 minutes.`);

    setInterval(async () => {
        try {
            const response = await fetch(url);
            console.log(`[KeepAlive] Ping sent to ${url}. Status: ${response.status}`);
        } catch (error) {
            console.error(`[KeepAlive] Ping failed: ${error.message}`);
        }
    }, interval);
};

// Listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`--------------------------------------------------`);
  console.log(`CRM Server running on port ${PORT}`);
  console.log(`Webhook Endpoint: POST /api/webhook`);
  console.log(`--------------------------------------------------`);
  
  // Start the keep-alive loop
  keepAlive();
});
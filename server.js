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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- Mock Database (In-Memory) ---
// Note: In a real production app, use MongoDB, PostgreSQL, or Firebase.
// Data here resets when the server restarts.
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
    joinedDate: '2023-10-15',
    notes: 'לקוח מחפש משכנתא לדירה ראשונה בראשון לציון.',
    documents: [
      { id: 'd1', name: 'תעודת זהות', type: 'PDF', isSigned: true, uploadDate: '2023-10-16' },
      { id: 'd2', name: 'תלושי שכר (3 חודשים)', type: 'PDF', isSigned: false, uploadDate: '2023-10-17' },
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
    joinedDate: '2023-09-20',
    notes: 'משכנתא לשיפוץ. אישור עקרוני התקבל.',
    documents: [
      { id: 'd3', name: 'אישור בעלות', type: 'PDF', isSigned: true, uploadDate: '2023-09-21' },
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
    joinedDate: '2023-10-25',
    notes: 'פנייה חדשה מאתר האינטרנט.',
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

// GET: Webhook status check
app.get('/api/webhook', (req, res) => {
  res.status(200).send('Webhook is active. Use POST to send data.');
});

// POST: Webhook for WhatsApp Bot (Smart UPSERT Logic)
app.post('/api/webhook', (req, res) => {
  const { firstName, lastName, phone, email, requestedAmount, source, notes } = req.body;
  
  console.log('>>> Webhook Received:', req.body);

  if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Missing phone number' });
  }

  // 1. Check if client exists by phone
  const existingClientIndex = clients.findIndex(c => c.phone === phone);

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

      // Move to top of list (optional: to show recent activity)
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
          phone,
          email: email || '',
          requestedAmount: Number(requestedAmount) || 0,
          status: 'חדש',
          monthlyIncome: 0,
          creditScore: 0,
          joinedDate: new Date().toISOString().split('T')[0],
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
// This enables the server to serve the React app after 'npm run build'
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Routing, return all requests to React app
app.get('*', (req, res) => {
  // Check if request is for API, if so, don't return html
  if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`--------------------------------------------------`);
  console.log(`CRM Server running on port ${PORT}`);
  console.log(`Webhook Endpoint: POST /api/webhook`);
  console.log(`--------------------------------------------------`);
});
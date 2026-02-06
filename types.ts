export enum MortgageStatus {
  NEW = 'חדש',
  IN_PROCESS = 'בתהליך',
  APPROVED = 'אושר',
  REJECTED = 'נדחה',
  PAID = 'שולם'
}

export interface Document {
  id: string;
  name: string;
  type: string;
  isSigned: boolean;
  uploadDate: string;
}

export interface Reminder {
  id: string;
  dueDate: string;
  dueTime: string;
  note: string;
  isCompleted: boolean;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  requestedAmount: number;
  status: MortgageStatus;
  documents: Document[];
  reminders: Reminder[];
  notes: string;
  joinedDate: string;
  monthlyIncome: number;
  creditScore: number;
}

export interface KpiData {
  totalClients: number;
  activeProcesses: number;
  conversionRate: number;
  totalVolume: number;
}
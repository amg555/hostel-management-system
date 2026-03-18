// lib/constants.ts
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' }
];

export const PAYMENT_TYPES = [
  { value: 'monthly_rent', label: 'Monthly Rent' },
  { value: 'admission_fee', label: 'Admission Fee' },
  { value: 'security_deposit', label: 'Security Deposit' },
  { value: 'other', label: 'Other' }
];

export const COMPLAINT_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'food', label: 'Food' },
  { value: 'security', label: 'Security' },
  { value: 'wifi', label: 'WiFi/Internet' },
  { value: 'other', label: 'Other' }
];

export const ROOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
  { value: 'dormitory', label: 'Dormitory' }
];
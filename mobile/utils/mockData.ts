export const HOME_STATS = [
  { id: '1', icon: '🐟', label: 'Total Ponds', value: '2', color: 'infoBlue' as const },
  { id: '2', icon: '🌿', label: 'Active Species', value: '3', color: 'green' as const },
  { id: '3', icon: '💰', label: 'This Month', value: '₹12,500', color: 'red' as const },
  { id: '4', icon: '⚠️', label: 'Diseases', value: '1', color: 'amber' as const },
];

export const RECENT_ACTIVITY = [
  { id: '1', icon: '🦠', text: 'Disease diagnosed: White Spot', time: 'Today, 2:30 PM', color: 'red' as const },
  { id: '2', icon: '💸', text: 'Expense logged: ₹12,000 (Feed)', time: 'Today, 10:30 AM', color: 'purple' as const },
  { id: '3', icon: '🤖', text: 'Asked Advisor about water pH', time: 'Yesterday', color: 'green' as const },
  { id: '4', icon: '💵', text: 'Income logged: ₹45,000 (Sale)', time: '2 days ago', color: 'success' as const },
];

export const MOCK_DIAGNOSIS = [
  {
    id: '1',
    diseaseName: 'Epidemic Ulcerative Disease',
    confidence: 92,
    severity: 'high' as const,
    description: 'EUS detected. Remove infected fish, apply potassium permanganate.',
    date: 'Today',
  },
  {
    id: '2',
    diseaseName: 'White Spot Disease',
    confidence: 87,
    severity: 'medium' as const,
    description: 'Whitespot on gills. Increase water temperature, add salt.',
    date: 'Yesterday',
  },
];

export const MOCK_VOICE_TXS = [
  { id: '1', type: 'expense' as const, amount: 12000, category: 'Feed', description: 'Super feed purchase', date: 'Today' },
  { id: '2', type: 'income' as const, amount: 45000, category: 'Sale', description: 'Fish sale to trader', date: 'Yesterday' },
  { id: '3', type: 'expense' as const, amount: 5000, category: 'Medicine', description: 'Vitamins and probiotics', date: '2 days ago' },
];

export const EXPENSE_CATEGORIES = ['Feed', 'Seed', 'Medicine', 'Labor', 'Equipment', 'Other'];
export const INCOME_CATEGORIES = ['Sale', 'Harvest', 'Subsidy', 'Other'];

export const AQUAADVISOR_SUGGESTED = [
  'Water quality tips',
  'Best feed for shrimp?',
  'White spot signs?',
  'When to harvest?',
];

export const AQUAADVISOR_AI: Record<string, string> = {
  water: 'Maintain pH 7–8.5, ammonia < 0.02 ppm. Check daily.',
  feed: 'Use 30% protein feed. Feed 3–4% of body weight.',
  white: 'White spot: add salt 10g/L, raise temp to 30°C.',
  harvest: 'Harvest at 90–120 days. Check market price first.',
  default: 'I can help with water quality, feed, diseases, or harvesting. Ask away!',
};

export const AQUACONNECT_ALERTS = [
  { id: '1', text: 'New government subsidy announced for aquaculture', type: 'info' as const, date: 'Today' },
  { id: '2', text: 'Water quality alert: pH levels dropping in region', type: 'warning' as const, date: 'Yesterday' },
  { id: '3', text: 'Training session on organic farming this Saturday', type: 'success' as const, date: '2 days ago' },
];

export const AQUACONNECT_MEMBERS = [
  { id: '1', name: 'Ravi Kumar', ponds: 3, joined: '6 months ago' },
  { id: '2', name: 'Srinivas Rao', ponds: 2, joined: '1 year ago' },
  { id: '3', name: 'Prasad Reddy', ponds: 5, joined: '2 years ago' },
  { id: '4', name: 'Venkat Sharma', ponds: 1, joined: '3 months ago' },
  { id: '5', name: 'Lakshmi Devi', ponds: 4, joined: '1.5 years ago' },
];

export const AQUACONNECT_RESOURCES = [
  { id: '1', title: 'Best Practices Guide', type: 'document' as const },
  { id: '2', title: 'Emergency Contacts', type: 'contact' as const },
  { id: '3', title: 'Government Schemes 2024', type: 'link' as const },
  { id: '4', title: 'Feed Suppliers List', type: 'document' as const },
];

export const AQUACONNECT_STATS = [
  { icon: '👥', value: '24', label: 'Members' },
  { icon: '🐟', value: '89', label: 'Total Ponds' },
  { icon: '📊', value: '₹2.4L', label: 'Avg Revenue' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
];

export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'AquaNexus AI — B.Tech Final Year Project';

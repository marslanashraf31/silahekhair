export interface Program {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  purpose: string;
  deliveryMethod: string;
  impactExplanation: string;
  iconName: string;
  featuredImage?: string;
  status?: 'published' | 'draft' | 'archived';
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  description: string;
  isVerifiedLive: boolean;
  source: string;
}

export interface FinancialSummary {
  totalContributions: number | null;
  totalExpenses: number | null;
  availableBalance: number | null;
  lastUpdated: string;
}

export interface MembershipApplication {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  pledgedAmount: string;
  city?: string;
  occupation?: string;
  reference?: string;
  motivation?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'active';
  rejectionReason?: string;
  password?: string;
}

export interface MemberRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  area?: string;
  cnic?: string;
  emergencyContact?: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate?: string;
  joinDate?: string;
  monthlyContribution?: string;
  monthlyPledge?: number;
  points?: number;
  level?: string;
  achievements?: string[];
  password?: string;
}

export interface ContributionRecord {
  id: string;
  contributionCode?: string;
  memberId: string;
  memberName: string;
  month: string; // e.g. "Aug 2026"
  amount: number;
  paymentDate: string;
  paymentMethod: 'JazzCash' | 'EasyPaisa' | 'Cash' | 'Bank Transfer' | 'NayaPay' | 'Other';
  senderAccountName?: string;
  senderAccountNumber?: string;
  reference?: string;
  receiptReference?: string;
  receiptImage?: string;
  status: 'Paid' | 'Pending' | 'Pending Review' | 'Cancelled';
  notes?: string;
  submissionType?: 'member_contribution' | 'public_donation';
}

export interface SubExpenseItem {
  id?: string;
  name: string;
  amount: number;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: 'Ration Support' | 'Food Distribution' | 'Medical Relief' | 'Education Support' | 'Operations' | 'Other' | string;
  amount: number;
  description: string;
  eventId?: string;
  eventName?: string;
  items?: SubExpenseItem[];
  receiptAvailable: boolean;
  receiptImage?: string;
  status?: 'Confirmed' | 'Pending' | 'Archived';
  notes?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Ration Support' | 'Food Distribution' | 'Medical Aid' | 'Community';
  imageUrl: string;
  caption: string;
  date: string;
  location?: string;
}

export interface UpdateArticle {
  id: string;
  title: string;
  date: string;
  category: 'Announcement' | 'Distribution Report' | 'Foundation Update' | 'Community Story';
  summary: string;
  content: string;
  imageUrl?: string;
  readTime?: string;
  tag?: string;
  status?: 'published' | 'draft' | 'archived';
}

export interface EventRegistration {
  memberId: string;
  memberName: string;
  registeredAt: string;
  attended?: boolean;
  pointsAwarded?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  category: 'Community Ration Distribution' | 'Meal Distribution Drive' | 'Fundraising / Community Event' | 'Volunteer Activity' | 'Educational Support Event' | 'Other';
  registrationEnabled: boolean;
  maxParticipants?: number;
  pointsForAttendance: number;
  status: 'published' | 'draft' | 'completed' | 'cancelled';
  registrations: EventRegistration[];
}

export interface PointActivityConfig {
  id: string;
  activity: string;
  defaultPoints: number;
  description: string;
  active: boolean;
}

export interface PointTransaction {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  activity: string;
  eventId?: string;
  points: number;
  runningTotal: number;
  reason?: string;
  adminName?: string;
}

export interface MemberLevelConfig {
  id: string;
  levelName: string;
  minPoints: number;
  maxPoints: number;
  description: string;
  benefits: string[];
  status: 'active' | 'inactive';
}

export interface NotificationItem {
  id: string;
  type: 'application' | 'contribution' | 'expense' | 'event' | 'points' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface AuditLogItem {
  id: string;
  adminName: string;
  action: string;
  module: string;
  recordId: string;
  reason?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface NavItem {
  label: string;
  path: string;
}

export interface FoundationSettings {
  coordinatorTitle: string;
  adminEmail: string;
  whatsappNumber: string;
  foundationEmail: string;
  foundationAddress: string;
  emailNotifications: boolean;
  whatsappAlerts: boolean;
}


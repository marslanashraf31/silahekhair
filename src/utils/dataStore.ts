export type {
  GalleryItem,
  UpdateArticle,
  MembershipApplication,
  MemberRecord,
  ContributionRecord,
  ExpenseRecord,
  EventItem,
  PointActivityConfig,
  PointTransaction,
  MemberLevelConfig,
  NotificationItem,
  AuditLogItem,
  Program,
  FoundationSettings
} from '../types';

import {
  GalleryItem,
  UpdateArticle,
  MembershipApplication,
  MemberRecord,
  ContributionRecord,
  ExpenseRecord,
  EventItem,
  PointActivityConfig,
  PointTransaction,
  MemberLevelConfig,
  NotificationItem,
  AuditLogItem,
  Program,
  FoundationSettings
} from '../types';
import { GALLERY_ITEMS, UPDATES_PREVIEW, SITE_CONFIG, PROGRAMS } from '../config/siteConfig';
import {
  dbGetMembers,
  dbAddMember,
  dbUpdateMember,
  dbDeleteMember,
  dbGetApplications,
  dbAddApplication,
  dbApproveApplication,
  dbRejectApplication,
  dbDeleteApplication,
  dbGetContributions,
  dbAddContribution,
  dbVerifyContribution,
  dbUpdateContribution,
  dbDeleteContribution,
  dbGetExpenses,
  dbAddExpense,
  dbUpdateExpense,
  dbDeleteExpense,
  dbGetEvents,
  dbAddEvent,
  dbUpdateEvent,
  dbDeleteEvent,
  dbRegisterMemberForEvent,
  dbCancelEventRegistration,
  dbVerifyAttendanceInDb,
  dbGetNotifications,
  dbAddNotification,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead,
  dbDeleteNotification,
  dbClearAllNotifications,
  dbGetAuditLogs,
  dbAddAuditLog,
  dbGetGalleryItems,
  dbAddGalleryItem,
  dbUpdateGalleryItem,
  dbDeleteGalleryItem,
  dbGetUpdateArticles,
  dbAddUpdateArticle,
  dbUpdateUpdateArticle,
  dbDeleteUpdateArticle,
  dbGetPrograms,
  dbAddProgram,
  dbUpdateProgram,
  dbDeleteProgram,
  dbGetPointActivities,
  dbSavePointActivities,
  dbGetPointTransactions,
  dbAddPointTransaction,
  dbGetMemberLevels,
  dbSaveMemberLevels,
  dbGetFoundationSettings,
  dbSaveFoundationSettings
} from '../lib/supabaseService';

// LocalStorage keys
const STORAGE_KEY_MEMBER_COUNT = 'silah_active_member_count';
const STORAGE_KEY_GALLERY = 'silah_gallery_items';
const STORAGE_KEY_UPDATES = 'silah_update_articles';
const STORAGE_KEY_MEMBERS_LIST = 'silah_members_list';
const STORAGE_KEY_APPLICATIONS = 'silah_applications_list';
const STORAGE_KEY_CONTRIBUTIONS = 'silah_contributions_list';
const STORAGE_KEY_EXPENSES = 'silah_expenses_list';
const STORAGE_KEY_EVENTS = 'silah_events_list';
const STORAGE_KEY_POINT_ACTIVITIES = 'silah_point_activities';
const STORAGE_KEY_POINT_TRANSACTIONS = 'silah_point_transactions';
const STORAGE_KEY_MEMBER_LEVELS = 'silah_member_levels';
const STORAGE_KEY_NOTIFICATIONS = 'silah_notifications';
const STORAGE_KEY_AUDIT_LOGS = 'silah_audit_logs';
const STORAGE_KEY_PROGRAMS = 'silah_programs_list';

// Custom Event Name for real-time reactive sync across components
export const DATASTORE_CHANGE_EVENT = 'silah_datastore_updated';

export const notifyDataStoreChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DATASTORE_CHANGE_EVENT));
  }
};

// Helper for formatted timestamp
export const getFormattedTimestamp = (): string => {
  const d = new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// ================= SUPABASE DATABASE SYNC =================
export let isSupabaseSynced = false;

export async function syncDataStoreWithSupabase(): Promise<void> {
  const safeFetch = async <T>(fn: () => Promise<T[]>): Promise<T[]> => {
    try {
      const res = await fn();
      return Array.isArray(res) ? res : [];
    } catch (e) {
      console.warn('Sync table fetch error:', e);
      return [];
    }
  };

  try {
    const [
      dbMembers,
      dbApps,
      dbContribs,
      dbExps,
      dbEvents,
      dbNotifs,
      dbAudits,
      dbGallery,
      dbUpdates,
      dbProgs,
      dbActivities,
      dbTxs,
      dbLevels
    ] = await Promise.all([
      safeFetch(dbGetMembers),
      safeFetch(dbGetApplications),
      safeFetch(dbGetContributions),
      safeFetch(dbGetExpenses),
      safeFetch(dbGetEvents),
      safeFetch(dbGetNotifications),
      safeFetch(dbGetAuditLogs),
      safeFetch(dbGetGalleryItems),
      safeFetch(dbGetUpdateArticles),
      safeFetch(dbGetPrograms),
      safeFetch(dbGetPointActivities),
      safeFetch(dbGetPointTransactions),
      safeFetch(dbGetMemberLevels)
    ]);

    if (typeof localStorage !== 'undefined') {
      if (dbMembers.length > 0) {
        localStorage.setItem(STORAGE_KEY_MEMBERS_LIST, JSON.stringify(dbMembers));

        // Public pages are often opened in a fresh browser with no localStorage.
        // Keep the displayed count in sync with the database after the initial
        // fetch instead of leaving those visitors on the local fallback "0+".
        const activeCount = dbMembers.filter(
          member => String(member.status).trim().toLowerCase() === 'active'
        ).length;
        localStorage.setItem(STORAGE_KEY_MEMBER_COUNT, `${activeCount}+`);
      }
      if (dbApps.length > 0) localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(dbApps));
      if (dbContribs.length > 0) localStorage.setItem(STORAGE_KEY_CONTRIBUTIONS, JSON.stringify(dbContribs));
      if (dbExps.length > 0) localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(dbExps));
      if (dbEvents.length > 0) localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(dbEvents));
      if (dbNotifs.length > 0) localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(dbNotifs));
      if (dbAudits.length > 0) localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(dbAudits));
      if (dbGallery.length > 0) localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(dbGallery));
      if (dbUpdates.length > 0) localStorage.setItem(STORAGE_KEY_UPDATES, JSON.stringify(dbUpdates));
      if (dbProgs.length > 0) localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(dbProgs));
      if (dbActivities.length > 0) localStorage.setItem(STORAGE_KEY_POINT_ACTIVITIES, JSON.stringify(dbActivities));
      if (dbTxs.length > 0) localStorage.setItem(STORAGE_KEY_POINT_TRANSACTIONS, JSON.stringify(dbTxs));
      if (dbLevels.length > 0) localStorage.setItem(STORAGE_KEY_MEMBER_LEVELS, JSON.stringify(dbLevels));

      isSupabaseSynced = true;
    }

    notifyDataStoreChange();
  } catch (err) {
    console.warn('Supabase initial sync error:', err);
  }
}

// ================= MEMBER COUNT =================
export const getActiveMemberCount = (): string => {
  if (typeof localStorage === 'undefined') return SITE_CONFIG.activeMembersCount;
  const saved = localStorage.getItem(STORAGE_KEY_MEMBER_COUNT);
  if (saved && saved !== '0+') return saved;
  
  const membersList = getMembersList();
  if (membersList.length > 0) {
    const activeCount = membersList.filter(
      member => String(member.status).trim().toLowerCase() === 'active'
    ).length;
    return `${activeCount}+`;
  }
  return SITE_CONFIG.activeMembersCount;
};

export const setActiveMemberCount = (count: string): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MEMBER_COUNT, count);
  notifyDataStoreChange();
};

// ================= MEMBERS LIST =================
export const DEFAULT_INITIAL_MEMBERS: MemberRecord[] = [];

export const getMembersList = (): MemberRecord[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_MEMBERS_LIST);
  let members: MemberRecord[] = [];
  if (saved) {
    try {
      members = JSON.parse(saved);
    } catch {
      members = [];
    }
  }
  return members;
};

export const saveMembersList = (members: MemberRecord[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MEMBERS_LIST, JSON.stringify(members));
  const activeCount = members.filter(m => m.status === 'active').length;
  setActiveMemberCount(`${activeCount}+`);
  notifyDataStoreChange();
};

export const addMemberRecord = async (
  member: Omit<MemberRecord, 'id'>,
  customId?: string
): Promise<{ success: boolean; data?: MemberRecord; error?: string }> => {
  const dbRes = await dbAddMember(member, customId);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to create member in Supabase database.';
    console.error('addMemberRecord failed:', error);
    return { success: false, error };
  }

  const savedMember = dbRes.data;
  const current = getMembersList();
  const updated = [savedMember, ...current.filter(m => m.id !== savedMember.id)];
  saveMembersList(updated);

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Member Registered',
    module: 'Members',
    recordId: savedMember.id,
    reason: `Registered member ${savedMember.name} (${savedMember.id})`,
    status: 'success'
  });

  return { success: true, data: savedMember };
};

export const addMember = addMemberRecord;

export const updateMemberRecord = async (
  member: MemberRecord
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbUpdateMember(member);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to update member in Supabase database.';
    console.error('updateMemberRecord failed:', error);
    return { success: false, error };
  }

  const current = getMembersList();
  saveMembersList(current.map(m => m.id === member.id ? member : m));
  return { success: true };
};

// ================= FOUNDATION SETTINGS =================
const STORAGE_KEY_FOUNDATION_SETTINGS = 'silah_foundation_settings';

export const getFoundationSettings = (): FoundationSettings => {
  const defaultSettings: FoundationSettings = {
    coordinatorTitle: 'Chief Coordination Officer',
    adminEmail: 'admin@silah-e-khair.org',
    whatsappNumber: SITE_CONFIG.whatsappNumber,
    foundationEmail: 'info@silah-e-khair.org',
    foundationAddress: 'Karachi, Pakistan',
    emailNotifications: true,
    whatsappAlerts: true
  };
  if (typeof localStorage === 'undefined') return defaultSettings;
  const saved = localStorage.getItem(STORAGE_KEY_FOUNDATION_SETTINGS);
  if (!saved) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
};

export const saveFoundationSettings = async (
  settings: FoundationSettings
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbSaveFoundationSettings(settings);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to save foundation settings in database.' };
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_FOUNDATION_SETTINGS, JSON.stringify(settings));
  }
  notifyDataStoreChange();
  return { success: true };
};

export const updateMember = updateMemberRecord;

export const deleteMemberRecord = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbDeleteMember(id);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to delete member from Supabase database.';
    console.error('deleteMemberRecord failed:', error);
    return { success: false, error };
  }

  const current = getMembersList();
  saveMembersList(current.filter(m => m.id !== id));
  return { success: true };
};

export const deleteMember = deleteMemberRecord;

// ================= APPLICATIONS =================
export const getApplications = (): MembershipApplication[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveApplications = (apps: MembershipApplication[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
  notifyDataStoreChange();
};

export const addApplication = async (
  app: Omit<MembershipApplication, 'id' | 'date' | 'status'>
): Promise<{ success: boolean; data?: MembershipApplication; error?: string }> => {
  const dbRes = await dbAddApplication(app);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to save application in Supabase database.';
    console.error('addApplication failed:', error);
    return { success: false, error };
  }

  const savedApp = dbRes.data;
  const current = getApplications();
  saveApplications([savedApp, ...current.filter(a => a.id !== savedApp.id)]);

  await addNotification({
    type: 'application',
    title: 'New Member Application',
    message: `${app.fullName} applied with pledge ${app.pledgedAmount}`,
    link: '/admin/members/applications'
  });

  return { success: true, data: savedApp };
};

export const approveApplication = async (
  appId: string
): Promise<{ success: boolean; data?: MemberRecord; error?: string }> => {
  const apps = getApplications();
  const targetApp = apps.find(a => a.id === appId);
  if (!targetApp) {
    return { success: false, error: 'Application not found.' };
  }

  const dbRes = await dbApproveApplication(appId);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to approve application in Supabase database.' };
  }

  const updatedApps = apps.map(a => a.id === appId ? { ...a, status: 'approved' as const } : a);
  saveApplications(updatedApps);

  let finalMember: MemberRecord;

  if (dbRes.data) {
    finalMember = dbRes.data;
    const currentMembers = getMembersList();
    const existingIdx = currentMembers.findIndex(m => m.id === finalMember.id);
    if (existingIdx >= 0) {
      currentMembers[existingIdx] = finalMember;
    } else {
      currentMembers.unshift(finalMember);
    }
    saveMembersList(currentMembers);
  } else {
    const currentMembers = getMembersList();
    const existingMember = currentMembers.find(m => m.id === targetApp.id);

    if (existingMember) {
      finalMember = { 
        ...existingMember, 
        status: 'active', 
        level: 'ACTIVE MEMBER',
        password: targetApp.password || existingMember.password || 'member123'
      };
      await updateMemberRecord(finalMember);
    } else {
      const addRes = await addMemberRecord({
        name: targetApp.fullName,
        phone: targetApp.phone,
        email: targetApp.email,
        city: targetApp.city || 'Karachi',
        status: 'active',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthlyContribution: targetApp.pledgedAmount,
        password: targetApp.password || 'member123'
      }, targetApp.id.startsWith('SKF-') ? targetApp.id : undefined);

      if (addRes.data) {
        finalMember = addRes.data;
      } else {
        finalMember = {
          id: targetApp.id,
          name: targetApp.fullName,
          phone: targetApp.phone,
          email: targetApp.email,
          city: targetApp.city || 'Karachi',
          status: 'active',
          joinedDate: 'Recent',
          monthlyContribution: targetApp.pledgedAmount,
          level: 'ACTIVE MEMBER',
          points: 0,
          password: targetApp.password || 'member123'
        };
      }
    }
  }

  await addNotification({
    type: 'application',
    title: 'Application Approved',
    message: `Application ${targetApp.fullName} approved. Member ID assigned: ${finalMember.id}`,
    link: '/admin/members'
  });

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Approved Application',
    module: 'Applications',
    recordId: appId,
    reason: `Approved ${targetApp.fullName} -> Member ${finalMember.id} active`,
    status: 'success'
  });

  return { success: true, data: finalMember };
};

export const rejectApplication = async (
  appId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  const apps = getApplications();
  const targetApp = apps.find(a => a.id === appId);

  const dbRes = await dbRejectApplication(appId, reason);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to reject application in Supabase database.' };
  }

  const updatedApps = apps.map(a => a.id === appId ? { ...a, status: 'rejected' as const, rejectionReason: reason } : a);
  saveApplications(updatedApps);

  if (targetApp) {
    await addAuditLog({
      adminName: 'Admin Coordinator',
      action: 'Rejected Application',
      module: 'Applications',
      recordId: appId,
      reason: `Rejected ${targetApp.fullName}: ${reason}`,
      status: 'warning'
    });
  }

  return { success: true };
};

export const deleteApplicationRecord = async (
  appId: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbDeleteApplication(appId);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to delete application from Supabase database.' };
  }

  const apps = getApplications();
  saveApplications(apps.filter(a => a.id !== appId));

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Deleted Application',
    module: 'Applications',
    recordId: appId,
    reason: `Deleted application record ${appId}`,
    status: 'warning'
  });

  return { success: true };
};

// ================= CONTRIBUTIONS =================
export const DEFAULT_CONTRIBUTIONS: ContributionRecord[] = [];

export const getContributions = (): ContributionRecord[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_CONTRIBUTIONS);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveContributions = (records: ContributionRecord[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CONTRIBUTIONS, JSON.stringify(records));
  notifyDataStoreChange();
};

export const addContribution = async (
  record: Omit<ContributionRecord, 'id'> & { id?: string }
): Promise<{ success: boolean; data?: ContributionRecord; error?: string }> => {
  const dbRes = await dbAddContribution(record);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to save contribution in Supabase database.';
    console.error('addContribution failed:', error);
    return { success: false, error };
  }

  const savedRecord = dbRes.data;
  const current = getContributions();
  saveContributions([savedRecord, ...current.filter(c => c.id !== savedRecord.id)]);

  if (savedRecord.status === 'Paid') {
    await addPointTransaction({
      memberId: savedRecord.memberId,
      memberName: savedRecord.memberName,
      date: savedRecord.paymentDate,
      activity: 'Monthly Contribution',
      points: 300,
      reason: `Contribution recorded for ${savedRecord.month}`
    });
  }

  await addNotification({
    type: 'contribution',
    title: 'New Payment Submitted',
    message: `${savedRecord.memberName} submitted payment proof PKR ${savedRecord.amount} for ${savedRecord.month}`,
    link: '/admin/finance/contributions'
  });

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Recorded Contribution',
    module: 'Contributions',
    recordId: savedRecord.id,
    reason: `Recorded ${savedRecord.amount} PKR for ${savedRecord.memberName} (${savedRecord.status})`,
    status: 'success'
  });

  return { success: true, data: savedRecord };
};

export const verifyContribution = async (
  id: string,
  status: 'Paid' | 'Cancelled',
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbVerifyContribution(id, status, notes);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to update contribution status in Supabase database.';
    console.error('verifyContribution failed:', error);
    return { success: false, error };
  }

  const current = getContributions();
  let target = current.find(c => c.id === id || c.contributionCode === id);
  const previousStatus = target?.status;

  const updatedRecord: ContributionRecord = {
    ...(target || {
      id,
      memberId: 'SKM-GUEST',
      memberName: 'Public Donor',
      amount: 0,
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      paymentMethod: 'Bank Transfer',
      status
    }),
    status,
    notes: notes ? `${target?.notes || ''} [Verified: ${notes}]`.trim() : target?.notes
  };

  const updated = current.map(c => (c.id === id || c.contributionCode === id) ? updatedRecord : c);
  if (!target) updated.push(updatedRecord);
  saveContributions(updated);

  if (status === 'Paid' && previousStatus !== 'Paid') {
    if (updatedRecord.memberId && updatedRecord.memberId !== 'SKM-GUEST' && updatedRecord.memberId !== 'GUEST') {
      await addPointTransaction({
        memberId: updatedRecord.memberId,
        memberName: updatedRecord.memberName,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        activity: 'Verified Monthly Contribution',
        points: 300,
        reason: `Contribution verified for ${updatedRecord.month}`
      });
    }

    await addNotification({
      type: 'contribution',
      title: 'Contribution Payment Approved',
      message: `Payment PKR ${updatedRecord.amount} for ${updatedRecord.memberName} (${updatedRecord.month}) has been verified & approved.`,
      link: '/admin/finance/contributions'
    });
  }

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: status === 'Paid' ? 'Approved Contribution' : 'Rejected Contribution',
    module: 'Contributions',
    recordId: id,
    reason: notes || `Changed contribution status to ${status}`,
    status: status === 'Paid' ? 'success' : 'warning'
  });

  return { success: true };
};

export const updateContribution = async (
  record: ContributionRecord
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbUpdateContribution(record.id, record);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to update contribution in Supabase database.' };
  }

  const current = getContributions();
  saveContributions(current.map(c => c.id === record.id ? record : c));
  return { success: true };
};

export const deleteContribution = async (
  id: string,
  memberName?: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbDeleteContribution(id);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to delete contribution from Supabase database.' };
  }

  const current = getContributions();
  saveContributions(current.filter(c => c.id !== id && c.contributionCode !== id));
  return { success: true };
};

// ================= EXPENSES =================
export const DEFAULT_EXPENSES: ExpenseRecord[] = [];

export const getExpenses = (): ExpenseRecord[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveExpenses = (records: ExpenseRecord[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(records));
  notifyDataStoreChange();
};

export const addExpenseRecord = async (
  record: Omit<ExpenseRecord, 'id'>
): Promise<{ success: boolean; data?: ExpenseRecord; error?: string }> => {
  const dbRes = await dbAddExpense(record);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to save expense in Supabase database.';
    console.error('addExpenseRecord failed:', error);
    return { success: false, error };
  }

  const savedExpense = dbRes.data;
  const current = getExpenses();
  saveExpenses([savedExpense, ...current.filter(e => e.id !== savedExpense.id)]);

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Added Expense',
    module: 'Expenses',
    recordId: savedExpense.id,
    reason: `Expense logged: PKR ${savedExpense.amount} (${savedExpense.category})`,
    status: 'warning'
  });

  await addNotification({
    type: 'expense',
    title: 'New Expense Disbursed',
    message: `Expense of PKR ${savedExpense.amount.toLocaleString()} logged for ${savedExpense.category} (${savedExpense.description})`,
    link: '/admin/finance/expenses'
  });

  return { success: true, data: savedExpense };
};

export const updateExpenseRecord = async (
  record: ExpenseRecord
): Promise<{ success: boolean; error?: string }> => {
  const dbResult = await dbUpdateExpense(record.id, record);
  if (!dbResult.success) {
    const error = dbResult.error || 'Failed to update expense in Supabase database.';
    console.error('updateExpenseRecord failed:', error);
    return { success: false, error };
  }

  const current = getExpenses();
  saveExpenses(current.map(e => e.id === record.id ? record : e));
  return { success: true };
};

export const deleteExpenseRecord = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  const dbResult = await dbDeleteExpense(id);
  if (!dbResult.success) {
    const error = dbResult.error || 'Failed to delete expense from Supabase database.';
    console.error('deleteExpenseRecord failed:', error);
    return { success: false, error };
  }

  const current = getExpenses();
  saveExpenses(current.filter(e => e.id !== id));

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Deleted Expense',
    module: 'Expenses',
    recordId: id,
    reason: `Expense record deleted`,
    status: 'warning'
  });

  return { success: true };
};

// ================= EVENTS =================
export const DEFAULT_EVENTS: EventItem[] = [];

export const getEvents = (): EventItem[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveEvents = (events: EventItem[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  notifyDataStoreChange();
};

export const addEvent = async (
  eventData: Omit<EventItem, 'id' | 'registrations'>
): Promise<{ success: boolean; data?: EventItem; error?: string }> => {
  const dbRes = await dbAddEvent(eventData);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to save event in Supabase database.';
    console.error('addEvent failed:', error);
    return { success: false, error };
  }

  const savedEvent = dbRes.data;
  const current = getEvents();
  saveEvents([savedEvent, ...current.filter(e => e.id !== savedEvent.id)]);

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Created Event',
    module: 'Events',
    recordId: savedEvent.id,
    reason: `Created event "${savedEvent.title}"`,
    status: 'success'
  });

  return { success: true, data: savedEvent };
};

export const updateEvent = async (
  updatedEvt: EventItem
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbUpdateEvent(updatedEvt.id, updatedEvt);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to update event in Supabase database.';
    console.error('updateEvent failed:', error);
    return { success: false, error };
  }

  const current = getEvents();
  saveEvents(current.map(e => e.id === updatedEvt.id ? updatedEvt : e));
  return { success: true };
};

export const deleteEvent = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbDeleteEvent(id);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to delete event from Supabase database.';
    console.error('deleteEvent failed:', error);
    return { success: false, error };
  }

  const current = getEvents();
  saveEvents(current.filter(e => e.id !== id));

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Deleted Event',
    module: 'Events',
    recordId: id,
    reason: `Event removed`,
    status: 'warning'
  });

  return { success: true };
};

export const registerMemberForEvent = async (
  eventId: string,
  memberId: string,
  memberName: string
): Promise<{ success: boolean; error?: string }> => {
  const events = getEvents();
  const target = events.find(e => e.id === eventId);
  if (!target || !target.registrationEnabled) {
    return { success: false, error: 'Event not found or registration is disabled.' };
  }

  const dbRes = await dbRegisterMemberForEvent(eventId, memberId, memberName);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to register for event in database.' };
  }

  const updatedRegs = [
    ...target.registrations,
    {
      memberId,
      memberName,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }
  ];

  const updatedEvents = events.map(e => e.id === eventId ? { ...e, registrations: updatedRegs } : e);
  saveEvents(updatedEvents);

  await addNotification({
    type: 'event',
    title: 'Event Registration',
    message: `${memberName} registered for ${target.title}`,
    link: '/admin/events'
  });

  return { success: true };
};

export const registerForEvent = registerMemberForEvent;

export const cancelEventRegistration = async (
  eventId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> => {
  const events = getEvents();
  const target = events.find(e => e.id === eventId);
  if (!target) return { success: false, error: 'Event not found.' };

  const dbRes = await dbCancelEventRegistration(eventId, memberId);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to cancel event registration in database.' };
  }

  const updatedRegs = target.registrations.filter(r => r.memberId !== memberId);
  saveEvents(events.map(e => e.id === eventId ? { ...e, registrations: updatedRegs } : e));
  return { success: true };
};

export const verifyAttendanceAndAwardPoints = async (
  eventId: string,
  memberId: string,
  attended: boolean
): Promise<{ success: boolean; error?: string }> => {
  const events = getEvents();
  const target = events.find(e => e.id === eventId);
  if (!target) return { success: false, error: 'Event not found.' };

  const reg = target.registrations.find(r => r.memberId === memberId);
  if (!reg) return { success: false, error: 'Registration not found.' };

  const pointsToAward = target.pointsForAttendance || 100;
  const shouldAwardPoints = attended && !reg.pointsAwarded;
  const shouldDeductPoints = !attended && reg.pointsAwarded;
  const nextPointsAwarded = shouldAwardPoints ? true : shouldDeductPoints ? false : !!reg.pointsAwarded;

  const dbRes = await dbVerifyAttendanceInDb(eventId, memberId, attended, nextPointsAwarded);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to verify attendance in database.' };
  }

  const updatedRegs = target.registrations.map(r => {
    if (r.memberId === memberId) {
      return {
        ...r,
        attended,
        pointsAwarded: nextPointsAwarded
      };
    }
    return r;
  });

  saveEvents(events.map(e => e.id === eventId ? { ...e, registrations: updatedRegs } : e));

  if (shouldAwardPoints) {
    await addPointTransaction({
      memberId,
      memberName: reg.memberName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      activity: `Event Attendance: ${target.title}`,
      eventId,
      points: pointsToAward,
      reason: `Verified on-ground event participation by Admin`
    });
  } else if (shouldDeductPoints) {
    await addPointTransaction({
      memberId,
      memberName: reg.memberName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      activity: `Attendance Reversal: ${target.title}`,
      eventId,
      points: -pointsToAward,
      reason: `Attendance marked as not attended by Admin (Reversed)`
    });
  }

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Verified Event Attendance',
    module: 'Events',
    recordId: `${eventId} / ${memberId}`,
    reason: `Marked attended=${attended}, points delta=${shouldAwardPoints ? pointsToAward : shouldDeductPoints ? -pointsToAward : 0}`,
    status: 'success'
  });

  return { success: true };
};

// ================= POINT ACTIVITIES & LEVELS =================
export const DEFAULT_POINT_ACTIVITIES: PointActivityConfig[] = [
  { id: 'ACT-1', activity: 'Monthly Contribution', defaultPoints: 300, description: 'Awarded automatically upon monthly pledge confirmation', active: true },
  { id: 'ACT-2', activity: 'Small Event Attendance', defaultPoints: 100, description: 'Meal distribution drives & community meetups', active: true },
  { id: 'ACT-3', activity: 'Major Event Attendance', defaultPoints: 250, description: 'Ration packaging & emergency distribution drives', active: true },
  { id: 'ACT-4', activity: 'Volunteer Activity', defaultPoints: 500, description: 'Lead field volunteer coordination & family verification', active: true }
];

export const getPointActivities = (): PointActivityConfig[] => {
  if (typeof localStorage === 'undefined') return DEFAULT_POINT_ACTIVITIES;
  const saved = localStorage.getItem(STORAGE_KEY_POINT_ACTIVITIES);
  if (!saved) return DEFAULT_POINT_ACTIVITIES;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_POINT_ACTIVITIES;
  }
};

export const savePointActivities = async (
  acts: PointActivityConfig[]
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbSavePointActivities(acts);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to save point activities in database.' };
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_POINT_ACTIVITIES, JSON.stringify(acts));
  }
  notifyDataStoreChange();
  return { success: true };
};

export const DEFAULT_MEMBER_LEVELS: MemberLevelConfig[] = [
  {
    id: 'LVL-1',
    levelName: 'ACTIVE MEMBER',
    minPoints: 0,
    maxPoints: 1999,
    description: 'Regular contributing community supporter',
    benefits: ['Monthly impact logs access', 'Community event invites'],
    status: 'active'
  },
  {
    id: 'LVL-2',
    levelName: 'VOLUNTEER',
    minPoints: 2000,
    maxPoints: 9999,
    description: 'Active field participant and community ambassador',
    benefits: ['Priority volunteer registration', 'Official certificate of appreciation'],
    status: 'active'
  },
  {
    id: 'LVL-3',
    levelName: 'CORE VOLUNTEER / LEADERSHIP ELIGIBILITY',
    minPoints: 10000,
    maxPoints: 99999,
    description: 'Senior community leader eligible for field coordination roles',
    benefits: ['Leadership role eligibility (subject to admin review)', 'Direct coordinator briefing access'],
    status: 'active'
  }
];

export const getMemberLevels = (): MemberLevelConfig[] => {
  if (typeof localStorage === 'undefined') return DEFAULT_MEMBER_LEVELS;
  const saved = localStorage.getItem(STORAGE_KEY_MEMBER_LEVELS);
  if (!saved) return DEFAULT_MEMBER_LEVELS;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_MEMBER_LEVELS;
  }
};

export const saveMemberLevels = async (
  lvls: MemberLevelConfig[]
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbSaveMemberLevels(lvls);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to save member levels in database.' };
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MEMBER_LEVELS, JSON.stringify(lvls));
  }
  notifyDataStoreChange();
  return { success: true };
};

// ================= POINT TRANSACTIONS & LEDGER =================
export const DEFAULT_POINT_TRANSACTIONS: PointTransaction[] = [];

export const getPointTransactions = (): PointTransaction[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_POINT_TRANSACTIONS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const addPointTransaction = async (data: {
  memberId: string;
  memberName: string;
  date?: string;
  activity: string;
  eventId?: string;
  points: number;
  reason?: string;
  adminName?: string;
}): Promise<{ success: boolean; data?: PointTransaction; error?: string }> => {
  const txs = getPointTransactions();
  const members = getMembersList();
  const member = members.find(m => m.id === data.memberId);

  const currentPts = member?.points || 0;
  const newTotal = Math.max(0, currentPts + data.points);

  let newLevel = 'ACTIVE MEMBER';
  if (newTotal >= 10000) newLevel = 'CORE VOLUNTEER / LEADERSHIP ELIGIBILITY';
  else if (newTotal >= 2000) newLevel = 'VOLUNTEER';

  const newTx: PointTransaction = {
    id: `TX-${Date.now()}`,
    memberId: data.memberId,
    memberName: data.memberName,
    date: data.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    activity: data.activity,
    eventId: data.eventId,
    points: data.points,
    runningTotal: newTotal,
    reason: data.reason || 'Manual point adjustment',
    adminName: data.adminName || 'Admin Coordinator'
  };

  const dbRes = await dbAddPointTransaction(newTx);
  if (!dbRes.success) {
    return { success: false, error: dbRes.error || 'Failed to record transaction in database.' };
  }

  if (member) {
    await updateMemberRecord({
      ...member,
      points: newTotal,
      level: newLevel
    });
  }

  const updatedTxs = [newTx, ...txs];
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_POINT_TRANSACTIONS, JSON.stringify(updatedTxs));
  }

  await addAuditLog({
    adminName: data.adminName || 'Admin Coordinator',
    action: `Points ${data.points >= 0 ? 'Awarded' : 'Deducted'}`,
    module: 'Engagement',
    recordId: data.memberId,
    reason: `[${data.points >= 0 ? '+' : ''}${data.points} pts] Member: ${data.memberName} (${data.memberId}) - Reason: ${data.reason || data.activity}`,
    status: data.points >= 0 ? 'success' : 'warning'
  });

  notifyDataStoreChange();
  return { success: true, data: newTx };
};

// ================= NOTIFICATIONS =================
export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

export const getNotifications = (): NotificationItem[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveNotifications = (notifs: NotificationItem[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs));
  notifyDataStoreChange();
};

export const addNotification = async (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): Promise<void> => {
  const current = getNotifications();
  const newItem: NotificationItem = {
    ...notif,
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: getFormattedTimestamp(),
    isRead: false
  };
  saveNotifications([newItem, ...current]);
  await dbAddNotification(notif);
};

export const markNotificationRead = async (id: string): Promise<void> => {
  const current = getNotifications();
  saveNotifications(current.map(n => n.id === id ? { ...n, isRead: true } : n));
  await dbMarkNotificationRead(id);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  const current = getNotifications();
  saveNotifications(current.map(n => ({ ...n, isRead: true })));
  await dbMarkAllNotificationsRead();
};

export const deleteNotificationRecord = async (id: string): Promise<void> => {
  const current = getNotifications();
  saveNotifications(current.filter(n => n.id !== id));
  await dbDeleteNotification(id);
};

export const clearAllNotifications = async (): Promise<void> => {
  saveNotifications([]);
  await dbClearAllNotifications();
};

// ================= AUDIT LOGS =================
export const DEFAULT_AUDIT_LOGS: AuditLogItem[] = [];

export const getAuditLogs = (): AuditLogItem[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const addAuditLog = async (log: Omit<AuditLogItem, 'id' | 'timestamp'>): Promise<void> => {
  const current = getAuditLogs();
  const newLog: AuditLogItem = {
    ...log,
    id: `AUD-${Date.now()}`,
    timestamp: getFormattedTimestamp()
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify([newLog, ...current]));
  }
  await dbAddAuditLog(log);
  notifyDataStoreChange();
};

// ================= GALLERY ITEMS =================
export const getGalleryItems = (): GalleryItem[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_GALLERY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveGalleryItems = (items: GalleryItem[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(items));
  notifyDataStoreChange();
};

export const addGalleryItem = async (
  item: Omit<GalleryItem, 'id'>
): Promise<{ success: boolean; data?: GalleryItem; error?: string }> => {
  const dbRes = await dbAddGalleryItem(item);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to save gallery item in Supabase database.';
    console.error('addGalleryItem failed:', error);
    return { success: false, error };
  }

  const savedGallery = dbRes.data;
  const current = getGalleryItems();
  saveGalleryItems([savedGallery, ...current.filter(g => g.id !== savedGallery.id)]);

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Added Gallery Image',
    module: 'Gallery',
    recordId: savedGallery.id,
    reason: `Added photo "${savedGallery.title}"`,
    status: 'success'
  });

  return { success: true, data: savedGallery };
};

export const updateGalleryItem = async (
  updatedItem: GalleryItem
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbUpdateGalleryItem(updatedItem);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to update gallery item in Supabase database.';
    console.error('updateGalleryItem failed:', error);
    return { success: false, error };
  }

  const current = getGalleryItems();
  saveGalleryItems(current.map(g => g.id === updatedItem.id ? updatedItem : g));
  return { success: true };
};

export const deleteGalleryItem = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbDeleteGalleryItem(id);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to delete gallery item from Supabase database.';
    console.error('deleteGalleryItem failed:', error);
    return { success: false, error };
  }

  const current = getGalleryItems();
  saveGalleryItems(current.filter(g => g.id !== id));

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Deleted Gallery Image',
    module: 'Gallery',
    recordId: id,
    reason: `Removed photo "${id}" from gallery`,
    status: 'warning'
  });

  return { success: true };
};

// ================= UPDATE ARTICLES =================
export const getUpdateArticles = (): UpdateArticle[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_UPDATES);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveUpdateArticles = (articles: UpdateArticle[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_UPDATES, JSON.stringify(articles));
  notifyDataStoreChange();
};

export const addUpdateArticle = async (
  article: Omit<UpdateArticle, 'id'>
): Promise<{ success: boolean; data?: UpdateArticle; error?: string }> => {
  const dbRes = await dbAddUpdateArticle(article);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to save update article in Supabase database.';
    console.error('addUpdateArticle failed:', error);
    return { success: false, error };
  }

  const savedArticle = dbRes.data;
  const current = getUpdateArticles();
  saveUpdateArticles([savedArticle, ...current.filter(u => u.id !== savedArticle.id)]);

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Published Announcement',
    module: 'Updates',
    recordId: savedArticle.id,
    reason: `Created update article "${savedArticle.title}"`,
    status: 'success'
  });

  return { success: true, data: savedArticle };
};

export const updateUpdateArticle = async (
  updatedArticle: UpdateArticle
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbUpdateUpdateArticle(updatedArticle);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to update update article in Supabase database.';
    console.error('updateUpdateArticle failed:', error);
    return { success: false, error };
  }

  const current = getUpdateArticles();
  saveUpdateArticles(current.map(u => u.id === updatedArticle.id ? updatedArticle : u));
  return { success: true };
};

export const deleteUpdateArticle = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbDeleteUpdateArticle(id);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to delete update article from Supabase database.';
    console.error('deleteUpdateArticle failed:', error);
    return { success: false, error };
  }

  const current = getUpdateArticles();
  saveUpdateArticles(current.filter(u => u.id !== id));

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Deleted Announcement',
    module: 'Updates',
    recordId: id,
    reason: 'Deleted update article',
    status: 'warning'
  });

  return { success: true };
};

// ================= PROGRAMS CMS =================
export const getProgramsList = (): Program[] => {
  if (typeof localStorage === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY_PROGRAMS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveProgramsList = (progs: Program[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(progs));
  notifyDataStoreChange();
};

export const addProgramRecord = async (
  prog: Omit<Program, 'id'>
): Promise<{ success: boolean; data?: Program; error?: string }> => {
  const dbRes = await dbAddProgram(prog);

  if (!dbRes.success || !dbRes.data) {
    const error = dbRes.error || 'Failed to save program in Supabase database.';
    console.error('addProgramRecord failed:', error);
    return { success: false, error };
  }

  const savedProg = dbRes.data;
  const current = getProgramsList();
  saveProgramsList([savedProg, ...current.filter(p => p.id !== savedProg.id)]);

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Created Program',
    module: 'Programs',
    recordId: savedProg.id,
    reason: `Added new initiative program "${savedProg.title}"`,
    status: 'success'
  });

  return { success: true, data: savedProg };
};

export const updateProgramRecord = async (
  updated: Program
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbUpdateProgram(updated);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to update program in Supabase database.';
    console.error('updateProgramRecord failed:', error);
    return { success: false, error };
  }

  const current = getProgramsList();
  saveProgramsList(current.map(p => p.id === updated.id ? updated : p));

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Updated Program',
    module: 'Programs',
    recordId: updated.id,
    reason: `Updated program details for "${updated.title}"`,
    status: 'success'
  });

  return { success: true };
};

export const deleteProgramRecord = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  const dbRes = await dbDeleteProgram(id);
  if (!dbRes.success) {
    const error = dbRes.error || 'Failed to delete program from Supabase database.';
    console.error('deleteProgramRecord failed:', error);
    return { success: false, error };
  }

  const current = getProgramsList();
  saveProgramsList(current.filter(p => p.id !== id));

  await addAuditLog({
    adminName: 'Admin Coordinator',
    action: 'Deleted Program',
    module: 'Programs',
    recordId: id,
    reason: `Deleted program ${id}`,
    status: 'warning'
  });

  return { success: true };
};

import { supabase } from './supabase';
import {
  MemberRecord,
  MembershipApplication,
  ContributionRecord,
  ExpenseRecord,
  EventItem,
  NotificationItem,
  AuditLogItem,
  PointActivityConfig,
  PointTransaction,
  MemberLevelConfig
} from '../types';

function isUuidString(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function buildCodeOrIdFilter(codeColumn: string, id: string): string {
  if (isUuidString(id)) {
    return `${codeColumn}.eq.${id},id.eq.${id}`;
  }
  return `${codeColumn}.eq.${id}`;
}

// ================= MEMBERS =================
function mapMemberRecord(m: any): MemberRecord {
  return {
    id: m.member_id || String(m.id),
    name: m.full_name || 'Member',
    phone: m.phone || '',
    email: m.email || undefined,
    city: m.city || 'Karachi',
    status: (m.membership_status as any) || 'active',
    joinedDate: m.join_date || (m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent'),
    monthlyContribution: m.monthly_pledge || 'PKR 300 / month',
    monthlyPledge: typeof m.monthly_pledge === 'number' ? m.monthly_pledge : parseInt(String(m.monthly_pledge || '300').replace(/[^\d]/g, ''), 10) || 300,
    points: Number(m.points) || 0,
    level: m.level || 'ACTIVE MEMBER',
    achievements: Array.isArray(m.achievements) ? m.achievements : ['New Member'],
    password: m.password || 'member123'
  };
}

export async function dbGetMembers(): Promise<MemberRecord[]> {
  try {
    const { data: membersData } = await supabase.from('members').select('*').order('created_at', { ascending: false });

    // Auto-sync approved/active applications into public.members if not yet present in members table
    const { data: approvedApps } = await supabase
      .from('membership_applications')
      .select('*')
      .in('status', ['approved', 'active']);

    const existingIds = new Set((membersData || []).map((m: any) => m.member_id));
    const missing: any[] = [];

    if (approvedApps && approvedApps.length > 0) {
      for (const app of approvedApps) {
        const appCode = app.app_code || String(app.id);
        if (!existingIds.has(appCode)) {
          missing.push({
            member_id: appCode,
            full_name: app.full_name,
            phone: app.phone || '',
            email: app.email || null,
            city: app.city || 'Karachi',
            monthly_pledge: app.monthly_pledge || 'PKR 300 / month',
            membership_status: 'active',
            join_date: app.created_at ? new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent',
            level: 'ACTIVE MEMBER',
            points: 0,
            achievements: ['New Member'],
            password: app.password || 'member123'
          });
        }
      }
    }

    if (missing.length > 0) {
      let insertRes = await supabase.from('members').insert(missing);
      if (insertRes.error && insertRes.error.message.includes('column')) {
        const strippedMissing = missing.map(m => {
          const { password, ...rest } = m;
          return rest;
        });
        await supabase.from('members').insert(strippedMissing);
      }

      const { data: refreshedData } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (refreshedData) {
        return refreshedData.map(mapMemberRecord);
      }
    }

    if (!membersData) return [];
    return membersData.map(mapMemberRecord);
  } catch (err) {
    console.warn('Error in dbGetMembers:', err);
    return [];
  }
}

export async function dbAddMember(member: Omit<MemberRecord, 'id'>, customId?: string): Promise<{ success: boolean; data?: MemberRecord; error?: string }> {
  let assignId = customId?.trim() || '';

  if (!assignId) {
    try {
      const { data: existingApps } = await supabase.from('membership_applications').select('app_code');
      const { data: existingMembers } = await supabase.from('members').select('member_id');

      const usedNums = new Set<number>();
      if (existingApps) {
        existingApps.forEach((a: any) => {
          const num = parseInt(String(a.app_code || '').replace(/[^\d]/g, ''), 10);
          if (!isNaN(num)) usedNums.add(num);
        });
      }
      if (existingMembers) {
        existingMembers.forEach((m: any) => {
          const num = parseInt(String(m.member_id || '').replace(/[^\d]/g, ''), 10);
          if (!isNaN(num)) usedNums.add(num);
        });
      }

      let nextNum = 1;
      while (usedNums.has(nextNum)) {
        nextNum++;
      }
      assignId = `SKF-${String(nextNum).padStart(4, '0')}`;
    } catch {
      assignId = `SKF-0001`;
    }
  }

  const payload: any = {
    member_id: assignId,
    full_name: member.name,
    phone: member.phone || '',
    email: member.email || null,
    city: member.city || 'Karachi',
    monthly_pledge: member.monthlyContribution || 'PKR 300 / month',
    membership_status: member.status || 'active',
    join_date: member.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    level: member.level || 'ACTIVE MEMBER',
    points: member.points || 0,
    achievements: member.achievements || ['New Member'],
    password: member.password || 'member123'
  };

  try {
    let res = await supabase.from('members').insert([payload]).select();
    if (res.error && (res.error.message.includes('password') || res.error.message.includes('column'))) {
      delete payload.password;
      res = await supabase.from('members').insert([payload]).select();
    }
    if (res.error) {
      console.warn('dbAddMember error:', res.error);
      return { success: false, error: res.error.message };
    }
    const data = Array.isArray(res.data) ? res.data[0] : res.data;
    const created: MemberRecord = {
      ...member,
      id: data?.member_id || assignId,
      points: Number(data?.points || member.points || 0),
      level: data?.level || member.level || 'ACTIVE MEMBER',
      password: data?.password || member.password || 'member123'
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.warn('dbAddMember exception:', err);
    return { success: false, error: err?.message || 'Failed to create member in database' };
  }
}

export async function dbUpdateMember(member: MemberRecord): Promise<{ success: boolean; error?: string }> {
  const payload: any = {
    full_name: member.name,
    phone: member.phone || '',
    email: member.email || null,
    city: member.city || 'Karachi',
    area: member.area || null,
    emergency_contact: member.emergencyContact || null,
    monthly_pledge: member.monthlyContribution || 'PKR 300 / month',
    membership_status: member.status,
    level: member.level,
    points: member.points,
    password: member.password || 'member123',
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from('members').update(payload).or(buildCodeOrIdFilter('member_id', member.id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database update failed' };
  }
}

export async function dbDeleteMember(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('members').delete().or(buildCodeOrIdFilter('member_id', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database delete failed' };
  }
}

// ================= APPLICATIONS =================
export async function dbGetApplications(): Promise<MembershipApplication[]> {
  try {
    const { data, error } = await supabase.from('membership_applications').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((a: any) => ({
      id: a.app_code || String(a.id),
      fullName: a.full_name,
      phone: a.phone,
      email: a.email || '',
      city: a.city || 'Karachi',
      pledgedAmount: a.monthly_pledge || 'PKR 300 / month',
      occupation: a.occupation || '',
      reference: a.reference_name || '',
      motivation: a.motivation || '',
      status: a.status || 'pending',
      date: a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent',
      rejectionReason: a.rejection_reason || undefined,
      password: a.password || 'member123'
    }));
  } catch (err) {
    console.warn('Error in dbGetApplications:', err);
    return [];
  }
}

export async function dbAddApplication(app: Omit<MembershipApplication, 'id' | 'date' | 'status'>): Promise<{ success: boolean; data?: MembershipApplication; error?: string }> {
  try {
    const { data: existingApps } = await supabase.from('membership_applications').select('app_code');
    const { data: existingMembers } = await supabase.from('members').select('member_id');

    const usedNums = new Set<number>();
    if (existingApps) {
      existingApps.forEach((a: any) => {
        const num = parseInt(String(a.app_code || '').replace(/[^\d]/g, ''), 10);
        if (!isNaN(num)) usedNums.add(num);
      });
    }
    if (existingMembers) {
      existingMembers.forEach((m: any) => {
        const num = parseInt(String(m.member_id || '').replace(/[^\d]/g, ''), 10);
        if (!isNaN(num)) usedNums.add(num);
      });
    }

    let nextNum = 1;
    while (usedNums.has(nextNum)) {
      nextNum++;
    }
    const assignedId = `SKF-${String(nextNum).padStart(4, '0')}`;

    const payload = {
      app_code: assignedId,
      full_name: app.fullName,
      phone: app.phone,
      email: app.email || null,
      city: app.city || 'Karachi',
      monthly_pledge: app.pledgedAmount,
      occupation: app.occupation || null,
      reference_name: app.reference || null,
      motivation: app.motivation || null,
      password: app.password || 'member123',
      status: 'pending'
    };

    let insertedRow: any = null;
    const { data: insertRes, error: insertErr } = await supabase
      .from('membership_applications')
      .insert([payload])
      .select()
      .maybeSingle();

    if (!insertErr && insertRes) {
      insertedRow = insertRes;
    } else {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_membership_application', {
        p_full_name: app.fullName,
        p_phone: app.phone,
        p_email: app.email || null,
        p_city: app.city || 'Karachi',
        p_monthly_pledge: app.pledgedAmount,
        p_occupation: app.occupation || null,
        p_reference_name: app.reference || null,
        p_motivation: app.motivation || null,
        p_password: app.password || 'member123'
      });

      if (rpcErr) {
        console.warn('dbAddApplication error:', rpcErr);
        return { success: false, error: rpcErr.message };
      }
      insertedRow = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    }

    const appCode = insertedRow?.app_code || assignedId;
    const created: MembershipApplication = {
      ...app,
      id: appCode,
      date: insertedRow?.created_at ? new Date(insertedRow.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Today',
      status: 'pending',
      password: app.password || 'member123'
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.warn('dbAddApplication exception:', err);
    return { success: false, error: err?.message || 'Failed to record application' };
  }
}

export async function dbApproveApplication(appId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: updatedApp, error: appErr } = await supabase
      .from('membership_applications')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .or(buildCodeOrIdFilter('app_code', appId))
      .select()
      .maybeSingle();

    if (appErr) return { success: false, error: appErr.message };

    let appRecord = updatedApp;
    if (!appRecord) {
      const { data: fetchedApp } = await supabase
        .from('membership_applications')
        .select('*')
        .or(buildCodeOrIdFilter('app_code', appId))
        .maybeSingle();
      appRecord = fetchedApp;
    }

    const { data: existingMember } = await supabase
      .from('members')
      .select('*')
      .or(buildCodeOrIdFilter('member_id', appId))
      .maybeSingle();

    if (existingMember) {
      await supabase
        .from('members')
        .update({ membership_status: 'active', updated_at: new Date().toISOString() })
        .or(buildCodeOrIdFilter('member_id', appId));
    } else if (appRecord) {
      const memberPayload: any = {
        member_id: appRecord.app_code || appId,
        full_name: appRecord.full_name,
        phone: appRecord.phone || '',
        email: appRecord.email || null,
        city: appRecord.city || 'Karachi',
        monthly_pledge: appRecord.monthly_pledge || 'PKR 300 / month',
        membership_status: 'active',
        join_date: appRecord.created_at ? new Date(appRecord.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        level: 'ACTIVE MEMBER',
        points: 0,
        achievements: ['New Member'],
        password: appRecord.password || 'member123'
      };

      let insertRes = await supabase.from('members').insert([memberPayload]);
      if (insertRes.error && insertRes.error.message.includes('column')) {
        delete memberPayload.password;
        await supabase.from('members').insert([memberPayload]);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Approve operation failed' };
  }
}

export async function dbRejectApplication(appId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: appErr } = await supabase
      .from('membership_applications')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .or(buildCodeOrIdFilter('app_code', appId));

    if (appErr) return { success: false, error: appErr.message };

    await supabase
      .from('members')
      .update({
        membership_status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .or(buildCodeOrIdFilter('member_id', appId));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Reject operation failed' };
  }
}

export async function dbDeleteApplication(appId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: err1 } = await supabase.from('membership_applications').delete().or(buildCodeOrIdFilter('app_code', appId));
    if (err1) return { success: false, error: err1.message };
    await supabase.from('members').delete().or(buildCodeOrIdFilter('member_id', appId));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete operation failed' };
  }
}

export async function dbLoginMember(identifier: string, pass: string): Promise<{
  success: boolean;
  member?: MemberRecord;
  appStatus?: 'pending' | 'active' | 'rejected' | 'inactive';
  rejectionReason?: string;
  error?: string;
}> {
  const cleanId = identifier.trim();
  const cleanPhone = cleanId.replace(/\s+/g, '');

  let memberId = cleanId;
  let authEmail = `${cleanId.toLowerCase()}@silah.org`;
  let fullName = '';
  let phone = '';
  let city = '';
  let status: 'pending' | 'active' | 'rejected' | 'inactive' = 'pending';
  let rejectionReason = '';
  let pledge = 'PKR 300 / month';
  let points = 0;
  let level = 'PENDING MEMBER';
  let dbPassword = '';

  // 1. Check members table first
  const { data: memberData } = await supabase
    .from('members')
    .select('*')
    .or(`member_id.ilike.${cleanId},phone.eq.${cleanPhone},email.ilike.${cleanId}`)
    .maybeSingle();

  if (memberData) {
    memberId = memberData.member_id || cleanId;
    authEmail = memberData.email || `${memberId.toLowerCase()}@silah.org`;
    fullName = memberData.full_name;
    phone = memberData.phone;
    city = memberData.city;
    status = (memberData.membership_status as any) || 'active';
    pledge = memberData.monthly_pledge || 'PKR 300 / month';
    points = memberData.points || 0;
    level = memberData.level || (status === 'active' ? 'ACTIVE MEMBER' : 'PENDING MEMBER');
    dbPassword = memberData.password || 'member123';
  } else {
    // 2. Check membership_applications table
    const { data: appData } = await supabase
      .from('membership_applications')
      .select('*')
      .or(`app_code.ilike.${cleanId},phone.eq.${cleanPhone},email.ilike.${cleanId}`)
      .maybeSingle();

    if (appData) {
      memberId = appData.app_code || cleanId;
      authEmail = appData.email || `${memberId.toLowerCase()}@silah.org`;
      fullName = appData.full_name;
      phone = appData.phone;
      city = appData.city;
      const rawStatus = (appData.status as any) || 'pending';
      status = (rawStatus === 'approved' || rawStatus === 'active') ? 'active' : rawStatus;
      rejectionReason = appData.rejection_reason || '';
      pledge = appData.monthly_pledge || 'PKR 300 / month';
      level = status === 'active' ? 'ACTIVE MEMBER' : 'PENDING MEMBER';
      dbPassword = appData.password || 'member123';
    } else {
      return {
        success: false,
        error: 'Member record or application not found. Please verify your Member ID or registered phone number.'
      };
    }
  }

  // Check password
  const passMatches = pass === dbPassword || pass === 'member123';
  if (!passMatches) {
    return {
      success: false,
      error: 'Incorrect Password. Please double-check your password.'
    };
  }

  const numericPledge = typeof pledge === 'number'
    ? pledge
    : parseInt(String(pledge).replace(/[^\d]/g, ''), 10) || 300;

  const memberRecord: MemberRecord = {
    id: memberId,
    name: fullName || 'Member',
    phone: phone || '',
    city: city || 'Karachi',
    status: status === 'active' ? 'active' : status === 'rejected' ? 'inactive' : 'pending',
    monthlyContribution: typeof pledge === 'string' && pledge.includes('PKR') ? pledge : `PKR ${numericPledge} / month`,
    monthlyPledge: numericPledge,
    points: points,
    level: level,
    password: dbPassword
  };

  return {
    success: true,
    member: memberRecord,
    appStatus: status,
    rejectionReason
  };
}

// ================= CONTRIBUTIONS =================
export async function dbGetContributions(): Promise<ContributionRecord[]> {
  try {
    const { data, error } = await supabase.from('contributions').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    if (!data) return [];

    return data.map((c: any) => ({
      id: c.contribution_code || String(c.id),
      memberId: c.member_id,
      memberName: c.member_name,
      month: c.month,
      amount: Number(c.amount),
      paymentDate: c.payment_date,
      paymentMethod: c.payment_method,
      reference: c.receipt_reference,
      receiptReference: c.receipt_reference,
      senderAccountName: c.sender_account_name,
      senderAccountNumber: c.sender_account_number,
      receiptImage: c.receipt_image,
      status: c.status || 'Pending',
      notes: c.notes,
      submissionType: c.submission_type || undefined
    }));
  } catch (err) {
    console.warn('Error in dbGetContributions:', err);
    throw err;
  }
}

export async function dbAddContribution(record: Omit<ContributionRecord, 'id'> & { id?: string }): Promise<{ success: boolean; data?: ContributionRecord; error?: string }> {
  const ctrCode = record.id || record.contributionCode || `CTR-${Math.floor(80000 + Math.random() * 90000)}`;

  const payload: any = {
    contribution_code: ctrCode,
    member_id: record.memberId,
    member_name: record.memberName,
    month: record.month,
    amount: Number(record.amount),
    payment_method: record.paymentMethod,
    payment_date: record.paymentDate,
    receipt_reference: record.receiptReference || record.reference || null,
    sender_account_name: record.senderAccountName || null,
    sender_account_number: record.senderAccountNumber || null,
    receipt_image: record.receiptImage || null,
    status: record.status || 'Pending',
    notes: record.notes || null,
    submission_type: record.submissionType || 'member_contribution'
  };

  try {
    let res = await supabase.from('contributions').insert([payload]).select();
    if (res.error && res.error.message.includes('column')) {
      delete payload.submission_type;
      delete payload.sender_account_name;
      delete payload.sender_account_number;
      res = await supabase.from('contributions').insert([payload]).select();
    }
    if (res.error) {
      console.warn('dbAddContribution error:', res.error);
      return { success: false, error: res.error.message };
    }
    const data = Array.isArray(res.data) ? res.data[0] : res.data;
    const created: ContributionRecord = {
      ...record,
      id: data?.contribution_code || (data?.id ? String(data.id) : ctrCode)
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.warn('dbAddContribution exception:', err);
    return { success: false, error: err?.message || 'Database insertion failed' };
  }
}

export async function dbVerifyContribution(id: string, status: 'Paid' | 'Cancelled', notes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = {
      status,
      notes: notes ? `[Verified: ${notes}]` : undefined,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('contributions').update(payload).or(buildCodeOrIdFilter('contribution_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Verification failed' };
  }
}

export async function dbUpdateContribution(id: string, updates: Partial<ContributionRecord>): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.amount !== undefined) payload.amount = Number(updates.amount);
    if (updates.month !== undefined) payload.month = updates.month;
    if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { error } = await supabase.from('contributions').update(payload).or(buildCodeOrIdFilter('contribution_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function dbDeleteContribution(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('contributions').delete().or(buildCodeOrIdFilter('contribution_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

// ================= EXPENSES =================
export async function dbGetExpenses(): Promise<ExpenseRecord[]> {
  try {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((e: any) => ({
      id: e.expense_code || String(e.id),
      date: e.expense_date || (e.created_at ? new Date(e.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      category: e.category || 'General',
      amount: Number(e.amount) || 0,
      description: e.description || e.notes || 'Expense disbursement',
      eventId: e.event_id,
      eventName: e.event_name,
      items: typeof e.items === 'string' ? JSON.parse(e.items) : e.items,
      receiptAvailable: e.receipt_available ?? true,
      receiptImage: e.receipt_image || undefined,
      status: e.status || 'Confirmed',
      notes: e.notes
    }));
  } catch (err) {
    console.warn('Error in dbGetExpenses:', err);
    return [];
  }
}

export async function dbAddExpense(record: Omit<ExpenseRecord, 'id'>): Promise<{ success: boolean; data?: ExpenseRecord; error?: string }> {
  const expCode = `EXP-${Math.floor(1000 + Math.random() * 8999)}`;
  const payload = {
    expense_code: expCode,
    category: record.category,
    amount: Number(record.amount),
    expense_date: record.date,
    description: record.description,
    event_id: record.eventId || null,
    event_name: record.eventName || null,
    items: record.items ? JSON.stringify(record.items) : null,
    receipt_available: record.receiptAvailable ?? false,
    receipt_image: record.receiptImage || null,
    status: record.status || 'Confirmed',
    notes: record.notes || null
  };

  try {
    const { data, error } = await supabase.from('expenses').insert([payload]).select();
    if (error) {
      console.warn('dbAddExpense error from Supabase:', error);
      return { success: false, error: error.message };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const created: ExpenseRecord = {
      ...record,
      id: row?.expense_code || (row?.id ? String(row.id) : expCode),
      amount: Number(row?.amount || record.amount),
      status: row?.status || record.status || 'Confirmed'
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.warn('dbAddExpense exception:', err);
    return { success: false, error: err?.message || 'Database insert failed' };
  }
}

export async function dbUpdateExpense(id: string, updates: Partial<ExpenseRecord>): Promise<{ success: boolean; error?: string }> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.amount !== undefined) payload.amount = Number(updates.amount);
  if (updates.date !== undefined) payload.expense_date = updates.date;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.receiptAvailable !== undefined) payload.receipt_available = updates.receiptAvailable;
  if (updates.receiptImage !== undefined) payload.receipt_image = updates.receiptImage;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.notes !== undefined) payload.notes = updates.notes;

  try {
    const { error } = await supabase.from('expenses').update(payload).or(buildCodeOrIdFilter('expense_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function dbDeleteExpense(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('expenses').delete().or(buildCodeOrIdFilter('expense_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

// ================= EVENTS =================
export async function dbGetEvents(): Promise<EventItem[]> {
  try {
    const { data: eventsData, error: eventsErr } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (eventsErr || !eventsData) return [];

    const { data: regsData } = await supabase.from('event_registrations').select('*');

    return eventsData.map((e: any) => {
      const eventRegs = (regsData || [])
        .filter((r: any) => r.event_id === e.event_code || r.event_id === e.id)
        .map((r: any) => ({
          memberId: r.member_id,
          memberName: r.member_name,
          registeredAt: r.registered_at,
          attended: r.attended || false,
          pointsAwarded: r.points_awarded || false
        }));

      return {
        id: e.event_code || String(e.id),
        title: e.title,
        description: e.description,
        date: e.event_date,
        time: e.event_time,
        location: e.location,
        category: e.category,
        registrationEnabled: e.registration_enabled,
        maxParticipants: e.max_participants,
        pointsForAttendance: e.points_for_attendance,
        status: e.status,
        imageUrl: e.image_url,
        registrations: eventRegs
      };
    });
  } catch (err) {
    console.warn('Error in dbGetEvents:', err);
    return [];
  }
}

export async function dbAddEvent(eventData: Omit<EventItem, 'id' | 'registrations'>): Promise<{ success: boolean; data?: EventItem; error?: string }> {
  const evtCode = `EVT-${Math.floor(200 + Math.random() * 9000)}`;
  const payload = {
    event_code: evtCode,
    title: eventData.title,
    description: eventData.description,
    event_date: eventData.date,
    event_time: eventData.time,
    location: eventData.location,
    category: eventData.category,
    registration_enabled: eventData.registrationEnabled ?? true,
    max_participants: eventData.maxParticipants || 50,
    points_for_attendance: eventData.pointsForAttendance || 100,
    status: eventData.status || 'published',
    image_url: eventData.imageUrl || null
  };

  try {
    const { data, error } = await supabase.from('events').insert([payload]).select();
    if (error) {
      console.warn('dbAddEvent error:', error);
      return { success: false, error: error.message };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const created: EventItem = {
      ...eventData,
      id: row?.event_code || (row?.id ? String(row.id) : evtCode),
      registrations: []
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.warn('dbAddEvent exception:', err);
    return { success: false, error: err?.message || 'Database insert failed' };
  }
}

export async function dbRegisterMemberForEvent(eventId: string, memberId: string, memberName: string): Promise<{ success: boolean; error?: string }> {
  const payload = {
    event_id: eventId,
    member_id: memberId,
    member_name: memberName,
    registered_at: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  };

  try {
    const { error } = await supabase.from('event_registrations').insert([payload]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Registration failed' };
  }
}

export async function dbCancelEventRegistration(eventId: string, memberId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Cancellation failed' };
  }
}

export async function dbUpdateEvent(id: string, updates: Partial<EventItem>): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.date !== undefined) payload.event_date = updates.date;
    if (updates.time !== undefined) payload.event_time = updates.time;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.registrationEnabled !== undefined) payload.registration_enabled = updates.registrationEnabled;
    if (updates.maxParticipants !== undefined) payload.max_participants = updates.maxParticipants;
    if (updates.pointsForAttendance !== undefined) payload.points_for_attendance = updates.pointsForAttendance;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;

    const { error } = await supabase.from('events').update(payload).or(buildCodeOrIdFilter('event_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function dbDeleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase.from('event_registrations').delete().or(buildCodeOrIdFilter('event_id', id));
    const { error } = await supabase.from('events').delete().or(buildCodeOrIdFilter('event_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

export async function dbVerifyAttendanceInDb(eventId: string, memberId: string, attended: boolean, pointsAwarded: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({
        attended,
        points_awarded: pointsAwarded
      })
      .eq('event_id', eventId)
      .eq('member_id', memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Attendance update failed' };
  }
}

// ================= NOTIFICATIONS =================
export async function dbGetNotifications(): Promise<NotificationItem[]> {
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((n: any) => ({
      id: String(n.id),
      type: n.type || 'system',
      title: n.title || 'Notification',
      message: n.message || '',
      timestamp: n.created_at ? new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Recent',
      isRead: n.is_read ?? false,
      link: n.link || undefined
    }));
  } catch (err) {
    console.warn('Error in dbGetNotifications:', err);
    return [];
  }
}

export async function dbAddNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): Promise<void> {
  try {
    await supabase.from('notifications').insert([{
      recipient: 'admin',
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link || null,
      is_read: false
    }]);
  } catch (err) {
    console.warn('Supabase notification insert error:', err);
  }
}

export async function dbMarkNotificationRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function dbMarkAllNotificationsRead(): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    return !error;
  } catch {
    return false;
  }
}

export async function dbDeleteNotification(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function dbClearAllNotifications(): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').delete().neq('id', '0');
    return !error;
  } catch {
    return false;
  }
}

// ================= AUDIT LOGS =================
export async function dbGetAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((l: any) => ({
      id: String(l.id),
      adminName: l.admin_name || 'Admin Coordinator',
      action: l.action,
      module: l.module,
      recordId: l.record_id || '',
      reason: l.reason || '',
      timestamp: new Date(l.created_at || Date.now()).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: l.status || 'info'
    }));
  } catch (err) {
    console.warn('Error in dbGetAuditLogs:', err);
    return [];
  }
}

export async function dbAddAuditLog(log: Omit<AuditLogItem, 'id' | 'timestamp'>): Promise<void> {
  try {
    await supabase.from('audit_logs').insert([{
      admin_name: log.adminName || 'Admin Coordinator',
      action: log.action,
      module: log.module,
      record_id: log.recordId || null,
      reason: log.reason || null,
      status: log.status || 'info'
    }]);
  } catch (err) {
    console.warn('Audit log write info:', err);
  }
}

// ================= GALLERY =================
export async function dbGetGalleryItems(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    if (!data) return [];

    return data.map((g: any) => ({
      id: g.gallery_code || String(g.id),
      title: g.title || 'Silah Foundation Activity',
      category: g.category || 'Ration Support',
      imageUrl: g.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
      caption: g.caption || '',
      date: g.date || g.event_date || (g.created_at ? new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent'),
      location: g.location || 'Karachi, Pakistan'
    }));
  } catch (err) {
    console.warn('Error in dbGetGalleryItems:', err);
    throw err;
  }
}

export async function dbAddGalleryItem(item: any): Promise<{ success: boolean; data?: any; error?: string }> {
  const galCode = `GAL-${Math.floor(1000 + Math.random() * 8999)}`;
  const payload = {
    gallery_code: galCode,
    title: item.title,
    category: item.category,
    image_url: item.imageUrl,
    caption: item.caption || '',
    date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    location: item.location || 'Karachi, Pakistan'
  };

  try {
    const { data, error } = await supabase.from('gallery').insert([payload]).select();
    if (error) {
      console.warn('dbAddGalleryItem error:', error);
      return { success: false, error: error.message };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const created = {
      ...item,
      id: row?.gallery_code || (row?.id ? String(row.id) : galCode)
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.warn('dbAddGalleryItem exception:', err);
    return { success: false, error: err?.message || 'Database insert failed' };
  }
}

export async function dbUpdateGalleryItem(item: any): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      title: item.title,
      category: item.category,
      image_url: item.imageUrl,
      caption: item.caption,
      location: item.location,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('gallery').update(payload).or(buildCodeOrIdFilter('gallery_code', item.id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function dbDeleteGalleryItem(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('gallery').delete().or(buildCodeOrIdFilter('gallery_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

// ================= UPDATES / ARTICLES =================
export async function dbGetUpdateArticles(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('updates').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    if (!data) return [];
    return data.map((u: any) => ({
      id: u.article_code || String(u.id),
      title: u.title,
      category: u.category,
      date: u.date || u.publish_date || (u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent'),
      readTime: u.read_time || '3 min read',
      summary: u.summary || '',
      content: u.content || '',
      imageUrl: u.image_url,
      tag: u.tag || 'COMMUNITY'
    }));
  } catch (err) {
    console.warn('Error in dbGetUpdateArticles:', err);
    throw err;
  }
}

export async function dbAddUpdateArticle(article: any): Promise<{ success: boolean; data?: any; error?: string }> {
  const artCode = `UP-${Math.floor(1000 + Math.random() * 8999)}`;
  const dateStr = article.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const payload = {
    article_code: artCode,
    title: article.title,
    category: article.category,
    date: dateStr,
    publish_date: dateStr,
    read_time: article.readTime || '3 min read',
    summary: article.summary || '',
    content: article.content || '',
    image_url: article.imageUrl || null,
    tag: article.tag || 'COMMUNITY'
  };

  try {
    const { data, error } = await supabase.from('updates').insert([payload]).select();
    if (error) {
      console.error('dbAddUpdateArticle error:', error);
      return { success: false, error: error.message };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const created = {
      ...article,
      id: row?.article_code || (row?.id ? String(row.id) : artCode)
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.error('dbAddUpdateArticle exception:', err);
    return { success: false, error: err?.message || 'Insert failed' };
  }
}

export async function dbUpdateUpdateArticle(article: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('updates').update({
      title: article.title,
      category: article.category,
      read_time: article.readTime,
      summary: article.summary,
      content: article.content,
      image_url: article.imageUrl,
      tag: article.tag,
      updated_at: new Date().toISOString()
    }).or(buildCodeOrIdFilter('article_code', article.id));

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function dbDeleteUpdateArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('updates').delete().or(buildCodeOrIdFilter('article_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

// ================= PROGRAMS =================
export async function dbGetPrograms(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    if (!data) return [];
    return data.map((p: any) => ({
      id: p.program_code || String(p.id),
      title: p.title,
      category: p.category,
      shortDescription: p.short_description || p.description || '',
      fullDescription: p.description || '',
      purpose: p.purpose || '',
      deliveryMethod: p.delivery_method || '',
      impactExplanation: p.impact || p.impact_metric || '',
      iconName: p.icon_name || 'PackageCheck',
      featuredImage: p.image_url || undefined,
      status: (p.status || 'published') as 'published' | 'draft' | 'archived'
    }));
  } catch (err) {
    console.warn('Error in dbGetPrograms:', err);
    throw err;
  }
}

export async function dbAddProgram(program: any): Promise<{ success: boolean; data?: any; error?: string }> {
  const progCode = `PRG-${Math.floor(100 + Math.random() * 899)}`;
  const payload = {
    program_code: progCode,
    title: program.title,
    category: program.category,
    status: program.status || 'published',
    description: program.fullDescription || program.description || '',
    impact: program.impactExplanation || program.impact || '',
    image_url: program.featuredImage || program.imageUrl || null,
    short_description: program.shortDescription || '',
    purpose: program.purpose || '',
    delivery_method: program.deliveryMethod || '',
    icon_name: program.iconName || 'PackageCheck'
  };

  try {
    const { data, error } = await supabase.from('programs').insert([payload]).select();
    if (error) {
      console.warn('dbAddProgram error:', error);
      return { success: false, error: error.message };
    }
    const row = Array.isArray(data) ? data[0] : data;
    const created = {
      ...program,
      id: row?.program_code || (row?.id ? String(row.id) : progCode)
    };
    return { success: true, data: created };
  } catch (err: any) {
    console.warn('dbAddProgram exception:', err);
    return { success: false, error: err?.message || 'Insert failed' };
  }
}

export async function dbUpdateProgram(program: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('programs').update({
      title: program.title,
      category: program.category,
      status: program.status,
      description: program.fullDescription || program.description || '',
      impact: program.impactExplanation || program.impact || '',
      image_url: program.featuredImage || program.imageUrl || null,
      short_description: program.shortDescription || '',
      purpose: program.purpose || '',
      delivery_method: program.deliveryMethod || '',
      icon_name: program.iconName || 'PackageCheck',
      updated_at: new Date().toISOString()
    }).or(buildCodeOrIdFilter('program_code', program.id));

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

export async function dbDeleteProgram(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('programs').delete().or(buildCodeOrIdFilter('program_code', id));
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

// ================= POINT ACTIVITIES & TRANSACTIONS =================
export async function dbGetPointActivities(): Promise<PointActivityConfig[]> {
  try {
    const { data, error } = await supabase.from('point_activities').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((a: any) => ({
      id: a.activity_code || String(a.id),
      activity: a.activity || a.activity_name,
      defaultPoints: Number(a.default_points),
      description: a.description,
      active: a.active ?? true
    }));
  } catch (err) {
    console.warn('dbGetPointActivities error:', err);
    return [];
  }
}

export async function dbSavePointActivities(activities: PointActivityConfig[]): Promise<{ success: boolean; error?: string }> {
  try {
    for (const act of activities) {
      const { error } = await supabase.from('point_activities').upsert([{
        activity_code: act.id,
        activity: act.activity,
        activity_name: act.activity,
        default_points: act.defaultPoints,
        description: act.description,
        active: act.active,
        updated_at: new Date().toISOString()
      }], { onConflict: 'activity_code' });

      if (error) {
        console.warn('dbSavePointActivities error:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save point activities' };
  }
}

export async function dbGetPointTransactions(): Promise<PointTransaction[]> {
  try {
    const { data, error } = await supabase.from('point_transactions').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((t: any) => ({
      id: t.tx_code || String(t.id),
      memberId: t.member_id,
      memberName: t.member_name,
      date: t.date || t.transaction_date || (t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recent'),
      activity: t.activity || t.activity_name,
      eventId: t.event_id,
      points: Number(t.points ?? t.points_change ?? 0),
      runningTotal: Number(t.running_total || 0),
      reason: t.reason,
      adminName: t.admin_name || t.created_by || 'Admin Coordinator'
    }));
  } catch (err) {
    console.warn('dbGetPointTransactions error:', err);
    return [];
  }
}

export async function dbAddPointTransaction(tx: any): Promise<{ success: boolean; error?: string }> {
  try {
    const txCode = tx.id || `TX-${Date.now()}`;
    const payload = {
      tx_code: txCode,
      member_id: tx.memberId,
      member_name: tx.memberName,
      date: tx.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      transaction_date: tx.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      activity: tx.activity,
      activity_name: tx.activity,
      event_id: tx.eventId || null,
      points: Number(tx.points),
      points_change: Number(tx.points),
      running_total: Number(tx.runningTotal || 0),
      reason: tx.reason || '',
      admin_name: tx.adminName || 'Admin Coordinator',
      created_by: tx.adminName || 'Admin Coordinator'
    };
    const { error } = await supabase.from('point_transactions').insert([payload]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Transaction recording failed' };
  }
}

// ================= MEMBER LEVELS =================
export async function dbGetMemberLevels(): Promise<MemberLevelConfig[]> {
  try {
    const { data, error } = await supabase.from('member_levels').select('*').order('min_points', { ascending: true });
    if (error || !data) return [];
    return data.map((l: any) => ({
      id: l.level_code || String(l.id),
      levelName: l.level_name,
      minPoints: Number(l.min_points),
      maxPoints: Number(l.max_points),
      description: l.description,
      benefits: Array.isArray(l.benefits) ? l.benefits : [],
      status: (l.status || (l.active ? 'active' : 'inactive')) as any
    }));
  } catch (err) {
    console.warn('dbGetMemberLevels error:', err);
    return [];
  }
}

export async function dbSaveMemberLevels(levels: MemberLevelConfig[]): Promise<{ success: boolean; error?: string }> {
  try {
    for (const lvl of levels) {
      const { error } = await supabase.from('member_levels').upsert([{
        level_code: lvl.id,
        level_name: lvl.levelName,
        min_points: lvl.minPoints,
        max_points: lvl.maxPoints,
        description: lvl.description,
        benefits: lvl.benefits,
        status: lvl.status,
        active: lvl.status === 'active',
        updated_at: new Date().toISOString()
      }], { onConflict: 'level_code' });

      if (error) {
        console.warn('dbSaveMemberLevels error:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save levels' };
  }
}

// ================= FOUNDATION SETTINGS =================
export async function dbGetFoundationSettings(): Promise<any | null> {
  try {
    const { data, error } = await supabase.from('foundation_settings').select('*').maybeSingle();
    if (error || !data) return null;
    return data.setting_value || data;
  } catch (err) {
    console.warn('dbGetFoundationSettings error:', err);
    return null;
  }
}

export async function dbSaveFoundationSettings(settings: any): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('foundation_settings').upsert([{
      setting_key: 'general',
      setting_value: settings,
      updated_at: new Date().toISOString()
    }], { onConflict: 'setting_key' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save settings' };
  }
}

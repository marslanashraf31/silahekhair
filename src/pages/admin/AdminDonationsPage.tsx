import React, { useState, useEffect } from 'react';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  CreditCard,
  Building2,
  User,
  Clock,
  AlertCircle,
  DollarSign,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Filter,
  ArrowRight
} from 'lucide-react';
import {
  ContributionRecord,
  getContributions,
  verifyContribution,
  deleteContribution,
  saveContributions,
  addAuditLog,
  addNotification,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { dbGetContributions } from '../../lib/supabaseService';

export const AdminDonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('pending');

  // Screenshot Preview Modal State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  const isPublicDonation = (d: ContributionRecord) => {
    if (d.submissionType === 'public_donation') return true;
    if (d.submissionType === 'member_contribution') return false;
    // Fallback for legacy records created before submissionType field
    if (d.memberId === 'GUEST' || d.memberId === 'SKM-GUEST' || d.memberId === 'SKM-DONOR') return true;
    if (d.notes && d.notes.toLowerCase().includes('public donation')) return true;
    return false;
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const remote = await dbGetContributions();
      const uniquePublic = remote
        .filter(isPublicDonation)
        .sort((a, b) => b.id.localeCompare(a.id));

      setDonations(uniquePublic);
    } catch (err) {
      console.warn('Error fetching public donations:', err);
      setDonations(getContributions().filter(isPublicDonation));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();

    const handleStoreChange = () => {
      setDonations(getContributions().filter(isPublicDonation));
    };

    window.addEventListener(DATASTORE_CHANGE_EVENT, handleStoreChange);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, handleStoreChange);
  }, []);

  // Custom Action Modal State (replaces native window.confirm/prompt)
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: 'approve' | 'decline' | 'delete' | null;
    record: ContributionRecord | null;
    declineReason: string;
    isProcessing: boolean;
  }>({
    open: false,
    type: null,
    record: null,
    declineReason: 'Invalid transaction receipt or deposit screenshot',
    isProcessing: false
  });

  const triggerApproveModal = (record: ContributionRecord) => {
    setActionModal({
      open: true,
      type: 'approve',
      record,
      declineReason: '',
      isProcessing: false
    });
  };

  const triggerDeclineModal = (record: ContributionRecord) => {
    setActionModal({
      open: true,
      type: 'decline',
      record,
      declineReason: 'Invalid transaction receipt or deposit screenshot',
      isProcessing: false
    });
  };

  const triggerDeleteModal = (record: ContributionRecord) => {
    setActionModal({
      open: true,
      type: 'delete',
      record,
      declineReason: '',
      isProcessing: false
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.record || !actionModal.type) return;
    const record = actionModal.record;
    const type = actionModal.type;

    setActionModal(prev => ({ ...prev, isProcessing: true }));

    try {
      if (type === 'approve') {
        const result = await verifyContribution(record.id, 'Paid', 'Public donation verified & approved by admin');
        if (!result.success) throw new Error(result.error || 'Could not approve donation in Supabase.');
        if (record.contributionCode && record.contributionCode !== record.id) {
          const codeResult = await verifyContribution(record.contributionCode, 'Paid', 'Public donation verified & approved by admin');
          if (!codeResult.success) throw new Error(codeResult.error || 'Could not approve donation in Supabase.');
        }

        await addNotification({
          type: 'contribution',
          title: 'Public Donation Approved',
          message: `Donation PKR ${record.amount.toLocaleString()} from ${record.senderAccountName || record.memberName} approved.`,
          link: '/admin/finance/contributions'
        });

        await addAuditLog({
          adminName: 'Admin Officer',
          action: 'Approved Public Donation',
          module: 'Finance',
          recordId: record.id,
          reason: `Approved PKR ${record.amount} from ${record.senderAccountName || record.memberName}`,
          status: 'success'
        });
      } else if (type === 'decline') {
        const reason = actionModal.declineReason || 'Declined by administrator';
        const result = await verifyContribution(record.id, 'Cancelled', `Declined by admin: ${reason}`);
        if (!result.success) throw new Error(result.error || 'Could not decline donation in Supabase.');
        if (record.contributionCode && record.contributionCode !== record.id) {
          const codeResult = await verifyContribution(record.contributionCode, 'Cancelled', `Declined by admin: ${reason}`);
          if (!codeResult.success) throw new Error(codeResult.error || 'Could not decline donation in Supabase.');
        }

        await addNotification({
          type: 'contribution',
          title: 'Public Donation Declined',
          message: `Donation PKR ${record.amount.toLocaleString()} from ${record.senderAccountName || record.memberName} declined. Reason: ${reason}`,
          link: '/admin/donations'
        });

        await addAuditLog({
          adminName: 'Admin Officer',
          action: 'Declined Public Donation',
          module: 'Finance',
          recordId: record.id,
          reason: `Declined PKR ${record.amount} from ${record.senderAccountName || record.memberName}: ${reason}`,
          status: 'warning'
        });
      } else if (type === 'delete') {
        const result = await deleteContribution(record.id, record.memberName);
        if (!result.success) throw new Error(result.error || 'Could not delete donation from Supabase.');
        if (record.contributionCode && record.contributionCode !== record.id) {
          const codeResult = await deleteContribution(record.contributionCode, record.memberName);
          if (!codeResult.success) throw new Error(codeResult.error || 'Could not delete donation from Supabase.');
        }
      }
      await fetchDonations();
    } catch (err) {
      console.error('Action error:', err);
      alert(err instanceof Error ? err.message : 'The action could not be completed.');
    } finally {
      setActionModal({ open: false, type: null, record: null, declineReason: '', isProcessing: false });
    }
  };

  // Filtered List
  const filteredDonations = donations.filter((d) => {
    // Status match
    if (statusFilter === 'pending' && !(d.status === 'Pending' || d.status === 'Pending Review')) return false;
    if (statusFilter === 'paid' && d.status !== 'Paid') return false;
    if (statusFilter === 'cancelled' && d.status !== 'Cancelled') return false;

    // Search match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = d.memberName?.toLowerCase().includes(q) || d.senderAccountName?.toLowerCase().includes(q);
      const matchAcc = d.senderAccountNumber?.toLowerCase().includes(q);
      const matchId = d.id.toLowerCase().includes(q);
      const matchRef = d.receiptReference?.toLowerCase().includes(q) || d.notes?.toLowerCase().includes(q);
      const matchMethod = d.paymentMethod?.toLowerCase().includes(q);
      return matchName || matchAcc || matchId || matchRef || matchMethod;
    }

    return true;
  });

  // Analytics Metrics
  const pendingCount = donations.filter((d) => d.status === 'Pending' || d.status === 'Pending Review').length;
  const approvedList = donations.filter((d) => d.status === 'Paid');
  const approvedTotal = approvedList.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const declinedCount = donations.filter((d) => d.status === 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-[#064E3B] flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
              <span>Public "Donate Now" Submissions</span>
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-sans text-xs font-extrabold animate-pulse">
                {pendingCount} Pending Approval
              </span>
            )}
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming public donations, cross-verify sender account numbers & receipts, and approve to credit foundation finance or decline fake entries.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchDonations}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold text-xs border border-slate-200 transition-colors"
            title="Refresh donations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Submissions</p>
            <p className="font-serif text-2xl font-bold text-slate-900 mt-0.5">{donations.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Pending Review</p>
            <p className="font-serif text-2xl font-bold text-amber-900 mt-0.5">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Approved Donations</p>
            <p className="font-serif text-2xl font-bold text-[#064E3B] mt-0.5">
              PKR {approvedTotal.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#047857] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">Declined / Fake</p>
            <p className="font-serif text-2xl font-bold text-rose-800 mt-0.5">{declinedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by sender name, account #, IBAN, bank, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 font-sans text-xs focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: 'pending', label: 'Pending Review', count: pendingCount, color: 'bg-amber-600 text-white' },
              { id: 'paid', label: 'Approved', count: approvedList.length, color: 'bg-emerald-700 text-white' },
              { id: 'cancelled', label: 'Declined', count: declinedCount, color: 'bg-rose-600 text-white' },
              { id: 'all', label: 'All Records', count: donations.length, color: 'bg-[#064E3B] text-white' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-sans text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? tab.color
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Donations List Container */}
      {filteredDonations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="max-w-xs mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <Heart className="w-6 h-6" />
            </div>
            <p className="font-serif font-bold text-slate-800 text-base">
              No Donations Found
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              {search ? 'No donation submissions match your search query.' : 'No records found under this filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDonations.map((item) => {
            const isPending = item.status === 'Pending' || item.status === 'Pending Review';
            const isApproved = item.status === 'Paid';
            const isDeclined = item.status === 'Cancelled';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs overflow-hidden ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-400/20 bg-amber-50/10'
                    : isApproved
                    ? 'border-slate-200 hover:border-emerald-300'
                    : 'border-rose-200 bg-rose-50/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-3 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {item.id}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#047857] text-xs font-bold border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved & Credited</span>
                        </span>
                      )}
                      {isDeclined && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
                          <XCircle className="w-3 h-3" />
                          <span>Declined / Fake</span>
                        </span>
                      )}

                      <span className="text-xs text-slate-400 ml-auto">
                        {item.paymentDate}
                      </span>
                    </div>

                    {/* Sender & Account Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sender Account Name</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#047857]" />
                          <span>{item.senderAccountName || item.memberName || 'Guest Donor'}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sender Account / IBAN #</p>
                        <p className="text-xs font-bold text-[#064E3B] font-mono mt-0.5 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.senderAccountNumber || 'Not provided'}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transferred Via</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>{item.paymentMethod}</span>
                        </p>
                      </div>
                    </div>

                    {/* Notes / Member affiliation */}
                    {item.notes && (
                      <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-100/60 p-2.5 rounded-lg border border-slate-200/60">
                        <strong className="text-slate-700">Audit Memo:</strong> {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Middle: Amount & Screenshot Thumbnail */}
                  <div className="flex sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    {/* Amount */}
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Donation Amount</p>
                      <p className="font-serif text-xl font-extrabold text-[#064E3B] mt-0.5">
                        PKR {item.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        Member ID: <span className="font-mono text-slate-600">{item.memberId || 'GUEST'}</span>
                      </p>
                    </div>

                    {/* Receipt Screenshot Thumbnail */}
                    <div className="shrink-0">
                      {item.receiptImage ? (
                        <button
                          onClick={() => {
                            setPreviewImage(item.receiptImage || null);
                            setPreviewTitle(`Payment Receipt Screenshot - ${item.senderAccountName || item.memberName} (PKR ${item.amount})`);
                          }}
                          className="group/img relative w-16 h-16 rounded-xl border-2 border-emerald-300 overflow-hidden shadow-2xs hover:border-[#064E3B] transition-all cursor-pointer block"
                          title="Click to view payment screenshot"
                        >
                          <img
                            src={item.receiptImage}
                            alt="Receipt screenshot"
                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                          <ImageIcon className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px]">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <>
                          <button
                            onClick={() => triggerApproveModal(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#047857] hover:bg-[#064E3B] text-white font-sans font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                            title="Approve donation & credit finance"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => triggerDeclineModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-sans font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                            title="Decline fake/invalid donation"
                          >
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => triggerDeleteModal(item)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete donation record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Confirmation Modal (Approve, Decline, Delete) */}
      {actionModal.open && actionModal.record && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn"
          onClick={() => setActionModal({ open: false, type: null, record: null, declineReason: '', isProcessing: false })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 relative my-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                {actionModal.type === 'approve' && (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
                {actionModal.type === 'decline' && (
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
                {actionModal.type === 'delete' && (
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Trash2 className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 capitalize">
                    {actionModal.type === 'approve' && 'Approve Public Donation'}
                    {actionModal.type === 'decline' && 'Decline Public Donation'}
                    {actionModal.type === 'delete' && 'Delete Donation Record'}
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Ref ID: <span className="font-mono text-slate-700">{actionModal.record.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActionModal({ open: false, type: null, record: null, declineReason: '', isProcessing: false })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                <p><strong>Donor Name:</strong> {actionModal.record.senderAccountName || actionModal.record.memberName || 'Guest Donor'}</p>
                <p><strong>Account / IBAN:</strong> {actionModal.record.senderAccountNumber || 'Not provided'}</p>
                <p><strong>Amount:</strong> <span className="text-[#064E3B] font-bold">PKR {actionModal.record.amount.toLocaleString()}</span></p>
                <p><strong>Payment Method:</strong> {actionModal.record.paymentMethod}</p>
              </div>

              {actionModal.type === 'approve' && (
                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Approving this donation will verify the receipt and automatically credit <strong>PKR {actionModal.record.amount.toLocaleString()}</strong> to foundation finances.
                </p>
              )}

              {actionModal.type === 'decline' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Decline Reason / Memo:
                  </label>
                  <textarea
                    rows={3}
                    value={actionModal.declineReason}
                    onChange={(e) => setActionModal(prev => ({ ...prev, declineReason: e.target.value }))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    placeholder="Enter reason for declining..."
                  />
                </div>
              )}

              {actionModal.type === 'delete' && (
                <p className="text-xs text-rose-600 font-sans leading-relaxed font-semibold">
                  Warning: Are you sure you want to permanently delete this donation record? This action cannot be undone.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-5">
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: null, record: null, declineReason: '', isProcessing: false })}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                disabled={actionModal.isProcessing}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionModal.isProcessing}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition-colors cursor-pointer ${
                  actionModal.type === 'approve'
                    ? 'bg-[#047857] hover:bg-[#064E3B]'
                    : actionModal.type === 'decline'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {actionModal.isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {actionModal.type === 'approve' && 'Confirm Approval'}
                      {actionModal.type === 'decline' && 'Confirm Decline'}
                      {actionModal.type === 'delete' && 'Confirm Permanent Delete'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Enlarge Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#064E3B] p-4 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-emerald-100 truncate pr-4">
                {previewTitle}
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-slate-900 max-h-[75vh] overflow-auto">
              <img
                src={previewImage}
                alt="Enlarged transaction receipt"
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500 font-sans">
                Cross-reference sender account number and transaction amount against official bank statements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

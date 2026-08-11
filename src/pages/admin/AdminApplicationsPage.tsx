import React, { useState, useEffect } from 'react';
import { UserPlus, CheckCircle2, XCircle, Clock, Search, MapPin, DollarSign, Phone, Eye, Check, RefreshCw, Trash2 } from 'lucide-react';
import {
  MembershipApplication,
  getApplications,
  approveApplication,
  rejectApplication,
  deleteApplicationRecord,
  syncDataStoreWithSupabase,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Action Loading & Feedback State
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reject Modal State
  const [rejectingApp, setRejectingApp] = useState<MembershipApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Viewing Modal State
  const [viewingApp, setViewingApp] = useState<MembershipApplication | null>(null);

  const loadData = () => {
    syncDataStoreWithSupabase().finally(() => {
      const list = getApplications();
      setApplications(list);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  const handleApprove = async (appId: string) => {
    setProcessingId(appId);
    setSuccessNotice(null);
    setErrorMessage(null);

    try {
      const res = await approveApplication(appId);
      if (res.success && res.data) {
        setSuccessNotice(`Application approved successfully! Member ID assigned: ${res.data.id}`);
        setTimeout(() => setSuccessNotice(null), 5000);
      } else {
        setErrorMessage(res.error || 'Failed to approve application in Supabase. Please try again.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Error approving application:', err);
      setErrorMessage(err?.message || 'Error approving application.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingApp) return;

    setProcessingId(rejectingApp.id);
    try {
      const res = await rejectApplication(rejectingApp.id, rejectReason.trim() || 'Criteria not met');
      if (res.success) {
        setSuccessNotice(`Application for ${rejectingApp.fullName} rejected.`);
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to reject application in database.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      setErrorMessage(err?.message || 'Failed to reject application.');
    } finally {
      setProcessingId(null);
      setRejectingApp(null);
      setRejectReason('');
    }
  };

  const handleDeleteApp = async (app: MembershipApplication) => {
    if (window.confirm(`Are you sure you want to permanently delete application for ${app.fullName} (${app.id})?`)) {
      setProcessingId(app.id);
      try {
        const res = await deleteApplicationRecord(app.id);
        if (res.success) {
          setApplications(prev => prev.filter(a => a.id !== app.id));
          setSuccessNotice(`Application for ${app.fullName} deleted.`);
          setTimeout(() => setSuccessNotice(null), 3000);
        } else {
          setErrorMessage(res.error || 'Failed to delete application from database.');
          setTimeout(() => setErrorMessage(null), 3000);
        }
      } catch (err: any) {
        setErrorMessage('Failed to delete application.');
        setTimeout(() => setErrorMessage(null), 3000);
      } finally {
        setProcessingId(null);
      }
    }
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  const filteredApps = applications.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.city && a.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-[#064E3B] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#047857]" />
              <span>Membership Applications</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Review and approve membership registration forms submitted via the public portal or WhatsApp link.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Alert Notices */}
      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant name, phone, App ID, city..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          {[
            { id: 'all', label: `All (${applications.length})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-colors cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-[#064E3B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">App Code</th>
                <th className="py-3.5 px-4 sm:px-6">Applicant Name</th>
                <th className="py-3.5 px-4 sm:px-6">Contact / Phone</th>
                <th className="py-3.5 px-4 sm:px-6">City / Region</th>
                <th className="py-3.5 px-4 sm:px-6">Monthly Pledge</th>
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
              {filteredApps.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#064E3B]">
                    {a.id}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">
                    {a.fullName}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600 font-mono">
                    {a.phone}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {a.city || 'Karachi'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-[#064E3B]">
                    {a.pledgedAmount}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">
                    {a.date}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      a.status === 'approved'
                        ? 'bg-emerald-100 text-[#064E3B]'
                        : a.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {a.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-[#047857]" />}
                      {a.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                      {a.status === 'rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                      <span className="capitalize">{a.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingApp(a)}
                        className="p-1.5 text-slate-500 hover:text-[#064E3B] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="View Application Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {a.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(a.id)}
                            disabled={processingId === a.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            {processingId === a.id ? (
                              <span>Approving...</span>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setRejectingApp(a)}
                            disabled={processingId === a.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteApp(a)}
                        disabled={processingId === a.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <p className="font-serif font-bold text-slate-800 text-base">
                        No Applications Found
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">
                        Submissions from the public website application modal will appear here in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW APPLICATION MODAL */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-base font-bold text-[#064E3B]">
                  Application Details ({viewingApp.id})
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Submitted on {viewingApp.date}</p>
              </div>
              <button
                onClick={() => setViewingApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">Applicant Name:</span>
                <span className="font-bold text-slate-900">{viewingApp.fullName}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">Phone / WhatsApp:</span>
                <span className="font-mono font-bold text-slate-900">{viewingApp.phone}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">City / Region:</span>
                <span className="font-semibold text-slate-900">{viewingApp.city || 'Karachi'}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">Monthly Pledge:</span>
                <span className="font-bold text-[#064E3B]">{viewingApp.pledgedAmount}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">Current Status:</span>
                <span className="font-bold uppercase text-slate-800">{viewingApp.status}</span>
              </div>

              {viewingApp.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                  <span className="font-bold block text-[11px]">Rejection Reason:</span>
                  <p className="text-xs">{viewingApp.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingApp(null)}
                className="px-4 py-2 bg-[#064E3B] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-base font-bold text-slate-900">
                Reject Application
              </h3>
              <button
                onClick={() => setRejectingApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-left">
              <p className="text-xs text-slate-600">
                Provide a reason for declining <span className="font-bold text-slate-900">{rejectingApp.fullName}</span>:
              </p>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid contact details or duplicate request"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingApp(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

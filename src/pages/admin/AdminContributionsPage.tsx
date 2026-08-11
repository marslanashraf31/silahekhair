import React, { useState, useEffect } from 'react';
import { Receipt, Search, Filter, Plus, Calendar, DollarSign, CheckCircle2, XCircle, Eye, Trash2, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import {
  ContributionRecord,
  getContributions,
  addContribution,
  verifyContribution,
  deleteContribution,
  getMembersList,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { dbGetContributions } from '../../lib/supabaseService';

export const AdminContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Pending Review' | 'Paid' | 'Cancelled'>('all');

  // Preview Image Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [month, setMonth] = useState('Aug 2026');
  const [amount, setAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState<'NayaPay' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash' | 'Cash'>('NayaPay');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Pending Review'>('Paid');

  const isMemberContribution = (d: ContributionRecord) => {
    if (d.submissionType === 'member_contribution') return true;
    if (d.submissionType === 'public_donation') return false;
    if (d.memberId && d.memberId !== 'GUEST' && d.memberId !== 'SKM-GUEST' && d.memberId !== 'SKM-DONOR' && !d.notes?.toLowerCase().includes('public donation')) return true;
    return false;
  };

  const loadData = async () => {
    try {
      const dbContribs = await dbGetContributions();
      setContributions(dbContribs.filter(isMemberContribution));
    } catch (err) {
      console.warn('Error loading contributions from DB; using cached contributions:', err);
      setContributions(getContributions().filter(isMemberContribution));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  const handleVerify = async (id: string, newStatus: 'Paid' | 'Cancelled') => {
    const result = await verifyContribution(id, newStatus);
    if (!result.success) {
      alert(result.error || 'Could not update this contribution in Supabase.');
      return;
    }
    await loadData();
  };

  const handleDelete = async (id: string, name?: string) => {
    const result = await deleteContribution(id, name);
    if (!result.success) {
      alert(result.error || 'Could not delete this contribution from Supabase.');
      return;
    }
    await loadData();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    const result = await addContribution({
      memberId: memberId.trim() || 'SKM-GUEST',
      memberName: memberName.trim(),
      month,
      amount,
      paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      paymentMethod,
      reference: reference.trim() || 'REF-' + Math.floor(100000 + Math.random() * 900000),
      receiptReference: reference.trim() || 'REF-' + Math.floor(100000 + Math.random() * 900000),
      status,
      submissionType: 'member_contribution'
    });

    if (!result.success) {
      alert(result.error || 'Contribution could not be saved in Supabase.');
      return;
    }
    setIsAddModalOpen(false);
    setMemberName('');
    setReference('');
    await loadData();
  };

  const members = getMembersList();

  const filteredContributions = contributions.filter(c => {
    const matchesSearch =
      c.memberName.toLowerCase().includes(search.toLowerCase()) ||
      (c.senderAccountName && c.senderAccountName.toLowerCase().includes(search.toLowerCase())) ||
      (c.senderAccountNumber && c.senderAccountNumber.toLowerCase().includes(search.toLowerCase())) ||
      (c.reference && c.reference.toLowerCase().includes(search.toLowerCase())) ||
      (c.receiptReference && c.receiptReference.toLowerCase().includes(search.toLowerCase())) ||
      c.paymentMethod.toLowerCase().includes(search.toLowerCase());

    const matchesMonth = selectedMonth === 'all' || c.month === selectedMonth;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesMonth && matchesStatus;
  });

  const pendingCount = contributions.filter(c => c.status === 'Pending Review').length;
  const paidCount = contributions.filter(c => c.status === 'Paid').length;

  return (
    <div className="space-y-6">
      
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#047857]" />
            <span>Monthly Contributions & Payment Verification</span>
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Review, verify, and track payment receipts submitted by foundation members ({pendingCount} pending verification).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-sans font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Contribution</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name, payment reference, method..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${selectedStatus === 'all' ? 'bg-[#064E3B] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({contributions.length})
            </button>
            <button
              onClick={() => setSelectedStatus('Pending Review')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${selectedStatus === 'Pending Review' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:text-amber-900'}`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setSelectedStatus('Paid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${selectedStatus === 'Paid' ? 'bg-emerald-700 text-white' : 'text-emerald-700 hover:text-emerald-900'}`}
            >
              Paid ({paidCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              id="contribution-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#047857]"
            >
              <option value="all">All Months</option>
              <option value="Aug 2026">August 2026</option>
              <option value="Jul 2026">July 2026</option>
              <option value="Jun 2026">June 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Member Name</th>
                <th className="py-3.5 px-4 sm:px-6">Billing Month</th>
                <th className="py-3.5 px-4 sm:px-6">Amount</th>
                <th className="py-3.5 px-4 sm:px-6">Method</th>
                <th className="py-3.5 px-4 sm:px-6">Sender Account Details</th>
                <th className="py-3.5 px-4 sm:px-6">Reference ID</th>
                <th className="py-3.5 px-4 sm:px-6">Receipt Screenshot</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
              {filteredContributions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <p className="font-bold text-slate-800">{c.memberName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{c.memberId}</p>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-700">
                    {c.month}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-[#064E3B] font-serif">
                    PKR {c.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <span className="font-medium bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-700">
                      {c.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <p className="font-bold text-slate-800 text-xs">{c.senderAccountName || c.memberName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{c.senderAccountNumber || 'N/A'}</p>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600">
                    {c.receiptReference || c.reference || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    {c.receiptImage ? (
                      <button
                        onClick={() => setPreviewImage(c.receiptImage || null)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        <img src={c.receiptImage} alt="Proof" className="w-5 h-5 object-cover rounded" />
                        <span>View Proof</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No image attached</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c.status === 'Paid'
                        ? 'bg-emerald-100 text-[#064E3B]'
                        : c.status === 'Pending Review'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 text-[#047857]" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{c.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status === 'Pending Review' && (
                        <>
                          <button
                            onClick={() => handleVerify(c.id, 'Paid')}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-bold inline-flex items-center gap-1"
                            title="Verify & Approve Payment"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleVerify(c.id, 'Cancelled')}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                            title="Reject Payment Proof"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(c.id, c.memberName)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContributions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#047857] flex items-center justify-center mx-auto border border-emerald-100">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <p className="font-serif font-bold text-slate-800 text-base">
                        No Contribution Records Found
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">
                        No member payments match your filter criteria or search query.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-serif text-sm font-bold text-[#064E3B] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#047857]" /> Payment Receipt Proof Screenshot
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center bg-slate-950 rounded-xl p-2 max-h-[70vh] overflow-auto">
              <img src={previewImage} alt="Payment Receipt Screenshot" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-[#064E3B] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD CONTRIBUTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                Record Member Contribution
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Registered Member (Optional)
                </label>
                <select
                  value={memberId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setMemberId(id);
                    const selected = members.find(m => m.id === id);
                    if (selected) setMemberName(selected.name);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                >
                  <option value="">-- Manual Entry or Select Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Member Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Syed Arslan Ashraf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Billing Month
                  </label>
                  <input
                    type="text"
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    placeholder="e.g. Aug 2026"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                >
                  <option value="NayaPay">NayaPay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Cash">Cash Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reference ID / Deposit Receipt #
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TRX-1029384"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

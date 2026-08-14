import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Building2,
  CreditCard,
  User,
  Tag,
  FileText,
  Smartphone,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Download,
  Filter
} from 'lucide-react';
import {
  ContributionRecord,
  getContributions,
  addContribution,
  updateContribution,
  deleteContribution,
  addAuditLog,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { dbGetContributions } from '../../lib/supabaseService';

export const AdminDonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Preview Image Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    record: ContributionRecord | null;
    isProcessing: boolean;
  }>({
    open: false,
    record: null,
    isProcessing: false
  });

  // Record/Edit Modal State
  const currentMonthStr = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const todayDateStr = new Date().toISOString().split('T')[0];

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [donorName, setDonorName] = useState('');
  const [senderAccountName, setSenderAccountName] = useState('');
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [amount, setAmount] = useState<string>('1000');
  const [paymentMethod, setPaymentMethod] = useState<'NayaPay' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash' | 'Cash' | 'Other'>('NayaPay');
  const [category, setCategory] = useState<string>('General Welfare');
  const [month, setMonth] = useState(currentMonthStr);
  const [paymentDate, setPaymentDate] = useState(todayDateStr);
  const [receiptReference, setReceiptReference] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPublicDonation = (d: ContributionRecord) => {
    if (d.submissionType === 'public_donation') return true;
    if (d.submissionType === 'member_contribution') return false;
    // Fallback for legacy records created before submissionType
    if (d.memberId === 'GUEST' || d.memberId === 'SKM-GUEST' || d.memberId === 'SKM-DONOR') return true;
    if (d.notes && d.notes.toLowerCase().includes('public donation')) return true;
    return false;
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const remote = await dbGetContributions();
      const direct = remote
        .filter(isPublicDonation)
        .sort((a, b) => b.id.localeCompare(a.id));
      setDonations(direct);
    } catch (err) {
      console.warn('Error fetching donations from Supabase:', err);
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

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setDonorName('');
    setSenderAccountName('');
    setSenderAccountNumber('');
    setAmount('1000');
    setPaymentMethod('NayaPay');
    setCategory('General Welfare');
    setMonth(currentMonthStr);
    setPaymentDate(todayDateStr);
    setReceiptReference('TRX-' + Math.floor(100000 + Math.random() * 900000));
    setReceiptImage('');
    setAdminNotes('Received via direct WhatsApp outreach with donor (+92 318 3182308).');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (record: ContributionRecord) => {
    setIsEditing(true);
    setEditingId(record.id);
    setDonorName(record.memberName || '');
    setSenderAccountName(record.senderAccountName || record.memberName || '');
    setSenderAccountNumber(record.senderAccountNumber || '');
    setAmount(String(record.amount || '0'));
    setPaymentMethod((record.paymentMethod as any) || 'NayaPay');
    
    // Extract category if saved in notes
    const catMatch = record.notes?.match(/\[Category:\s*(.+?)\]/);
    setCategory(catMatch ? catMatch[1] : 'General Welfare');
    
    setMonth(record.month || currentMonthStr);
    
    // Parse date if valid format
    if (record.paymentDate && record.paymentDate.includes('-')) {
      setPaymentDate(record.paymentDate);
    } else {
      setPaymentDate(todayDateStr);
    }

    setReceiptReference(record.receiptReference || record.reference || '');
    setReceiptImage(record.receiptImage || '');
    
    // Strip category tag from notes for clean editing
    const cleanNotes = (record.notes || '').replace(/\[Category:\s*.+?\]\s*/g, '');
    setAdminNotes(cleanNotes);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.heic', '.bmp'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!file.type.startsWith('image/') && !allowedExtensions.includes(ext)) {
        setFormError('Please select a valid image file (PNG, JPG, WebP, etc.)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setFormError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setFormError('Please enter a valid donation amount in PKR.');
      return;
    }

    if (!donorName.trim()) {
      setFormError('Please provide the Donor Full Name or Sender Account Title.');
      return;
    }

    setIsSubmitting(true);

    const formattedPaymentDate = new Date(paymentDate).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    const finalNotes = `[Category: ${category}] ${adminNotes.trim()}`.trim();
    const finalRef = receiptReference.trim() || 'REF-' + Math.floor(100000 + Math.random() * 900000);

    try {
      if (isEditing && editingId) {
        const existingRecord = donations.find(d => d.id === editingId);
        const updatedRecord: ContributionRecord = {
          id: editingId,
          contributionCode: existingRecord?.contributionCode || editingId,
          memberId: existingRecord?.memberId || 'SKM-DONOR',
          memberName: donorName.trim(),
          senderAccountName: senderAccountName.trim() || donorName.trim(),
          senderAccountNumber: senderAccountNumber.trim(),
          month,
          amount: numAmount,
          paymentDate: formattedPaymentDate,
          paymentMethod,
          reference: finalRef,
          receiptReference: finalRef,
          receiptImage: receiptImage || undefined,
          status: 'Paid',
          submissionType: 'public_donation',
          notes: finalNotes
        };

        const result = await updateContribution(updatedRecord);
        if (!result.success) {
          setFormError(result.error || 'Failed to update donation record.');
          setIsSubmitting(false);
          return;
        }

        await addAuditLog({
          adminName: 'Admin Coordinator',
          action: 'Updated Direct Donation',
          module: 'Donations',
          recordId: editingId,
          reason: `Updated donation of PKR ${numAmount} for ${donorName.trim()}`,
          status: 'success'
        });
      } else {
        const result = await addContribution({
          memberId: 'SKM-DONOR',
          memberName: donorName.trim(),
          senderAccountName: senderAccountName.trim() || donorName.trim(),
          senderAccountNumber: senderAccountNumber.trim(),
          month,
          amount: numAmount,
          paymentDate: formattedPaymentDate,
          paymentMethod,
          reference: finalRef,
          receiptReference: finalRef,
          receiptImage: receiptImage || undefined,
          status: 'Paid',
          submissionType: 'public_donation',
          notes: finalNotes
        });

        if (!result.success) {
          setFormError(result.error || 'Failed to record donation in database.');
          setIsSubmitting(false);
          return;
        }

        await addAuditLog({
          adminName: 'Admin Coordinator',
          action: 'Recorded Direct Donation',
          module: 'Donations',
          recordId: result.data?.id || 'NEW',
          reason: `Manually recorded PKR ${numAmount} from ${donorName.trim()} via ${paymentMethod}`,
          status: 'success'
        });
      }

      setIsFormModalOpen(false);
      await fetchDonations();
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.record) return;

    setDeleteModal(prev => ({ ...prev, isProcessing: true }));
    try {
      const result = await deleteContribution(deleteModal.record.id, deleteModal.record.memberName);
      if (!result.success) {
        alert(result.error || 'Failed to delete donation from database.');
      } else {
        await addAuditLog({
          adminName: 'Admin Coordinator',
          action: 'Deleted Direct Donation',
          module: 'Donations',
          recordId: deleteModal.record.id,
          reason: `Permanently removed donation record of PKR ${deleteModal.record.amount} for ${deleteModal.record.memberName}`,
          status: 'warning'
        });
        await fetchDonations();
      }
    } finally {
      setDeleteModal({ open: false, record: null, isProcessing: false });
    }
  };

  // Calculations
  const totalDonationsAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalDonorsCount = donations.length;
  const avgDonation = totalDonorsCount > 0 ? Math.round(totalDonationsAmount / totalDonorsCount) : 0;

  // Filtered donations
  const filteredDonations = donations.filter(d => {
    const q = search.toLowerCase();
    const matchesSearch =
      (d.memberName && d.memberName.toLowerCase().includes(q)) ||
      (d.senderAccountName && d.senderAccountName.toLowerCase().includes(q)) ||
      (d.senderAccountNumber && d.senderAccountNumber.toLowerCase().includes(q)) ||
      (d.receiptReference && d.receiptReference.toLowerCase().includes(q)) ||
      (d.id && d.id.toLowerCase().includes(q)) ||
      (d.notes && d.notes.toLowerCase().includes(q));

    const matchesMethod = methodFilter === 'all' || d.paymentMethod === methodFilter;
    const matchesMonth = selectedMonth === 'all' || d.month === selectedMonth;

    return matchesSearch && matchesMethod && matchesMonth;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-[#047857] rounded-xl border border-emerald-200">
              <Heart className="w-5 h-5 fill-emerald-600/20 text-[#047857]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                Direct & Public Donations Ledger
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-sans mt-0.5">
                Record and manage donations received via WhatsApp (+92 318 3182308), bank transfers, or offline outreach.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchDonations}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
            title="Refresh records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#047857] hover:bg-[#064E3B] transition-all shadow-xs hover:shadow-md cursor-pointer border border-[#047857]"
          >
            <Plus className="w-4 h-4" />
            <span>Record Direct Donation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Funds Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">
              Total Direct Donations
            </p>
            <h3 className="text-2xl font-extrabold text-[#064E3B] font-serif">
              PKR {totalDonationsAmount.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-700 font-medium">
              100% credited to treasury balance
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-[#047857] rounded-xl border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Donations Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">
              Recorded Donors
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
              {totalDonorsCount} {totalDonorsCount === 1 ? 'Entry' : 'Entries'}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Self-recorded by Admin
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* Average Donation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">
              Average Contribution
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
              PKR {avgDonation.toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Per recorded donation
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor, bank, phone/IBAN, TRX..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#047857]"
          >
            <option value="all">All Payment Channels</option>
            <option value="NayaPay">NayaPay</option>
            <option value="Bank Transfer">Bank Transfer / Meezan</option>
            <option value="EasyPaisa">EasyPaisa</option>
            <option value="JazzCash">JazzCash</option>
            <option value="Cash">Cash</option>
            <option value="Other">Other</option>
          </select>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#047857]"
          >
            <option value="all">All Months</option>
            {monthOptions.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donations List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading && donations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#047857]" />
            <p className="text-sm font-sans">Loading donation records from database...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-slate-800">
              No Direct Donations Found
            </h3>
            <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
              {search || methodFilter !== 'all' || selectedMonth !== 'all'
                ? 'No recorded donations match your selected filters. Try clearing filters.'
                : 'Click "Record Direct Donation" to log the first donation received via WhatsApp or bank transfer.'}
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Donation Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Ref Code</th>
                  <th className="py-3.5 px-4">Donor & Account</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Channel</th>
                  <th className="py-3.5 px-4">Category & Notes</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Receipt</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonations.map((rec) => {
                  const catMatch = rec.notes?.match(/\[Category:\s*(.+?)\]/);
                  const displayCat = catMatch ? catMatch[1] : 'Direct Donation';
                  const cleanNotes = (rec.notes || '').replace(/\[Category:\s*.+?\]\s*/g, '');

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* Ref Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#047857]">
                        {rec.id}
                      </td>

                      {/* Donor & Account */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-bold text-slate-900 text-sm">
                          {rec.memberName || rec.senderAccountName || 'Anonymous Donor'}
                        </div>
                        {rec.senderAccountNumber && (
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-slate-400" />
                            <span>{rec.senderAccountNumber}</span>
                          </div>
                        )}
                        {rec.senderAccountName && rec.senderAccountName !== rec.memberName && (
                          <div className="text-[10px] text-slate-400">
                            A/C Title: {rec.senderAccountName}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#064E3B] font-extrabold text-xs border border-emerald-200">
                          PKR {Number(rec.amount).toLocaleString()}
                        </span>
                      </td>

                      {/* Payment Channel */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.paymentMethod}</span>
                        </div>
                        {rec.receiptReference && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            TRX: {rec.receiptReference}
                          </div>
                        )}
                      </td>

                      {/* Category & Notes */}
                      <td className="py-3.5 px-4 max-w-xs space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {displayCat}
                        </span>
                        {cleanNotes && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {cleanNotes}
                          </p>
                        )}
                      </td>

                      {/* Date & Month */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-medium text-slate-700">
                          {rec.paymentDate || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cycle: {rec.month}
                        </div>
                      </td>

                      {/* Receipt Image Thumbnail */}
                      <td className="py-3.5 px-4 text-center">
                        {rec.receiptImage ? (
                          <button
                            onClick={() => {
                              setPreviewImage(rec.receiptImage || null);
                              setPreviewTitle(`Donation Receipt - ${rec.memberName} (PKR ${rec.amount})`);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                            title="View receipt screenshot"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No File</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-[#064E3B] border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Verified & Paid</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(rec)}
                            className="p-1.5 text-slate-600 hover:text-[#047857] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                            title="Edit donation details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, record: rec, isProcessing: false })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Delete donation entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record / Edit Donation Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-5 bg-[#064E3B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-800/80 rounded-xl text-emerald-200">
                  <Heart className="w-5 h-5 fill-current text-rose-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">
                    {isEditing ? 'Edit Direct Donation Record' : 'Record Direct Public Donation'}
                  </h3>
                  <p className="text-xs text-emerald-200 font-sans">
                    Log donor contribution received via WhatsApp (+92 318 3182308) or offline contact.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Donor Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Donor Full Name / Sender Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => {
                    setDonorName(e.target.value);
                    if (!senderAccountName) setSenderAccountName(e.target.value);
                  }}
                  placeholder="e.g. Brother Muhammad Usman"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                />
              </div>

              {/* Amount & Quick Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Donation Amount (PKR) <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#047857]">
                    PKR {Number(amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    PKR
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    min="1"
                    required
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                  />
                </div>
                {/* Quick amount chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['500', '1000', '2000', '3000', '5000', '10000', '25000', '50000'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAmount(chip)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        amount === chip
                          ? 'bg-[#047857] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      PKR {Number(chip).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Column Row: Sender Phone / Account & Bank Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Sender Account / Phone / IBAN
                  </label>
                  <input
                    type="text"
                    value={senderAccountNumber}
                    onChange={(e) => setSenderAccountNumber(e.target.value)}
                    placeholder="e.g. 0318-3182308 or Bank A/C"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Payment Method / Channel <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                  >
                    <option value="NayaPay">NayaPay (Direct Foundation Wallet)</option>
                    <option value="Bank Transfer">Meezan Bank / Bank Transfer</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Other">Other Gateway</option>
                  </select>
                </div>
              </div>

              {/* Two Column Row: Category / Purpose & Billing Month */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Cause / Allocation Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                  >
                    <option value="General Welfare">General Welfare & Charity</option>
                    <option value="Monthly Ration Support">Monthly Ration Support</option>
                    <option value="Daily Meal Distribution">Daily Meal Distribution</option>
                    <option value="Medical Assistance">Medical Assistance</option>
                    <option value="Education Support">Education Support</option>
                    <option value="Sadqah & Zakat">Sadqah & Zakat Fund</option>
                    <option value="Emergency Relief">Emergency Relief</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Accounting Month / Cycle
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                  >
                    {monthOptions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Two Column Row: Payment Date & Transaction ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Transaction ID / Reference
                  </label>
                  <input
                    type="text"
                    value={receiptReference}
                    onChange={(e) => setReceiptReference(e.target.value)}
                    placeholder="e.g. TRX-982138"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white"
                  />
                </div>
              </div>

              {/* Receipt Screenshot Upload */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Payment Receipt Screenshot (Optional)
                </label>
                
                {receiptImage ? (
                  <div className="relative p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={receiptImage}
                        alt="Receipt Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Screenshot Attached</p>
                        <p className="text-[10px] text-slate-500">Ready to save with record</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptImage('')}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#047857] bg-slate-50 hover:bg-emerald-50/40 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Click or drag screenshot here</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Admin Notes / Memo */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Admin Audit Notes / Memo
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Donor reached out via WhatsApp (+92 318 3182308) to support Ramadan Rations."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857] focus:bg-white resize-none"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#047857] hover:bg-[#064E3B] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Record...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEditing ? 'Save Changes' : 'Save & Record Donation'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Delete Donation Record?
              </h3>
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                Are you sure you want to delete the donation of <strong className="text-slate-800">PKR {Number(deleteModal.record.amount).toLocaleString()}</strong> recorded for <strong className="text-slate-800">{deleteModal.record.memberName}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ open: false, record: null, isProcessing: false })}
                disabled={deleteModal.isProcessing}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteModal.isProcessing}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
              >
                {deleteModal.isProcessing ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold truncate pr-4">
                {previewTitle || 'Donation Screenshot'}
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={previewImage}
                alt="Donation Screenshot"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { getLoggedInMember } from '../../utils/memberAuth';
import {
  ContributionRecord,
  getContributions,
  addContribution,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { Receipt, Plus, CheckCircle2, Clock, AlertCircle, Building2, Smartphone, ShieldCheck } from 'lucide-react';

export const MemberContributionsPage: React.FC = () => {
  const member = getLoggedInMember();
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);

  const getPledgeAmount = (): number => {
    if (!member) return 300;
    if (member.monthlyPledge && member.monthlyPledge > 0) return member.monthlyPledge;
    if (member.monthlyContribution) {
      const match = member.monthlyContribution.match(/\d+/g);
      if (match) {
        const num = parseInt(match.join(''), 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return 300;
  };

  const currentPledge = getPledgeAmount();

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [month, setMonth] = useState(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  const [amount, setAmount] = useState<number>(currentPledge);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'EasyPaisa' | 'JazzCash' | 'NayaPay' | 'Cash'>('NayaPay');
  const [senderAccountName, setSenderAccountName] = useState('');
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [receiptReference, setReceiptReference] = useState('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = () => {
    if (member) {
      const all = getContributions();
      setContributions(all.filter(c => c.memberId === member.id));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  if (!member) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.bmp', '.heic', '.heif'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!file.type.startsWith('image/') && !allowedExtensions.includes(ext)) {
        setErrorMessage('Only image files (JPEG, PNG, GIF, WebP, AVIF, TIFF, BMP, HEIC/HEIF) are allowed. Zip files are not permitted.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Receipt image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount < 300) {
      setErrorMessage('Monthly contribution pledge minimum must be 300 PKR/month.');
      return;
    }

    setIsSubmitting(true);
    const result = await addContribution({
      memberId: member.id,
      memberName: member.name,
      month,
      amount,
      paymentMethod,
      senderAccountName: senderAccountName.trim() || member.name,
      senderAccountNumber: senderAccountNumber.trim(),
      receiptReference: receiptReference.trim() || 'REF-' + Math.floor(100000 + Math.random() * 900000),
      receiptImage: receiptImage || undefined,
      paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending Review',
      notes: notes.trim(),
      submissionType: 'member_contribution'
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to submit contribution payment proof. Please try again.');
      return;
    }

    setIsSubmitModalOpen(false);
    setSenderAccountName('');
    setSenderAccountNumber('');
    setReceiptReference('');
    setReceiptImage('');
    setNotes('');
    setSuccessMessage('Contribution payment proof submitted! Admin will verify and update status.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B] flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-[#047857]" />
            My Monthly Contribution Ledger
          </h1>
          <p className="font-sans text-xs text-slate-500 mt-1">
            Track your monthly pledge payments and submit bank transfer / mobile wallet transfer references for verification.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Payment Proof</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mandatory Pledge Info Banner */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Foundation Monthly Pledge Rule:</p>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Minimum monthly contribution pledge is <span className="font-bold">300 PKR/month</span>. Your current registered pledge is <span className="font-bold">PKR {currentPledge.toLocaleString()}/month</span>. Verified monthly payments automatically earn +300 community engagement points.
          </p>
        </div>
      </div>

      {/* Official Foundation Payment Account Info Card */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-3">
        <h3 className="font-serif text-sm font-bold text-[#064E3B] flex items-center justify-between">
          <span>Official Foundation Payment Accounts</span>
          <span className="text-[10px] bg-emerald-100 text-[#064E3B] px-2 py-0.5 rounded font-bold">Verified Account</span>
        </h3>
        <div className="max-w-md text-xs">
          <div className="p-4 bg-emerald-50/90 rounded-2xl border border-emerald-300/80 space-y-1.5 shadow-xs">
            <p className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Smartphone className="w-4 h-4 text-emerald-700" /> NAYA PAY (Primary)
            </p>
            <p className="text-xs text-slate-700">Account Title: <strong className="text-[#064E3B]">MEHR SHEHARYAR KHAN</strong></p>
            <p className="font-mono text-sm font-extrabold text-emerald-900">Account / Mobile #: 0341 0611344</p>
          </div>
        </div>
      </div>

      {/* Contributions History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-[#064E3B]">
            Contribution Receipts History
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Total Logged: {contributions.length}
          </span>
        </div>

        {contributions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-slate-800">No contribution receipts found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Submit your bank or wallet transfer reference above after making your monthly pledge contribution.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Pledge Amount</th>
                  <th className="py-3 px-4">Transfer Method</th>
                  <th className="py-3 px-4">Sender Account Info</th>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Receipt Proof</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.month}</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-emerald-700">
                      PKR {c.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-800 font-semibold">
                        {c.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <p className="font-bold text-slate-800 text-xs">{c.senderAccountName || c.memberName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{c.senderAccountNumber || 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{c.receiptReference || 'N/A'}</td>
                    <td className="py-3.5 px-4">
                      {c.receiptImage ? (
                        <a href={c.receiptImage} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline">
                          <img src={c.receiptImage} alt="Receipt" className="w-7 h-7 object-cover rounded border border-slate-200" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No image</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{c.paymentDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        c.status === 'Pending Review' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        c.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUBMIT CONTRIBUTION PROOF MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                Submit Monthly Contribution Proof
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Official Foundation Deposit Account Info Banner */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/90 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#064E3B] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  Official Foundation Deposit Account
                </span>
                <span className="text-[10px] bg-emerald-200/80 text-[#064E3B] font-bold px-2 py-0.5 rounded">
                  NAYA PAY
                </span>
              </div>
              <p className="text-slate-700 font-medium">
                Account Title: <strong className="text-[#064E3B]">MEHR SHEHARYAR KHAN</strong>
              </p>
              <p className="text-slate-700 font-mono font-bold">
                Account / Mobile Number: <span className="text-emerald-900 bg-emerald-100/60 px-1.5 py-0.5 rounded">0341 0611344</span>
              </p>
              <p className="text-[10px] text-slate-500 italic pt-0.5">
                Send your monthly pledge to this account, then enter your sender details below.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitContribution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Billing Month
                </label>
                <input
                  type="text"
                  required
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contribution Amount (PKR) * [Minimum 300 PKR/month]
                </label>
                <input
                  type="number"
                  required
                  min={300}
                  value={amount}
                  onChange={e => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Transfer Method Used *
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                >
                  <option value="NayaPay">NayaPay</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Direct Cash Deposit</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Account Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arslan Ashraf"
                    value={senderAccountName}
                    onChange={e => setSenderAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Account # / Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0300 1234567"
                    value={senderAccountNumber}
                    onChange={e => setSenderAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction Reference ID / Deposit Receipt # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRX-98230198 or Ref Number"
                  value={receiptReference}
                  onChange={e => setReceiptReference(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Receipt Screenshot / Image *
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/tiff,image/bmp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.tiff,.bmp,.heic,.heif"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-[#064E3B] hover:file:bg-emerald-100"
                />
                {receiptImage && (
                  <div className="mt-2 relative inline-block">
                    <img src={receiptImage} alt="Receipt Screenshot" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-xs" />
                    <button
                      type="button"
                      onClick={() => setReceiptImage('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-5 h-5 text-[10px] font-bold flex items-center justify-center cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details regarding transfer..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

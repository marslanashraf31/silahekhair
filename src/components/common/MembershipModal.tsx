import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, CheckCircle2, Lock, Phone, User, MapPin, DollarSign, MessageSquare, ShieldCheck, AlertCircle, Upload } from 'lucide-react';
import { FoundationLogo } from './FoundationLogo';
import { SITE_CONFIG } from '../../config/siteConfig';
import { getActiveMemberCount, DATASTORE_CHANGE_EVENT, notifyDataStoreChange, getApplications, saveApplications, MembershipApplication, addNotification, addAuditLog, addApplication } from '../../utils/dataStore';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [memberCount, setMemberCount] = useState(getActiveMemberCount());

  // Form Field States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [amount, setAmount] = useState('300');
  const [customAmount, setCustomAmount] = useState('');
  const [motivation, setMotivation] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'WhatsApp' | 'Phone Call' | 'Email'>('WhatsApp');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState('');

  // Status & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.tiff', '.bmp', '.heic', '.heif'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!file.type.startsWith('image/') && !allowedExtensions.includes(ext)) {
        setError('Only image files (JPEG, PNG, GIF, WebP, AVIF, TIFF, BMP, HEIC/HEIF) are allowed. Zip files are not permitted.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handleUpdate = () => setMemberCount(getActiveMemberCount());
    window.addEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      resetForm();
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setCity('');
    setAmount('300');
    setCustomAmount('');
    setMotivation('');
    setPassword('');
    setConfirmPassword('');
    setConsentChecked(false);
    setError('');
    setIsLoading(false);
    setAssignedMemberId(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation 1: Required Fields
    if (!fullName.trim() || !phone.trim() || !city.trim() || !motivation.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validation 2: Valid Phone Number
    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number (e.g. 03001234567).');
      return;
    }

    // Validation 3: Monthly Pledge minimum 300 PKR
    let pledgeVal = 300;
    if (amount === 'custom') {
      pledgeVal = parseInt(customAmount, 10);
      if (isNaN(pledgeVal) || pledgeVal < 300) {
        setError('Minimum monthly contribution pledge is PKR 300/month.');
        return;
      }
    } else {
      pledgeVal = parseInt(amount, 10);
    }
    const finalPledge = `PKR ${pledgeVal.toLocaleString()} / month`;

    // Validation 4: Password Match & Length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    // Validation 5: Consent Checkbox
    if (!consentChecked) {
      setError('You must accept the membership pledge & terms to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await addApplication({
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: `${fullName.toLowerCase().replace(/\s+/g, '')}@silah.org`,
        city: city.trim(),
        pledgedAmount: finalPledge,
        motivation: motivation.trim(),
        password: password
      });

      setIsLoading(false);

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to submit application. Please try again.');
        return;
      }

      const assignedId = result.data.id;
      setAssignedMemberId(assignedId);

      await addNotification({
        type: 'application',
        title: 'New Membership Application',
        message: `New application received from ${fullName.trim()} (${assignedId}) — Pledged: ${finalPledge}`,
        link: '/admin/members/applications'
      });

      await addAuditLog({
        adminName: 'Applicant',
        action: 'Submitted Application',
        module: 'Members',
        recordId: assignedId,
        reason: `Membership application submitted by ${fullName.trim()} (${cleanPhone})`,
        status: 'info'
      });

      notifyDataStoreChange();
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'A network error occurred while submitting. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0F172A]/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="membership-modal-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-[#047857]/20 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#047857]/10 bg-[#FAF9F6] shrink-0">
          <FoundationLogo size="sm" />
          <button
            onClick={onClose}
            aria-label="Close membership application modal"
            className="p-2 rounded-full text-[#64748B] hover:text-[#064E3B] hover:bg-[#ECFDF5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#047857] min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-5">
          {assignedMemberId ? (
            /* ================= SUCCESS / MEMBER ID CONFIRMATION STATE ================= */
            <div className="text-center py-4 sm:py-6 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-[#ECFDF5] text-[#047857] rounded-full flex items-center justify-center mx-auto border-2 border-[#047857]/20">
                <CheckCircle2 className="w-10 h-10 text-[#047857]" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-serif text-2xl font-bold text-[#064E3B]">
                  Your application has been submitted.
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thank you for joining Silah-e-Khair Foundation. Your official application has been recorded in our permanent database.
                </p>
              </div>

              {/* Reserved sequential Member ID display */}
              <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl max-w-sm mx-auto text-center space-y-2 shadow-xs">
                <p className="text-xs font-bold text-[#047857] uppercase tracking-wider">
                  Your Reserved Member ID
                </p>
                <div className="text-3xl font-mono font-extrabold text-[#064E3B] bg-white py-2 px-4 rounded-xl border border-emerald-300 shadow-2xs inline-block">
                  {assignedMemberId}
                </div>
                <div className="pt-1 flex items-center justify-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-100/80 py-1 px-3 rounded-lg border border-amber-300/60">
                  <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Status: PENDING APPROVAL</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 max-w-md mx-auto text-left space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#047857]" />
                  Important Login Instructions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  <li>Please note down your reserved Member ID: <strong className="text-slate-900 font-mono">{assignedMemberId}</strong>.</li>
                  <li>This ID remains yours after admin approval.</li>
                  <li>Your membership is currently being reviewed by admin coordinators.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/member/login');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Proceed to Member Login</span>
                </button>

                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum, I submitted my member application for Silah-e-Khair Foundation. My reserved Member ID is ${assignedMemberId}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current shrink-0" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            /* ================= APPLICATION FORM STATE ================= */
            <>
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#047857] text-xs font-semibold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Official Membership Application</span>
                </div>
                <h2 id="membership-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-[#064E3B]">
                  Become a Contributing Member
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  Join {memberCount} active members pooling monthly pledges for verified community relief.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Section 1: Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad Ali"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-1">
                      City / Location *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Karachi, Lahore, Islamabad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-1">
                      Preferred Contact Method
                    </label>
                    <select
                      value={preferredContactMethod}
                      onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857]"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                </div>

                {/* Section 2: Monthly Pledge Amount */}
                <div className="space-y-1.5 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#047857]" />
                      Monthly Contribution Pledge *
                    </label>
                    <span className="text-[10px] font-bold text-[#047857] bg-emerald-100 px-2 py-0.5 rounded-md">
                      Minimum 300 PKR / month
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {['300', '500', '1000', 'custom'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          amount === val
                            ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        {val === 'custom' ? 'Custom Amount' : `PKR ${val}/mo`}
                      </button>
                    ))}
                  </div>

                  {amount === 'custom' && (
                    <input
                      type="number"
                      required
                      min="300"
                      placeholder="Enter monthly amount in PKR (Minimum 300 PKR)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                    />
                  )}
                </div>

                {/* Optional Payment Proof Attachment */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider">
                        First Payment Screenshot (Optional)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        If you have already made your initial pledge payment via NayaPay (0341 0611344), you may attach proof.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-emerald-50 text-[#064E3B] text-xs font-bold rounded-xl border border-emerald-300 shadow-2xs cursor-pointer transition-colors shrink-0">
                      <Upload className="w-4 h-4 text-[#047857]" />
                      <span>{paymentScreenshot ? 'Change Screenshot' : 'Attach Screenshot'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/tiff,image/bmp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.tiff,.bmp,.heic,.heif"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {paymentScreenshot && (
                    <div className="pt-2 flex items-center gap-3">
                      <img src={paymentScreenshot} alt="Payment proof preview" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Payment screenshot attached
                      </span>
                    </div>
                  )}
                </div>

                {/* Section 3: Reason for Joining */}
                <div>
                  <label className="block text-xs font-bold text-[#064E3B] uppercase tracking-wider mb-1">
                    Reason for Joining / Motivation *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Briefly share why you wish to join Silah-e-Khair Foundation as a member..."
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 focus:border-[#047857]"
                  />
                </div>

                {/* Section 4: Security Password for Member Portal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Choose Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 col-span-1 sm:col-span-2">
                    🔒 Password is used to securely authenticate your Member Portal account using Supabase Auth.
                  </p>
                </div>

                {/* Section 5: Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#047857] focus:ring-[#047857] w-4 h-4"
                  />
                  <label htmlFor="consentCheck" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                    I confirm my monthly pledge commitment (Minimum 300 PKR/month) to Silah-e-Khair Foundation and agree to adhere to community rules.
                  </label>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#064E3B] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
                >
                  {isLoading ? (
                    <span>Submitting Application to Database...</span>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-current shrink-0" />
                      <span>Submit Membership Application</span>
                    </>
                  )}
                </button>

                {/* Secondary Option: WhatsApp Support */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Need help with your application?{' '}
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent('Assalam-o-Alaikum, I need help with my membership application.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#25D366] hover:underline inline-flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      Chat with Coordinator on WhatsApp
                    </a>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Heart, CheckCircle2, Lock, Phone, User, MapPin, Upload, Smartphone, AlertCircle, Eye, EyeOff, Building2, CreditCard, DollarSign } from 'lucide-react';
import { FoundationLogo } from './FoundationLogo';
import { saveApplications, getApplications, notifyDataStoreChange, MembershipApplication, addContribution, addApplication } from '../../utils/dataStore';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  // Mandatory Donation Fields
  const [amount, setAmount] = useState<string>('1000');
  const [senderAccountTitle, setSenderAccountTitle] = useState<string>('');
  const [senderAccountNumber, setSenderAccountNumber] = useState<string>('');
  const [senderBank, setSenderBank] = useState<string>('NayaPay');
  const [receiptImage, setReceiptImage] = useState<string>('');

  const [becomeMember, setBecomeMember] = useState(false);

  // Member Registration Fields
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyPledge, setMonthlyPledge] = useState('300');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setReceiptImage(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setAmount('1000');
    setSenderAccountTitle('');
    setSenderAccountNumber('');
    setSenderBank('NayaPay');
    setReceiptImage('');
    setBecomeMember(false);
    setFullName('');
    setCity('');
    setPhone('');
    setPassword('');
    setError('');
    setSuccessMessage('');
    setAssignedMemberId(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Mandatory Donation Validations
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid donation amount in PKR.');
      return;
    }
    if (!senderAccountTitle.trim()) {
      setError('Please enter the Sender Account Title (Name on your bank account).');
      return;
    }
    if (!senderAccountNumber.trim()) {
      setError('Please enter your Account Number / IBAN / Phone Number from which you transferred.');
      return;
    }
    if (!senderBank.trim()) {
      setError('Please select or specify the Bank/Wallet used for the transfer.');
      return;
    }
    if (!receiptImage) {
      setError('Mandatory requirement: Please upload a screenshot of your transfer payment receipt.');
      return;
    }

    // Always log contribution record to database & notify admin portal
    let memberIdForContrib = 'GUEST';

    if (becomeMember) {
      if (!fullName.trim() || !city.trim() || !phone.trim() || !password) {
        setError('Please fill in all member registration fields.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      setIsLoading(true);
      try {
        const cleanPhone = phone.replace(/\s+/g, '');
        const res = await addApplication({
          fullName: fullName.trim(),
          phone: cleanPhone,
          email: `${fullName.toLowerCase().replace(/\s+/g, '')}@silah.org`,
          city: city.trim(),
          pledgedAmount: `PKR ${Number(monthlyPledge || 300).toLocaleString()} / month`,
          motivation: `Donated PKR ${amount} via ${senderBank} (Sender: ${senderAccountTitle.trim()}, Acc: ${senderAccountNumber.trim()})`,
          password: password
        });

        setIsLoading(false);

        if (res.success && res.data) {
          const assignedId = res.data.id;
          memberIdForContrib = assignedId;
          setAssignedMemberId(assignedId);
        } else {
          setError(res.error || 'Failed to register membership application.');
          return;
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err?.message || 'Error processing request.');
        return;
      }
    }

    // Map sender bank to allowed type or fallback
    const allowedPaymentMethods = ['JazzCash', 'EasyPaisa', 'Cash', 'Bank Transfer', 'NayaPay'] as const;
    let mappedMethod: any = 'Bank Transfer';
    if (senderBank === 'NayaPay') mappedMethod = 'NayaPay';
    else if (senderBank === 'EasyPaisa') mappedMethod = 'EasyPaisa';
    else if (senderBank === 'JazzCash') mappedMethod = 'JazzCash';

    setIsLoading(true);
    // Submit contribution awaiting admin approval
    const contribResult = await addContribution({
      memberId: memberIdForContrib,
      memberName: senderAccountTitle.trim(),
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      amount: Number(amount),
      paymentMethod: mappedMethod,
      paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      receiptReference: `${senderBank} Tx - ${senderAccountNumber.trim()}`,
      senderAccountName: senderAccountTitle.trim(),
      senderAccountNumber: senderAccountNumber.trim(),
      receiptImage: receiptImage || undefined,
      status: 'Pending Review',
      notes: `Public donation submitted via ${senderBank} from Account #${senderAccountNumber.trim()}. Screenshot attached. Pending Admin Verification.`,
      submissionType: 'public_donation'
    });
    setIsLoading(false);

    if (!contribResult.success) {
      setError(contribResult.error || 'Failed to submit donation record to database. Please check connection.');
      return;
    }

    notifyDataStoreChange();

    if (!becomeMember) {
      setSuccessMessage(`JazakAllah Khair! Thank you for your generous contribution of PKR ${Number(amount).toLocaleString()} via ${senderBank}.`);
      setTimeout(() => {
        handleClose();
      }, 3500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-emerald-200/80 w-full max-w-lg overflow-hidden my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#064E3B] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FoundationLogo variant="white" size="sm" />
            <span className="font-serif font-bold text-sm text-emerald-100 ml-2">Donate to Foundation</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {assignedMemberId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-[#047857] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                Donation & Membership Application Submitted!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your assigned Member ID is <strong className="text-[#064E3B] font-mono font-bold">{assignedMemberId}</strong>. You can use this ID or your phone number to log into the Member Portal.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-[#047857] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : successMessage ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-[#047857] rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {successMessage}
              </h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Card */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-[#064E3B] font-serif font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-[#047857]" />
                  <span>Official Foundation NayaPay Account</span>
                </div>
                <div className="text-xs space-y-1 pt-1 text-slate-800">
                  <p>Account Title: <strong className="text-[#064E3B]">MEHR SHEHARYAR KHAN</strong></p>
                  <p className="font-mono text-sm font-bold text-emerald-900">Account / Mobile #: 0341 0611344</p>
                </div>
              </div>

              {/* Mandatory Donation Verification Details */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#064E3B] uppercase tracking-wider">
                    Transfer Verification Details
                  </p>
                  <span className="text-rose-600 text-[10px] font-bold">* required</span>
                </div>

                {/* Amount Transferred & Sender Account Number Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Transferred Amount (PKR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#064E3B]">PKR</span>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 1000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-14 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Account / Mobile / IBAN # *
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 03410611344 or IBAN"
                        value={senderAccountNumber}
                        onChange={(e) => setSenderAccountNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Sender Account Title & Sender Bank Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Account Title *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Name on sender account"
                        value={senderAccountTitle}
                        onChange={(e) => setSenderAccountTitle(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Transferred From (Bank/Wallet) *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      >
                        <option value="NayaPay">NayaPay</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="JazzCash">JazzCash</option>
                        <option value="Meezan Bank">Meezan Bank</option>
                        <option value="Allied Bank">Allied Bank (ABL)</option>
                        <option value="Habib Bank (HBL)">Habib Bank (HBL)</option>
                        <option value="United Bank (UBL)">United Bank (UBL)</option>
                        <option value="Bank Alfalah">Bank Alfalah</option>
                        <option value="SadaPay">SadaPay</option>
                        <option value="Other Bank Account">Other Bank Account</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mandatory Payment Receipt Screenshot */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                        Payment Screenshot * (Mandatory)
                      </label>
                      <p className="text-[11px] text-amber-800">
                        Please upload transaction receipt screenshot from {senderBank}.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-amber-100 text-[#064E3B] text-xs font-bold rounded-xl border border-amber-300 shadow-2xs cursor-pointer transition-colors shrink-0">
                      <Upload className="w-4 h-4 text-[#047857]" />
                      <span>{receiptImage ? 'Change Image' : 'Attach Screenshot *'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/tiff,image/bmp,image/heic,image/heif,.jpg,.jpeg,.png,.gif,.webp,.avif,.tiff,.bmp,.heic,.heif"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {receiptImage ? (
                    <div className="pt-2 flex items-center gap-3">
                      <img src={receiptImage} alt="Payment screenshot preview" className="w-12 h-12 object-cover rounded-lg border border-amber-300" />
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Screenshot attached
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-rose-600">
                      * Screenshot attachment is strictly mandatory to submit donation.
                    </p>
                  )}
                </div>
              </div>

              {/* Become a Member Checkbox */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={becomeMember}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBecomeMember(checked);
                      if (checked) {
                        const numAmt = Number(amount);
                        if (!isNaN(numAmt) && numAmt >= 300) {
                          setMonthlyPledge(String(numAmt));
                        } else {
                          setMonthlyPledge('300');
                        }
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-[#047857] focus:ring-[#047857] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#064E3B]">
                    I would also like to Become an Official Member
                  </span>
                </label>
              </div>

              {/* Conditional Member Registration Fields */}
              {becomeMember && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                    Member Account Details
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required={becomeMember}
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required={becomeMember}
                          placeholder="e.g. Karachi"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required={becomeMember}
                          placeholder="0300 1234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Monthly Contribution Pledge (PKR/month) *
                      </label>
                      <span className="text-[10px] text-[#047857] font-semibold">Min PKR 300/mo</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      {['300', '500', '1000', '2000'].map((pVal) => (
                        <button
                          key={pVal}
                          type="button"
                          onClick={() => setMonthlyPledge(pVal)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            monthlyPledge === pVal
                              ? 'bg-[#064E3B] text-white border-[#064E3B]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          PKR {pVal}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="300"
                        required={becomeMember}
                        placeholder="300"
                        value={monthlyPledge}
                        onChange={(e) => setMonthlyPledge(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Select or enter your monthly commitment (e.g. 300, 500, 1000 PKR/month).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Choose Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={becomeMember}
                        minLength={6}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#047857] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>{isLoading ? 'Processing...' : becomeMember ? 'Submit Donation & Become Member' : 'Confirm Donation'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

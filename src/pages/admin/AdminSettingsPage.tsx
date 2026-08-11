import React, { useState, useEffect } from 'react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { Settings, User, Building2, MessageSquare, Bell, Shield, Save, Check, KeyRound, AlertCircle } from 'lucide-react';
import { changeAdminPassword } from '../../utils/adminAuth';
import { getFoundationSettings, saveFoundationSettings, FoundationSettings } from '../../utils/dataStore';

export const AdminSettingsPage: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Editable settings form state
  const [coordinatorTitle, setCoordinatorTitle] = useState('Chief Coordination Officer');
  const [adminEmail, setAdminEmail] = useState('admin@silah-e-khair.org');
  const [whatsappNumber, setWhatsappNumber] = useState(SITE_CONFIG.whatsappNumber);
  const [foundationEmail, setFoundationEmail] = useState('info@silah-e-khair.org');
  const [foundationAddress, setFoundationAddress] = useState('Karachi, Pakistan');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  useEffect(() => {
    const initial = getFoundationSettings();
    setCoordinatorTitle(initial.coordinatorTitle || 'Chief Coordination Officer');
    setAdminEmail(initial.adminEmail || 'admin@silah-e-khair.org');
    setWhatsappNumber(initial.whatsappNumber || SITE_CONFIG.whatsappNumber);
    setFoundationEmail(initial.foundationEmail || 'info@silah-e-khair.org');
    setFoundationAddress(initial.foundationAddress || 'Karachi, Pakistan');
    setEmailNotifications(initial.emailNotifications ?? true);
    setWhatsappAlerts(initial.whatsappAlerts ?? true);
  }, []);

  // Password Update Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);

    const payload: FoundationSettings = {
      coordinatorTitle,
      adminEmail,
      whatsappNumber,
      foundationEmail,
      foundationAddress,
      emailNotifications,
      whatsappAlerts
    };

    const res = await saveFoundationSettings(payload);
    setIsSaving(false);

    if (!res.success) {
      setSaveError(res.error || 'Failed to save foundation settings to database.');
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('New passwords do not match.');
      return;
    }

    changeAdminPassword(currentPasswordInput, newPasswordInput).then((result) => {
      if (!result.success) {
        setPasswordError(result.error || 'Unable to update admin password.');
        return;
      }

      setPasswordSuccess('Admin password updated successfully!');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B]">
            Portal & Foundation Settings
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Configure coordinator profiles, public WhatsApp contacts, and portal login credentials.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-[#047857] text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}

        {saveError && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{saveError}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Admin Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-[#064E3B]">
            <User className="w-5 h-5 text-[#047857]" />
            <h3 className="font-serif text-base font-bold">Administrator Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Coordinator Title / Role
              </label>
              <input
                type="text"
                value={coordinatorTitle}
                onChange={(e) => setCoordinatorTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Foundation Contact Information & WhatsApp */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-[#064E3B]">
            <Building2 className="w-5 h-5 text-[#047857]" />
            <h3 className="font-serif text-base font-bold">Public Contact & WhatsApp Settings</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Public WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#25D366]">
                  <MessageSquare className="w-4 h-4 fill-current" />
                </div>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Updates WhatsApp direct contact buttons across the website.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Inquiries Email
              </label>
              <input
                type="email"
                value={foundationEmail}
                onChange={(e) => setFoundationEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registered Operations Location
              </label>
              <input
                type="text"
                value={foundationAddress}
                onChange={(e) => setFoundationAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-[#064E3B]">
            <Bell className="w-5 h-5 text-[#047857]" />
            <h3 className="font-serif text-base font-bold">Notification Preferences</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-[#047857] focus:ring-[#047857]"
              />
              <span className="text-xs font-medium text-slate-700">
                Email notification alerts for new member applications
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#047857] focus:ring-[#047857]"
              />
              <span className="text-xs font-medium text-slate-700">
                WhatsApp coordinator notification for monthly contribution verifications
              </span>
            </label>
          </div>
        </div>

        {/* Section 4: Security & Credentials */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-[#064E3B]">
            <Shield className="w-5 h-5 text-[#047857]" />
            <h3 className="font-serif text-base font-bold">Security & Credentials</h3>
          </div>

          <div className="space-y-3 text-xs font-sans text-slate-600">
            <p className="leading-relaxed">
              Default password for admin login is <code className="font-bold text-[#064E3B] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">muzammil123</code>. You can change this password below.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(true);
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#064E3B] text-white font-bold rounded-xl hover:bg-[#047857] transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Update Admin Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Settings Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#064E3B] hover:bg-[#047857] text-white font-sans font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#064E3B] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#047857]" />
                <span>Change Admin Password</span>
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

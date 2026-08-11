import React, { useState } from 'react';
import { getLoggedInMember } from '../../utils/memberAuth';
import { MemberRecord, updateMember, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';
import { User, Phone, Mail, MapPin, Shield, CheckCircle2, AlertCircle, Calendar, CreditCard, Lock } from 'lucide-react';

export const MemberProfilePage: React.FC = () => {
  const current = getLoggedInMember();
  const [member, setMember] = useState<MemberRecord | null>(current);

  const [phone, setPhone] = useState(current?.phone || '');
  const [email, setEmail] = useState(current?.email || '');
  const [city, setCity] = useState(current?.city || '');
  const [area, setArea] = useState(current?.area || '');
  const [emergencyContact, setEmergencyContact] = useState(current?.emergencyContact || '');

  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!member) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setIsSubmitting(true);

    const updated: MemberRecord = {
      ...member,
      phone,
      email,
      city,
      area,
      emergencyContact
    };

    const res = await updateMember(updated);
    setIsSubmitting(false);

    if (!res.success) {
      setSaveError(res.error || 'Failed to update member profile in database.');
      return;
    }

    setMember(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B] flex items-center gap-2.5">
          <User className="w-7 h-7 text-[#047857]" />
          My Member Profile
        </h1>
        <p className="font-sans text-xs text-slate-500 mt-1">
          View your membership details, verify contact records, and update your emergency contact preferences.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile contact details updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Security Rule Warning Box */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-700 flex items-start gap-3">
        <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-slate-800">Security & Anti-Abuse Controls:</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            As per foundation policy, members cannot directly modify their Member ID, Assigned Progression Level, Total Points, or Contribution Pledges. To request changes to these core fields, please contact foundation coordinators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Read-Only Core Identity Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-5 h-fit">
          <div className="text-center space-y-2 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-xl mx-auto font-serif">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">{member.name}</h2>
              <p className="font-mono text-xs font-semibold text-[#047857]">{member.id}</p>
            </div>
            <div className="flex justify-center gap-1.5 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {member.status.toUpperCase()}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {member.level || 'ACTIVE MEMBER'}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Join Date</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {member.joinDate}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Monthly Pledge</span>
              <span className="font-semibold text-[#064E3B] flex items-center gap-1.5 mt-0.5 font-serif text-sm">
                <CreditCard className="w-3.5 h-3.5 text-[#047857]" /> {member.monthlyContribution || 'PKR 300 / month'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">CNIC / ID Record</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 font-mono">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> {member.cnic || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Points Balance</span>
              <span className="font-bold text-amber-600 flex items-center gap-1.5 mt-0.5 font-serif text-sm">
                {(member.points || 0).toLocaleString()} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Editable Contact Information Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-serif text-lg font-bold text-[#064E3B]">
              Update Contact Information
            </h3>
            <p className="text-xs text-slate-500">
              Keep your primary mobile number and emergency contact updated for foundation announcements.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan-e-Iqbal Block 4"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emergency Contact (Name & Phone)
              </label>
              <input
                type="text"
                placeholder="e.g. Muhammad Ali (Brother) - 03009876543"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

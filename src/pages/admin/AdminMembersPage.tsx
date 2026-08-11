import React, { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, UserX, Clock, Users, Plus, Shield, Check, Trash2, Edit, Save, Eye, MapPin, Award, Phone, Mail, Building2, Calendar, FileText, KeyRound, Copy } from 'lucide-react';
import {
  MemberRecord,
  getMembersList,
  addMemberRecord,
  deleteMemberRecord,
  updateMemberRecord,
  getActiveMemberCount,
  setActiveMemberCount,
  addAuditLog,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Member Count banner edit state
  const [memberCountText, setMemberCountText] = useState('');
  const [countSavedNotice, setCountSavedNotice] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<MemberRecord | null>(null);
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const [deletingMember, setDeletingMember] = useState<{ id: string; name: string } | null>(null);
  const [copyNotice, setCopyNotice] = useState(false);

  // Add Member Form Fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('Karachi');
  const [newContribution, setNewContribution] = useState('PKR 300 / month');
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'pending'>('active');
  const [newCustomId, setNewCustomId] = useState('');
  const [newPassword, setNewPassword] = useState('member123');

  const loadData = () => {
    const list = getMembersList();
    setMembers(list);
    setMemberCountText(getActiveMemberCount());
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  const handleUpdateMemberCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberCountText.trim()) return;
    setActiveMemberCount(memberCountText.trim());
    setCountSavedNotice(true);
    setTimeout(() => setCountSavedNotice(false), 2000);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addMemberRecord({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@member.org`,
      city: newCity || 'Karachi',
      status: newStatus,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthlyContribution: newContribution,
      password: newPassword.trim() || 'member123'
    }, newCustomId.trim() || undefined);

    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewCustomId('');
    setNewPassword('member123');
    setIsAddModalOpen(false);
  };

  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateMemberRecord(editingMember);

    addAuditLog({
      adminName: 'Admin Coordinator',
      action: 'Updated Member Credentials & Profile',
      module: 'Members',
      recordId: editingMember.id,
      reason: `Updated member profile & credentials for ${editingMember.name} (${editingMember.id})`,
      status: 'success'
    });

    setEditingMember(null);
  };

  const handleDeleteMember = (id: string, name: string) => {
    setDeletingMember({ id, name });
  };

  const confirmDeleteMember = () => {
    if (deletingMember) {
      deleteMemberRecord(deletingMember.id);
      setDeletingMember(null);
    }
  };

  const handleToggleStatus = (member: MemberRecord) => {
    const nextStatus: MemberRecord['status'] = member.status === 'active' ? 'inactive' : 'active';
    updateMemberRecord({
      ...member,
      status: nextStatus
    });

    addAuditLog({
      adminName: 'Admin Coordinator',
      action: nextStatus === 'active' ? 'Activated Member' : 'Deactivated Member',
      module: 'Members',
      recordId: member.id,
      reason: `Changed member ${member.name} status to ${nextStatus}`,
      status: nextStatus === 'active' ? 'success' : 'warning'
    });
  };

  // Unique locations from members list
  const uniqueLocations = Array.from(
    new Set(members.map(m => m.city).filter(Boolean))
  );

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.city && m.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || m.city === selectedLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const activeCount = members.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Live Member Count Sync Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#047857]" />
            <span>Member Directory & Active Count Sync</span>
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Currently tracking <strong className="text-[#064E3B] font-bold">{members.length} total members</strong> ({activeCount} active).
          </p>
        </div>

        {/* Global Website Member Count Controller */}
        <form onSubmit={handleUpdateMemberCount} className="flex items-center gap-2 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/80 shrink-0">
          <div className="text-[11px] font-bold text-[#064E3B] whitespace-nowrap px-1">
            Public Web Badge:
          </div>
          <input
            type="text"
            required
            value={memberCountText}
            onChange={(e) => setMemberCountText(e.target.value)}
            className="w-20 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold font-mono text-[#064E3B] text-center focus:outline-none focus:ring-2 focus:ring-[#047857]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Badge</span>
          </button>
          {countSavedNotice && (
            <span className="text-[10px] text-emerald-700 font-bold animate-fade-in">Updated!</span>
          )}
        </form>
      </div>

      {/* Action & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, ID, or city..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
          />
        </div>

        {/* Filters & Add Member Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: `All (${members.length})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'inactive', label: `Inactive (${members.length - activeCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#064E3B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Location Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#047857]"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white font-sans font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Member ID</th>
                <th className="py-3.5 px-4 sm:px-6">Full Name</th>
                <th className="py-3.5 px-4 sm:px-6">WhatsApp / Phone</th>
                <th className="py-3.5 px-4 sm:px-6">Location</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
                <th className="py-3.5 px-4 sm:px-6">Contribution</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#064E3B]">
                    {m.id}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">
                    {m.name}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600 font-mono">
                    {m.phone}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {m.city || 'Karachi'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <button
                      onClick={() => handleToggleStatus(m)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        m.status === 'active'
                          ? 'bg-emerald-100 text-[#064E3B] hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Click to toggle Active/Inactive"
                    >
                      {m.status === 'active' ? (
                        <>
                          <UserCheck className="w-3 h-3 text-[#047857]" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                    {m.monthlyContribution || 'PKR 300 / month'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingMember(m)}
                        className="p-1.5 text-slate-500 hover:text-[#064E3B] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingMember(m)}
                        className="p-1.5 text-slate-500 hover:text-[#064E3B] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id, m.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No members match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MEMBER DETAILS MODAL */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#064E3B] font-serif font-bold flex items-center justify-center">
                  {viewingMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#064E3B]">
                    {viewingMember.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">{viewingMember.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingMember(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Credentials Box */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#064E3B]">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Member Portal Credentials</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Member ID: ${viewingMember.id}\nPassword: ${viewingMember.password || 'member123'}`);
                      setCopyNotice(true);
                      setTimeout(() => setCopyNotice(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#047857] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copyNotice ? 'Copied!' : 'Copy Credentials'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-white p-2 rounded border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Member ID</span>
                    <span className="font-bold text-[#064E3B]">{viewingMember.id}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">Portal Password</span>
                    <span className="font-bold text-slate-800">{viewingMember.password || 'member123'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${viewingMember.status === 'active' ? 'bg-emerald-100 text-[#064E3B]' : 'bg-slate-200 text-slate-700'}`}>
                    {viewingMember.status === 'active' ? 'Active Member' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Joined Date</span>
                  <span className="font-semibold text-slate-800">{viewingMember.joinedDate}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp / Phone</span>
                  <span className="font-mono font-bold text-slate-800">{viewingMember.phone}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email</span>
                  <span className="font-medium text-slate-800">{viewingMember.email || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> City / Location</span>
                  <span className="font-semibold text-slate-800">{viewingMember.city || 'Karachi'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Monthly Contribution</span>
                  <span className="font-bold text-[#064E3B]">{viewingMember.monthlyContribution || 'PKR 300 / month'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-500" /> Engagement Points</span>
                  <span className="font-mono font-bold text-amber-700">{viewingMember.points ?? 0} pts</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingMember(null)}
                className="px-4 py-2 bg-[#064E3B] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                Edit Member Record ({editingMember.id})
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditMemberSubmit} className="space-y-4">
              
              {/* Credentials Section */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-3">
                <span className="text-xs font-bold text-[#064E3B] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Member Credentials Management</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#064E3B] uppercase mb-1">
                      Member ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.id}
                      onChange={(e) => setEditingMember({ ...editingMember, id: e.target.value })}
                      placeholder="e.g. SKF-0001"
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-[#064E3B] focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#064E3B] uppercase mb-1">
                      Portal Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.password || 'member123'}
                      onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                      placeholder="e.g. member123"
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    placeholder="member@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editingMember.city || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, city: e.target.value })}
                    placeholder="e.g. Karachi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Monthly Target
                  </label>
                  <input
                    type="text"
                    value={editingMember.monthlyContribution || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, monthlyContribution: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Member Status
                  </label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    <option value="active">Active Member</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Engagement Points
                  </label>
                  <input
                    type="number"
                    value={editingMember.points ?? 0}
                    onChange={(e) => setEditingMember({ ...editingMember, points: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                Register New Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              
              {/* Credentials Configuration */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-3">
                <span className="text-xs font-bold text-[#064E3B] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Assign Initial Credentials</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#064E3B] uppercase mb-1">
                      Member ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCustomId}
                      onChange={(e) => setNewCustomId(e.target.value)}
                      placeholder="Auto e.g. SKF-1002"
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-[#064E3B] focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#064E3B] uppercase mb-1">
                      Portal Password
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="e.g. member123"
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Arslan Ashraf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  WhatsApp / Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g. Karachi, Lahore, Islamabad"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Monthly Contribution Target
                </label>
                <input
                  type="text"
                  value={newContribution}
                  onChange={(e) => setNewContribution(e.target.value)}
                  placeholder="e.g. PKR 300 / month"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#047857]"
                >
                  <option value="active">Active Member</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending Approval</option>
                </select>
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
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-serif text-lg font-bold">
              !
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Remove Member Record?
              </h3>
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove member <span className="font-bold text-slate-800">"{deletingMember.name}"</span> ({deletingMember.id})? An audit log will be created.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

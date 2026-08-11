import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Minus,
  Search,
  ShieldCheck,
  Settings,
  History,
  Users,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import {
  MemberRecord,
  PointActivityConfig,
  PointTransaction,
  MemberLevelConfig,
  getMembersList,
  getPointActivities,
  savePointActivities,
  getMemberLevels,
  saveMemberLevels,
  getPointTransactions,
  addPointTransaction,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';

export const AdminEngagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'activities' | 'levels' | 'ledger'>('members');

  // Data states
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [activities, setActivities] = useState<PointActivityConfig[]>([]);
  const [levels, setLevels] = useState<MemberLevelConfig[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Manual Adjustment Modal State
  const [adjustingMember, setAdjustingMember] = useState<MemberRecord | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [adjustmentPoints, setAdjustmentPoints] = useState<number>(100);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [adjustmentActivityName, setAdjustmentActivityName] = useState<string>('Volunteer Service Verification');
  const [modalError, setModalError] = useState<string>('');

  // Activity Edit Modal State
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityPoints, setNewActivityPoints] = useState(100);
  const [newActivityDesc, setNewActivityDesc] = useState('');

  const loadData = () => {
    setMembers(getMembersList());
    setActivities(getPointActivities());
    setLevels(getMemberLevels());
    setTransactions(getPointTransactions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    m.phone.includes(searchMemberQuery)
  );

  // Level Editing State
  const [editingLevel, setEditingLevel] = useState<MemberLevelConfig | null>(null);
  const [levelForm, setLevelForm] = useState<MemberLevelConfig>({
    id: '',
    levelName: '',
    minPoints: 0,
    maxPoints: 0,
    description: '',
    benefits: [],
    status: 'active'
  });
  const [benefitsInput, setBenefitsInput] = useState('');

  // Submit Manual Points Adjustment
  const handlePerformAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMember) return;
    if (!adjustmentReason.trim()) {
      setModalError('A mandatory reason is required for manual point adjustments to populate audit logs.');
      return;
    }
    if (adjustmentPoints <= 0) {
      setModalError('Point value must be greater than 0.');
      return;
    }

    const delta = adjustmentType === 'add' ? Math.abs(adjustmentPoints) : -Math.abs(adjustmentPoints);

    const res = await addPointTransaction({
      memberId: adjustingMember.id,
      memberName: adjustingMember.name,
      activity: adjustmentActivityName || 'Manual Admin Adjustment',
      points: delta,
      reason: adjustmentReason.trim(),
      adminName: 'Admin Coordinator'
    });

    if (!res.success) {
      setModalError(res.error || 'Failed to update member points in database.');
      return;
    }

    setAdjustingMember(null);
    setAdjustmentReason('');
    setModalError('');
    alert(`Successfully ${delta >= 0 ? 'awarded' : 'deducted'} ${Math.abs(delta)} points for ${adjustingMember.name}. Audit log created.`);
  };

  // Add Activity Type
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;

    const newAct: PointActivityConfig = {
      id: `ACT-${Date.now()}`,
      activity: newActivityName.trim(),
      defaultPoints: newActivityPoints,
      description: newActivityDesc.trim() || 'Custom community activity',
      active: true
    };

    const res = await savePointActivities([...activities, newAct]);
    if (!res.success) {
      alert(res.error || 'Failed to save point activities to database.');
      return;
    }

    setNewActivityName('');
    setNewActivityPoints(100);
    setNewActivityDesc('');
  };

  // Toggle Activity Active state
  const handleToggleActivity = async (id: string) => {
    const updated = activities.map(a => a.id === id ? { ...a, active: !a.active } : a);
    const res = await savePointActivities(updated);
    if (!res.success) {
      alert(res.error || 'Failed to update activity status in database.');
    }
  };

  // Level editing handlers
  const handleOpenEditLevel = (lvl: MemberLevelConfig) => {
    setEditingLevel(lvl);
    setLevelForm(lvl);
    setBenefitsInput((lvl.benefits || []).join('\n'));
  };

  const handleSaveLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel) return;

    const benefitsArray = benefitsInput
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean);

    const updatedLevelObj: MemberLevelConfig = {
      ...levelForm,
      benefits: benefitsArray
    };

    const nextLevels = levels.map(l => l.id === editingLevel.id ? updatedLevelObj : l);
    const res = await saveMemberLevels(nextLevels);

    if (!res.success) {
      alert(res.error || 'Failed to save progression levels to database.');
      return;
    }

    setEditingLevel(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B] flex items-center gap-2.5">
          <Award className="w-7 h-7 text-amber-500" />
          Community Engagement & Points System
        </h1>
        <p className="font-sans text-xs text-slate-500 mt-1 max-w-3xl">
          Recognize consistent monthly contributions, event attendance, and volunteer service. Points provide community appreciation and structure volunteer progression levels.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'members'
              ? 'border-[#047857] text-[#047857]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Member Points Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'activities'
              ? 'border-[#047857] text-[#047857]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Point Activity Types</span>
        </button>

        <button
          onClick={() => setActiveTab('levels')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'levels'
              ? 'border-[#047857] text-[#047857]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Progression Levels</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-[#047857] text-[#047857]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Points Transaction Ledger</span>
        </button>
      </div>

      {/* TAB 1: MEMBERS POINTS OVERVIEW */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member name or ID..."
                value={searchMemberQuery}
                onChange={e => setSearchMemberQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
              />
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredMembers.length} Members
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Member ID</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Current Points</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredMembers.slice(0, 25).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {m.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                        {m.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.level === 'VOLUNTEER' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          m.level?.includes('CORE') ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {m.level || 'ACTIVE MEMBER'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-600 font-serif text-sm">
                        {(m.points || 0).toLocaleString()} pts
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setAdjustingMember(m);
                            setModalError('');
                          }}
                          className="px-3 py-1.5 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Adjust Points</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: POINT ACTIVITY TYPES CONFIG */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              Active Point Distribution Rules
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
              {activities.map(act => (
                <div key={act.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-sm font-bold text-slate-900">{act.activity}</h4>
                      <span className="font-serif font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-xs">
                        +{act.defaultPoints} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{act.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleActivity(act.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      act.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {act.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 h-fit">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              Add New Activity Type
            </h3>
            <form onSubmit={handleAddActivity} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relief Packaging Help"
                  value={newActivityName}
                  onChange={e => setNewActivityName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Points
                </label>
                <input
                  type="number"
                  required
                  value={newActivityPoints}
                  onChange={e => setNewActivityPoints(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Details regarding points qualification..."
                  value={newActivityDesc}
                  onChange={e => setNewActivityDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Add Activity Configuration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PROGRESSION LEVELS */}
      {activeTab === 'levels' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Important Organizational Authority Principle:</p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Reaching points thresholds grants community recognition and volunteer eligibility. Points do NOT automatically bestow sensitive administrative or financial access. All core volunteer and leadership assignments remain subject to explicit Admin approval.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levels.map(lvl => (
              <div key={lvl.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="w-2 h-full bg-[#047857] absolute left-0 top-0"></div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {lvl.minPoints.toLocaleString()} - {lvl.maxPoints.toLocaleString()} PTS
                    </span>
                    <button
                      onClick={() => handleOpenEditLevel(lvl)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      Edit Level
                    </button>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#064E3B] pt-2">
                    {lvl.levelName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{lvl.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Associated Benefits & Privileges:</p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {lvl.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: POINTS TRANSACTIONS LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-[#064E3B]">
              Official Points Ledger Audit Log
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Recorded Transactions: {transactions.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Activity / Reason</th>
                  <th className="py-3 px-4">Points Delta</th>
                  <th className="py-3 px-4">Running Balance</th>
                  <th className="py-3 px-4">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{tx.memberId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{tx.memberName}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <p className="font-semibold">{tx.activity}</p>
                      {tx.reason && <p className="text-[11px] text-slate-500">{tx.reason}</p>}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={tx.points >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-slate-800">
                      {tx.runningTotal.toLocaleString()} pts
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {tx.adminName || 'Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANUAL POINTS ADJUSTMENT MODAL */}
      {adjustingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                  Manual Points Adjustment
                </h3>
                <p className="text-xs text-slate-500">
                  Member: <span className="font-bold text-slate-800">{adjustingMember.name}</span> ({adjustingMember.id})
                </p>
              </div>
              <button
                onClick={() => setAdjustingMember(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handlePerformAdjustment} className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    adjustmentType === 'add'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Award Points
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('deduct')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    adjustmentType === 'deduct'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" /> Correct / Deduct Points
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Points Value *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={adjustmentPoints}
                  onChange={e => setAdjustmentPoints(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Activity Title / Category
                </label>
                <input
                  type="text"
                  required
                  value={adjustmentActivityName}
                  onChange={e => setAdjustmentActivityName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mandatory Audit Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Verified on-ground ration distribution volunteer participation..."
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save & Log Audit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROGRESSION LEVEL MODAL */}
      {editingLevel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                  Configure Progression Level
                </h3>
                <p className="text-xs text-slate-500">
                  Level Code: <span className="font-mono font-bold text-slate-800">{editingLevel.id}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingLevel(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLevel} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Level Title / Name
                </label>
                <input
                  type="text"
                  required
                  value={levelForm.levelName}
                  onChange={e => setLevelForm({ ...levelForm, levelName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Minimum Points Threshold
                  </label>
                  <input
                    type="number"
                    required
                    value={levelForm.minPoints}
                    onChange={e => setLevelForm({ ...levelForm, minPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Points Threshold
                  </label>
                  <input
                    type="number"
                    required
                    value={levelForm.maxPoints}
                    onChange={e => setLevelForm({ ...levelForm, maxPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={levelForm.description}
                  onChange={e => setLevelForm({ ...levelForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Benefits & Privileges (One per line)
                </label>
                <textarea
                  rows={3}
                  value={benefitsInput}
                  onChange={e => setBenefitsInput(e.target.value)}
                  placeholder="e.g. Priority registration for drives&#10;Community badge on member card"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={levelForm.status}
                  onChange={e => setLevelForm({ ...levelForm, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLevel(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Level Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

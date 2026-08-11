import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Users,
  Award,
  Clock,
  MapPin,
  Eye,
  Filter
} from 'lucide-react';
import {
  EventItem,
  getEvents,
  saveEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  verifyAttendanceAndAwardPoints,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { dbGetEvents } from '../../lib/supabaseService';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [managingEvent, setManagingEvent] = useState<EventItem | null>(null);

  // Form State
  const [customCategory, setCustomCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    imageUrl: '',
    category: 'Community Ration Distribution' as EventItem['category'],
    registrationEnabled: true,
    maxParticipants: 30,
    pointsForAttendance: 250,
    status: 'published' as EventItem['status']
  });

  const standardEventCategories = [
    'Community Ration Distribution',
    'Meal Distribution Drive',
    'Fundraising / Community Event',
    'Volunteer Activity',
    'Educational Support Event'
  ];

  const loadData = async () => {
    const local = getEvents();
    setEvents(local);
    try {
      const remote = await dbGetEvents();
      if (Array.isArray(remote) && remote.length > 0) {
        setEvents(remote);
        saveEvents(remote);
      }
    } catch (err) {
      console.warn('Error fetching events from DB:', err);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  // Filtered Events
  const filteredEvents = events.filter(evt => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || evt.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setCustomCategory('');
    setFormData({
      title: '',
      description: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time: '10:00 AM - 01:00 PM',
      location: 'Silah Foundation Relief Center, Karachi',
      imageUrl: '',
      category: 'Community Ration Distribution',
      registrationEnabled: true,
      maxParticipants: 30,
      pointsForAttendance: 250,
      status: 'published'
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (evt: EventItem) => {
    setEditingEvent(evt);
    const isStandard = standardEventCategories.includes(evt.category);
    if (isStandard) {
      setCustomCategory('');
    } else {
      setCustomCategory(evt.category);
    }
    setFormData({
      title: evt.title,
      description: evt.description,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      imageUrl: evt.imageUrl || '',
      category: isStandard ? evt.category : ('Other' as any),
      registrationEnabled: evt.registrationEnabled,
      maxParticipants: evt.maxParticipants || 30,
      pointsForAttendance: evt.pointsForAttendance,
      status: evt.status
    });
    setIsCreateModalOpen(true);
  };

  // Save Event (Create or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) {
      alert('Please fill in all required event details.');
      return;
    }

    const finalCategory = (formData.category as string) === 'Other'
      ? (customCategory.trim() || 'Other')
      : formData.category;

    const payload = {
      ...formData,
      category: finalCategory as any
    };

    let res;
    if (editingEvent) {
      res = await updateEvent({
        ...editingEvent,
        ...payload
      });
    } else {
      res = await addEvent(payload);
    }

    if (!res.success) {
      alert(res.error || 'Failed to save event to database.');
      return;
    }

    setIsCreateModalOpen(false);
    setEditingEvent(null);
    await loadData();
  };

  // Toggle Status directly
  const handleToggleStatus = async (evt: EventItem) => {
    const nextStatus: EventItem['status'] = evt.status === 'published' ? 'draft' : 'published';
    const res = await updateEvent({ ...evt, status: nextStatus });
    if (!res.success) {
      alert(res.error || 'Failed to update event status in database.');
      return;
    }
    await loadData();
  };

  // Delete Event
  const handleConfirmDelete = async () => {
    if (deletingEvent) {
      const res = await deleteEvent(deletingEvent.id);
      if (!res.success) {
        alert(res.error || 'Failed to delete event from database.');
        return;
      }
      setDeletingEvent(null);
      await loadData();
    }
  };

  // Attendance Toggle
  const handleToggleAttendance = async (eventId: string, memberId: string, currentAttended: boolean) => {
    const res = await verifyAttendanceAndAwardPoints(eventId, memberId, !currentAttended);
    if (!res.success) {
      alert(res.error || 'Failed to verify attendance in database.');
      return;
    }
    await loadData();
    const updatedEvts = getEvents();
    const updatedTarget = updatedEvts.find(e => e.id === eventId);
    if (updatedTarget) {
      setManagingEvent(updatedTarget);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B] flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-[#047857]" />
            Events & Community Drives Management
          </h1>
          <p className="font-sans text-xs text-slate-500 mt-1">
            Create, publish, and track volunteer participation for foundation drives. Verify attendance to award community engagement points.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-[#047857] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Total Organized Events</p>
          <p className="text-2xl font-bold font-serif text-[#064E3B]">{events.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Published Active Events</p>
          <p className="text-2xl font-bold font-serif text-emerald-600">
            {events.filter(e => e.status === 'published').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Total Registered Volunteers</p>
          <p className="text-2xl font-bold font-serif text-amber-600">
            {events.reduce((acc, e) => acc + e.registrations.length, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500">Verified Field Participants</p>
          <p className="text-2xl font-bold font-serif text-teal-700">
            {events.reduce((acc, e) => acc + e.registrations.filter(r => r.attended).length, 0)}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search event title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Community Ration Distribution">Ration Distribution</option>
            <option value="Meal Distribution Drive">Meal Distribution</option>
            <option value="Fundraising / Community Event">Fundraising</option>
            <option value="Volunteer Activity">Volunteer Activity</option>
            <option value="Educational Support Event">Education Event</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table / Card List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-slate-800">No events found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No foundation events match your search criteria. Create a new drive or adjust your filters above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEvents.map(evt => (
              <div key={evt.id} className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 grow max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      evt.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                      evt.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                      evt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {evt.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-semibold text-[#047857] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                      {evt.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      +{evt.pointsForAttendance} pts for attendance
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#064E3B]">
                    {evt.title}
                  </h3>
                  <p className="font-sans text-xs text-slate-600 line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {evt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {evt.location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right md:text-left lg:text-right space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {evt.registrations.length} {evt.maxParticipants ? `/ ${evt.maxParticipants}` : ''} Registered
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      {evt.registrations.filter(r => r.attended).length} Verified Attended
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setManagingEvent(evt)}
                      title="Manage Volunteer Attendance"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Registrations</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(evt)}
                      title={evt.status === 'published' ? 'Unpublish Event' : 'Publish Event'}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(evt)}
                      title="Edit Event"
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingEvent(evt)}
                      title="Delete Event"
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {editingEvent ? 'Edit Event Details' : 'Create New Event'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Ration Packaging Drive"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide drive objectives and volunteer instructions..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Event Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => {
                      const val = e.target.value as any;
                      setFormData({ ...formData, category: val });
                      if (val !== 'Other') setCustomCategory('');
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Community Ration Distribution">Ration Distribution</option>
                    <option value="Meal Distribution Drive">Meal Distribution</option>
                    <option value="Fundraising / Community Event">Fundraising</option>
                    <option value="Volunteer Activity">Volunteer Activity</option>
                    <option value="Educational Support Event">Education Event</option>
                    <option value="Other">Other / Custom...</option>
                  </select>
                  {((formData.category as string) === 'Other') && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category name..."
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="published">Published (Public)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aug 25, 2026"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM - 02:00 PM"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silah Foundation Relief Depot, Karachi"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Volunteer Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={e => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Points awarded for Verified Attendance
                  </label>
                  <input
                    type="number"
                    value={formData.pointsForAttendance}
                    onChange={e => setFormData({ ...formData, pointsForAttendance: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regEnabled"
                  checked={formData.registrationEnabled}
                  onChange={e => setFormData({ ...formData, registrationEnabled: e.target.checked })}
                  className="w-4 h-4 text-[#047857] rounded cursor-pointer"
                />
                <label htmlFor="regEnabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Enable Member Online Registration / Interest
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingEvent ? 'Update Event' : 'Save & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGING REGISTRATIONS & ATTENDANCE MODAL */}
      {managingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                  Manage Event Registrations & Attendance
                </h3>
                <p className="text-xs text-slate-500">{managingEvent.title}</p>
              </div>
              <button
                onClick={() => setManagingEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <p className="font-bold">Attendance Verification Policy:</p>
                <p className="text-[11px] text-emerald-800">
                  Only Admin-verified attendance awards +{managingEvent.pointsForAttendance} community points to member ledger.
                </p>
              </div>
              <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg text-xs shrink-0">
                +{managingEvent.pointsForAttendance} Pts
              </span>
            </div>

            {managingEvent.registrations.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No member registrations yet</p>
                <p className="text-xs text-slate-500">
                  Members can express interest via the public/member portal once registration is open.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {managingEvent.registrations.map(reg => (
                  <div
                    key={reg.memberId}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{reg.memberName}</p>
                      <p className="text-[11px] text-slate-500">
                        ID: <span className="font-mono text-slate-700">{reg.memberId}</span> • Registered: {reg.registeredAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {reg.pointsAwarded && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <Award className="w-3 h-3" /> Points Awarded
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(managingEvent.id, reg.memberId, !!reg.attended)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          reg.attended
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {reg.attended ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Attended
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Mark Attended
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setManagingEvent(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto font-serif text-lg font-bold">
              !
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Remove Event Record?
              </h3>
              <p className="font-sans text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{deletingEvent.title}"</span>? This will remove all registrations associated with it.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEvent(null)}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

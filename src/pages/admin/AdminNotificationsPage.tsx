import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Inbox, Clock, Filter, Trash2, ArrowRight, UserPlus, CreditCard, TrendingDown, Calendar, ShieldCheck, RefreshCw, CheckCircle2, Search } from 'lucide-react';
import { NotificationItem, getNotifications, saveNotifications, markNotificationRead, markAllNotificationsRead, deleteNotificationRecord, clearAllNotifications, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';
import { dbGetNotifications } from '../../lib/supabaseService';

export const AdminNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'application' | 'contribution' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const local = getNotifications();
      const remote = await dbGetNotifications();

      const map = new Map<string, NotificationItem>();
      local.forEach(n => map.set(n.id, n));
      remote.forEach(n => map.set(n.id, n));

      const merged = Array.from(map.values()).sort((a, b) => {
        // Unread first, then by id descending
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return b.id.localeCompare(a.id);
      });

      setNotifications(merged);
      saveNotifications(merged);
    } catch (err) {
      console.warn('Error fetching notifications:', err);
      setNotifications(getNotifications());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleStoreChange = () => {
      setNotifications(getNotifications());
    };

    window.addEventListener(DATASTORE_CHANGE_EVENT, handleStoreChange);
    return () => {
      window.removeEventListener(DATASTORE_CHANGE_EVENT, handleStoreChange);
    };
  }, []);

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteNotificationRecord(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      await clearAllNotifications();
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'application' && n.type !== 'application') return false;
    if (filter === 'contribution' && n.type !== 'contribution') return false;
    if (filter === 'expense' && n.type !== 'expense') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }

    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <UserPlus className="w-5 h-5 text-emerald-600" />;
      case 'contribution':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'expense':
        return <TrendingDown className="w-5 h-5 text-amber-600" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'contribution':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'expense':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'event':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-[#064E3B]">
              Notification Center
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-sans text-xs font-bold animate-pulse">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Real-time alerts for member applications, contribution verifications, and system disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh from Supabase DB"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-sans font-semibold text-xs border transition-colors ${
              unreadCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-sans font-semibold text-xs border border-slate-200 hover:border-rose-200 transition-colors"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts by name, keyword or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 font-sans text-xs focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'application', label: 'Applications', count: notifications.filter(n => n.type === 'application').length },
              { id: 'contribution', label: 'Payments', count: notifications.filter(n => n.type === 'contribution').length },
              { id: 'expense', label: 'Expenses', count: notifications.filter(n => n.type === 'expense').length }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filter === tab.id
                  ? 'bg-[#064E3B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Feed */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="max-w-xs mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="font-serif font-bold text-slate-800 text-base">
              No Notifications Found
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              {searchQuery ? 'No notifications match your search query.' : 'No alerts recorded under this filter.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) handleMarkRead(item.id);
                if (item.link) navigate(item.link);
              }}
              className={`group bg-white p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer hover:shadow-md ${
                !item.isRead
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-400/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Type Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getNotificationBadgeColor(item.type)}`}>
                {getNotificationIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-serif text-sm ${!item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {item.title}
                    </h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Unread" />
                    )}
                  </div>

                  <span className="font-sans text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timestamp}
                  </span>
                </div>

                <p className="font-sans text-xs text-slate-600 mt-1 leading-relaxed">
                  {item.message}
                </p>

                {item.link && (
                  <div className="mt-2.5 inline-flex items-center gap-1 font-sans text-xs font-semibold text-[#064E3B] group-hover:text-emerald-700 group-hover:underline">
                    <span>Take Action</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>

              {/* Individual Actions */}
              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                {!item.isRead && (
                  <button
                    onClick={(e) => handleMarkRead(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

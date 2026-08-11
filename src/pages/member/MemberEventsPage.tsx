import React, { useState, useEffect } from 'react';
import { getLoggedInMember } from '../../utils/memberAuth';
import {
  EventItem,
  getEvents,
  registerForEvent,
  cancelEventRegistration,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';
import { Calendar, MapPin, Clock, Award, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export const MemberEventsPage: React.FC = () => {
  const member = getLoggedInMember();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);

  const loadData = () => {
    const all = getEvents();
    // Only published events for member portal
    setEvents(all.filter(e => e.status === 'published'));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  if (!member) return null;

  const handleToggleRegistration = async (evt: EventItem) => {
    setErrorMessage('');
    setToastMessage('');
    setProcessingEventId(evt.id);

    const isRegistered = evt.registrations.some(r => r.memberId === member.id);
    if (isRegistered) {
      const res = await cancelEventRegistration(evt.id, member.id);
      setProcessingEventId(null);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to cancel event registration.');
        return;
      }
      setToastMessage(`Cancelled registration for "${evt.title}".`);
    } else {
      const res = await registerForEvent(evt.id, member.id, member.name);
      setProcessingEventId(null);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to register for event.');
        return;
      }
      setToastMessage(`Successfully registered for "${evt.title}"! Look forward to seeing you.`);
    }
    loadData();
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B] flex items-center gap-2.5">
          <Calendar className="w-7 h-7 text-[#047857]" />
          Volunteer Drives & Foundation Events
        </h1>
        <p className="font-sans text-xs text-slate-500 mt-1">
          Participate in community ration distributions, meal drives, and fundraising events with fellow members.
        </p>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Security Notice Box */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-700 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-slate-800">Attendance Verification Policy:</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Members cannot self-mark attendance. On-ground verification is recorded by Admin Coordinators during drive operations. Verified attendance automatically awards community points to your member ledger.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <div className="md:col-span-2 bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-slate-800">No active drives announced</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Check back soon! New community drives and ration packaging volunteer activities will be published here.
            </p>
          </div>
        ) : (
          events.map(evt => {
            const myReg = evt.registrations.find(r => r.memberId === member.id);
            const isRegistered = !!myReg;

            return (
              <div key={evt.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#047857] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      {evt.category}
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      +{evt.pointsForAttendance} Points
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#047857] shrink-0" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#047857] shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#047857] shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 pt-1">
                      <Users className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{evt.registrations.length} Volunteers Registered {evt.maxParticipants ? `(Max ${evt.maxParticipants})` : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {myReg?.attended ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Attendance Verified (+{evt.pointsForAttendance} pts)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleRegistration(evt)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isRegistered
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                          : 'bg-[#047857] hover:bg-[#064E3B] text-white shadow-xs'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-amber-700" />
                          <span>Registered (Click to Cancel)</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          <span>Register / Express Volunteer Interest</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

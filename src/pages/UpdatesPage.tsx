import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ArrowRight, X, BookOpen, MapPin, Clock, Users, UserCheck, Sparkles } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { UpdateArticle, EventItem } from '../types';
import { getUpdateArticles, getEvents, DATASTORE_CHANGE_EVENT } from '../utils/dataStore';
import { dbGetUpdateArticles, dbGetEvents } from '../lib/supabaseService';

export const UpdatesPage: React.FC = () => {
  const [articles, setArticles] = useState<UpdateArticle[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<UpdateArticle | null>(null);

  const loadData = async () => {
    const localArticles = getUpdateArticles();
    const localEvents = getEvents();
    setArticles(localArticles);
    setUpcomingEvents(localEvents);

    try {
      const [remoteArticles, remoteEvents] = await Promise.all([
        dbGetUpdateArticles(),
        dbGetEvents()
      ]);
      setArticles(remoteArticles);
      setUpcomingEvents(remoteEvents);
    } catch (err) {
      console.warn('Error fetching updates/events from Supabase:', err);
    }
  };

  useEffect(() => {
    document.title = 'Updates & Upcoming Events | Silah-e-Khair Foundation';
    window.scrollTo(0, 0);
    loadData();

    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  const categories = ['All', 'Distribution Report', 'Announcement', 'Foundation Update'];

  const filteredArticles = activeCategory === 'All'
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="News & Distribution Logs"
        title="Foundation Updates"
        subtitle="Official updates, field distribution reports, and foundation growth announcements."
      />

      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 pb-4 border-b border-[#047857]/10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-4 py-2 rounded-full font-sans text-xs md:text-sm font-semibold transition-all cursor-pointer
                  ${activeCategory === cat
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'bg-[#FAF9F6] text-[#1E293B] hover:bg-[#ECFDF5] hover:text-[#064E3B] border border-[#047857]/10'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15 hover:border-[#047857]/30 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[#047857] font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {article.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#64748B]">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#064E3B] group-hover:text-[#047857] transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="font-sans text-xs text-[#64748B] leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E3B] group-hover:text-[#047857] pt-3 border-t border-[#047857]/10">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Official Report</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              No updates published under this category yet.
            </div>
          )}

        </div>
      </section>

      {/* Upcoming Events & Volunteer Drives Section */}
      <section className="py-12 md:py-16 bg-[#FAF9F6] border-t border-[#047857]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#047857]/15">
            <div>
              <span className="text-xs font-bold text-[#047857] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4" /> Community Drives & Volunteer Schedules
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                Upcoming Foundation Events
              </h2>
            </div>
            <Link
              to="/member/login"
              className="inline-flex items-center gap-2 bg-[#064E3B] hover:bg-[#047857] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors w-fit shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login to Volunteer for Events</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#064E3B] font-bold text-[11px]">
                      {evt.category}
                    </span>
                    <span className="text-emerald-700 font-bold font-mono text-[11px]">
                      +{evt.pointsReward} PTS
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                      <span className="font-medium">{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                      <span>{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {evt.registrations?.length || 0} Registered Volunteers
                  </span>
                  <Link
                    to="/member/login"
                    className="text-xs font-bold text-[#064E3B] hover:text-[#047857] inline-flex items-center gap-1"
                  >
                    <span>Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {upcomingEvents.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No upcoming public events scheduled right now. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArticle(null)}
              aria-label="Close article"
              className="absolute top-4 right-4 p-2 rounded-full text-[#64748B] hover:bg-[#FAF9F6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs text-[#047857] font-semibold">
                <span>{selectedArticle.category}</span>
                <span>•</span>
                <span className="text-[#64748B]">{selectedArticle.date}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#064E3B]">
                {selectedArticle.title}
              </h2>
            </div>

            <p className="font-sans text-sm text-[#1E293B]/90 leading-relaxed pt-2 border-t border-[#FAF9F6] whitespace-pre-line">
              {selectedArticle.content}
            </p>

            <div className="pt-4 border-t border-[#FAF9F6] flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 bg-[#064E3B] text-white text-xs font-bold rounded-lg hover:bg-[#047857]"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

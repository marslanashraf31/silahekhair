import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading';
import { UpdateArticle } from '../../types';
import { getUpdateArticles, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';
import { dbGetUpdateArticles } from '../../lib/supabaseService';

export const UpdatesPreview: React.FC = () => {
  const [articles, setArticles] = useState<UpdateArticle[]>([]);

  const loadArticles = async () => {
    const local = getUpdateArticles();
    setArticles(local);

    try {
      const remote = await dbGetUpdateArticles();
      setArticles(remote);
    } catch (err) {
      console.warn('Error fetching update articles in preview:', err);
    }
  };

  useEffect(() => {
    loadArticles();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadArticles);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadArticles);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#047857]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#047857]/10 pb-8">
          <SectionHeading
            eyebrow="Announcements & Logs"
            title="Latest Updates"
            subtitle="Verified distribution reports and foundation announcements."
          />
          <Link
            to="/updates"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold text-[#064E3B] hover:text-[#047857] group shrink-0"
          >
            <span>View All Announcements</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Updates Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.slice(0, 3).map((article) => (
            <article
              key={article.id}
              className="flex flex-col justify-between space-y-4 group border-b border-[#047857]/10 pb-6 md:border-b-0 md:pb-0"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#047857] font-semibold">
                  <span>{article.category}</span>
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

              <Link
                to="/updates"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#064E3B] group-hover:text-[#047857] pt-2"
              >
                <span>Read Official Log</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

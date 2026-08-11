import React, { useState, useEffect } from 'react';
import { Maximize2, MapPin, X } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { GalleryItem } from '../types';
import { getGalleryItems, DATASTORE_CHANGE_EVENT } from '../utils/dataStore';
import { dbGetGalleryItems } from '../lib/supabaseService';

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const loadItems = async () => {
    const local = getGalleryItems();
    setItems(local);
    try {
      const dbItems = await dbGetGalleryItems();
      setItems(dbItems);
    } catch (err) {
      console.warn('Gallery page db fetch error:', err);
    }
  };

  useEffect(() => {
    document.title = 'Gallery | Silah-e-Khair Foundation';
    window.scrollTo(0, 0);
    loadItems();

    window.addEventListener(DATASTORE_CHANGE_EVENT, loadItems);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadItems);
  }, []);

  const categories = ['All', 'Ration Support', 'Food Distribution', 'Emergency Relief', 'Education Support', 'Community'];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Visual Record"
        title="Field Activity & Distribution Gallery"
        subtitle="Dignified, on-ground photography documenting our ration packing, meal serving, and community assistance drives."
      />

      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Category Filter Pills */}
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

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="bg-[#FAF9F6] rounded-2xl overflow-hidden border border-[#047857]/15 shadow-2xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-emerald-950/10">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs font-semibold text-white bg-[#064E3B]/80 px-2.5 py-1 rounded-md backdrop-blur-xs">
                      {item.category}
                    </span>
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#047857] font-semibold">
                    <span>{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#064E3B] group-hover:text-[#047857] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs text-[#64748B] line-clamp-2">
                    {item.caption}
                  </p>
                  {item.location && (
                    <div className="flex items-center gap-1 text-[11px] text-[#047857] font-sans pt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              No gallery items published under this category yet.
            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="Close Lightbox"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-16/9 bg-black">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#047857] font-semibold">
                <span>{selectedImage.category}</span>
                <span>{selectedImage.date}</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                {selectedImage.title}
              </h3>
              <p className="font-sans text-sm text-[#1E293B]/80 leading-relaxed">
                {selectedImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

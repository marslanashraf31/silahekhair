import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Maximize2, MapPin } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading';
import { GalleryItem } from '../../types';
import { getGalleryItems, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';

export const GalleryPreview: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const loadItems = () => {
    setItems(getGalleryItems());
  };

  useEffect(() => {
    loadItems();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadItems);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadItems);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-b border-[#047857]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow="On The Ground"
            title="Recent Field Work"
            subtitle="Glimpses into our on-ground food distribution, monthly ration packing, and community support."
          />
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold text-[#064E3B] hover:text-[#047857] group shrink-0"
          >
            <span>View Complete Gallery</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#047857]/15 shadow-2xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedImage(item)}
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
                <h4 className="font-serif text-base font-bold text-[#064E3B] group-hover:text-[#047857] transition-colors leading-snug">
                  {item.title}
                </h4>
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

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
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
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 bg-[#064E3B] text-white rounded-lg text-xs font-bold hover:bg-[#047857]"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/config/brand';
import { EnquiryModal } from '@/components/catalogue/EnquiryModal';

interface CatalogueItemClientProps {
  item: {
    id: string;
    slug: string;
    name: string;
    description?: string;
    images: { url: string; isPrimary: boolean }[];
    sizes: string[];
    category?: { name: string; slug: string };
  };
}

export default function CatalogueItemClient({ item }: CatalogueItemClientProps) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(
    item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url || '/placeholder-product.svg'
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back to Catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={item.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-product.svg';
                }}
              />
            </div>
            {item.images?.length > 1 && (
              <div className="flex gap-2">
                {item.images.map((img) => (
                  <button
                    key={img.url}
                    onClick={() => setActiveImage(img.url)}
                    className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === img.url ? 'border-gray-900' : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={item.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {item.category?.name && (
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 block">
                {item.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">{item.name}</h1>

            {item.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{item.description}</p>
            )}

            {item.sizes?.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Available Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((size) => (
                    <span
                      key={size}
                      className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-700"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 max-w-sm">
              <button
                onClick={() => setEnquiryOpen(true)}
                className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors active:scale-95"
              >
                Request Custom Order
              </button>
              <a
                href={buildWhatsAppLink(`Hi, I'd like to enquire about: *${item.name}*. Please share more details.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 py-1.5"
              >
                <MessageCircle className="h-4 w-4" />
                Or chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal
        isOpen={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        catalogueItemId={item.id}
        itemName={item.name}
      />
    </div>
  );
}

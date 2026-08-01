'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, PackageSearch } from 'lucide-react';
import { buildWhatsAppLink } from '@/config/brand';
import { EnquiryModal } from '@/components/catalogue/EnquiryModal';

interface CatalogueItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  images: { url: string; isPrimary: boolean }[];
  sizes: string[];
}

interface CatalogueCategory {
  id: string;
  name: string;
  slug: string;
}

interface CatalogueClientProps {
  categories: CatalogueCategory[];
  itemsByCategory: Record<string, CatalogueItem[]>;
}

function CatalogueItemCard({
  item,
  onEnquire,
}: {
  item: CatalogueItem;
  onEnquire: (item: CatalogueItem) => void;
}) {
  const primaryImage =
    item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url || '/placeholder-product.svg';

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Link href={`/catalogue/${item.slug}`} className="relative block aspect-square bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={primaryImage}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover object-center"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/placeholder-product.svg';
          }}
        />
      </Link>

      <div className="flex flex-col flex-1 p-5">
        <Link href={`/catalogue/${item.slug}`} className="block mb-1.5">
          <h3 className="font-semibold text-gray-900 text-base leading-snug hover:text-gray-600 transition-colors">
            {item.name}
          </h3>
        </Link>

        {item.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.description}</p>
        )}

        {item.sizes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.sizes.map((size) => (
              <span
                key={size}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={() => onEnquire(item)}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors active:scale-95"
          >
            Request Custom Order
          </button>
          <a
            href={buildWhatsAppLink(`Hi, I'd like to enquire about: *${item.name}*. Please share more details.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 py-1.5"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Or chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CatalogueClient({ categories, itemsByCategory }: CatalogueClientProps) {
  const [enquiryItem, setEnquiryItem] = useState<CatalogueItem | null>(null);

  const sectionsWithItems = categories.filter((c) => (itemsByCategory[c.id]?.length || 0) > 0);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Product Catalogue</h1>
          <p className="text-gray-500 text-sm max-w-2xl">
            Everything we manufacture, grouped by category, with the standard sizes available for each. Need
            something custom? Tap "Request Custom Order" on any item.
          </p>
        </div>
      </div>

      {sectionsWithItems.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageSearch className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Catalogue coming soon</h3>
          <p className="text-gray-500">Check back shortly.</p>
        </div>
      ) : (
        <>
          {/* Sticky category quick-nav */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
            <div className="container mx-auto px-4 lg:px-8 py-3 flex gap-2 overflow-x-auto">
              {sectionsWithItems.map((c) => (
                <a
                  key={c.id}
                  href={`#cat-${c.slug}`}
                  className="whitespace-nowrap text-xs font-semibold px-3.5 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 lg:px-8 py-10 space-y-14">
            {sectionsWithItems.map((category) => (
              <section key={category.id} id={`cat-${category.slug}`} className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {itemsByCategory[category.id].map((item) => (
                    <CatalogueItemCard key={item.id} item={item} onEnquire={setEnquiryItem} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      <EnquiryModal
        isOpen={!!enquiryItem}
        onClose={() => setEnquiryItem(null)}
        catalogueItemId={enquiryItem?.id}
        itemName={enquiryItem?.name || ''}
      />
    </div>
  );
}

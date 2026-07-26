import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { BRAND } from '@/config/brand';
import { ProductsClient } from './ProductsClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = `https://${BRAND.domain}`;

function prettifySlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function fetchProducts(params: URLSearchParams) {
  try {
    const res = await fetch(`${API_BASE}/products?${params.toString()}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { items: [], meta: undefined };
    const json = await res.json();
    const data = json.data || json;
    return { items: data.items || [], meta: data.meta };
  } catch {
    return { items: [], meta: undefined };
  }
}

type SearchParams = Promise<{ search?: string; category?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { search, category } = await searchParams;

  let title: string = `All Products | ${BRAND.name}`;
  let description: string = BRAND.siteDescription;

  if (search) {
    title = `Search results for "${search}" | ${BRAND.name}`;
  } else if (category) {
    const label = prettifySlug(category);
    title = `${label} | ${BRAND.name}`;
    description = `Shop our range of ${label.toLowerCase()} — premium steel kitchen storage from ${BRAND.name}.`;
  }

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/products` },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search = '', category = '' } = await searchParams;

  const params = new URLSearchParams({ limit: '12', page: '1' });
  if (search) params.set('search', search);
  if (category) params.set('categorySlug', category);

  const { items, meta } = await fetchProducts(params);

  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      }
    >
      <ProductsClient
        initialSearch={search}
        initialCategorySlug={category}
        initialProducts={items}
        initialMeta={meta}
      />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { BRAND } from '@/config/brand';
import CatalogueClient from './CatalogueClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = `https://${BRAND.domain}`;

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

function flattenCategories(nodes: CategoryNode[]): { id: string; name: string; slug: string }[] {
  const flat: { id: string; name: string; slug: string }[] = [];
  const walk = (list: CategoryNode[]) => {
    for (const node of list || []) {
      flat.push({ id: node.id, name: node.name, slug: node.slug });
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return flat;
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories/tree`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const tree = json.data || json;
    return flattenCategories(Array.isArray(tree) ? tree : []);
  } catch {
    return [];
  }
}

async function fetchCatalogueItems() {
  try {
    const res = await fetch(`${API_BASE}/catalogue-items`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json.data || json;
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const title = `Product Catalogue | ${BRAND.name}`;
  const description = `Browse everything we manufacture — the full range of steel kitchen storage products, grouped by category, with standard sizes for each — from ${BRAND.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/catalogue` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/catalogue`,
      siteName: BRAND.name,
      type: 'website',
    },
  };
}

export default async function CataloguePage() {
  const [categories, items] = await Promise.all([fetchCategories(), fetchCatalogueItems()]);

  const itemsByCategory: Record<string, any[]> = {};
  for (const item of items) {
    const categoryId = item.categoryId || item.category?.id;
    if (!categoryId) continue;
    if (!itemsByCategory[categoryId]) itemsByCategory[categoryId] = [];
    itemsByCategory[categoryId].push(item);
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Product Catalogue', item: `${SITE_URL}/catalogue` },
    ],
  };

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Product Catalogue | ${BRAND.name}`,
    url: `${SITE_URL}/catalogue`,
    description: BRAND.siteDescription,
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <Suspense
        fallback={
          <div className="bg-white min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        }
      >
        <CatalogueClient categories={categories} itemsByCategory={itemsByCategory} />
      </Suspense>
    </>
  );
}

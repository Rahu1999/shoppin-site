import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BRAND } from '@/config/brand';
import { getPublicModuleFlags } from '@/utils/moduleFlags';
import CatalogueItemClient from './CatalogueItemClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = `https://${BRAND.domain}`;

async function getCatalogueItem(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/catalogue-items/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCatalogueItem(slug);

  if (!item) {
    return { title: `Item Not Found | ${BRAND.name}` };
  }

  const title = item.metaTitle || `${item.name} | ${BRAND.name}`;
  const description = item.metaDescription || item.description || BRAND.siteDescription;
  const image = item.images?.find((i: any) => i.isPrimary)?.url || item.images?.[0]?.url;
  const url = `${SITE_URL}/catalogue/${item.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND.name,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function CatalogueItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const flags = await getPublicModuleFlags();
  if (!flags.catalogue) notFound();

  const { slug } = await params;
  const item = await getCatalogueItem(slug);

  if (!item) {
    notFound();
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Product Catalogue', item: `${SITE_URL}/catalogue` },
      { '@type': 'ListItem', position: 3, name: item.name, item: `${SITE_URL}/catalogue/${item.slug}` },
    ],
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description || BRAND.siteDescription,
    image: (item.images || []).map((i: any) => i.url),
    brand: { '@type': 'Brand', name: BRAND.name },
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <CatalogueItemClient item={item} />
    </>
  );
}

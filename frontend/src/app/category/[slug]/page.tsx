import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BRAND } from '@/config/brand';
import CategoryClient from './CategoryClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/categories/${slug}`, { next: { revalidate: 300 } });
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
  const category = await getCategory(slug);

  if (!category) {
    return { title: `Category Not Found | ${BRAND.name}` };
  }

  const title = category.metaTitle || `${category.name} | ${BRAND.name}`;
  const description =
    category.metaDescription || category.description || BRAND.siteDescription;
  const url = `https://${BRAND.domain}/category/${category.slug}`;

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
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${BRAND.domain}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: `https://${BRAND.domain}/category/${category.slug}`,
      },
    ],
  };

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryClient category={category} initialProducts={category.products || []} />
    </>
  );
}

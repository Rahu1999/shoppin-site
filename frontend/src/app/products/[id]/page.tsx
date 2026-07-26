import type { Metadata } from 'next';
import { BRAND } from '@/config/brand';
import ProductDetailClient from './ProductDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: `Product Not Found | ${BRAND.name}` };
  }

  const title = product.metaTitle || `${product.name} | ${BRAND.name}`;
  const description =
    product.metaDescription || product.shortDescription || BRAND.siteDescription;
  const image = product.images?.find((i: any) => i.isPrimary)?.url || product.images?.[0]?.url;
  const url = `https://${BRAND.domain}/products/${product.slug}`;

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription || product.description || BRAND.siteDescription,
        image: (product.images || []).map((i: any) => i.url),
        sku: product.sku || undefined,
        brand: { '@type': 'Brand', name: product.brand?.name || BRAND.name },
        ...(product.reviewCount > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          },
        }),
        offers: {
          '@type': 'Offer',
          url: `https://${BRAND.domain}/products/${product.slug}`,
          priceCurrency: 'INR',
          price: product.basePrice,
          availability:
            product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        // eslint-disable-next-line react/no-danger
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}

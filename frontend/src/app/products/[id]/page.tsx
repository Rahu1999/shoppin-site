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

async function getShippingConfig() {
  try {
    const res = await fetch(`${API_BASE}/shipping/config`, { next: { revalidate: 3600 } });
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
  const [product, shippingConfig] = await Promise.all([getProduct(id), getShippingConfig()]);

  const shippingRate = shippingConfig
    ? shippingConfig.freeAbove != null && product && Number(product.basePrice) >= Number(shippingConfig.freeAbove)
      ? 0
      : Number(shippingConfig.flatFee)
    : undefined;

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
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'IN',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 7,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/ReturnShippingFees',
          },
          ...(shippingRate !== undefined && {
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: { '@type': 'MonetaryAmount', value: shippingRate, currency: 'INR' },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: shippingConfig?.estimatedDaysMin ?? 5,
                  maxValue: shippingConfig?.estimatedDaysMax ?? 7,
                  unitCode: 'DAY',
                },
              },
            },
          }),
        },
      }
    : null;

  const breadcrumbJsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${BRAND.domain}/` },
          { '@type': 'ListItem', position: 2, name: 'Products', item: `https://${BRAND.domain}/products` },
          { '@type': 'ListItem', position: 3, name: product.name, item: `https://${BRAND.domain}/products/${product.slug}` },
        ],
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
      {breadcrumbJsonLd && (
        // eslint-disable-next-line react/no-danger
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}

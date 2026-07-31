import type { MetadataRoute } from 'next';
import { BRAND } from '@/config/brand';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = `https://${BRAND.domain}`;

async function fetchAllProducts() {
  const products: { slug: string; updatedAt?: string }[] = [];
  let page = 1;

  // Server-side pagination is capped at 100/page — loop until exhausted.
  while (page <= 20) {
    try {
      const res = await fetch(`${API_BASE}/products?page=${page}&limit=100`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const data = json.data || json;
      const items = data.items || [];
      products.push(...items);
      if (!data.meta?.hasNext) break;
      page += 1;
    } catch {
      break;
    }
  }

  return products;
}

async function fetchBlogPosts() {
  const posts: { slug: string; updatedAt?: string }[] = [];
  let page = 1;

  while (page <= 20) {
    try {
      const res = await fetch(`${API_BASE}/blog?page=${page}&limit=100`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json = await res.json();
      const data = json.data || json;
      posts.push(...(data.items || []));
      if (!data.meta?.hasNext) break;
      page += 1;
    } catch {
      break;
    }
  }

  return posts;
}

async function fetchCategorySlugs() {
  try {
    const res = await fetch(`${API_BASE}/categories/tree`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    const tree = json.data || json;

    const slugs: string[] = [];
    const walk = (nodes: any[]) => {
      for (const node of nodes || []) {
        if (node.slug) slugs.push(node.slug);
        if (node.children?.length) walk(node.children);
      }
    };
    walk(Array.isArray(tree) ? tree : []);
    return slugs;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categorySlugs, blogPosts] = await Promise.all([
    fetchAllProducts(),
    fetchCategorySlugs(),
    fetchBlogPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/category/${encodeURIComponent(slug)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}

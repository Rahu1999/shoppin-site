import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { BRAND } from '@/config/brand';
import { getPublicModuleFlags } from '@/utils/moduleFlags';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 's',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'blockquote',
  'a', 'img', 'code', 'pre',
];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height'];

async function getPost(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/blog/${slug}`, { next: { revalidate: 300 } });
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
  const post = await getPost(slug);

  if (!post) {
    return { title: `Post Not Found | ${BRAND.name}` };
  }

  const title = post.metaTitle || `${post.title} | ${BRAND.name}`;
  const description = post.metaDescription || post.excerpt || BRAND.siteDescription;
  const url = `https://${BRAND.domain}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: BRAND.name,
      type: 'article',
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const flags = await getPublicModuleFlags();
  if (!flags.blog) notFound();

  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const safeContent = DOMPurify.sanitize(post.content, { ALLOWED_TAGS, ALLOWED_ATTR });

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${BRAND.domain}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://${BRAND.domain}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://${BRAND.domain}/blog/${post.slug}` },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: post.authorName || BRAND.name },
    publisher: { '@type': 'Organization', name: BRAND.name },
  };

  return (
    <div className="bg-white min-h-screen">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          {post.publishedAt && (
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 block">
              {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {post.authorName && ` · ${post.authorName}`}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{post.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl">
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-2xl mb-8"
          />
        )}
        <div
          className="prose prose-slate max-w-none"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </div>
    </div>
  );
}

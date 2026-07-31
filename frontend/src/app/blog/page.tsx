import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/config/brand';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = `https://${BRAND.domain}`;

async function getPosts(page: number) {
  try {
    const res = await fetch(`${API_BASE}/blog?page=${page}&limit=12`, { next: { revalidate: 300 } });
    if (!res.ok) return { items: [], meta: undefined };
    const json = await res.json();
    const data = json.data || json;
    return { items: data.items || [], meta: data.meta };
  } catch {
    return { items: [], meta: undefined };
  }
}

export const metadata: Metadata = {
  title: `Blog | ${BRAND.name}`,
  description: `Guides, tips, and ideas for steel kitchen storage from ${BRAND.name}.`,
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const { items: posts, meta } = await getPosts(page);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">Blog</h1>
          <p className="text-gray-500 text-sm">Guides, tips, and ideas for steel kitchen storage.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-50">
                  {post.coverImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300 text-sm">
                      {BRAND.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-5">
                  {post.publishedAt && (
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                      {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between gap-4 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page <span className="font-semibold text-gray-900">{meta.page}</span> of{' '}
              <span className="font-semibold text-gray-900">{meta.totalPages}</span>
            </p>
            <div className="flex gap-2">
              {meta.hasPrev && (
                <Link href={`/blog?page=${page - 1}`} className="h-10 px-5 flex items-center rounded-lg font-medium text-sm border border-gray-200 hover:border-gray-400 transition-colors">
                  Previous
                </Link>
              )}
              {meta.hasNext && (
                <Link href={`/blog?page=${page + 1}`} className="h-10 px-5 flex items-center rounded-lg font-medium text-sm border border-gray-200 hover:border-gray-400 transition-colors">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

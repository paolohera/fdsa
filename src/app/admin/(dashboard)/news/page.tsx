import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Pin, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deletePost, setPostPriority } from "./actions";
import { sortByPriority } from "@/lib/news-priority";
import {
  AdminPageHeader,
  AdminCard,
  AdminLinkButton,
  AdminBadge,
  AdminButton,
  AdminEmptyState,
} from "@/components/admin/admin-ui";

export default async function NewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("news_posts")
    .select("id, title, published, priority, created_at, image_url")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data: rawPosts, error } = await query;
  const posts = rawPosts ? sortByPriority(rawPosts) : rawPosts;

  return (
    <div>
      <AdminPageHeader
        title="News posts"
        description="Articles shown on the homepage and /news. Pin a post to keep it at the top of the list, or feature one to show it on the homepage hero."
        action={
          <AdminLinkButton href="/admin/news/new">
            <Plus size={16} /> New post
          </AdminLinkButton>
        }
      />

      {q && (
        <p className="mb-4 text-sm text-charcoal/60">
          Showing results for <span className="font-medium text-ink">&ldquo;{q}&rdquo;</span> —{" "}
          <Link href="/admin/news" className="text-brass hover:underline">
            clear
          </Link>
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {posts?.length === 0 ? (
        <AdminEmptyState>
          {q ? `No posts match "${q}".` : "No posts yet. Create the first one."}
        </AdminEmptyState>
      ) : (
        <AdminCard className="divide-y divide-ink/10">
          {posts?.map((post) => (
            <div key={post.id} className="flex items-center gap-4 p-4">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden bg-ink/5">
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-charcoal/40">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/admin/news/${post.id}`}
                  className="text-sm font-medium text-ink hover:underline"
                >
                  {post.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <AdminBadge tone={post.published ? "green" : "slate"}>
                    {post.published ? "Published" : "Draft"}
                  </AdminBadge>
                  {post.priority === "pinned" && (
                    <AdminBadge tone="brass">
                      <Pin size={11} className="mr-1 inline" />
                      Pinned
                    </AdminBadge>
                  )}
                  {post.priority === "featured" && (
                    <AdminBadge tone="brass">
                      <Star size={11} className="mr-1 inline" />
                      Featured
                    </AdminBadge>
                  )}
                  <span className="text-xs text-charcoal/40">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Quick priority toggles — jump straight to pinned/featured/normal
                  without opening the edit form. */}
              <div className="hidden items-center gap-1 sm:flex">
                <form action={setPostPriority.bind(null, post.id, post.priority === "pinned" ? "normal" : "pinned")}>
                  <AdminButton
                    variant={post.priority === "pinned" ? "primary" : "ghost"}
                    title={post.priority === "pinned" ? "Unpin" : "Pin to top"}
                  >
                    <Pin size={14} />
                  </AdminButton>
                </form>
                <form action={setPostPriority.bind(null, post.id, post.priority === "featured" ? "normal" : "featured")}>
                  <AdminButton
                    variant={post.priority === "featured" ? "primary" : "ghost"}
                    title={post.priority === "featured" ? "Unfeature" : "Feature on hero"}
                  >
                    <Star size={14} />
                  </AdminButton>
                </form>
              </div>

              <form action={deletePost.bind(null, post.id)}>
                <AdminButton variant="danger">
                  <Trash2 size={15} />
                </AdminButton>
              </form>
            </div>
          ))}
        </AdminCard>
      )}
    </div>
  );
}
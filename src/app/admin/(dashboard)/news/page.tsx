import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deletePost } from "./actions";
import {
  AdminPageHeader,
  AdminCard,
  AdminLinkButton,
  AdminBadge,
  AdminButton,
  AdminEmptyState,
} from "@/components/admin/admin-ui";

export default async function NewsListPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("news_posts")
    .select("id, title, published, created_at, image_url")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title="News posts"
        description="Articles shown on the homepage and /news."
        action={
          <AdminLinkButton href="/admin/news/new">
            <Plus size={16} /> New post
          </AdminLinkButton>
        }
      />

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {posts?.length === 0 ? (
        <AdminEmptyState>No posts yet. Create the first one.</AdminEmptyState>
      ) : (
        <AdminCard className="divide-y divide-slate-100">
          {posts?.map((post) => (
            <div key={post.id} className="flex items-center gap-4 p-4">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {post.image_url ? (
                  <Image
                    src={post.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  href={`/admin/news/${post.id}`}
                  className="text-sm font-medium text-slate-900 hover:underline"
                >
                  {post.title}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <AdminBadge tone={post.published ? "green" : "slate"}>
                    {post.published ? "Published" : "Draft"}
                  </AdminBadge>
                  <span className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
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
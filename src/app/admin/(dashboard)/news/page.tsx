import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePost } from "./actions";

export default async function NewsListPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("news_posts")
    .select("id, title, published, created_at, image_url")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">News posts</h1>
        <Link
          href="/admin/news/new"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          New post
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      )}

      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {posts?.length === 0 && (
          <p className="p-4 text-sm text-slate-500">
            No posts yet. Create the first one.
          </p>
        )}

        {posts?.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-4 justify-between p-4"
          >
            <div className="flex items-center gap-4">
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
              <div>
                <Link
                  href={`/admin/news/${post.id}`}
                  className="text-sm font-medium text-slate-900 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-400">
                  {post.published ? "Published" : "Draft"} ·{" "}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <form action={deletePost.bind(null, post.id)}>
              <button
                type="submit"
                className="text-sm text-slate-400 hover:text-red-600"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
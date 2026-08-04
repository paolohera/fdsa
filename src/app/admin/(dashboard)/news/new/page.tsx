import PostForm from "../post-form";
import { createPost } from "../actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">New post</h1>
      <div className="mt-6">
        <PostForm action={createPost} error={error} />
      </div>
    </div>
  );
}

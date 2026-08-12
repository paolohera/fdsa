import { createPost } from "../actions";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import PostForm from "../post-form";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <AdminPageHeader title="New post" />
      <PostForm action={createPost} error={error} />
    </div>
  );
}
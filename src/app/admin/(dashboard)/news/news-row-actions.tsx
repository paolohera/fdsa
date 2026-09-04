"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pin, Star, Trash2, Loader2 } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-ui";
import { setPostPriority, deletePost } from "./actions";
import { useAdminToast } from "@/components/admin/admin-toast";

type NewsRowActionsProps = {
  post: {
    id: string;
    title: string;
    published: boolean;
    priority: "normal" | "featured" | "pinned";
    image_url: string | null;
    created_at: string;
  };
};

export default function NewsRowActions({ post }: NewsRowActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useAdminToast();

  const handlePriorityChange = (newPriority: "normal" | "featured" | "pinned") => {
    startTransition(async () => {
      try {
        await setPostPriority(post.id, newPriority);
        router.refresh();
        showToast(
          newPriority === "pinned"
            ? `"${post.title}" pinned`
            : newPriority === "featured"
            ? `"${post.title}" featured`
            : `"${post.title}" unpinned`,
          "success"
        );
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to update priority", "error");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePost(post.id);
        router.refresh();
        showToast("Post deleted", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to delete post", "error");
      }
    });
  };

  const isPinned = post.priority === "pinned";
  const isFeatured = post.priority === "featured";

  return (
    <div className="hidden items-center gap-1 sm:flex">
      <AdminButton
        variant={isPinned ? "primary" : "ghost"}
        onClick={() => handlePriorityChange(isPinned ? "normal" : "pinned")}
        disabled={isPending}
        title={isPinned ? "Unpin" : "Pin to top"}
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        <Pin size={14} />
      </AdminButton>
      <AdminButton
        variant={isFeatured ? "primary" : "ghost"}
        onClick={() => handlePriorityChange(isFeatured ? "normal" : "featured")}
        disabled={isPending}
        title={isFeatured ? "Unfeature" : "Feature on hero"}
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        <Star size={14} />
      </AdminButton>
      <AdminButton
        variant="danger"
        onClick={handleDelete}
        disabled={isPending}
        title="Delete post"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        <Trash2 size={15} />
      </AdminButton>
    </div>
  );
}
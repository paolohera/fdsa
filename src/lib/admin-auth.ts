import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; userId: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Please sign in");
  }

  return { supabase, userId: user.id };
}

export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("duplicate key") || message.includes("unique constraint")) {
      return "This item already exists.";
    }
    if (message.includes("foreign key") || message.includes("not found")) {
      return "Referenced item not found.";
    }
    if (message.includes("permission denied") || message.includes("policy")) {
      return "You don't have permission to perform this action.";
    }
  }
  console.error("Server action error:", error);
  return "An error occurred. Please try again.";
}
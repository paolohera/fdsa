
import { createClient } from "@/lib/supabase/server";
import { updateCoreValue } from "./actions";
import { AdminPageHeader, AdminCard, AdminButton } from "@/components/admin/admin-ui";
 
export default async function CoreValuesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();
 
  const { data: values } = await supabase
    .from("core_values")
    .select("id, letter, title, body, sort_order")
    .order("sort_order", { ascending: true });
 
  return (
    <div>
      <AdminPageHeader
        title="Core Values"
        description="The F-D-S-A value cards shown on the About page."
      />
 
      {saved && (
        <p className="mb-4 max-w-2xl rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Saved.
        </p>
      )}
 
      {error && (
        <p className="mb-4 max-w-2xl rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
 
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {values?.map((value) => (
          <form key={value.id} action={updateCoreValue.bind(null, value.id)}>
            <AdminCard className="p-6">
              <span className="text-3xl font-bold text-brass" style={{ fontFamily: "var(--font-display)" }}>
                {value.letter}
              </span>
 
              <label className="mt-3 block">
                <span className="text-sm font-medium text-ink">Title</span>
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={value.title}
                  className="mt-1.5 w-full rounded-md border border-ink/15 px-3 py-2 text-sm text-ink outline-none focus:border-brass"
                />
              </label>
 
              <label className="mt-4 block">
                <span className="text-sm font-medium text-ink">Description</span>
                <textarea
                  name="body"
                  rows={4}
                  required
                  defaultValue={value.body}
                  className="mt-1.5 w-full resize-y rounded-md border border-ink/15 px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-brass"
                />
              </label>
 
              <AdminButton type="submit" className="mt-5">
                Save
              </AdminButton>
            </AdminCard>
          </form>
        ))}
      </div>
    </div>
  );
}
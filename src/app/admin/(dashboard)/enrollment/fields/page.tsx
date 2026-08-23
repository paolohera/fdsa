import { createClient } from "@/lib/supabase/server";
import { createField } from "../actions";
import { AdminPageHeader, AdminButton, AdminEmptyState } from "@/components/admin/admin-ui";
import SortableFieldList from "./sortable-field-list";

export default async function EnrollmentFieldsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: fields } = await supabase
    .from("enrollment_fields")
    .select("id, label, field_key, field_type, options, required, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <AdminPageHeader
        title="Enrollment form fields"
        description="Fields shown on the public Enroll Now form. Drag to reorder — changes apply immediately."
      />

      {error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="max-w-2xl">
        {(!fields || fields.length === 0) ? (
          <AdminEmptyState>No fields yet.</AdminEmptyState>
        ) : (
          <SortableFieldList initialFields={fields} />
        )}
      </div>

      <form action={createField} className="mt-8 max-w-2xl space-y-3 border border-dashed border-ink/20 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">Add field</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="label"
            required
            placeholder="Field label"
            className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
          />
          <select
            name="field_type"
            className="border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
            <option value="textarea">Long text</option>
            <option value="select">Dropdown</option>
          </select>
        </div>
        <input
          type="text"
          name="options"
          placeholder="For dropdowns only: Option 1, Option 2, Option 3"
          className="w-full border border-ink/20 px-2.5 py-1.5 text-xs outline-none focus:border-brass"
        />
        <label className="flex items-center gap-2 text-xs text-charcoal/60">
          <input type="checkbox" name="required" defaultChecked />
          Required
        </label>
        <AdminButton type="submit" className="px-3 py-1.5 text-xs">
          Add field
        </AdminButton>
      </form>
    </div>
  );
}
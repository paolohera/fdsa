
import { createClient } from "@/lib/supabase/server";
import { updateCoreValue } from "./actions";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import CoreValueForm from "./core-value-form";

export default async function CoreValuesPage() {
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {values?.map((value) => (
          <CoreValueForm
            key={value.id}
            action={updateCoreValue.bind(null, value.id)}
            defaultValues={value}
          />
        ))}
      </div>
    </div>
  );
}
import { createClient } from "@/lib/supabase";
import { getTokenUser, logAudit, apiError, apiSuccess, requireRoles } from "@/lib/db-helpers";

const DEFAULT_ENTRIES = [
  { jabatan: "Kepala SPPG", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Pengawas Gizi", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Pengawas Keuangan", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Asisten Lapangan", jumlah: 1, insentif: 2000, nama: "" },
  { jabatan: "Tenaga Persiapan", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Tenaga Masak", jumlah: 4, insentif: 2000, nama: "" },
  { jabatan: "Tenaga Pemorsian", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Petugas Kebersihan", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Pencuci Ompreng", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Driver", jumlah: 2, insentif: 2000, nama: "" },
  { jabatan: "Kader Gizi", jumlah: 5, insentif: 2000, nama: "" },
];

export async function GET(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);
    const supabase = await createClient();
    const { data } = await supabase.from("global_config").select("value").eq("key", "dafnom_entries").single();
    let entries = DEFAULT_ENTRIES;
    if (data?.value) {
      try { entries = JSON.parse(data.value); } catch { entries = DEFAULT_ENTRIES; }
    }
    return apiSuccess(entries);
  } catch {
    return apiSuccess(DEFAULT_ENTRIES);
  }
}

export async function PUT(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);
    requireRoles("admin_apps","admin_sppg","accountant","kitchen_head")(user);
    const body = await request.json();
    const supabase = await createClient();
    const entries = body.entries || [];

    const { error } = await supabase
      .from("global_config")
      .upsert({ key: "dafnom_entries", value: JSON.stringify(entries) }, { onConflict: "key" });

    if (error) return apiError(error.message);

    await logAudit(supabase, {
      actor: user, action: "UPDATE_DAFNOM", entity: "global_config", entity_id: "dafnom_entries",
      note: `Update ${entries.length} entry DafNom`,
    });

    return apiSuccess({ ok: true });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

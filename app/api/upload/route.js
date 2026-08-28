import { createClient } from "@/lib/supabase";
import { getTokenUser, requireRoles, apiError, apiSuccess } from "@/lib/db-helpers";

export async function POST(request) {
  try {
    const user = await getTokenUser(request);
    if (!user) return apiError("Unauthorized", 401);

    const body = await request.json();
    if (!body.file) return apiError("file wajib diisi (base64 data URL)");
    if (!body.folder) return apiError("folder wajib diisi");

    const supabase = await createClient();

    const dataUrl = body.file;
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return apiError("Format file tidak valid");

    const mimeType = matches[1];
    const base64Data = matches[2];

    if (!mimeType.startsWith("image/")) return apiError("Hanya file gambar yang diizinkan");

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 5 * 1024 * 1024) return apiError("Ukuran file maksimal 5MB");

    const ext = mimeType.split("/")[1] || "jpg";
    const filename = `${body.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filename, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) return apiError("Gagal upload: " + uploadError.message);

    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filename);

    return apiSuccess({ url: urlData.publicUrl, filename });
  } catch (e) {
    return apiError("Internal server error", 500);
  }
}

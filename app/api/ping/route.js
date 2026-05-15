import { createClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("users").select("count").single();
    return Response.json({
      ok: true,
      dbConnected: !error,
      dbError: error?.message || null,
      dbResult: data,
      envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "not set",
      envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "not set",
    });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

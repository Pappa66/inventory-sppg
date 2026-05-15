import { createClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// ---------- Auth (via Supabase + bcrypt) ----------
export async function getTokenUser(request) {
  const authHeader = request.headers.get("Authorization") || "";
  const email = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!email) {
    throw new Error("Tidak terautentikasi");
  }

  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user || !user.is_active) throw new Error("User tidak aktif / tidak ditemukan");
  return user;
}

export function requireRoles(...allowed) {
  return (user) => {
    if (!allowed.includes(user.role)) {
      throw new Error(`Akses ditolak. Hanya ${allowed.join(",")}`);
    }
    return user;
  };
}

// ---------- Audit Trail ----------
export async function logAudit(supabase, { actor, action, entity, entity_id, before, after, note = "", zone = null, reason = null }) {
  const role = (actor?.role || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const actorLabel = `${actor?.name || actor?.email} (${role})`;

  let changes = null;
  if (before && after) {
    const diff = {};
    for (const k of Object.keys({ ...before, ...after })) {
      if (String(before[k]) !== String(after[k])) diff[k] = { old: before[k], new: after[k] };
    }
    if (reason) diff._reason = reason;
    if (Object.keys(diff).length > 0) changes = diff;
  } else if (after) {
    changes = { new: after };
    if (reason) changes._reason = reason;
  } else if (before) {
    changes = { old: before };
  }

  const { error } = await supabase.from("audit_trail").insert({
    actor: actorLabel,
    actor_id: actor?.id,
    actor_role: actor?.role,
    action,
    entity,
    entity_id,
    zone,
    changes,
    note,
  });
  if (error) console.error("Audit log error:", error);
}

// ---------- API Response Helpers ----------
function headers() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  };
}

export function apiError(message, status = 400) {
  return Response.json({ detail: message }, { status, headers: headers() });
}

export function apiSuccess(data, status = 200) {
  return Response.json(data, { status, headers: headers() });
}

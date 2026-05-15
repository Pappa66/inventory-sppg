import { createClient } from "@/lib/supabase";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sppg-default-secret-change-me";

// ---------- JWT Helpers ----------
export function createAccessToken(userId, email) {
  return jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: "12h" });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// ---------- Auth Helpers ----------
export async function getTokenUser(request) {
  const authHeader = request.headers.get("Authorization") || "";
  let token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    token = request.cookies.get("sppg_token")?.value;
  }
  if (!token) throw new Error("Tidak terautentikasi");

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new Error("Token tidak valid");
  }

  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", payload.sub)
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

// ---------- API Response Helper ----------
export function apiError(message, status = 400) {
  return Response.json({ detail: message }, { status });
}

export function apiSuccess(data, status = 200) {
  return Response.json(data, { status });
}

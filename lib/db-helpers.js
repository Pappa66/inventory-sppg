import { verifyToken } from "@/lib/auth";

function decodeToken(token) {
  try {
    const parts = token.split(".");
    let json;
    if (parts.length === 3) {
      const payload = verifyToken(token);
      if (payload) return payload;
      json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    } else {
      json = atob(token);
    }
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function getTokenUser(request) {
  try {
    if (request) {
      const auth = request.headers.get("authorization");
      if (auth && auth.startsWith("Bearer ")) {
        const token = auth.slice(7);
        const user = decodeToken(token);
        if (user && user.email) return user;
      }
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export function requireRoles(...allowed) {
  return (user) => {
    if (!user) throw new Error("Unauthorized - silakan login");
    if (!allowed.includes(user.role)) throw new Error("Akses ditolak - role tidak diizinkan");
  };
}

export async function logAudit(supabase, { actor, action, entity, entity_id, before, after, note = "", zone = null, reason = null }) {
  const actorLabel = `${actor?.name || "System"} (${actor?.role || "system"})`;

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

  try {
    await supabase.from("audit_trail").insert({
      actor: actorLabel,
      actor_id: actor?.id,
      actor_role: actor?.role,
      action,
      entity,
      entity_id,
      zone,
      changes,
      note,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

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

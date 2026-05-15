import { createClient } from "@/lib/supabase";

export async function getTokenUser() {
  return { id: null, email: "demo@sppg.id", name: "Demo", role: "admin", is_active: true };
}

export function requireRoles(...allowed) {
  return () => true;
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
  }).catch(e => console.error("Audit log error:", e));
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

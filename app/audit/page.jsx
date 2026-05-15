"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { fmtDateTime, ROLE_LABELS, ROLE_COLORS, ZONE_COLORS } from "@/lib/format";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

function renderChanges(changes) {
  if (!changes) return null;
  const entries = Object.entries(changes).filter(([k]) => !k.startsWith("_"));
  if (entries.length === 0) return null;
  const reason = changes._reason;
  return (
    <div className="mt-1 text-xs">
      {reason && <div className="text-[#5C5C5C] italic mb-1">Alasan: {reason}</div>}
      <div className="grid grid-cols-1 gap-1">
        {entries.slice(0, 6).map(([k, v]) => {
          if (v && typeof v === "object" && ("old" in v || "new" in v)) {
            return (
              <div key={k} className="audit-ts text-[11px] flex flex-wrap items-baseline gap-1">
                <span className="font-semibold text-[#5C5C5C]">{k}:</span>
                <span className="text-[#C5533B] line-through">{JSON.stringify(v.old)}</span>
                <span>→</span>
                <span className="text-[#4A7C59] font-semibold">{JSON.stringify(v.new)}</span>
              </div>
            );
          }
          return <div key={k} className="audit-ts text-[11px]"><span className="font-semibold text-[#5C5C5C]">{k}:</span> {JSON.stringify(v)}</div>;
        })}
      </div>
    </div>
  );
}

export default function Page() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => { setLoading(true); api.get("/audit").then(({data})=>{ setRows(data); setPage(1); }).finally(() => setLoading(false)); }, []);

  const shown = rows.filter(r => {
    if (!filter) return true;
    const blob = `${r.entity||""} ${r.actor||""} ${r.action||""} ${r.zone||""}`.toLowerCase();
    return blob.includes(filter.toLowerCase());
  });

  useEffect(() => { setPage(1); }, [filter]);

  const paginatedShown = useMemo(() => {
    const start = (page - 1) * perPage;
    return shown.slice(start, start + perPage);
  }, [shown, page]);

  return (
    <Layout>
      <div className="space-y-6" data-testid="audit-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Audit Trail</h1>
            <p className="text-[#5C5C5C] mt-1">Format flat & human-readable. Siapa, apa, kapan — akurasi detik. Tidak ada penghapusan.</p>
          </div>
          <input data-testid="audit-filter" placeholder="filter (entity/actor/action/zone)…" value={filter} onChange={(e)=>setFilter(e.target.value)} className="card-soft px-3 py-2 text-sm w-72"/>
        </div>

        {loading ? (
          <SkeletonTable rows={8} cols={4} />
        ) : (
          <div className="card-soft p-6">
            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#EAE4D8]"/>
              {paginatedShown.map(r => {
                const ts = r.timestamp || r.ts;
                const role = r.actor_role;
                const roleColor = ROLE_COLORS[role] || "#5C5C5C";
                return (
                  <div key={r.id} className="mb-5 relative" data-testid={`audit-row-${r.id}`}>
                    <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full" style={{background: roleColor, boxShadow:`0 0 0 4px ${roleColor}22`}}/>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="audit-ts text-xs text-[#5C5C5C]">{fmtDateTime(ts)}</span>
                      <span className="role-pill" style={{background:`${roleColor}1A`, color:roleColor}}>{ROLE_LABELS[role] || role}</span>
                      <span className="font-semibold">{r.actor || r.actor_email}</span>
                      <span className="tag bg-[#1F1F1F] text-white">{r.action}</span>
                      <span className="font-display font-semibold">{r.entity}</span>
                      {r.zone && <span className="role-pill" style={{background:`${ZONE_COLORS[r.zone]}1A`, color:ZONE_COLORS[r.zone]}}>Zona {r.zone}</span>}
                      <span className="audit-ts text-xs text-[#5C5C5C]">{r.entity_id?.slice(0,8)}</span>
                    </div>
                    {r.note ? <div className="text-sm text-[#5C5C5C] mt-1">"{r.note}"</div> : null}
                    {renderChanges(r.changes)}
                  </div>
                );
              })}
              {shown.length === 0 && <div className="text-sm text-[#5C5C5C]">Belum ada aktivitas.</div>}
            </div>
            <Pagination page={page} totalPages={Math.ceil(shown.length / perPage)} onPageChange={setPage} />
          </div>
        )}
      </div>
    </Layout>
  );
}

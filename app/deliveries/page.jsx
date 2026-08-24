"use client";

import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  MENU_CATEGORIES,
  DELIVERY_STATUSES,
  ASSIGNMENT_STATUSES,
  fmtDate,
} from "@/lib/format";
import { Plus, Truck, MapPin, Users, ChevronDown, ChevronUp } from "lucide-react";
import { SkeletonTable } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

const EMPTY_PLAN = {
  delivery_date: "",
  destination_ids: [],
  driver_id: "",
  notes: "",
};

function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function Page() {
  const { activeRole } = useAuth();
  const [plans, setPlans] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dateStr());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PLAN);
  const [portions, setPortions] = useState({});
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const canWrite = activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "field_assistant";

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/delivery-plans"),
      api.get("/destinations"),
      api.get("/users"),
    ])
      .then(([plansRes, destsRes, usersRes]) => {
        setPlans(plansRes.data);
        setDestinations(destsRes.data.filter((d) => d.is_active));
        setDrivers(usersRes.data.filter((u) => u.role === "driver" && u.is_active));
        setPage(1);
      })
      .catch((e) => toast.error(formatErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const plansForDate = useMemo(() => {
    const list = plans.filter((p) => p.delivery_date === selectedDate);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p) => {
      const driver = drivers.find((d) => d.id === p.driver_id);
      return (
        p.notes?.toLowerCase().includes(q) ||
        driver?.name?.toLowerCase().includes(q)
      );
    });
  }, [plans, selectedDate, search, drivers]);

  useEffect(() => { setPage(1); }, [selectedDate, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return plansForDate.slice(start, start + perPage);
  }, [plansForDate, page]);

  const openCreate = () => {
    setForm({ ...EMPTY_PLAN, delivery_date: selectedDate });
    setPortions({});
    setOpen(true);
  };

  const toggleDest = (destId) => {
    setForm((prev) => {
      const ids = prev.destination_ids.includes(destId)
        ? prev.destination_ids.filter((id) => id !== destId)
        : [...prev.destination_ids, destId];
      return { ...prev, destination_ids: ids };
    });
  };

  const setPortion = (destId, category, value) => {
    setPortions((prev) => ({
      ...prev,
      [destId]: { ...(prev[destId] || {}), [category]: parseInt(value) || 0 },
    }));
  };

  const submitPlan = async (e) => {
    e.preventDefault();
    if (form.destination_ids.length === 0) {
      toast.error("Pilih minimal satu tujuan");
      return;
    }
    try {
      const payload = {
        delivery_date: form.delivery_date,
        driver_id: form.driver_id || null,
        notes: form.notes,
        destinations: form.destination_ids.map((destId) => ({
          destination_id: destId,
          portions: portions[destId] || {},
        })),
      };
      await api.post("/delivery-plans", payload);
      toast.success("Rencana antar dibuat");
      setOpen(false);
      setForm(EMPTY_PLAN);
      setPortions({});
      load();
    } catch (er) {
      toast.error(formatErr(er));
    }
  };

  const assignDriver = async (planId, driverId) => {
    try {
      await api.patch(`/delivery-plans/${planId}`, { driver_id: driverId || null });
      toast.success("Driver ditugaskan");
      load();
    } catch (e) {
      toast.error(formatErr(e));
    }
  };

  const statusBadge = (status) => {
    const s = ASSIGNMENT_STATUSES[status] || ASSIGNMENT_STATUSES.PENDING;
    return (
      <span className="role-pill text-xs" style={{ background: `${s.color}1A`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const destName = (id) => {
    const d = destinations.find((x) => x.id === id);
    return d?.name || "—";
  };

  const driverName = (id) => {
    if (!id) return <span className="text-[#5C5C5C] italic">Belum ditugaskan</span>;
    const d = drivers.find((x) => x.id === id);
    return d?.name || "—";
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="deliveries-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Rencana Antar</h1>
            <p className="text-[#5C5C5C] mt-1">Kelola rencana pengantaran harian ke tujuan.</p>
          </div>
          {canWrite && (
            <button data-testid="add-plan-btn" onClick={openCreate} className="btn-primary">
              <Plus size={16} /> Buat Rencana
            </button>
          )}
        </div>

        {/* Date Picker + Search */}
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C] block mb-1">Tanggal</label>
            <input
              data-testid="plan-date"
              type="date"
              className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C] block mb-1">Cari</label>
            <input
              data-testid="search-plan"
              type="text"
              placeholder="Cari driver atau catatan..."
              className="w-full px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : (
          <div className="card-soft overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4">Driver</th>
                    <th className="text-left py-3 px-4">Tujuan</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Catatan</th>
                    {canWrite && <th className="text-left py-3 px-4">Tugaskan</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => {
                    const destCount = p.destinations?.length || 0;
                    const isExpanded = expandedPlan === p.id;
                    return (
                      <React.Fragment key={p.id}>
                        <tr className="border-b border-[#EAE4D8] last:border-0">
                          <td className="py-3 px-4 font-semibold flex items-center gap-2">
                            <Truck size={14} className="text-[#0891B2]" />
                            {driverName(p.driver_id)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setExpandedPlan(isExpanded ? null : p.id)}
                              className="flex items-center gap-1 text-[#4A7C59] hover:underline text-sm"
                            >
                              <MapPin size={14} /> {destCount} tujuan
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                          <td className="py-3 px-4">{statusBadge(p.status)}</td>
                          <td className="py-3 px-4 text-[#5C5C5C] text-xs max-w-[200px] truncate">{p.notes || "—"}</td>
                          {canWrite && (
                            <td className="py-3 px-4">
                              <select
                                data-testid={`assign-driver-${p.id}`}
                                className="px-3 py-1.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-xs"
                                value={p.driver_id || ""}
                                onChange={(e) => assignDriver(p.id, e.target.value)}
                              >
                                <option value="">— Pilih Driver —</option>
                                {drivers.map((d) => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </td>
                          )}
                        </tr>
                        {isExpanded && p.destinations?.map((dest, idx) => (
                          <tr key={`${p.id}-${idx}`} className="bg-[#F9F6F0] border-b border-[#EAE4D8] last:border-0">
                            <td className="py-2 px-4 text-xs text-[#5C5C5C] pl-10">{idx + 1}.</td>
                            <td className="py-2 px-4 text-sm font-medium">{destName(dest.destination_id)}</td>
                            <td className="py-2 px-4" colSpan={canWrite ? 3 : 2}>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(MENU_CATEGORIES).map(([key, cat]) => (
                                  <span key={key} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cat.color}1A`, color: cat.color }}>
                                    {cat.label}: {dest.portions?.[key] || 0}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={canWrite ? 5 : 4} className="py-10 text-center text-[#5C5C5C]">
                        Belum ada rencana antar untuk tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {paginated.map((p) => {
                const isExpanded = expandedPlan === p.id;
                return (
                  <div key={p.id} className="card-soft p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <Truck size={14} className="text-[#0891B2]" /> {driverName(p.driver_id)}
                        </div>
                        <div className="text-xs text-[#5C5C5C] mt-1">{fmtDate(p.delivery_date)}</div>
                      </div>
                      {statusBadge(p.status)}
                    </div>
                    <button
                      onClick={() => setExpandedPlan(isExpanded ? null : p.id)}
                      className="text-sm text-[#4A7C59] hover:underline flex items-center gap-1"
                    >
                      <MapPin size={14} /> {(p.destinations?.length || 0)} tujuan
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isExpanded && p.destinations?.map((dest, idx) => (
                      <div key={idx} className="bg-[#EAE4D8]/30 rounded-md p-3 space-y-1">
                        <div className="font-medium text-sm">{destName(dest.destination_id)}</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(MENU_CATEGORIES).map(([key, cat]) => (
                            <span key={key} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${cat.color}1A`, color: cat.color }}>
                              {cat.label}: {dest.portions?.[key] || 0}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {canWrite && (
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#5C5C5C]">Tugaskan Driver</label>
                        <select
                          className="w-full mt-1 px-3 py-1.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-xs"
                          value={p.driver_id || ""}
                          onChange={(e) => assignDriver(p.id, e.target.value)}
                        >
                          <option value="">— Pilih Driver —</option>
                          {drivers.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
              {paginated.length === 0 && (
                <div className="text-center text-[#5C5C5C] py-10">Belum ada rencana antar untuk tanggal ini.</div>
              )}
            </div>

            <Pagination page={page} totalPages={Math.ceil(plansForDate.length / perPage)} onPageChange={setPage} />
          </div>
        )}

        {/* Create Plan Modal */}
        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={submitPlan}
              className="card-soft p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
              data-testid="plan-modal"
            >
              <h2 className="font-display text-2xl font-bold">Buat Rencana Antar</h2>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tanggal Antar</label>
                  <input
                    data-testid="plan-date-input"
                    required
                    type="date"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    value={form.delivery_date}
                    onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Driver</label>
                  <select
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    value={form.driver_id}
                    onChange={(e) => setForm({ ...form, driver_id: e.target.value })}
                  >
                    <option value="">— Pilih Driver —</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Catatan</label>
                  <textarea
                    rows={2}
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm resize-none"
                    placeholder="Catatan tambahan (opsional)"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Pilih Tujuan & Set Porsi</label>
                  <div className="mt-2 space-y-3">
                    {destinations.length === 0 && (
                      <p className="text-sm text-[#5C5C5C]">Tidak ada tujuan aktif. Buat tujuan terlebih dahulu.</p>
                    )}
                    {destinations.map((d) => {
                      const isSelected = form.destination_ids.includes(d.id);
                      return (
                        <div key={d.id} className="border border-[#EAE4D8] rounded-md p-3 bg-[#F9F6F0]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleDest(d.id)}
                              className="accent-[#4A7C59]"
                            />
                            <span className="font-semibold text-sm flex items-center gap-1">
                              <MapPin size={12} className="text-[#4A7C59]" /> {d.name}
                            </span>
                          </label>
                          {isSelected && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 ml-6">
                              {Object.entries(MENU_CATEGORIES).map(([key, cat]) => (
                                <div key={key}>
                                  <label className="text-[10px] uppercase tracking-widest" style={{ color: cat.color }}>
                                    {cat.label}
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full mt-0.5 px-2 py-1 rounded border border-[#EAE4D8] bg-white text-sm"
                                    value={portions[d.id]?.[key] || ""}
                                    placeholder="0"
                                    onChange={(e) => setPortion(d.id, key, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="save-plan" type="submit" className="btn-primary">Simpan Rencana</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

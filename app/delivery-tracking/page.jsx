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
  fmtDateTime,
} from "@/lib/format";
import {
  Navigation,
  Camera,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  Truck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { SkeletonCards } from "@/components/Skeleton";

function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Page() {
  const { activeRole, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedDest, setExpandedDest] = useState(null);
  const [updateForms, setUpdateForms] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const canSeeAll = activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "field_assistant";

  const load = () => {
    setLoading(true);
    api
      .get("/delivery-plans", { params: { date: dateStr() } })
      .then(({ data }) => {
        setPlans(data);
      })
      .catch((e) => toast.error(formatErr(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const myPlans = useMemo(() => {
    if (canSeeAll) return plans;
    return plans.filter((p) => p.driver_id === user?.id);
  }, [plans, canSeeAll, user]);

  const getNextStatus = (current) => {
    if (current === "NOT_DELIVERED") return "IN_TRANSIT";
    if (current === "IN_TRANSIT") return "DELIVERED";
    return null;
  };

  const getNextStatusLabel = (current) => {
    const next = getNextStatus(current);
    if (!next) return null;
    return DELIVERY_STATUSES[next]?.label || next;
  };

  const initUpdateForm = (planId, destIdx, dest) => {
    const key = `${planId}-${destIdx}`;
    setUpdateForms((prev) => ({
      ...prev,
      [key]: {
        status: getNextStatus(dest.status) || "IN_TRANSIT",
        notes: "",
        photo_url: "",
        photoFile: null,
      },
    }));
    setExpandedDest(key);
  };

  const handlePhoto = async (planId, destIdx, file) => {
    const key = `${planId}-${destIdx}`;
    if (!file) {
      setUpdateForms((prev) => ({
        ...prev,
        [key]: { ...prev[key], photoFile: null, photo_url: "" },
      }));
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setUpdateForms((prev) => ({
        ...prev,
        [key]: { ...prev[key], photoFile: file, photo_url: base64 },
      }));
    } catch {
      toast.error("Gagal membaca foto");
    }
  };

  const submitUpdate = async (planId, destIdx, dest) => {
    const key = `${planId}-${destIdx}`;
    const form = updateForms[key];
    if (!form) return;

    setSubmitting(key);
    try {
      await api.post("/delivery-logs", {
        delivery_plan_id: planId,
        destination_index: destIdx,
        destination_id: dest.destination_id,
        status: form.status,
        notes: form.notes,
        photo_url: form.photo_url || null,
      });
      toast.success(
        `Status ${destName(dest.destination_id)} diupdate ke ${
          DELIVERY_STATUSES[form.status]?.label || form.status
        }`
      );
      setExpandedDest(null);
      setUpdateForms((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      load();
    } catch (er) {
      toast.error(formatErr(er));
    } finally {
      setSubmitting(null);
    }
  };

  const destName = (id) => {
    if (!id) return "—";
    if (typeof id === "object") return id.name || "—";
    return id;
  };

  const statusBadge = (status, type = "delivery") => {
    const map = type === "assignment" ? ASSIGNMENT_STATUSES : DELIVERY_STATUSES;
    const s = map[status] || map.NOT_DELIVERED;
    return (
      <span
        className="role-pill text-xs"
        style={{ background: `${s.color}1A`, color: s.color }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6" data-testid="delivery-tracking-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">Tracking Pengantaran</h1>
            <p className="text-[#5C5C5C] mt-1">
              {canSeeAll
                ? "Pantau dan update status pengantaran semua driver."
                : "Update status pengantaran Anda hari ini."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5C5C5C]">
            <Truck size={16} className="text-[#0891B2]" />
            <span>{new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}</span>
          </div>
        </div>

        {loading ? (
          <SkeletonCards count={4} />
        ) : myPlans.length === 0 ? (
          <div className="card-soft p-10 text-center">
            <Navigation size={48} className="mx-auto text-[#EAE4D8]" />
            <p className="text-[#5C5C5C] mt-4 text-lg font-semibold">Tidak ada rencana antar hari ini</p>
            <p className="text-[#5C5C5C] text-sm mt-1">
              {canSeeAll ? "Belum ada rencana yang dibuat untuk hari ini." : "Anda belum ditugaskan untuk hari ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myPlans.map((plan) => {
              const driverName =
                plan.driver_name || plan.driver?.name || "Driver";
              const isExpanded = expandedPlan === plan.id;
              const dests = plan.destinations || [];
              const completedCount = dests.filter(
                (d) => d.status === "DELIVERED"
              ).length;

              return (
                <div key={plan.id} className="card-soft overflow-hidden">
                  {/* Plan header */}
                  <div className="p-4 bg-[#EAE4D8]/30 border-b border-[#EAE4D8]">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0891B2] text-white flex items-center justify-center text-sm font-bold">
                          <Truck size={16} />
                        </div>
                        <div>
                          <div className="font-semibold">{driverName}</div>
                          <div className="text-xs text-[#5C5C5C]">
                            {plan.delivery_date} &middot; {completedCount}/{dests.length} tujuan selesai
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(plan.status, "assignment")}
                        <button
                          onClick={() =>
                            setExpandedPlan(isExpanded ? null : plan.id)
                          }
                          className="btn-ghost text-xs"
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-[#EAE4D8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4A7C59] rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            dests.length > 0
                              ? (completedCount / dests.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Destination list */}
                  {isExpanded && (
                    <div className="divide-y divide-[#EAE4D8]">
                      {dests.map((dest, idx) => {
                        const destKey = `${plan.id}-${idx}`;
                        const isDestExpanded = expandedDest === destKey;
                        const updateForm = updateForms[destKey];
                        const nextStatus = getNextStatus(dest.status);
                        const dName =
                          typeof dest.destination === "object"
                            ? dest.destination?.name
                            : dest.destination_name || destName(dest.destination_id);

                        return (
                          <div key={idx} className="p-4">
                            {/* Desktop layout */}
                            <div className="hidden md:block">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full bg-[#F9F6F0] border border-[#EAE4D8] flex items-center justify-center text-xs font-semibold text-[#5C5C5C]">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm flex items-center gap-1">
                                      <MapPin size={12} className="text-[#4A7C59]" />
                                      {dName || `Tujuan ${idx + 1}`}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Object.entries(MENU_CATEGORIES).map(
                                        ([key, cat]) => (
                                          <span
                                            key={key}
                                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                                            style={{
                                              background: `${cat.color}1A`,
                                              color: cat.color,
                                            }}
                                          >
                                            {cat.label}:{" "}
                                            {dest.portions?.[key] ||
                                              dest[`${key.toLowerCase()}_portions`] ||
                                              0}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {statusBadge(dest.status)}
                                  {nextStatus && (
                                    <button
                                      onClick={() =>
                                        isDestExpanded
                                          ? setExpandedDest(null)
                                          : initUpdateForm(plan.id, idx, dest)
                                      }
                                      className={`btn-ghost text-xs ${
                                        nextStatus === "DELIVERED"
                                          ? "text-[#4A7C59]"
                                          : "text-[#D97706]"
                                      }`}
                                    >
                                      {nextStatus === "DELIVERED" ? (
                                        <CheckCircle2 size={14} />
                                      ) : (
                                        <ArrowRight size={14} />
                                      )}{" "}
                                      {getNextStatusLabel(dest.status)}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Update form (desktop) */}
                              {isDestExpanded && updateForm && (
                                <div className="mt-3 ml-10 p-3 bg-[#F9F6F0] border border-[#EAE4D8] rounded-md space-y-3">
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">
                                      Status
                                    </label>
                                    <select
                                      className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm"
                                      value={updateForm.status}
                                      onChange={(e) =>
                                        setUpdateForms((prev) => ({
                                          ...prev,
                                          [destKey]: {
                                            ...prev[destKey],
                                            status: e.target.value,
                                          },
                                        }))
                                      }
                                    >
                                      {Object.entries(DELIVERY_STATUSES).map(
                                        ([k, v]) => (
                                          <option key={k} value={k}>
                                            {v.label}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1">
                                      <FileText size={12} /> Catatan
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Catatan pengantaran (opsional)"
                                      className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm"
                                      value={updateForm.notes}
                                      onChange={(e) =>
                                        setUpdateForms((prev) => ({
                                          ...prev,
                                          [destKey]: {
                                            ...prev[destKey],
                                            notes: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                  {updateForm.status === "DELIVERED" && (
                                    <div>
                                      <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1">
                                        <Camera size={12} /> Foto Bukti
                                      </label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="w-full mt-1 text-sm text-[#5C5C5C] file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#4A7C59] file:text-white hover:file:bg-[#3d6847]"
                                        onChange={(e) =>
                                          handlePhoto(
                                            plan.id,
                                            idx,
                                            e.target.files?.[0]
                                          )
                                        }
                                      />
                                      {updateForm.photo_url && (
                                        <div className="mt-2 text-xs text-[#4A7C59]">
                                          Foto siap diupload
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedDest(null);
                                      }}
                                      className="btn-ghost text-xs"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      onClick={() =>
                                        submitUpdate(plan.id, idx, dest)
                                      }
                                      disabled={submitting === destKey}
                                      className="btn-primary text-xs"
                                    >
                                      {submitting === destKey
                                        ? "Mengirim..."
                                        : "Update Status"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Mobile layout */}
                            <div className="md:hidden space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-sm flex items-center gap-1">
                                  <span className="w-6 h-6 rounded-full bg-[#F9F6F0] border border-[#EAE4D8] flex items-center justify-center text-[10px] font-bold text-[#5C5C5C]">
                                    {idx + 1}
                                  </span>
                                  {dName || `Tujuan ${idx + 1}`}
                                </div>
                                {statusBadge(dest.status)}
                              </div>
                              <div className="flex flex-wrap gap-1 ml-7">
                                {Object.entries(MENU_CATEGORIES).map(
                                  ([key, cat]) => (
                                    <span
                                      key={key}
                                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                                      style={{
                                        background: `${cat.color}1A`,
                                        color: cat.color,
                                      }}
                                    >
                                      {cat.label}:{" "}
                                      {dest.portions?.[key] ||
                                        dest[`${key.toLowerCase()}_portions`] ||
                                        0}
                                    </span>
                                  )
                                )}
                              </div>
                              {nextStatus && (
                                <div className="ml-7">
                                  <button
                                    onClick={() =>
                                      isDestExpanded
                                        ? setExpandedDest(null)
                                        : initUpdateForm(plan.id, idx, dest)
                                    }
                                    className={`btn-ghost text-xs ${
                                      nextStatus === "DELIVERED"
                                        ? "text-[#4A7C59]"
                                        : "text-[#D97706]"
                                    }`}
                                  >
                                    {nextStatus === "DELIVERED" ? (
                                      <CheckCircle2 size={14} />
                                    ) : (
                                      <ArrowRight size={14} />
                                    )}{" "}
                                    {getNextStatusLabel(dest.status)}
                                  </button>
                                </div>
                              )}

                              {/* Update form (mobile) */}
                              {isDestExpanded && updateForm && (
                                <div className="ml-7 mt-2 p-3 bg-[#F9F6F0] border border-[#EAE4D8] rounded-md space-y-2">
                                  <select
                                    className="w-full px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm"
                                    value={updateForm.status}
                                    onChange={(e) =>
                                      setUpdateForms((prev) => ({
                                        ...prev,
                                        [destKey]: {
                                          ...prev[destKey],
                                          status: e.target.value,
                                        },
                                      }))
                                    }
                                  >
                                    {Object.entries(DELIVERY_STATUSES).map(
                                      ([k, v]) => (
                                        <option key={k} value={k}>
                                          {v.label}
                                        </option>
                                      )
                                    )}
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="Catatan (opsional)"
                                    className="w-full px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm"
                                    value={updateForm.notes}
                                    onChange={(e) =>
                                      setUpdateForms((prev) => ({
                                        ...prev,
                                        [destKey]: {
                                          ...prev[destKey],
                                          notes: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                  {updateForm.status === "DELIVERED" && (
                                    <div>
                                      <label className="text-[10px] uppercase tracking-widest text-[#5C5C5C]">
                                        Foto Bukti
                                      </label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="w-full mt-1 text-xs text-[#5C5C5C] file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-[#4A7C59] file:text-white"
                                        onChange={(e) =>
                                          handlePhoto(
                                            plan.id,
                                            idx,
                                            e.target.files?.[0]
                                          )
                                        }
                                      />
                                      {updateForm.photo_url && (
                                        <div className="mt-1 text-[10px] text-[#4A7C59]">
                                          Foto siap diupload
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDest(null)}
                                      className="btn-ghost text-xs"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      onClick={() =>
                                        submitUpdate(plan.id, idx, dest)
                                      }
                                      disabled={submitting === destKey}
                                      className="btn-primary text-xs"
                                    >
                                      {submitting === destKey
                                        ? "Mengirim..."
                                        : "Update"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

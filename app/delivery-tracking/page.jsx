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
  Clock,
  AlertTriangle,
} from "lucide-react";
import { SkeletonCards } from "@/components/Skeleton";

function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function timeStr(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STEPS = [
  { key: "NOT_DELIVERED", label: "Belum Diantar", icon: Clock },
  { key: "IN_TRANSIT", label: "Sedang Diantar", icon: Truck },
  { key: "DELIVERED", label: "Selesai Diantar", icon: CheckCircle2 },
];

function CourierTracker({ status, logs }) {
  const currentIdx = STEPS.findIndex(s => s.key === status);
  const lastLog = logs?.length > 0 ? logs[logs.length - 1] : null;

  return (
    <div className="flex items-center gap-0 w-full max-w-xs">
      {STEPS.map((step, idx) => {
        const isActive = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const StepIcon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? "bg-[#4A7C59] text-white shadow-md"
                    : "bg-[#EAE4D8] text-[#5C5C5C]"
                } ${isCurrent ? "ring-2 ring-[#4A7C59]/30 ring-offset-2" : ""}`}
              >
                <StepIcon size={14} />
              </div>
              <span className={`text-[9px] mt-1 font-medium text-center leading-tight ${
                isActive ? "text-[#4A7C59]" : "text-[#5C5C5C]"
              }`}>
                {step.label}
              </span>
              {isCurrent && lastLog?.photo_url && idx === 2 && (
                <img
                  src={lastLog.photo_url}
                  alt="Bukti"
                  className="w-8 h-8 rounded-md object-cover border border-[#EAE4D8] mt-1"
                />
              )}
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 flex items-center -mt-4">
                <div className={`h-0.5 w-full transition-all duration-500 ${
                  idx < currentIdx ? "bg-[#4A7C59]" : "bg-[#EAE4D8]"
                }`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function UpdateFormInline({ planId, destIdx, dest, onUpdate, onCancel }) {
  const [status, setStatus] = useState("IN_TRANSIT");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handlePhoto = async (file) => {
    if (!file) { setPhotoUrl(""); return; }
    try {
      const base64 = await fileToBase64(file);
      setPhotoUrl(base64);
    } catch {
      toast.error("Gagal membaca foto");
    }
  };

  const submit = async () => {
    if (status === "DELIVERED" && !photoUrl) {
      setError("Foto bukti wajib diunggah saat menandai pengantaran selesai");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/delivery-logs", {
        assignment_id: planId,
        destination_id: dest.destination_id || dest.id,
        status,
        notes,
        photo_url: photoUrl || null,
      });
      toast.success(`Status diupdate ke ${DELIVERY_STATUSES[status]?.label}`);
      onUpdate();
    } catch (er) {
      toast.error(formatErr(er));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 p-4 bg-[#F9F6F0] border border-[#EAE4D8] rounded-xl space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold">Status</label>
        <div className="flex gap-1">
          {STEPS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatus(s.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                status === s.key
                  ? "bg-[#4A7C59] text-white"
                  : "bg-white border border-[#EAE4D8] text-[#5C5C5C] hover:bg-[#EAE4D8]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1">
          <FileText size={12} /> Catatan
        </label>
        <input
          type="text"
          placeholder="Catatan pengantaran (opsional)"
          className="w-full mt-1 px-3 py-2 rounded-md border border-[#EAE4D8] bg-white text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {status === "DELIVERED" && (
        <div>
          <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1">
            <Camera size={12} /> Foto Bukti Pengantaran
            <span className="text-[#C5533B] font-bold">Wajib</span>
          </label>
          <div className="mt-1 flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-[#EAE4D8] bg-white cursor-pointer hover:border-[#4A7C59] transition-colors">
              <Camera size={16} className="text-[#5C5C5C]" />
              <span className="text-sm text-[#5C5C5C]">Pilih Foto</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0])}
              />
            </label>
            {photoUrl && (
              <div className="relative">
                <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-[#EAE4D8]" />
                <button type="button" onClick={() => setPhotoUrl("")} className="absolute -top-2 -right-2 bg-[#C5533B] text-white rounded-full p-0.5">
                  <span className="block w-3 h-3">×</span>
                </button>
              </div>
            )}
          </div>
          {!photoUrl && (
            <p className="text-[10px] text-[#C5533B] mt-1 flex items-center gap-1">
              <AlertTriangle size={10} /> Foto bukti diperlukan untuk menandai pengantaran selesai
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-[#C5533B] flex items-center gap-1">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost text-sm py-2">Batal</button>
        <button
          onClick={submit}
          disabled={submitting}
          className="btn-primary text-sm py-2 disabled:opacity-50"
        >
          {submitting ? "Mengirim..." : "Update Status"}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const { activeRole, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [expandedDest, setExpandedDest] = useState(null);
  const [logsByPlan, setLogsByPlan] = useState({});

  const canSeeAll = activeRole === "admin_apps" || activeRole === "admin_sppg" || activeRole === "field_assistant";

  const load = async () => {
    setLoading(true);
    try {
      const { data: planData } = await api.get("/delivery-plans", { params: { plan_date: dateStr() } });
      const planList = planData || [];
      setPlans(planList);

      const logsMap = {};
      for (const plan of planList) {
        const assignment = plan.delivery_assignments?.[0];
        if (assignment) {
          try {
            const { data: logs } = await api.get("/delivery-logs", { params: { assignment_id: assignment.id } });
            logsMap[plan.id] = logs || [];
          } catch { logsMap[plan.id] = []; }
        } else {
          logsMap[plan.id] = [];
        }
      }
      setLogsByPlan(logsMap);
    } catch (e) {
      toast.error(formatErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const myPlans = useMemo(() => {
    if (canSeeAll) return plans;
    return plans.filter((p) => p.driver_id === user?.id);
  }, [plans, canSeeAll, user]);

  const destName = (dest) => {
    if (!dest) return "—";
    if (typeof dest === "object") return dest.name || "—";
    return dest;
  };

  const ALLOWED_ROLES = ["admin_apps","admin_sppg","driver","field_assistant"];
  if (!ALLOWED_ROLES.includes(activeRole)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-[#5C5C5C]">Akses Dibatasi</h1>
            <p className="text-[#5C5C5C] mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
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
              const driverName = plan.delivery_assignments?.[0]?.driver_name || plan.driver_name || "Driver";
              const isExpanded = expandedPlan === plan.id;
              const dests = plan.delivery_plan_items || [];
              const planLogs = logsByPlan[plan.id] || [];
              const getDestStatus = (destId) => {
                const destLogs = planLogs.filter(l => l.destination_id === destId);
                if (destLogs.length === 0) return "NOT_DELIVERED";
                return destLogs[destLogs.length - 1].status;
              };
              const deliveredCount = dests.filter(d => getDestStatus(d.destination_id) === "DELIVERED").length;
              const transitCount = dests.filter(d => getDestStatus(d.destination_id) === "IN_TRANSIT").length;
              const overallStatus = deliveredCount === dests.length ? "DELIVERED" : transitCount > 0 ? "IN_TRANSIT" : "NOT_DELIVERED";

              return (
                <div key={plan.id} className="card-soft overflow-hidden">
                  <div
                    className="p-4 bg-gradient-to-r from-[#EAE4D8]/30 to-transparent border-b border-[#EAE4D8] cursor-pointer"
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0891B2] text-white flex items-center justify-center font-bold">
                          <Truck size={18} />
                        </div>
                        <div>
                          <div className="font-semibold">{driverName}</div>
                          <div className="text-xs text-[#5C5C5C]">
                            {plan.plan_date} &middot; {deliveredCount}/{dests.length} tujuan selesai
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CourierTracker status={overallStatus} logs={[]} />
                        <button className="btn-ghost p-1">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-[#EAE4D8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4A7C59] to-[#2D5A3B] rounded-full transition-all duration-700"
                        style={{ width: `${dests.length > 0 ? (deliveredCount / dests.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5 text-[10px] text-[#5C5C5C]">
                      <span>{deliveredCount} selesai</span>
                      <span>{transitCount} dalam perjalanan</span>
                      <span>{dests.length - deliveredCount - transitCount} menunggu</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="divide-y divide-[#EAE4D8]">
                      {dests.map((dest, idx) => {
                        const destKey = `${plan.id}-${idx}`;
                        const isDestExpanded = expandedDest === destKey;
                        const dName = dest.destinations?.name || dest.destination?.name || dest.destination_name || destName(dest.destination_id);
                        const destLogs = planLogs.filter(l => l.destination_id === dest.destination_id);
                        const destStatus = destLogs.length > 0 ? destLogs[destLogs.length - 1].status : "NOT_DELIVERED";
                        const lastLog = destLogs.length > 0 ? destLogs[destLogs.length - 1] : null;
                        const assignmentId = plan.delivery_assignments?.[0]?.id || plan.id;

                        return (
                          <div key={idx} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#F9F6F0] border-2 border-[#EAE4D8] flex items-center justify-center text-xs font-bold text-[#5C5C5C] shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-sm flex items-center gap-1.5">
                                    <MapPin size={13} className="text-[#4A7C59] shrink-0" />
                                    <span className="truncate">{dName || `Tujuan ${idx + 1}`}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {Object.entries(MENU_CATEGORIES).map(([key, cat]) => {
                                      const portions = dest.portions?.[key] || dest[`${key.toLowerCase()}_portions`] || 0;
                                      if (!portions) return null;
                                      return (
                                        <span key={key} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                                          style={{ background: `${cat.color}1A`, color: cat.color }}>
                                          {cat.label}: {portions}
                                        </span>
                                      );
                                    })}
                                  </div>
                                  {lastLog && (
                                    <div className="mt-2 text-[10px] text-[#5C5C5C] flex items-center gap-1">
                                      <Clock size={10} /> {timeStr(lastLog.created_at)}
                                      {lastLog.notes && <span className="italic">— {lastLog.notes}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <CourierTracker status={destStatus} logs={destLogs} />
                                {destStatus !== "DELIVERED" && (
                                  <button
                                    onClick={() => setExpandedDest(isDestExpanded ? null : destKey)}
                                    className={`btn-ghost text-xs whitespace-nowrap ${
                                      destStatus === "NOT_DELIVERED" ? "text-[#D97706]" : "text-[#4A7C59]"
                                    }`}
                                  >
                                    {destStatus === "NOT_DELIVERED" ? "Kirim" : "Selesaikan"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {isDestExpanded && (
                              <UpdateFormInline
                                planId={assignmentId}
                                destIdx={idx}
                                dest={dest}
                                onUpdate={() => { setExpandedDest(null); load(); }}
                                onCancel={() => setExpandedDest(null)}
                              />
                            )}
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

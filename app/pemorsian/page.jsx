"use client";

import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload, CheckCircle2, CalendarDays, Clock, UtensilsCrossed, X, AlertTriangle } from "lucide-react";

const CATEGORY_LABELS = {
  BALITA: "Balita",
  PORTION_SMALL: "Porsi Kecil (PAUD/SD1-3)",
  PORTION_LARGE: "Porsi Besar (SD4-SMA)",
  BUMIL_BUSUI: "Bumil & Busui",
};

const ROLE_PAGE_CONFIG = {
  pemorsian: { title: "Pemorsian", desc: "Kelola tugas pemorsian harian dan unggah foto ompreng.", taskType: "pemorsian" },
  persiapan: { title: "Persiapan Bahan", desc: "Catat persiapan bahan masak harian.", taskType: "persiapan" },
  tenaga_masak: { title: "Tenaga Masak", desc: "Catat aktivitas memasak harian.", taskType: "masak" },
  kebersihan: { title: "Kebersihan Dapur", desc: "Catat aktivitas kebersihan dapur.", taskType: "kebersihan" },
  pencuci: { title: "Pencuci Ompreng", desc: "Catat aktivitas pencucian ompreng.", taskType: "pencuci" },
};

const STATUS_LABELS = {
  SELESAI: { label: "Selesai", color: "#4A7C59" },
  BELUM_SELESAI: { label: "Belum Selesai", color: "#D97706" },
};

function dateStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function timeStr(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function Page() {
  const { activeRole } = useAuth();
  const role = activeRole || "pemorsian";
  const pageConfig = ROLE_PAGE_CONFIG[role] || ROLE_PAGE_CONFIG.pemorsian;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dateStr());
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  const EMPTY_FORM = {
    task_date: dateStr(),
    task_type: pageConfig.taskType,
    category: "BALITA",
    portions: 0,
    photo_url: "",
    description: "",
    status: "BELUM_SELESAI",
  };

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { setForm(p => ({ ...p, task_type: pageConfig.taskType })); }, [pageConfig.taskType]);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/daily-tasks?task_date=${selectedDate}&role=${role}`)
      .then(({ data }) => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [selectedDate, role]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setForm(p => ({ ...p, task_date: selectedDate })); }, [selectedDate]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setForm(p => ({ ...p, photo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setForm(p => ({ ...p, photo_url: "" }));
  };

  const submitTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/daily-tasks", {
        task_date: form.task_date,
        task_type: form.task_type,
        category: form.category,
        portions: parseInt(form.portions) || 0,
        photo_url: form.photo_url,
        description: form.description,
        status: form.status,
      });
      setSuccess("Tugas berhasil disimpan!");
      setOpen(false);
      setForm({ ...EMPTY_FORM, task_date: selectedDate });
      setPhotoPreview(null);
      load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (er) {
      setError("Gagal menyimpan tugas. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPortions = tasks.reduce((sum, t) => sum + (t.portions || 0), 0);
  const completedCount = tasks.filter(t => t.status === "SELESAI").length;
  const photoCount = tasks.filter(t => t.photo_url).length;

  return (
    <Layout>
      <div className="space-y-6" data-testid="pemorsian-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">{pageConfig.title}</h1>
            <p className="text-[#5C5C5C] mt-1">{pageConfig.desc}</p>
          </div>
          <button data-testid="add-task-btn" onClick={() => { setForm({ ...EMPTY_FORM, task_date: selectedDate }); setPhotoPreview(null); setOpen(true); }} className="btn-primary">
            <UtensilsCrossed size={16} /> Input Tugas
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-[#4A7C59]/10 text-[#4A7C59] px-4 py-3 rounded-lg text-sm font-medium">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-[#C5533B]/10 text-[#C5533B] px-4 py-3 rounded-lg text-sm font-medium">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-soft p-4 text-center">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Total Porsi</div>
            <div className="font-display text-3xl font-bold mt-1" style={{ color: "#2C4251" }}>{totalPortions}</div>
          </div>
          <div className="card-soft p-4 text-center">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Tugas Selesai</div>
            <div className="font-display text-3xl font-bold mt-1" style={{ color: "#4A7C59" }}>{completedCount} / {tasks.length}</div>
          </div>
          <div className="card-soft p-4 text-center">
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">Foto Terupload</div>
            <div className="font-display text-3xl font-bold mt-1" style={{ color: "#D97706" }}>{photoCount}</div>
          </div>
        </div>

        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="text-xs uppercase tracking-widest text-[#5C5C5C] block mb-1">Tanggal</label>
            <input
              data-testid="date-picker"
              type="date"
              className="px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="card-soft overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left py-3 px-4">Jenis Tugas</th>
                  <th className="text-left py-3 px-4">Kategori</th>
                  <th className="text-left py-3 px-4">Porsi</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Foto</th>
                  <th className="text-left py-3 px-4">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const st = STATUS_LABELS[t.status] || STATUS_LABELS.BELUM_SELESAI;
                  return (
                    <tr key={t.id} className="border-b border-[#EAE4D8] last:border-0" data-testid={`task-row-${t.id}`}>
                      <td className="py-3 px-4 font-semibold">{t.task_type}</td>
                      <td className="py-3 px-4">
                        <span className="tag bg-[#2C4251]/10 text-[#2C4251]">{CATEGORY_LABELS[t.category] || t.category}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{t.portions}</td>
                      <td className="py-3 px-4">
                        <span className="role-pill" style={{ background: `${st.color}1A`, color: st.color }}>{st.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        {t.photo_url ? (
                          <img src={t.photo_url} alt="Foto ompreng" className="w-10 h-10 rounded-md object-cover border border-[#EAE4D8]" />
                        ) : (
                          <span className="text-xs text-[#5C5C5C]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#5C5C5C] flex items-center gap-1">
                        <Clock size={12} /> {timeStr(t.created_at)}
                      </td>
                    </tr>
                  );
                })}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#5C5C5C]">Belum ada tugas untuk tanggal ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {tasks.map((t) => {
              const st = STATUS_LABELS[t.status] || STATUS_LABELS.BELUM_SELESAI;
              return (
                <div key={t.id} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{t.task_type}</div>
                      <div className="text-xs text-[#5C5C5C] flex items-center gap-1 mt-1">
                        <Clock size={12} /> {timeStr(t.created_at)}
                      </div>
                    </div>
                    <span className="role-pill" style={{ background: `${st.color}1A`, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="tag bg-[#2C4251]/10 text-[#2C4251]">{CATEGORY_LABELS[t.category] || t.category}</span>
                    <span className="font-semibold">{t.portions} porsi</span>
                  </div>
                  {t.photo_url && (
                    <img src={t.photo_url} alt="Foto ompreng" className="w-16 h-16 rounded-md object-cover border border-[#EAE4D8]" />
                  )}
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="text-center text-[#5C5C5C] py-10">Belum ada tugas untuk tanggal ini.</div>
            )}
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4 overflow-y-auto" onClick={() => setOpen(false)}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitTask} className="card-soft p-6 w-full max-w-lg my-8" data-testid="task-modal">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Input Tugas {pageConfig.title}</h2>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost p-1"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><CalendarDays size={12} /> Tanggal</label>
                  <input
                    data-testid="task-date"
                    required
                    type="date"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    value={form.task_date}
                    onChange={(e) => setForm({ ...form, task_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jenis Tugas</label>
                  <input
                    data-testid="task-type"
                    required
                    readOnly
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#EAE4D8] text-[#5C5C5C] cursor-not-allowed"
                    value="Pemorsian"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kategori</label>
                  <select
                    data-testid="task-category"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah Porsi</label>
                  <input
                    data-testid="task-portions"
                    required
                    type="number"
                    min="0"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    value={form.portions}
                    onChange={(e) => setForm({ ...form, portions: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><Camera size={12} /> Foto Ompreng</label>
                  <input
                    data-testid="task-photo"
                    type="file"
                    accept="image/*"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#4A7C59] file:text-white"
                    onChange={handlePhoto}
                  />
                  {photoPreview && (
                    <div className="relative mt-2 inline-block">
                      <img src={photoPreview} alt="Preview" className="w-32 h-24 rounded-md object-cover border border-[#EAE4D8]" />
                      <button type="button" onClick={removePhoto} className="absolute -top-2 -right-2 bg-[#C5533B] text-white rounded-full p-0.5"><X size={14} /></button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Deskripsi</label>
                  <textarea
                    data-testid="task-description"
                    rows={3}
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm resize-none"
                    placeholder="Catatan tambahan (opsional)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Status</label>
                  <select
                    data-testid="task-status"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="SELESAI">Selesai</option>
                    <option value="BELUM_SELESAI">Belum Selesai</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Batal</button>
                <button data-testid="submit-task" type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? "Menyimpan..." : "Simpan Tugas"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

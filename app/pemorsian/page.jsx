"use client";

import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, CheckCircle2, CalendarDays, Clock, UtensilsCrossed, X, AlertTriangle, Plus, Trash2 } from "lucide-react";

const CATEGORY_LABELS = {
  BALITA: "Balita",
  PORTION_SMALL: "Porsi Kecil (PAUD/SD1-3)",
  PORTION_LARGE: "Porsi Besar (SD4-SMA)",
  BUMIL_BUSUI: "Bumil & Busui",
};

const ROLE_PAGE_CONFIG = {
  pemorsian: {
    title: "Pemorsian",
    desc: "Isi makanan ke ompreng dan foto dokumentasi per kategori penerima manfaat.",
    taskType: "pemorsian",
    showCategory: true,
    showPortions: true,
    multiPhoto: false,
    photoLabel: "Foto Ompreng",
  },
  persiapan: {
    title: "Persiapan Bahan",
    desc: "Catat persiapan bahan masak harian.",
    taskType: "persiapan",
    showCategory: false,
    showPortions: false,
    multiPhoto: false,
    photoLabel: "Foto Persiapan",
  },
  tenaga_masak: {
    title: "Tenaga Masak",
    desc: "Catat aktivitas memasak harian.",
    taskType: "masak",
    showCategory: false,
    showPortions: false,
    multiPhoto: false,
    photoLabel: "Foto Masak",
  },
  kebersihan: {
    title: "Kebersihan Dapur",
    desc: "Dokumentasikan kebersihan dapur. Upload semua foto area yang sudah bersih.",
    taskType: "kebersihan",
    showCategory: false,
    showPortions: false,
    multiPhoto: true,
    photoLabel: "Foto Area Dapur",
    photoSlots: [
      { label: "Area Memasak", desc: "Foto kompor, meja, dan area memasak" },
      { label: "Area Cuci", desc: "Foto wastafel dan area pencucian" },
      { label: "Area Penyimpanan", desc: "Foto rak dan lemari penyimpanan" },
      { label: "Lantai & Drainase", desc: "Foto kebersihan lantai dan saluran air" },
    ],
  },
  pencuci: {
    title: "Pencuci Ompreng",
    desc: "Dokumentasikan pencucian ompreng. Wajib upload 3 foto berikut.",
    taskType: "pencuci",
    showCategory: false,
    showPortions: false,
    multiPhoto: true,
    photoLabel: "Foto Pencucian",
    photoSlots: [
      { label: "Ompreng Bersih", desc: "Foto ompreng setelah dicuci bersih" },
      { label: "Penanggulangan Limbah", desc: "Foto pembuangan limbah cuci yang benar" },
      { label: "Kebersihan Area", desc: "Foto area pencucian setelah digunakan" },
    ],
  },
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

function PhotoUpload({ label, desc, preview, onUpload, onRemove, required }) {
  return (
    <div className="border border-[#EAE4D8] rounded-lg p-3 bg-[#F9F6F0]">
      <div className="flex items-center gap-2 mb-1">
        <Camera size={14} className="text-[#4A7C59]" />
        <span className="text-sm font-semibold">{label}</span>
        {required && <span className="text-[10px] text-[#C5533B] font-bold uppercase">Wajib</span>}
      </div>
      {desc && <p className="text-xs text-[#5C5C5C] mb-2">{desc}</p>}
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt={label} className="w-24 h-24 rounded-lg object-cover border border-[#EAE4D8]" />
          <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 bg-[#C5533B] text-white rounded-full p-1 shadow-md">
            <X size={14} />
          </button>
          <div className="absolute bottom-1 left-1 bg-[#4A7C59] text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold">
            ✓ Terupload
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-[#EAE4D8] rounded-lg cursor-pointer hover:border-[#4A7C59] transition-colors">
          <Camera size={20} className="text-[#5C5C5C] mb-1" />
          <span className="text-[10px] text-[#5C5C5C] font-medium">Pilih Foto</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onUpload} />
        </label>
      )}
    </div>
  );
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

  const [form, setForm] = useState({
    task_date: dateStr(),
    category: "BALITA",
    portions: 0,
    description: "",
  });

  const [photos, setPhotos] = useState({});

  useEffect(() => { setForm(p => ({ ...p, task_date: selectedDate })); }, [selectedDate]);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/daily-tasks?task_date=${selectedDate}&role=${role}`)
      .then(({ data }) => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [selectedDate, role]);

  useEffect(() => { load(); }, [load]);

  const handlePhoto = (slotIdx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotos(prev => ({ ...prev, [slotIdx]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (slotIdx) => {
    setPhotos(prev => {
      const next = { ...prev };
      delete next[slotIdx];
      return next;
    });
  };

  const submitTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (pageConfig.multiPhoto) {
        const slots = pageConfig.photoSlots || [];
        const photoEntries = slots
          .map((slot, idx) => ({ idx, slot, photo: photos[idx] }))
          .filter(e => e.photo);

        if (photoEntries.length === 0) {
          setError("Minimal upload 1 foto");
          setSubmitting(false);
          return;
        }

        for (const entry of photoEntries) {
          await api.post("/daily-tasks", {
            task_date: form.task_date,
            task_type: pageConfig.taskType,
            category: null,
            portions: 0,
            photo_url: entry.photo,
            description: `${entry.slot.label}: ${form.description || entry.slot.desc}`,
            status: "SELESAI",
          });
        }
      } else {
        await api.post("/daily-tasks", {
          task_date: form.task_date,
          task_type: pageConfig.taskType,
          category: pageConfig.showCategory ? form.category : null,
          portions: pageConfig.showPortions ? parseInt(form.portions) || 0 : 0,
          photo_url: photos[0] || "",
          description: form.description,
          status: "SELESAI",
        });
      }

      setSuccess("Tugas berhasil disimpan!");
      setOpen(false);
      setForm({ task_date: selectedDate, category: "BALITA", portions: 0, description: "" });
      setPhotos({});
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
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">{pageConfig.title}</h1>
            <p className="text-[#5C5C5C] mt-1">{pageConfig.desc}</p>
          </div>
          <button onClick={() => { setForm({ task_date: selectedDate, category: "BALITA", portions: 0, description: "" }); setPhotos({}); setOpen(true); }} className="btn-primary">
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
            <div className="text-xs uppercase tracking-widest text-[#5C5C5C]">
              {pageConfig.showPortions ? "Total Porsi" : "Total Foto"}
            </div>
            <div className="font-display text-3xl font-bold mt-1" style={{ color: "#2C4251" }}>
              {pageConfig.showPortions ? totalPortions : photoCount}
            </div>
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
                  {pageConfig.showPortions && <th className="text-left py-3 px-4">Porsi</th>}
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Foto</th>
                  <th className="text-left py-3 px-4">Deskripsi</th>
                  <th className="text-left py-3 px-4">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const st = STATUS_LABELS[t.status] || STATUS_LABELS.BELUM_SELESAI;
                  return (
                    <tr key={t.id} className="border-b border-[#EAE4D8] last:border-0">
                      <td className="py-3 px-4 font-semibold capitalize">{t.task_type}</td>
                      <td className="py-3 px-4">
                        {t.category ? (
                          <span className="tag bg-[#2C4251]/10 text-[#2C4251]">{CATEGORY_LABELS[t.category] || t.category}</span>
                        ) : (
                          <span className="text-xs text-[#5C5C5C]">—</span>
                        )}
                      </td>
                      {pageConfig.showPortions && (
                        <td className="py-3 px-4 font-semibold">{t.portions || 0}</td>
                      )}
                      <td className="py-3 px-4">
                        <span className="tag" style={{ background: `${st.color}1A`, color: st.color }}>{st.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        {t.photo_url ? (
                          <img src={t.photo_url} alt="Foto" className="w-10 h-10 rounded-md object-cover border border-[#EAE4D8]" />
                        ) : (
                          <span className="text-xs text-[#5C5C5C]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#5C5C5C] max-w-[200px] truncate">{t.description || "—"}</td>
                      <td className="py-3 px-4 text-xs text-[#5C5C5C] flex items-center gap-1">
                        <Clock size={12} /> {timeStr(t.created_at)}
                      </td>
                    </tr>
                  );
                })}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={pageConfig.showPortions ? 7 : 6} className="py-10 text-center text-[#5C5C5C]">Belum ada tugas untuk tanggal ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3 p-3">
            {tasks.map((t) => {
              const st = STATUS_LABELS[t.status] || STATUS_LABELS.BELUM_SELESAI;
              return (
                <div key={t.id} className="card-soft p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold capitalize">{t.task_type}</div>
                      <div className="text-xs text-[#5C5C5C] flex items-center gap-1 mt-1">
                        <Clock size={12} /> {timeStr(t.created_at)}
                      </div>
                    </div>
                    <span className="tag" style={{ background: `${st.color}1A`, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {t.category && <span className="tag bg-[#2C4251]/10 text-[#2C4251]">{CATEGORY_LABELS[t.category] || t.category}</span>}
                    {t.portions > 0 && <span className="font-semibold">{t.portions} porsi</span>}
                  </div>
                  {t.description && <div className="text-xs text-[#5C5C5C]">{t.description}</div>}
                  {t.photo_url && (
                    <img src={t.photo_url} alt="Foto" className="w-16 h-16 rounded-md object-cover border border-[#EAE4D8]" />
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
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitTask} className="card-soft p-4 sm:p-6 w-full max-w-lg my-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold">Input Tugas {pageConfig.title}</h2>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost p-1"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1"><CalendarDays size={12} /> Tanggal</label>
                  <input
                    required
                    type="date"
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                    value={form.task_date}
                    onChange={(e) => setForm({ ...form, task_date: e.target.value })}
                  />
                </div>

                {pageConfig.showCategory && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Kategori Penerima</label>
                    <select
                      className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                )}

                {pageConfig.showPortions && (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Jumlah Porsi</label>
                    <input
                      required
                      type="number"
                      min="1"
                      className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0]"
                      value={form.portions}
                      onChange={(e) => setForm({ ...form, portions: e.target.value })}
                    />
                  </div>
                )}

                {pageConfig.multiPhoto ? (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C] font-semibold mb-2 block">
                      Foto Dokumentasi {pageConfig.title}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(pageConfig.photoSlots || []).map((slot, idx) => (
                        <PhotoUpload
                          key={idx}
                          label={slot.label}
                          desc={slot.desc}
                          preview={photos[idx]}
                          onUpload={(e) => handlePhoto(idx, e)}
                          onRemove={() => removePhoto(idx)}
                          required={role === "pencuci"}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-[#5C5C5C] mt-2">
                      {role === "pencuci"
                        ? "Wajib upload semua 3 foto untuk dokumentasi pencucian ompreng."
                        : "Upload semua foto area dapur yang sudah bersih."}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#5C5C5C] flex items-center gap-1">
                      <Camera size={12} /> {pageConfig.photoLabel}
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#EAE4D8] rounded-lg cursor-pointer hover:border-[#4A7C59] transition-colors mt-1">
                      {photos[0] ? (
                        <div className="relative">
                          <img src={photos[0]} alt="Preview" className="w-28 h-20 rounded-md object-cover" />
                          <button type="button" onClick={() => removePhoto(0)} className="absolute -top-2 -right-2 bg-[#C5533B] text-white rounded-full p-1">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera size={24} className="text-[#5C5C5C] mb-1" />
                          <span className="text-xs text-[#5C5C5C]">Klik untuk foto atau upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhoto(0, e)} />
                    </label>
                  </div>
                )}

                <div>
                  <label className="text-xs uppercase tracking-widest text-[#5C5C5C]">Catatan</label>
                  <textarea
                    rows={2}
                    className="w-full mt-1 px-4 py-2.5 rounded-md border border-[#EAE4D8] bg-[#F9F6F0] text-sm resize-none"
                    placeholder="Catatan tambahan (opsional)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Batal</button>
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
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

"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Database, Plus, Edit2, Trash2, ChevronRight, ChevronDown,
  Save, X, FolderTree, Package, Layers
} from "lucide-react";

const LEVEL_LABELS = { 1: "Kelompok", 2: "Sub-Kelompok", 3: "Barang" };
const LEVEL_COLORS = { 1: "#4A7C59", 2: "#D97706", 3: "#2C4251" };
const ZONES = ["DRY", "WET", "FREEZER"];

export default function ItemHierarchyPage() {
  const { user, activeRole } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState(null);
  const [filter, setFilter] = useState({ level: "" });

  const canWrite = activeRole === "admin_apps" || activeRole === "admin_sppg";

  const ALLOWED_ROLES = ["admin_apps", "admin_sppg"];
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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/item-hierarchies");
      setItems(data || []);
    } catch (err) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (code) => {
    setExpanded(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const getChildren = (parentCode) => items.filter(i => i.parent_code === parentCode);

  const renderTree = (parentCode, depth = 0) => {
    const children = getChildren(parentCode);
    if (children.length === 0) return null;

    return children.map((item) => {
      const childCount = getChildren(item.code).length;
      const isExpanded = expanded[item.code];

      return (
        <div key={item.id} style={{ marginLeft: depth * 24 }}>
          <div className="flex items-center gap-2 py-2 px-3 hover:bg-[#F9F6F0] rounded-md group">
            {childCount > 0 ? (
              <button onClick={() => toggleExpand(item.code)} className="p-1 hover:bg-[#EAE4D8] rounded">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ background: LEVEL_COLORS[item.level] + "20", color: LEVEL_COLORS[item.level] }}
            >
              {item.code}
            </span>
            <span className="font-medium text-sm flex-1">{item.name}</span>
            {item.unit && <span className="text-xs text-[#5C5C5C]">{item.unit}</span>}
            {item.zone && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE4D8]">{item.zone}</span>
            )}
            {canWrite && (
              <div className="md:opacity-0 md:group-hover:opacity-100 opacity-100 flex gap-1 transition-opacity">
                <button onClick={() => setForm(item)} className="p-1.5 hover:bg-[#EAE4D8] rounded"><Edit2 size={12}/></button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={12}/></button>
              </div>
            )}
          </div>
          {isExpanded && renderTree(item.code, depth + 1)}
        </div>
      );
    });
  };

  const level1Items = items.filter(i => i.level === 1);
  const filtered = filter.level ? items.filter(i => i.level === parseInt(filter.level)) : level1Items;

  const handleDelete = async (id) => {
    if (!confirm("Nonaktifkan item ini?")) return;
    try {
      await api.delete(`/item-hierarchies/${id}`);
      toast.success("Item dinonaktifkan");
      fetchItems();
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  };

  const handleSave = async () => {
    try {
      if (form.id) {
        await api.put(`/item-hierarchies/${form.id}`, form);
        toast.success("Berhasil diupdate");
      } else {
        await api.post("/item-hierarchies", form);
        toast.success("Berhasil ditambahkan");
      }
      setForm(null);
      fetchItems();
    } catch (err) {
      toast.error("Gagal menyimpan");
    }
  };

  const stats = {
    level1: items.filter(i => i.level === 1).length,
    level2: items.filter(i => i.level === 2).length,
    level3: items.filter(i => i.level === 3).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">Hirarki Barang</h1>
            <p className="text-[#5C5C5C] mt-1">Referensi barang 3 level: Kelompok &gt; Sub-Kelompok &gt; Barang</p>
          </div>
          {canWrite && (
            <button onClick={() => setForm({ code: "", name: "", level: 1, parent_code: "", category: "", unit: "", zone: "DRY" })} className="btn-primary">
              <Plus size={14}/> Tambah Item
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-soft p-4 text-center">
            <Layers size={20} className="mx-auto mb-1" style={{ color: LEVEL_COLORS[1] }} />
            <div className="font-display font-bold text-2xl">{stats.level1}</div>
            <div className="text-xs text-[#5C5C5C]">Kelompok</div>
          </div>
          <div className="card-soft p-4 text-center">
            <FolderTree size={20} className="mx-auto mb-1" style={{ color: LEVEL_COLORS[2] }} />
            <div className="font-display font-bold text-2xl">{stats.level2}</div>
            <div className="text-xs text-[#5C5C5C]">Sub-Kelompok</div>
          </div>
          <div className="card-soft p-4 text-center">
            <Package size={20} className="mx-auto mb-1" style={{ color: LEVEL_COLORS[3] }} />
            <div className="font-display font-bold text-2xl">{stats.level3}</div>
            <div className="text-xs text-[#5C5C5C]">Barang</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <select
            value={filter.level}
            onChange={(e) => setFilter({ level: e.target.value })}
            className="form-select text-sm"
          >
            <option value="">Semua Level</option>
            <option value="1">Level 1 - Kelompok</option>
            <option value="2">Level 2 - Sub-Kelompok</option>
            <option value="3">Level 3 - Barang</option>
          </select>
        </div>

        {/* Tree View */}
        {loading ? (
          <div className="card-soft p-12 text-center text-[#5C5C5C]">
            <div className="animate-spin w-8 h-8 border-2 border-[#4A7C59] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="card-soft overflow-hidden">
            <div className="px-5 py-3 border-b border-[#EAE4D8] font-display font-bold flex items-center gap-2">
              <Database size={16} /> Struktur Hierarki
            </div>
            <div className="p-3">
              {filter.level ? (
                filtered.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-2 px-3 hover:bg-[#F9F6F0] rounded-md group">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: LEVEL_COLORS[item.level] + "20", color: LEVEL_COLORS[item.level] }}>
                      {item.code}
                    </span>
                    <span className="font-medium text-sm flex-1">{item.name}</span>
                    {item.unit && <span className="text-xs text-[#5C5C5C]">{item.unit}</span>}
                    {item.zone && <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAE4D8]">{item.zone}</span>}
                    {canWrite && (
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button onClick={() => setForm(item)} className="p-1.5 hover:bg-[#EAE4D8] rounded"><Edit2 size={12}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={12}/></button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                renderTree(null)
              )}
            </div>
          </div>
        )}

        {/* Form Modal */}
        {form && (
          <div className="modal-overlay" onClick={() => setForm(null)}>
            <div className="modal-panel modal-panel-sm" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="font-display font-bold text-lg">{form.id ? "Edit" : "Tambah"} Item Hierarki</h3>
                <button onClick={() => setForm(null)} className="btn-ghost p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={18}/></button>
              </div>
              <div className="modal-body space-y-4">
                <div>
                  <label className="form-label">Kode</label>
                  <input required className="form-input w-full mt-1 font-mono" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="Contoh: KH-01-001"/>
                </div>
                <div>
                  <label className="form-label">Nama</label>
                  <input required className="form-input w-full mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nama item"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Level</label>
                    <select className="form-select w-full mt-1" value={form.level} onChange={e => setForm({...form, level: parseInt(e.target.value)})}>
                      <option value={1}>1 - Kelompok</option>
                      <option value={2}>2 - Sub-Kelompok</option>
                      <option value={3}>3 - Barang</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Kode Induk</label>
                    <select className="form-select w-full mt-1" value={form.parent_code || ""} onChange={e => setForm({...form, parent_code: e.target.value || null})}>
                      <option value="">-</option>
                      {items.filter(i => i.level < form.level && i.is_active !== false).map(i => (
                        <option key={i.code} value={i.code}>{i.code} - {i.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Kategori</label>
                    <select className="form-select w-full mt-1" value={form.category || ""} onChange={e => setForm({...form, category: e.target.value || null})}>
                      <option value="">-</option>
                      <option value="KH">KH - Karbohidrat</option>
                      <option value="PH">PH - Protein Hewani</option>
                      <option value="PN">PN - Protein Nabati</option>
                      <option value="SY">SY - Sayuran</option>
                      <option value="BU">BU - Buah-buahan</option>
                      <option value="BB">BB - Bahan Baku Lain</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Satuan</label>
                    <input className="form-input w-full mt-1" value={form.unit || ""} onChange={e => setForm({...form, unit: e.target.value})} placeholder="kg, liter, ikat"/>
                  </div>
                </div>
                {form.level === 3 && (
                  <div>
                    <label className="form-label">Zona</label>
                    <select className="form-select w-full mt-1" value={form.zone || "DRY"} onChange={e => setForm({...form, zone: e.target.value})}>
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={handleSave} className="btn-primary flex-1"><Save size={14}/> Simpan</button>
                <button onClick={() => setForm(null)} className="btn-outline flex-1">Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

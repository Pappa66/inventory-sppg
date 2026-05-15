"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { mondayOf } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Page() {
  const [rows, setRows] = useState([]);
  const [weekStart, setWeekStart] = useState(mondayOf());

  useEffect(() => {
    api.get(`/tva?week_start=${weekStart}`).then(({data}) => setRows(data));
  }, [weekStart]);

  return (
    <Layout>
      <div className="space-y-6" data-testid="tva-page">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold">TvA · Selisih Bahan</h1>
            <p className="text-[#5C5C5C] mt-1">Teoritis dari resep × porsi menu, dibandingkan dengan pemakaian aktual berdasarkan opname.</p>
          </div>
          <input type="date" value={weekStart} onChange={(e)=>setWeekStart(mondayOf(e.target.value))} className="audit-ts text-sm card-soft px-3 py-2"/>
        </div>

        <div className="card-soft p-6">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={rows.slice(0,10)} margin={{top:10,right:20,left:-10,bottom:30}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE4D8"/>
              <XAxis dataKey="item_name" tick={{fontSize:11, fill:"#5C5C5C"}} angle={-15} textAnchor="end" interval={0} height={50}/>
              <YAxis tick={{fontSize:11, fill:"#5C5C5C"}}/>
              <Tooltip contentStyle={{borderRadius:8, border:"1px solid #EAE4D8", fontSize:12}}/>
              <Legend wrapperStyle={{fontSize:12}}/>
              <Bar dataKey="theoretical" name="Teoritis" fill="#EAE4D8" stroke="#5C5C5C"/>
              <Bar dataKey="actual" name="Aktual" fill="#4A7C59"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#EAE4D8] text-[#5C5C5C] text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left py-3 px-4">Bahan</th>
                <th className="text-right py-3 px-4">Teoritis</th>
                <th className="text-right py-3 px-4">Aktual</th>
                <th className="text-right py-3 px-4">Selisih</th>
                <th className="text-right py-3 px-4">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const high = Math.abs(r.variance_pct) > 15;
                const color = high ? "#C5533B" : Math.abs(r.variance_pct) > 5 ? "#D97706" : "#4A7C59";
                return (
                  <tr key={r.item_id} className="border-b border-[#EAE4D8] last:border-0">
                    <td className="py-3 px-4 font-semibold">{r.item_name}</td>
                    <td className="py-3 px-4 text-right audit-ts">{r.theoretical} {r.unit}</td>
                    <td className="py-3 px-4 text-right audit-ts">{r.actual} {r.unit}</td>
                    <td className="py-3 px-4 text-right audit-ts" style={{color}}>{r.variance > 0 ? "+" : ""}{r.variance}</td>
                    <td className="py-3 px-4 text-right"><span className="role-pill" style={{background:`${color}1A`, color}}>{r.variance_pct}%</span></td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-[#5C5C5C]">Belum ada data TvA untuk minggu ini.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

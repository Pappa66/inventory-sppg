"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

function clearAll() {
  localStorage.removeItem("sppg_token");
  document.cookie = "sppg_token=; path=/; max-age=0";
  delete api.defaults.headers.common["Authorization"];
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("sppg_token");
    if (!token) {
      autoLogin();
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    api.get("/auth/me")
      .then(({ data }) => {
        setUser(data);
        setActiveRole(data.role);
        setLoading(false);
      })
      .catch(() => {
        clearAll();
        autoLogin();
      });
  }, [router]);

  function autoLogin() {
    const demoUser = { id: null, email: "demo@sppg.id", name: "Demo", role: "admin", is_active: true };
    localStorage.setItem("sppg_token", "demo");
    document.cookie = "sppg_token=demo; path=/; max-age=43200; SameSite=Lax";
    api.defaults.headers.common["Authorization"] = "Bearer demo";
    setUser(demoUser);
    setActiveRole(demoUser.role);
    setLoading(false);
  }

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      clearAll();
      localStorage.setItem("sppg_token", data.token);
      document.cookie = `sppg_token=${data.token}; path=/; max-age=43200; SameSite=Lax`;
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setUser(data.user);
      setActiveRole(data.user.role);
      setError("");
      return data.user;
    } catch (e) {
      const msg = e?.response?.data?.detail || "Login gagal";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAll();
    setUser(null);
    setActiveRole(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, activeRole, setActiveRole, loading, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

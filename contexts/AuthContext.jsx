"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("sppg_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/auth/me")
        .then(({ data }) => {
          setUser(data);
          setActiveRole(data.role);
        })
        .catch(() => {
          localStorage.removeItem("sppg_token");
          document.cookie = "sppg_token=; path=/; max-age=0";
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("sppg_token", data.token);
      document.cookie = `sppg_token=${data.token}; path=/; max-age=43200; SameSite=Lax`;
      api.defaults.headers.common["Authorization"] = `Bearer ${data.user.email}`;
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
    localStorage.removeItem("sppg_token");
    document.cookie = "sppg_token=; path=/; max-age=0";
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setActiveRole(null);
  }, []);

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

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { WodHistoryEntry, UBICACIONES_PREDEFINIDAS } from "@/lib/types";
import WodResult from "@/components/WodResult";

const intensidadColor = (n: number) => {
  if (n >= 8) return "#ff5c5c";
  if (n >= 6) return "#ff9f43";
  if (n >= 4) return "#feca57";
  return "#5cd85c";
};

export default function HistorialPage() {
  const [entries, setEntries] = useState<WodHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WodHistoryEntry | null>(null);
  const [filterUbi, setFilterUbi] = useState<string>("todas");
  const [ubicaciones, setUbicaciones] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUbicacion, setEditUbicacion] = useState("");
  const [editUbicacionCustom, setEditUbicacionCustom] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("wod_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setEntries(data as WodHistoryEntry[]);
      const ubis = Array.from(new Set(data.map((e: any) => e.ubicacion))) as string[];
      setUbicaciones(ubis);
    }
    setLoading(false);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("¿Eliminar este WOD del historial?")) return;
    await supabase.from("wod_history").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const startEditing = (entry: WodHistoryEntry) => {
    const isPredefined = UBICACIONES_PREDEFINIDAS.filter((u) => u !== "Otro").includes(entry.ubicacion);
    setEditingId(entry.id);
    setEditUbicacion(isPredefined ? entry.ubicacion : "Otro");
    setEditUbicacionCustom(isPredefined ? "" : entry.ubicacion);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditUbicacion("");
    setEditUbicacionCustom("");
  };

  const saveLocation = async (id: string) => {
    const newUbi = editUbicacion === "Otro" ? (editUbicacionCustom.trim() || "Otro") : editUbicacion;
    const { error } = await supabase
      .from("wod_history")
      .update({ ubicacion: newUbi })
      .eq("id", id);

    if (!error) {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ubicacion: newUbi } : e))
      );
      if (selected?.id === id) {
        setSelected((prev) => prev ? { ...prev, ubicacion: newUbi } : prev);
      }
      const updatedEntries = entries.map((e) => (e.id === id ? { ...e, ubicacion: newUbi } : e));
      const ubis = Array.from(new Set(updatedEntries.map((e) => e.ubicacion)));
      setUbicaciones(ubis);
    }
    cancelEditing();
  };

  const filtered =
    filterUbi === "todas"
      ? entries
      : entries.filter((e) => e.ubicacion === filterUbi);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (selected) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelected(null)}
          className="glass-sm !py-2 !px-5 text-[0.82em] font-medium transition-colors"
          style={{ color: "rgba(var(--base-rgb), 0.5)" }}
        >
          ← Volver al historial
        </button>

        <div className="glass-sm animate-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {editingId === selected.id ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[0.72em] font-medium tracking-[2px] uppercase"
                    style={{ color: "rgba(var(--base-rgb), 0.25)" }}
                  >
                    📍
                  </span>
                  <select
                    value={editUbicacion}
                    onChange={(e) => setEditUbicacion(e.target.value)}
                    className="rounded-lg py-1.5 px-3 text-[0.8em] appearance-none cursor-pointer"
                    style={{
                      backgroundColor: "rgba(var(--base-rgb), 0.04)",
                      border: "1px solid rgba(var(--base-rgb), 0.08)",
                      color: "rgba(var(--base-rgb), 0.7)",
                    }}
                  >
                    {UBICACIONES_PREDEFINIDAS.map((u) => (
                      <option key={u} value={u} style={{ background: "var(--surface-2)" }}>{u}</option>
                    ))}
                  </select>
                  {editUbicacion === "Otro" && (
                    <input
                      type="text"
                      value={editUbicacionCustom}
                      onChange={(e) => setEditUbicacionCustom(e.target.value)}
                      placeholder="¿Dónde?"
                      className="rounded-lg py-1.5 px-3 text-[0.8em]"
                      style={{
                        backgroundColor: "rgba(var(--base-rgb), 0.03)",
                        border: "1px solid rgba(var(--base-rgb), 0.08)",
                        color: "rgba(var(--base-rgb), 0.7)",
                      }}
                      autoFocus
                    />
                  )}
                  <button
                    onClick={() => saveLocation(selected.id)}
                    className="px-3 py-1.5 rounded-lg text-[0.78em] font-medium transition-colors"
                    style={{ background: "rgba(92,216,92,0.12)", color: "#5cd85c" }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1.5 rounded-lg text-[0.78em] font-medium transition-colors"
                    style={{ color: "rgba(var(--base-rgb), 0.35)" }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className="text-[0.72em] font-medium tracking-[2px] uppercase"
                    style={{ color: "rgba(var(--base-rgb), 0.25)" }}
                  >
                    📍 {selected.ubicacion}
                  </span>
                  <button
                    onClick={() => startEditing(selected)}
                    className="text-[0.75em] px-2 py-1 rounded-lg transition-colors"
                    style={{ color: "rgba(var(--base-rgb), 0.25)" }}
                    title="Editar ubicación"
                  >
                    ✏️
                  </button>
                </>
              )}
              <span
                className="ml-2 text-[0.78em]"
                style={{ color: "rgba(var(--base-rgb), 0.35)" }}
              >
                {formatDate(selected.created_at)}
              </span>
            </div>
            <span
              className="text-[0.78em] font-medium px-3 py-1 rounded-full"
              style={{
                background: "rgba(255,92,92,0.08)",
                color: selected.modo === "retrospectivo" ? "#5cd85c" : "#feca57",
              }}
            >
              {selected.modo === "retrospectivo" ? "✅ Hecho" : "🔜 Planeado"}
            </span>
          </div>
        </div>

        <WodResult result={selected.analisis} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass !py-8 text-center animate-in">
        <div className="text-3xl mb-2">📊</div>
        <h1
          className="text-[1em] font-semibold tracking-[4px] uppercase"
          style={{ color: "rgba(var(--base-rgb), 0.9)" }}
        >
          Historial de <span className="tracking-normal">WODs</span>
        </h1>
        <p
          className="text-[0.82em] mt-1"
          style={{ color: "rgba(var(--base-rgb), 0.35)" }}
        >
          {entries.length} {entries.length === 1 ? "sesión" : "sesiones"}{" "}
          registradas
        </p>
      </div>

      {/* Stats rápidas */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 animate-in animate-in-delay-1">
          <div className="glass-sm text-center">
            <div className="text-2xl font-bold" style={{ color: "#ff5c5c" }}>
              {entries.length}
            </div>
            <div
              className="text-[0.7em] tracking-[1px] uppercase"
              style={{ color: "rgba(var(--base-rgb), 0.25)" }}
            >
              WODs
            </div>
          </div>
          <div className="glass-sm text-center">
            <div className="text-2xl font-bold" style={{ color: "#ff9f43" }}>
              {(
                entries.reduce((s, e) => s + (e.intensidad || 0), 0) /
                entries.length
              ).toFixed(1)}
            </div>
            <div
              className="text-[0.7em] tracking-[1px] uppercase"
              style={{ color: "rgba(var(--base-rgb), 0.25)" }}
            >
              Int. media
            </div>
          </div>
          <div className="glass-sm text-center">
            <div className="text-2xl font-bold" style={{ color: "#feca57" }}>
              {ubicaciones.length}
            </div>
            <div
              className="text-[0.7em] tracking-[1px] uppercase"
              style={{ color: "rgba(var(--base-rgb), 0.25)" }}
            >
              Ubicaciones
            </div>
          </div>
        </div>
      )}

      {/* Filtro ubicación */}
      {ubicaciones.length > 1 && (
        <div className="flex gap-2 flex-wrap animate-in animate-in-delay-2">
          <button
            onClick={() => setFilterUbi("todas")}
            className="glass-sm !py-1.5 !px-4 text-[0.78em] font-medium transition-all"
            style={{
              background:
                filterUbi === "todas"
                  ? "rgba(255,92,92,0.12)"
                  : "rgba(var(--base-rgb), 0.03)",
              color:
                filterUbi === "todas"
                  ? "#ff5c5c"
                  : "rgba(var(--base-rgb), 0.4)",
            }}
          >
            Todas
          </button>
          {ubicaciones.map((u) => (
            <button
              key={u}
              onClick={() => setFilterUbi(u)}
              className="glass-sm !py-1.5 !px-4 text-[0.78em] font-medium transition-all"
              style={{
                background:
                  filterUbi === u
                    ? "rgba(255,92,92,0.12)"
                    : "rgba(var(--base-rgb), 0.03)",
                color:
                  filterUbi === u
                    ? "#ff5c5c"
                    : "rgba(var(--base-rgb), 0.4)",
              }}
            >
              {u}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="glass text-center py-12">
          <div className="flex justify-center gap-2 mb-3">
            <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-rojo" />
            <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-rojo" />
            <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-rojo" />
          </div>
          <span style={{ color: "rgba(var(--base-rgb), 0.35)" }}>Cargando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass text-center py-12">
          <div className="text-3xl mb-3">🏋️</div>
          <p style={{ color: "rgba(var(--base-rgb), 0.4)" }}>
            {entries.length === 0
              ? "Aún no hay WODs registrados. ¡Analiza tu primer WOD!"
              : "No hay WODs en esta ubicación."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <div
              key={entry.id}
              className="glass transition-all cursor-pointer animate-in"
              style={{
                animationDelay: `${Math.min(i * 0.05, 0.4)}s`,
                opacity: 0,
              }}
              onClick={() => setSelected(entry)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <span
                        className="text-[0.72em] font-medium tracking-[1px] uppercase"
                        style={{ color: "rgba(var(--base-rgb), 0.25)" }}
                      >
                        📍
                      </span>
                      <select
                        value={editUbicacion}
                        onChange={(e) => setEditUbicacion(e.target.value)}
                        className="rounded-lg py-1.5 px-3 text-[0.78em] appearance-none cursor-pointer"
                        style={{
                          backgroundColor: "rgba(var(--base-rgb), 0.04)",
                          border: "1px solid rgba(var(--base-rgb), 0.08)",
                          color: "rgba(var(--base-rgb), 0.7)",
                        }}
                      >
                        {UBICACIONES_PREDEFINIDAS.map((u) => (
                          <option key={u} value={u} style={{ background: "var(--surface-2)" }}>{u}</option>
                        ))}
                      </select>
                      {editUbicacion === "Otro" && (
                        <input
                          type="text"
                          value={editUbicacionCustom}
                          onChange={(e) => setEditUbicacionCustom(e.target.value)}
                          placeholder="¿Dónde?"
                          className="rounded-lg py-1.5 px-3 text-[0.78em] max-w-[160px]"
                          style={{
                            backgroundColor: "rgba(var(--base-rgb), 0.03)",
                            border: "1px solid rgba(var(--base-rgb), 0.08)",
                            color: "rgba(var(--base-rgb), 0.7)",
                          }}
                          autoFocus
                        />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); saveLocation(entry.id); }}
                        className="px-2.5 py-1.5 rounded-lg text-[0.75em] font-medium transition-colors"
                        style={{ background: "rgba(92,216,92,0.12)", color: "#5cd85c" }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); cancelEditing(); }}
                        className="px-2.5 py-1.5 rounded-lg text-[0.75em] font-medium transition-colors"
                        style={{ color: "rgba(var(--base-rgb), 0.35)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span
                          className="text-[0.72em] font-medium tracking-[1px] uppercase"
                          style={{ color: "rgba(var(--base-rgb), 0.25)" }}
                        >
                          📍 {entry.ubicacion}
                        </span>
                        <span
                          className="text-[0.72em]"
                          style={{ color: "rgba(var(--base-rgb), 0.2)" }}
                        >
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      <p
                        className="text-[0.88em] font-normal truncate"
                        style={{ color: "rgba(var(--base-rgb), 0.7)" }}
                      >
                        {entry.tipo_wod || entry.wod_text.slice(0, 80)}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {entry.intensidad && (
                    <div
                      className="text-xl font-bold"
                      style={{ color: intensidadColor(entry.intensidad) }}
                    >
                      {entry.intensidad}
                      <span
                        className="text-[0.45em]"
                        style={{ color: "rgba(var(--base-rgb), 0.2)" }}
                      >
                        /10
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(entry);
                    }}
                    className="text-[0.8em] px-2 py-1 rounded-lg transition-colors"
                    style={{ color: "rgba(var(--base-rgb), 0.2)" }}
                    title="Editar ubicación"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    className="text-[0.8em] px-2 py-1 rounded-lg hover:bg-[rgba(255,92,92,0.1)] transition-colors"
                    style={{ color: "rgba(var(--base-rgb), 0.2)" }}
                    title="Eliminar"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

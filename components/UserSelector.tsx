"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";

interface UserSelectorProps {
  selectedUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
}

function formatExperiencia(meses: number): string {
  const years = Math.floor(meses / 12);
  const months = meses % 12;
  if (years === 0) return `${months} mes${months !== 1 ? "es" : ""}`;
  if (months === 0) return `${years} año${years !== 1 ? "s" : ""}`;
  return `${years} año${years !== 1 ? "s" : ""} y ${months} mes${months !== 1 ? "es" : ""}`;
}

export default function UserSelector({ selectedUser, onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [nombre, setNombre] = useState("");
  const [genero, setGenero] = useState<"hombre" | "mujer">("hombre");
  const [edad, setEdad] = useState("");
  const [alturaCm, setAlturaCm] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [expYears, setExpYears] = useState("");
  const [expMonths, setExpMonths] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setUsers(data as UserProfile[]);
      // Auto-select first user if none selected
      if (!selectedUser && data.length > 0) {
        onUserChange(data[0] as UserProfile);
      }
    }
    setLoading(false);
  };

  const handleSelectChange = (userId: string) => {
    if (userId === "__add__") {
      setShowModal(true);
      return;
    }
    const user = users.find((u) => u.id === userId) || null;
    onUserChange(user);
  };

  const resetForm = () => {
    setNombre("");
    setGenero("hombre");
    setEdad("");
    setAlturaCm("");
    setPesoKg("");
    setExpYears("");
    setExpMonths("");
    setFormError("");
  };

  const handleSave = async () => {
    setFormError("");
    if (!nombre.trim()) {
      setFormError("El nombre es obligatorio");
      return;
    }
    const edadNum = parseInt(edad);
    const alturaNum = parseFloat(alturaCm);
    const pesoNum = parseFloat(pesoKg);
    const expTotal = (parseInt(expYears) || 0) * 12 + (parseInt(expMonths) || 0);

    if (!edadNum || edadNum < 10 || edadNum > 100) {
      setFormError("Edad debe estar entre 10 y 100");
      return;
    }
    if (!alturaNum || alturaNum < 100 || alturaNum > 250) {
      setFormError("Altura debe estar entre 100 y 250 cm");
      return;
    }
    if (!pesoNum || pesoNum < 30 || pesoNum > 250) {
      setFormError("Peso debe estar entre 30 y 250 kg");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        nombre: nombre.trim(),
        genero,
        edad: edadNum,
        altura_cm: alturaNum,
        peso_kg: pesoNum,
        experiencia_meses: expTotal,
      })
      .select()
      .single();

    if (error) {
      setFormError("Error al guardar: " + error.message);
      setSaving(false);
      return;
    }

    const newUser = data as UserProfile;
    setUsers((prev) => [...prev, newUser]);
    onUserChange(newUser);
    resetForm();
    setShowModal(false);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="glass-sm !py-3 !px-5 mb-4 animate-in">
        <span className="text-[0.8em]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Cargando perfiles...
        </span>
      </div>
    );
  }

  return (
    <>
      {/* User selector bar */}
      <div className="glass-sm !py-3 !px-5 mb-4 animate-in flex items-center gap-4 flex-wrap">
        <label
          className="text-[0.7em] font-medium tracking-[2px] uppercase shrink-0"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          👤 Atleta
        </label>
        <select
          value={selectedUser?.id || ""}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="flex-1 min-w-[180px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2 px-3 text-[0.85em] text-[rgba(255,255,255,0.7)] appearance-none cursor-pointer"
        >
          {users.length === 0 && (
            <option value="" className="bg-[#14141c]">Sin perfiles</option>
          )}
          {users.map((u) => (
            <option key={u.id} value={u.id} className="bg-[#14141c]">
              {u.nombre}
            </option>
          ))}
          <option value="__add__" className="bg-[#14141c]">
            + Añadir nuevo atleta...
          </option>
        </select>

        {selectedUser && (
          <div
            className="flex items-center gap-3 text-[0.75em] flex-wrap"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <span>{selectedUser.genero === "hombre" ? "♂" : "♀"} {selectedUser.edad} años</span>
            <span>{selectedUser.altura_cm} cm</span>
            <span>{selectedUser.peso_kg} kg</span>
            <span>{formatExperiencia(selectedUser.experiencia_meses)} CF</span>
          </div>
        )}
      </div>

      {/* Modal for adding new user */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div
            className="glass !p-6 w-full max-w-md animate-in"
            style={{ background: "rgba(14,14,20,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <h2
              className="text-[0.95em] font-semibold tracking-[2px] uppercase mb-5 text-center"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Nuevo Atleta
            </h2>

            <div className="space-y-3">
              {/* Nombre */}
              <div>
                <label className="block text-[0.7em] font-medium tracking-[1px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Alexis"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-4 text-[0.85em] text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.2)]"
                />
              </div>

              {/* Género */}
              <div>
                <label className="block text-[0.7em] font-medium tracking-[1px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Género
                </label>
                <div className="flex rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden bg-[rgba(255,255,255,0.03)]">
                  {(["hombre", "mujer"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenero(g)}
                      className="flex-1 py-2.5 text-[0.8em] font-medium transition-all"
                      style={{
                        background: genero === g ? "rgba(255,92,92,0.12)" : "transparent",
                        color: genero === g ? "#ff5c5c" : "rgba(255,255,255,0.35)",
                      }}
                    >
                      {g === "hombre" ? "♂ Hombre" : "♀ Mujer"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edad + Altura + Peso */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[0.7em] font-medium tracking-[1px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Edad
                  </label>
                  <input
                    type="number"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    placeholder="41"
                    min="10"
                    max="100"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-[0.85em] text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.2)] text-center"
                  />
                </div>
                <div>
                  <label className="block text-[0.7em] font-medium tracking-[1px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={alturaCm}
                    onChange={(e) => setAlturaCm(e.target.value)}
                    placeholder="168"
                    min="100"
                    max="250"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-[0.85em] text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.2)] text-center"
                  />
                </div>
                <div>
                  <label className="block text-[0.7em] font-medium tracking-[1px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={pesoKg}
                    onChange={(e) => setPesoKg(e.target.value)}
                    placeholder="64"
                    min="30"
                    max="250"
                    step="0.1"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-[0.85em] text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.2)] text-center"
                  />
                </div>
              </div>

              {/* Experiencia CrossFit */}
              <div>
                <label className="block text-[0.7em] font-medium tracking-[1px] uppercase mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Experiencia en CrossFit
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={expYears}
                      onChange={(e) => setExpYears(e.target.value)}
                      placeholder="1"
                      min="0"
                      max="30"
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-[0.85em] text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.2)] text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.7em]" style={{ color: "rgba(255,255,255,0.25)" }}>años</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={expMonths}
                      onChange={(e) => setExpMonths(e.target.value)}
                      placeholder="4"
                      min="0"
                      max="11"
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 px-3 text-[0.85em] text-[rgba(255,255,255,0.8)] placeholder:text-[rgba(255,255,255,0.2)] text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.7em]" style={{ color: "rgba(255,255,255,0.25)" }}>meses</span>
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <p className="mt-3 text-sem-rojo text-[0.8em]">{formError}</p>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 py-2.5 rounded-xl text-[0.82em] font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-[0.82em] font-semibold transition-all disabled:opacity-30"
                style={{
                  background: "linear-gradient(135deg, rgba(255,92,92,0.18), rgba(255,92,92,0.08))",
                  color: "#ff5c5c",
                  border: "1px solid rgba(255,92,92,0.15)",
                }}
              >
                {saving ? "Guardando..." : "Guardar Atleta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

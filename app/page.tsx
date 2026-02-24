"use client";

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { WodAnalisis, UserProfile, WodComparison as WodComparisonType, WodHistoryEntry, UBICACIONES_PREDEFINIDAS } from "@/lib/types";
import WodResult from "@/components/WodResult";
import WodChat from "@/components/WodChat";
import WodComparison from "@/components/WodComparison";
import UserSelector from "@/components/UserSelector";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [wodText, setWodText] = useState("");
  const [nombreWod, setNombreWod] = useState("");
  const [modo, setModo] = useState<"retrospectivo" | "prospectivo">("retrospectivo");
  const [ubicacion, setUbicacion] = useState("The Island Box");
  const [ubicacionCustom, setUbicacionCustom] = useState("");
  const [imageData, setImageData] = useState<{ base64: string; mediaType: string } | null>(null);
  const [imageName, setImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WodAnalisis | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [comparison, setComparison] = useState<WodComparisonType | null>(null);
  const [comparing, setComparing] = useState(false);
  const [ayerEntry, setAyerEntry] = useState<WodHistoryEntry | null>(null);
  const [noAyer, setNoAyer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = useCallback((file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImageData({ base64, mediaType: file.type });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file) handleImage(file);
    },
    [handleImage]
  );

  const analyze = async () => {
    if (!wodText.trim() && !imageData) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    setComparison(null);
    setAyerEntry(null);
    setNoAyer(false);

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wodText: wodText.trim(),
          modo,
          imageBase64: imageData?.base64 || null,
          imageMediaType: imageData?.mediaType || null,
          userProfile: selectedUser
            ? {
                nombre: selectedUser.nombre,
                genero: selectedUser.genero,
                edad: selectedUser.edad,
                altura_cm: selectedUser.altura_cm,
                peso_kg: selectedUser.peso_kg,
                experiencia_meses: selectedUser.experiencia_meses,
              }
            : null,
        }),
      });

      if (!resp.ok) throw new Error("Error en el análisis");

      const data: WodAnalisis = await resp.json();
      setResult(data);

      // Guardar en Supabase
      const ubi = ubicacion === "Otro" ? ubicacionCustom || "Otro" : ubicacion;
      const { error: dbError } = await supabase.from("wod_history").insert({
        nombre_wod: nombreWod.trim() || null,
        wod_text: wodText.trim() || "[Imagen de pizarra]",
        ubicacion: ubi,
        modo,
        analisis: data,
        tipo_wod: data.tipo_wod,
        intensidad: data.intensidad,
      });

      if (dbError) {
        console.error("Error saving:", dbError);
      } else {
        setSaved(true);
      }
    } catch (err: any) {
      setError("Error al analizar el WOD. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const compareWithYesterday = async () => {
    if (!result) return;
    setComparing(true);
    setComparison(null);
    setNoAyer(false);

    try {
      const now = new Date();
      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const { data, error: dbError } = await supabase
        .from("wod_history")
        .select("*")
        .gte("created_at", yesterdayStart.toISOString())
        .lte("created_at", yesterdayEnd.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        setNoAyer(true);
        return;
      }

      const ayer = data[0] as WodHistoryEntry;
      setAyerEntry(ayer);

      const resp = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analisisHoy: result,
          analisisAyer: ayer.analisis,
        }),
      });

      if (!resp.ok) throw new Error("Error en la comparación");

      const compData: WodComparisonType = await resp.json();
      setComparison(compData);
    } catch (err: any) {
      console.error("Compare error:", err);
      setError("Error al comparar con el WOD de ayer.");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* USER SELECTOR */}
      <UserSelector selectedUser={selectedUser} onUserChange={setSelectedUser} />

      {/* INPUT */}
      <div className="glass !p-8 animate-in">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏋️</div>
          <h1
            className="text-[1.1em] font-semibold tracking-[4px] uppercase"
            style={{ color: "rgba(var(--base-rgb), 0.9)" }}
          >
            Análisis de <span className="tracking-normal">WOD</span>
          </h1>
          <p
            className="text-[0.82em] mt-1"
            style={{ color: "rgba(var(--base-rgb), 0.35)" }}
          >
            Escribe el WOD o sube una foto de la pizarra
          </p>
        </div>

        {/* Textarea */}
        <textarea
          value={wodText}
          onChange={(e) => setWodText(e.target.value)}
          placeholder="Describe el WOD aquí... ej: 5 rounds de 10 thrusters @ 40kg + 15 pull-ups"
          className="w-full min-h-[120px] rounded-xl p-4 text-[0.9em] font-light resize-y leading-relaxed"
          style={{
            backgroundColor: "rgba(var(--base-rgb), 0.03)",
            border: "1px solid rgba(var(--base-rgb), 0.08)",
            color: "rgba(var(--base-rgb), 0.85)",
          }}
        />

        {/* Image drop */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 p-4 rounded-xl border border-dashed text-center cursor-pointer text-[0.82em] transition-colors"
          style={{
            borderColor: "rgba(var(--base-rgb), 0.1)",
            background: imageData ? "rgba(92,216,92,0.04)" : "transparent",
            color: "rgba(var(--base-rgb), 0.35)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
          />
          {imageData ? (
            <span className="text-sem-verde">
              📷 {imageName}{" "}
              <span className="opacity-60">— clic para cambiar</span>
            </span>
          ) : (
            "📷 Arrastra una foto de la pizarra aquí o haz clic para subir"
          )}
        </div>

        {/* Nombre del WOD */}
        <div className="mt-4">
          <label
            className="block text-[0.7em] font-medium tracking-[2px] uppercase mb-2"
            style={{ color: "rgba(var(--base-rgb), 0.25)" }}
          >
            🏷 Nombre del WOD (opcional)
          </label>
          <input
            type="text"
            value={nombreWod}
            onChange={(e) => setNombreWod(e.target.value)}
            placeholder='Ej: "Fran", "Murph", "Lunes de piernas"...'
            className="w-full rounded-xl py-2.5 px-4 text-[0.85em]"
            style={{
              backgroundColor: "rgba(var(--base-rgb), 0.03)",
              border: "1px solid rgba(var(--base-rgb), 0.08)",
              color: "rgba(var(--base-rgb), 0.85)",
            }}
          />
        </div>

        {/* Ubicación + Modo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Ubicación */}
          <div>
            <label
              className="block text-[0.7em] font-medium tracking-[2px] uppercase mb-2"
              style={{ color: "rgba(var(--base-rgb), 0.25)" }}
            >
              📍 Ubicación
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {UBICACIONES_PREDEFINIDAS.filter((u) => u !== "Otro").map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => { setUbicacion(u); setUbicacionCustom(""); }}
                  className="py-1.5 px-3 rounded-lg text-[0.75em] font-medium transition-all border"
                  style={{
                    background: ubicacion === u ? "rgba(255,92,92,0.12)" : "rgba(var(--base-rgb), 0.03)",
                    color: ubicacion === u ? "#ff5c5c" : "rgba(var(--base-rgb), 0.4)",
                    borderColor: ubicacion === u ? "rgba(255,92,92,0.2)" : "rgba(var(--base-rgb), 0.06)",
                  }}
                >
                  {u}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUbicacion("Otro")}
                className="py-1.5 px-3 rounded-lg text-[0.75em] font-medium transition-all border"
                style={{
                  background: ubicacion === "Otro" ? "rgba(254,202,87,0.12)" : "rgba(var(--base-rgb), 0.03)",
                  color: ubicacion === "Otro" ? "#feca57" : "rgba(var(--base-rgb), 0.4)",
                  borderColor: ubicacion === "Otro" ? "rgba(254,202,87,0.2)" : "rgba(var(--base-rgb), 0.06)",
                }}
              >
                ✍️ Campo libre
              </button>
            </div>
            {ubicacion === "Otro" && (
              <input
                type="text"
                value={ubicacionCustom}
                onChange={(e) => setUbicacionCustom(e.target.value)}
                placeholder="Escribe la ubicación..."
                className="w-full rounded-xl py-2 px-4 text-[0.85em]"
                style={{
                  backgroundColor: "rgba(var(--base-rgb), 0.03)",
                  border: "1px solid rgba(var(--base-rgb), 0.08)",
                  color: "rgba(var(--base-rgb), 0.7)",
                }}
                autoFocus
              />
            )}
          </div>

          {/* Modo */}
          <div>
            <label
              className="block text-[0.7em] font-medium tracking-[2px] uppercase mb-2"
              style={{ color: "rgba(var(--base-rgb), 0.25)" }}
            >
              ⏱ Modo
            </label>
            <div
              className="flex rounded-xl overflow-hidden"
              style={{
                border: "1px solid rgba(var(--base-rgb), 0.06)",
                background: "rgba(var(--base-rgb), 0.03)",
              }}
            >
              {(["retrospectivo", "prospectivo"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModo(m)}
                  className="flex-1 py-2.5 text-[0.8em] font-medium transition-all"
                  style={{
                    background:
                      modo === m ? "rgba(255,92,92,0.12)" : "transparent",
                    color:
                      modo === m ? "#ff5c5c" : "rgba(var(--base-rgb), 0.35)",
                  }}
                >
                  {m === "retrospectivo" ? "✅ Ya hecho" : "🔜 Por hacer"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botón analizar */}
        <button
          onClick={analyze}
          disabled={loading || (!wodText.trim() && !imageData)}
          className="w-full mt-5 py-3.5 rounded-xl font-semibold text-[0.88em] tracking-[1px] uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: loading
              ? "rgba(var(--base-rgb), 0.04)"
              : "linear-gradient(135deg, rgba(255,92,92,0.18), rgba(255,92,92,0.08))",
            color: loading ? "rgba(var(--base-rgb), 0.3)" : "#ff5c5c",
            border: "1px solid rgba(255,92,92,0.15)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-rojo" />
              <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-rojo" />
              <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-rojo" />
              <span className="ml-2">Analizando...</span>
            </span>
          ) : (
            "Analizar WOD"
          )}
        </button>

        {error && (
          <p className="mt-3 text-sem-rojo text-[0.85em]">{error}</p>
        )}
        {saved && (
          <p className="mt-3 text-sem-verde text-[0.82em] text-center opacity-70">
            ✓ Guardado en historial
          </p>
        )}
      </div>

      {/* RESULT */}
      {result && <WodResult result={result} />}

      {/* COMPARE WITH YESTERDAY */}
      {result && !comparison && (
        <div className="animate-in animate-in-delay-8">
          <button
            onClick={compareWithYesterday}
            disabled={comparing}
            className="w-full py-3.5 rounded-xl font-semibold text-[0.88em] tracking-[1px] uppercase transition-all compare-btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {comparing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-amarillo" />
                <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-amarillo" />
                <span className="loader-dot inline-block w-2 h-2 rounded-full bg-sem-amarillo" />
                <span className="ml-2">Comparando...</span>
              </span>
            ) : (
              "🔄 Comparar con el WOD de ayer"
            )}
          </button>
          {noAyer && (
            <p className="mt-3 text-sem-amarillo text-[0.82em] text-center opacity-70">
              No se encontró ningún WOD registrado ayer. Necesitas tener un WOD guardado del día anterior.
            </p>
          )}
        </div>
      )}

      {/* COMPARISON RESULT */}
      {comparison && ayerEntry && (
        <WodComparison
          comparison={comparison}
          ayerWodText={ayerEntry.analisis?.wod_transcrito || ayerEntry.wod_text}
          ayerUbicacion={ayerEntry.ubicacion}
        />
      )}

      {/* CHAT */}
      {result && <WodChat wodAnalisis={result} userProfile={selectedUser} />}
    </div>
  );
}

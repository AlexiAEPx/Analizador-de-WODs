export type SemaforoColor = "rojo" | "naranja" | "amarillo" | "verde";

export interface PatronMovimiento {
  nombre: string;
  pct: number;
  color: SemaforoColor;
}

export interface Musculo {
  nombre: string;
  color: SemaforoColor;
  nivel: number;
}

export interface Habilidad {
  nombre: string;
  color: SemaforoColor;
  nivel: number;
}

export interface Gap {
  titulo: string;
  descripcion: string;
}

export interface WodAnalisis {
  wod_transcrito: string;
  tipo_wod: string;
  intensidad: number;
  enfoque: "retrospectivo" | "prospectivo";
  patrones: PatronMovimiento[];
  musculos: {
    tren_inferior: Musculo[];
    core: Musculo[];
    tren_superior: Musculo[];
  };
  habilidades: Habilidad[];
  gaps: Gap[];
  tip: string;
  analisis: string;
}

export interface WodHistoryEntry {
  id: string;
  created_at: string;
  wod_text: string;
  ubicacion: string;
  modo: "retrospectivo" | "prospectivo";
  analisis: WodAnalisis;
  tipo_wod: string | null;
  intensidad: number | null;
  imagen_url: string | null;
}

export const COLOR_MAP: Record<SemaforoColor, { text: string; fill: string }> = {
  rojo: { text: "#ff5c5c", fill: "linear-gradient(90deg, #ff5c5c, #e84343)" },
  naranja: { text: "#ff9f43", fill: "linear-gradient(90deg, #ff9f43, #e08530)" },
  amarillo: { text: "#feca57", fill: "linear-gradient(90deg, #feca57, #dba940)" },
  verde: { text: "#5cd85c", fill: "linear-gradient(90deg, #5cd85c, #44b344)" },
};

export const UBICACIONES_PREDEFINIDAS = [
  "The Island Box",
  "Enjoy",
  "Blue Gorilla",
  "Hospital de la Línea",
  "Sótano de Casa",
  "Otro",
];

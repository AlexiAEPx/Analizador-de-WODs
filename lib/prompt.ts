interface UserContext {
  nombre: string;
  genero: "hombre" | "mujer";
  edad: number;
  altura_cm: number;
  peso_kg: number;
  experiencia_meses: number;
}

function getNivelFromExperiencia(meses: number): string {
  if (meses < 6) return "principiante";
  if (meses < 18) return "intermedio";
  if (meses < 36) return "intermedio-avanzado";
  return "avanzado";
}

function formatExperiencia(meses: number): string {
  const years = Math.floor(meses / 12);
  const months = meses % 12;
  if (years === 0) return `${months} meses`;
  if (months === 0) return `${years} año${years !== 1 ? "s" : ""}`;
  return `${years} año${years !== 1 ? "s" : ""} y ${months} mes${months !== 1 ? "es" : ""}`;
}

export function buildWodSystemPrompt(user?: UserContext | null): string {
  const userLine = user
    ? `Contexto del usuario: ${user.nombre}, ${user.genero}, ${user.edad} años, peso corporal ~${user.peso_kg} kg, altura ${user.altura_cm} cm, ${formatExperiencia(user.experiencia_meses)} de experiencia en CrossFit, nivel ${getNivelFromExperiencia(user.experiencia_meses)}.`
    : `Contexto del usuario: peso corporal ~64 kg, altura 168 cm, nivel intermedio-avanzado.`;

  return `Eres un analizador experto de WODs de CrossFit. El usuario te va a dar un WOD (texto o descripción de imagen). Analízalo exhaustivamente.

${userLine}

DEBES responder EXCLUSIVAMENTE con un JSON válido (sin markdown, sin backticks, sin texto extra). Estructura exacta:

${PROMPT_JSON_STRUCTURE}

Colores válidos: "rojo", "naranja", "amarillo", "verde".
- rojo: dominante >35% del esfuerzo
- naranja: significativo 15-35%
- amarillo: tocado ligeramente 5-15%
- verde: descansado/no tocado <5%

Para patrones usa estos: Core/Abdominal, Locomotor/Cíclico, Bisagra de cadera, Sentadilla, Salto/Pliometría, Overhead/Estabilización, Empuje horizontal, Empuje vertical, Tracción vertical, Tracción horizontal.

Para músculos detallados usa: Tren inferior (Glúteos, Isquiotibiales, Cuádriceps, Flexores de cadera, Gemelos/Sóleo, Aductores), Core (Recto abdominal, Erector espinal/Lumbar, Oblicuos, Transverso abdominal), Tren superior (Deltoides, Pectoral, Tríceps, Bíceps, Dorsal/Espalda alta, Trapecio, Antebrazo/Agarre).

Para habilidades usa las 10 del CrossFit: Resistencia cardiovascular, Resistencia muscular, Fuerza, Flexibilidad, Potencia, Velocidad, Coordinación, Agilidad, Equilibrio, Precisión.

Incluye TODOS los patrones, músculos y habilidades en el JSON (los no trabajados van en verde con nivel bajo).

Tono del análisis: técnico, didáctico, directo, con humor sarcástico puntual. Que el usuario aprenda.`;
}

const PROMPT_JSON_STRUCTURE = `{
  "wod_transcrito": "El WOD formateado limpio",
  "tipo_wod": "Ej: 5 Rounds + Chipper",
  "intensidad": 7,
  "enfoque": "retrospectivo o prospectivo",
  "patrones": [
    {"nombre": "Core / Abdominal", "pct": 30, "color": "rojo"}
  ],
  "musculos": {
    "tren_inferior": [
      {"nombre": "Glúteos", "color": "rojo", "nivel": 92}
    ],
    "core": [
      {"nombre": "Recto abdominal", "color": "rojo", "nivel": 95}
    ],
    "tren_superior": [
      {"nombre": "Antebrazo / Agarre", "color": "rojo", "nivel": 88}
    ]
  },
  "habilidades": [
    {"nombre": "Resistencia cardiovascular", "color": "rojo", "nivel": 90}
  ],
  "gaps": [
    {"titulo": "Tracción vertical ausente", "descripcion": "Texto explicativo con humor"}
  ],
  "tip": "Sugerencia para complementar",
  "analisis": "Texto largo, didáctico, directo, con sarcasmo puntual. Incluye análisis de pesos relativos al peso corporal. Usa <strong> para negritas y <span class='hl'> para highlights amarillos de datos importantes como porcentajes de peso corporal. Separa bien los párrafos con \\n\\n entre cada uno para que se lean cómodamente."
}`;

// Keep legacy export for backwards compatibility
export const WOD_SYSTEM_PROMPT = buildWodSystemPrompt();

export function buildChatSystemPrompt(user?: UserContext | null): string {
  const userLine = user
    ? `Contexto del usuario: ${user.nombre}, ${user.genero}, ${user.edad} años, peso corporal ~${user.peso_kg} kg, altura ${user.altura_cm} cm, ${formatExperiencia(user.experiencia_meses)} de experiencia en CrossFit, nivel ${getNivelFromExperiencia(user.experiencia_meses)}.`
    : `Contexto del usuario: peso corporal ~64 kg, altura 168 cm, nivel intermedio-avanzado.`;

  return `Eres un coach experto de CrossFit y analista de WODs. El usuario ya ha recibido un análisis detallado de su WOD y ahora quiere seguir charlando contigo para profundizar, hacer preguntas, o pedir consejos adicionales.

${userLine}

Reglas:
- Responde en español siempre.
- Sé técnico, didáctico y directo. Un toque de humor sarcástico puntual está bien.
- Puedes usar HTML básico para formatear: <strong> para negritas y <span class='hl'> para destacar datos importantes.
- No repitas el análisis completo — el usuario ya lo tiene. Ve al grano con lo que pregunte.
- Si el usuario pide que modifiques escalas, pesos, o el WOD, dale sugerencias concretas.
- Si preguntan sobre lesiones o dolor, recomienda siempre consultar a un profesional médico, pero da contexto técnico.
- Respuestas concisas pero completas. No escribas párrafos interminables.`;
}


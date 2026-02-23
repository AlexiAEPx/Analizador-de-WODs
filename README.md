# WOD Analyzer 🏋️

Análisis exhaustivo de WODs de CrossFit con sistema semáforo visual. Patrones de movimiento, músculos, habilidades físicas, gaps y análisis detallado.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (base de datos + historial)
- **Claude API** (análisis del WOD)
- **Tailwind CSS** (estilos glassmorphism)
- **Vercel** (deploy)

## Setup

### 1. Clonar y dependencias

```bash
git clone https://github.com/TU_USUARIO/wod-analyzer.git
cd wod-analyzer
npm install
```

### 2. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase-schema.sql`
3. Copia la URL y Anon Key desde **Settings > API**

### 3. Variables de entorno

Crea `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Desarrollo local

```bash
npm run dev
```

### 5. Deploy en Vercel

1. Push a GitHub
2. Importa el repo en [vercel.com](https://vercel.com)
3. Añade las 3 variables de entorno en Settings > Environment Variables
4. Deploy

## Funcionalidades

- **Analizar WOD**: texto o foto de pizarra
- **Selector de ubicación**: The Island Box, Casa, Gimnasio, etc.
- **Modo**: retrospectivo (ya hecho) / prospectivo (por hacer)
- **Historial**: todas las sesiones guardadas con filtro por ubicación
- **Estadísticas**: total WODs, intensidad media, ubicaciones
- **Análisis visual**: semáforo de colores (rojo/naranja/amarillo/verde)

-- ==============================================
-- WOD Analyzer — Supabase Schema
-- Ejecutar en Supabase SQL Editor
-- ==============================================

-- Tabla de perfiles de usuario
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  nombre TEXT NOT NULL,
  genero TEXT NOT NULL CHECK (genero IN ('hombre', 'mujer')),
  edad INTEGER NOT NULL CHECK (edad BETWEEN 10 AND 100),
  altura_cm NUMERIC(5,1) NOT NULL CHECK (altura_cm BETWEEN 100 AND 250),
  peso_kg NUMERIC(5,1) NOT NULL CHECK (peso_kg BETWEEN 30 AND 250),
  experiencia_meses INTEGER NOT NULL DEFAULT 0 CHECK (experiencia_meses >= 0)
);

-- RLS: acceso público (app personal, sin auth)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on user_profiles" ON user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tabla principal de historial de WODs
CREATE TABLE wod_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Input
  wod_text TEXT NOT NULL,
  ubicacion TEXT NOT NULL DEFAULT 'Sin especificar',
  modo TEXT NOT NULL DEFAULT 'retrospectivo' CHECK (modo IN ('retrospectivo', 'prospectivo')),
  
  -- Resultado del análisis (JSON completo)
  analisis JSONB NOT NULL,
  
  -- Campos desnormalizados para consultas rápidas
  tipo_wod TEXT,
  intensidad INTEGER CHECK (intensidad BETWEEN 1 AND 10),
  
  -- Imagen (URL si se sube a storage)
  imagen_url TEXT
);

-- Índices
CREATE INDEX idx_wod_history_created_at ON wod_history (created_at DESC);
CREATE INDEX idx_wod_history_ubicacion ON wod_history (ubicacion);
CREATE INDEX idx_wod_history_intensidad ON wod_history (intensidad);

-- RLS: acceso público (app personal, sin auth)
ALTER TABLE wod_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON wod_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Vista para estadísticas rápidas
CREATE VIEW wod_stats AS
SELECT
  ubicacion,
  COUNT(*) as total_wods,
  ROUND(AVG(intensidad), 1) as intensidad_media,
  MAX(created_at) as ultimo_wod
FROM wod_history
GROUP BY ubicacion
ORDER BY total_wods DESC;

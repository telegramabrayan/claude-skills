-- Ingenia · esquema PostgreSQL (compatible con Supabase)
--
-- Hoy el progreso vive en localStorage (src/lib/storage.ts). Este esquema es
-- el destino previsto: cada sección de ProgressState (src/engine/progress/state.ts)
-- es una tabla. Para migrar, implementar un ProgressRepository que lea/escriba
-- estas tablas y reemplazar `repository` en src/lib/storage.ts.
--
-- El CONTENIDO (materias, lecciones, ejercicios) hoy vive en src/content/*.ts.
-- Las tablas content_* permiten moverlo a la base para un futuro panel
-- administrador sin cambiar los tipos (src/engine/types.ts).

create extension if not exists "pgcrypto";

-- ───────────── Estudiantes ─────────────
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,               -- auth.users.id en Supabase
  name text not null default '',
  goal text check (goal in ('industrial', 'informatica', 'ambas')),
  start_mode text check (start_mode in ('diagnostico', 'cero')),
  onboarded boolean not null default false,
  xp integer not null default 0,
  streak_current integer not null default 0,
  streak_longest integer not null default 0,
  streak_last_day date,
  challenges_won integer not null default 0,
  settings jsonb not null default '{"theme":"system","hearts":true,"dailyMinutes":15}',
  route text[] not null default '{}',      -- ids de lecciones en orden
  unlocked text[] not null default '{}',   -- unidades desbloqueadas a mano o por diagnóstico
  created_at timestamptz not null default now()
);

create table if not exists study_days (
  student_id uuid references students(id) on delete cascade,
  day date not null,
  xp integer not null default 0,
  seconds integer not null default 0,
  exercises integer not null default 0,
  correct integer not null default 0,
  lessons integer not null default 0,
  primary key (student_id, day)
);

create table if not exists lesson_progress (
  student_id uuid references students(id) on delete cascade,
  lesson_id text not null,
  status text not null check (status in ('en-curso', 'completada')),
  card integer not null default 0,
  completed_at timestamptz,
  primary key (student_id, lesson_id)
);

create table if not exists unit_completions (
  student_id uuid references students(id) on delete cascade,
  unit_id text not null,
  completed_on date not null,
  primary key (student_id, unit_id)
);

-- Dominio, dificultad adaptativa y repetición espaciada por tema.
create table if not exists topic_state (
  student_id uuid references students(id) on delete cascade,
  topic_id text not null,
  mastery real not null default 0 check (mastery between 0 and 1),
  attempts integer not null default 0,
  correct integer not null default 0,
  level smallint not null default 2 check (level between 1 and 6),
  streak smallint not null default 0,
  wrong_streak smallint not null default 0,
  last_seen date,
  box smallint not null default 0,
  due date,
  primary key (student_id, topic_id)
);

-- Cada intento (base del historial de errores y de las estadísticas).
create table if not exists attempts (
  id bigserial primary key,
  student_id uuid references students(id) on delete cascade,
  ts timestamptz not null default now(),
  exercise_id text not null,   -- "generador:semilla:dificultad" permite regenerar el ejercicio exacto
  topic_id text not null,
  correct boolean not null,
  error_type text,
  hints smallint not null default 0,
  used_solution boolean not null default false,
  difficulty smallint not null,
  mode text not null
);
create index if not exists attempts_student_ts on attempts (student_id, ts desc);
create index if not exists attempts_errors on attempts (student_id, error_type) where not correct;

create table if not exists diagnostics (
  student_id uuid primary key references students(id) on delete cascade,
  completed_at timestamptz not null,
  skills jsonb not null                -- { "aritmetica": 0.83, ... }
);

create table if not exists exams (
  id text primary key,
  student_id uuid references students(id) on delete cascade,
  title text not null,
  ts timestamptz not null,
  score real not null,
  correct integer not null,
  total integer not null,
  seconds integer not null,
  by_topic jsonb not null,
  errors jsonb not null
);

create table if not exists achievements (
  student_id uuid references students(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (student_id, achievement_id)
);

create table if not exists missions_claimed (
  student_id uuid references students(id) on delete cascade,
  mission_key text not null,           -- "d:2026-10-04:ejercicios-5", "w:2026-09-28:dias-4", ...
  claimed_on date not null,
  primary key (student_id, mission_key)
);

-- ───────────── Contenido (para el futuro panel administrador) ─────────────
create table if not exists content_subjects (
  id text primary key,
  data jsonb not null,                 -- forma de Subject (src/engine/types.ts)
  verification_status text not null check (verification_status in ('verificado', 'parcial', 'pendiente')),
  updated_at timestamptz not null default now()
);

create table if not exists content_lessons (
  id text primary key,
  subject_id text references content_subjects(id),
  data jsonb not null,                 -- forma de Lesson
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists content_formulas (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seguridad en Supabase: cada estudiante solo ve lo suyo.
alter table students enable row level security;
create policy "propio perfil" on students for all using (auth_user_id = auth.uid());
-- Repetir el patrón para las tablas con student_id, por ejemplo:
alter table attempts enable row level security;
create policy "propios intentos" on attempts for all
  using (student_id in (select id from students where auth_user_id = auth.uid()));

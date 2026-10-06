/* Data3.jsx — datos de ejemplo para el prototipo. Textos de datos (comidas, etiquetas de fecha, tipos de serie) viven aquí. */

const MES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIA3 = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const cap3 = s => s.charAt(0).toUpperCase() + s.slice(1);
const dAgo = (n) => { const t = new Date(); t.setHours(12, 0, 0, 0); t.setDate(t.getDate() - n); return t; };
/* «12 sep» */
const fCorta = (n) => { const t = dAgo(n); return `${t.getDate()} ${MES3[t.getMonth()]}`; };
/* «Lunes 8 sep» */
const fLarga = (n) => { const t = dAgo(n); return `${cap3(DIA3[t.getDay()])} ${t.getDate()} ${MES3[t.getMonth()]}`; };
/* «Hoy, lunes 8 sep» / «Ayer, domingo 7 sep» / «Lunes 1 sep» */
const fDia = (n) => { const t = dAgo(n); const base = `${DIA3[t.getDay()]} ${t.getDate()} ${MES3[t.getMonth()]}`; return n === 0 ? `${window.D3.labels.hoy}, ${base}` : n === 1 ? `${window.D3.labels.ayer}, ${base}` : cap3(base); };
/* «Lunes 8 de septiembre» */
const fLargaMes = (n) => cap3(dAgo(n).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));

const R = (name, meta, last, exercises) => ({ name, meta, last, exercises });

/* ---- tipos de registro de serie ---- */
const LOG_MODES = [
  { k: 'peso_reps', lb: 'Peso y repeticiones', d: 'Lo normal: la carga y las repeticiones', cols: ['kg', 'r'] },
  { k: 'peso_tiempo', lb: 'Peso y tiempo', d: 'Isométricos y estiramientos; el peso es opcional', cols: ['kg', 't'] },
  { k: 'tiempo_distancia', lb: 'Tiempo y distancia', d: 'Cardio de máquina y carrera', cols: ['t', 'km'] },
  { k: 'reps', lb: 'Solo repeticiones', d: 'Sin carga: cuenta las repeticiones', cols: ['r'] },
  { k: 'tiempo', lb: 'Solo tiempo', d: 'Plancha, isométricos', cols: ['t'] },
  { k: 'tiempo_reps', lb: 'Tiempo y repeticiones', d: 'Rellena el que uses: un minuto o diez repeticiones', cols: ['t', 'r'] },
];
const COL_LB = { kg: 'KG', r: 'REPS', t: 'TIEMPO', km: 'KM' };
const has = (v) => v !== '' && v != null && +v !== 0;
const mmssS = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.round(s) % 60)).padStart(2, '0')}`;
const kmS = (v) => (+v).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const kgS = (v) => (Math.round(+v * 10) / 10).toLocaleString('es-ES');
/* «sin datos» en una fila: ninguna de sus dos columnas tiene valor */
const isEmpty = (s, mode) => !s || !(LOG_MODES.find(m => m.k === mode) || LOG_MODES[0]).cols.some(c => has(s[c]));
/* lectura larga: «80 kg × 8» · «1:00 con 10 kg» · «22:30 · 4,1 km» · «1:00 · 18 reps» */
const fmtSerie = (s, mode = 'peso_reps') => {
  if (!s) return '—';
  if (mode === 'peso_tiempo') return has(s.t) ? (has(s.kg) ? `${mmssS(s.t)} con ${kgS(s.kg)} kg` : mmssS(s.t)) : (has(s.kg) ? `${kgS(s.kg)} kg` : '—');
  if (mode === 'tiempo_distancia') return [has(s.t) ? mmssS(s.t) : null, has(s.km) ? `${kmS(s.km)} km` : null].filter(Boolean).join(' · ') || '—';
  if (mode === 'reps') return has(s.r) ? `${s.r} reps` : '—';
  if (mode === 'tiempo') return has(s.t) ? mmssS(s.t) : '—';
  if (mode === 'tiempo_reps') return [has(s.t) ? mmssS(s.t) : null, has(s.r) ? `${s.r} reps` : null].filter(Boolean).join(' · ') || '—';
  return has(s.kg) ? `${kgS(s.kg)} kg × ${s.r}` : has(s.r) ? `${s.r} reps` : '—';
};
/* lectura corta para la columna ANTERIOR: «80 × 8» · «1:00» · «20:00 · 3,8 km» · «10 reps» */
const fmtPrev = (s, mode = 'peso_reps') => {
  if (!s || isEmpty(s, mode)) return '—';
  if (mode === 'peso_reps') return has(s.kg) ? `${kgS(s.kg)} × ${s.r}` : `— × ${s.r}`;
  if (mode === 'peso_tiempo') return has(s.kg) ? `${mmssS(s.t)} · ${kgS(s.kg)} kg` : mmssS(s.t);
  return fmtSerie(s, mode);
};
const setVol = (s, mode = 'peso_reps') => mode === 'peso_reps' ? (+s.kg || 0) * (+s.r || 0) : 0;
const setKm = (s, mode = 'peso_reps') => mode === 'tiempo_distancia' ? (+s.km || 0) : 0;
/* «330» o «3:30» → 210 s: los dos últimos dígitos son segundos */
const parseT = (str) => { const d = String(str).replace(/\D/g, ''); if (!d) return ''; const n = d.slice(-6); const sec = +n.slice(-2), min = +(n.slice(0, -2) || 0); return min * 60 + sec; };
window.SERIE = { modes: LOG_MODES, colLb: COL_LB, has, mmss: mmssS, km: kmS, kg: kgS, isEmpty, fmt: fmtSerie, prev: fmtPrev, vol: setVol, dist: setKm, parseT, modeOf: (k) => LOG_MODES.find(m => m.k === k) || LOG_MODES[0] };

const routines = [
  /* rutina de muestra: un ejercicio por tipo de registro. prev[0] = null para que la 1.ª fila salga sin referencia. */
  R('Mixto · Fuerza y cardio', '4 ejercicios · 16 series', fCorta(3), [
    { name: 'Press banca con barra', mode: 'peso_reps', sets: 4, demo: true, prev: [null, { kg: 80, r: 8 }, { kg: 80, r: 8 }, { kg: 80, r: 8 }], today: [{}, {}, { kg: 82.5, r: 8 }, { kg: 82.5, r: 8 }] },
    { name: 'Plancha', mode: 'peso_tiempo', sets: 4, demo: true, prev: [null, { kg: 0, t: 60 }, { kg: 0, t: 60 }, { kg: 0, t: 60 }], today: [{}, {}, { kg: '', t: 60 }, { kg: 10, t: 45 }] },
    { name: 'Carrera suave', mode: 'tiempo_distancia', sets: 4, demo: true, prev: [null, { t: 1200, km: 3.8 }, { t: 1200, km: 3.8 }, { t: 1200, km: 3.8 }], today: [{}, {}, { t: 1350, km: 4.1 }, { t: 1350, km: 4.1 }] },
    { name: 'Burpee', mode: 'tiempo_reps', sets: 4, demo: true, prev: [null, { r: 10 }, { r: 10 }, { r: 10 }], today: [{}, {}, { t: '', r: 10 }, { t: 60, r: '' }] },
  ]),
  R('Empuje · Pecho y hombro', '6 ejercicios · 22 series', fCorta(5), [
    { name: 'Press banca con barra', sets: 4, prev: [{ kg: 50, r: 8 }, { kg: 50, r: 7 }, { kg: 47.5, r: 8 }, { kg: 47.5, r: 7 }] },
    { name: 'Press militar sentado', sets: 4, prev: [{ kg: 32.5, r: 9 }, { kg: 32.5, r: 8 }, { kg: 30, r: 9 }, { kg: 30, r: 8 }] },
    { name: 'Aperturas en polea', sets: 3, prev: [{ kg: 15, r: 12 }, { kg: 15, r: 11 }, { kg: 12.5, r: 12 }] },
    { name: 'Elevaciones laterales', sets: 4, prev: [{ kg: 10, r: 14 }, { kg: 10, r: 12 }, { kg: 10, r: 12 }, { kg: 8, r: 14 }] },
    { name: 'Fondos en paralelas', sets: 3, prev: [{ kg: 0, r: 12 }, { kg: 0, r: 10 }, { kg: 0, r: 9 }] },
    { name: 'Extensión de tríceps en polea', sets: 4, prev: [{ kg: 22.5, r: 12 }, { kg: 22.5, r: 11 }, { kg: 20, r: 12 }, { kg: 20, r: 12 }] },
  ]),
  R('Tirón · Espalda y bíceps', '7 ejercicios · 24 series', fCorta(1), [
    { name: 'Dominadas', sets: 4, prev: [{ kg: 0, r: 9 }, { kg: 0, r: 8 }, { kg: 0, r: 7 }, { kg: 0, r: 6 }] },
    { name: 'Remo con barra', sets: 4, prev: [{ kg: 46, r: 10 }, { kg: 46, r: 9 }, { kg: 43, r: 10 }, { kg: 43, r: 9 }] },
    { name: 'Jalón al pecho', sets: 3, prev: [{ kg: 55, r: 11 }, { kg: 55, r: 10 }, { kg: 50, r: 12 }] },
    { name: 'Remo en polea baja', sets: 3, prev: [{ kg: 48, r: 12 }, { kg: 48, r: 11 }, { kg: 45, r: 12 }] },
    { name: 'Curl con barra Z', sets: 4, prev: [{ kg: 25, r: 10 }, { kg: 25, r: 9 }, { kg: 22.5, r: 10 }, { kg: 22.5, r: 9 }] },
    { name: 'Curl martillo', sets: 3, prev: [{ kg: 12, r: 12 }, { kg: 12, r: 11 }, { kg: 10, r: 12 }] },
    { name: 'Face pull', sets: 3, prev: [{ kg: 18, r: 15 }, { kg: 18, r: 14 }, { kg: 16, r: 15 }] },
  ]),
  R('Pierna completa', '6 ejercicios · 20 series', fCorta(2), [
    { name: 'Sentadilla trasera', sets: 4, prev: [{ kg: 82, r: 6 }, { kg: 82, r: 6 }, { kg: 77.5, r: 7 }, { kg: 77.5, r: 6 }] },
    { name: 'Prensa de pierna', sets: 4, prev: [{ kg: 140, r: 10 }, { kg: 140, r: 9 }, { kg: 130, r: 11 }, { kg: 130, r: 10 }] },
    { name: 'Peso muerto rumano', sets: 3, prev: [{ kg: 60, r: 10 }, { kg: 60, r: 9 }, { kg: 55, r: 10 }] },
    { name: 'Extensión de cuádriceps', sets: 3, prev: [{ kg: 40, r: 12 }, { kg: 40, r: 11 }, { kg: 35, r: 12 }] },
    { name: 'Curl femoral tumbado', sets: 3, prev: [{ kg: 35, r: 12 }, { kg: 35, r: 11 }, { kg: 30, r: 12 }] },
    { name: 'Gemelo de pie', sets: 3, prev: [{ kg: 60, r: 15 }, { kg: 60, r: 14 }, { kg: 55, r: 15 }] },
  ]),
  R('Full body express', '5 ejercicios · 15 series', fCorta(9), [
    { name: 'Sentadilla goblet', sets: 3, prev: [{ kg: 24, r: 12 }, { kg: 24, r: 11 }, { kg: 20, r: 12 }] },
    { name: 'Press banca con mancuernas', sets: 3, prev: [{ kg: 22, r: 10 }, { kg: 22, r: 9 }, { kg: 20, r: 10 }] },
    { name: 'Remo con mancuerna', sets: 3, prev: [{ kg: 24, r: 11 }, { kg: 24, r: 10 }, { kg: 22, r: 11 }] },
    { name: 'Zancadas caminando', sets: 3, prev: [{ kg: 16, r: 12 }, { kg: 16, r: 12 }, { kg: 14, r: 12 }] },
    { name: 'Plancha frontal', sets: 3, prev: [{ kg: 0, r: 60 }, { kg: 0, r: 50 }, { kg: 0, r: 45 }] },
  ]),
  R('Core y movilidad', '4 ejercicios · 12 series', fCorta(4), [
    { name: 'Rueda abdominal', sets: 3, prev: [{ kg: 0, r: 12 }, { kg: 0, r: 10 }, { kg: 0, r: 9 }] },
    { name: 'Pallof press', sets: 3, prev: [{ kg: 14, r: 12 }, { kg: 14, r: 12 }, { kg: 12, r: 12 }] },
    { name: 'Elevación de piernas colgado', sets: 3, prev: [{ kg: 0, r: 12 }, { kg: 0, r: 10 }, { kg: 0, r: 9 }] },
    { name: 'Movilidad de cadera', sets: 3, prev: [{ kg: 0, r: 45 }, { kg: 0, r: 45 }, { kg: 0, r: 45 }] },
  ]),
  R('Cardio', '1 ejercicio · 1 serie', fCorta(6), [
    { name: 'Correr', mode: 'tiempo_distancia', sets: 1, prev: [{ t: 1800, km: 5.2 }] },
  ]),
];

/* sesión guardada a partir de una rutina */
let hid = 0;
const mkHist = (r, daysAgo, dur, note = '') => {
  const exercises = r.exercises.map(e => ({ name: e.name, mode: e.mode || 'peso_reps', sets: e.prev.slice(0, e.sets).filter(Boolean).map(s => ({ ...s })) }));
  const sets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const vol = exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + setVol(s, e.mode), 0), 0);
  const km = exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + setKm(s, e.mode), 0), 0);
  return { id: 'h' + (++hid), name: r.name, daysAgo, date: fCorta(daysAgo), dateLong: fLarga(daysAgo), dur, vol, km: Math.round(km * 10) / 10, sets, exercises, note, photos: [] };
};

/* pesajes: ~6 meses, subiendo de 58,9 a 61,4 */
const weights = [];
for (let d = 178; d >= 0; d -= 4) {
  const t = 1 - d / 178;
  const v = 58.9 + t * 2.5 + Math.sin(d / 9) * 0.35 + (d % 3 === 0 ? 0.15 : -0.1);
  weights.push({ d, v: Math.round(v * 10) / 10 });
}

window.D3 = {
  user: { name: 'Jaume Molina', email: 'jaume@bastion.app', initials: 'JM', photo: null },
  labels: { hoy: 'Hoy', ayer: 'Ayer', version: 'Bastion 1.0.0' },
  fmt: { corta: fCorta, larga: fLarga, dia: fDia, largaMes: fLargaMes, cap: cap3 },
  setTypes: [
    { k: 'normal', ab: '1', lb: 'Serie normal', desc: 'Serie de trabajo estándar numerada', cls: '' },
    { k: 'cal', ab: 'C', lb: 'Calentamiento', desc: 'Serie ligera de activación muscular', cls: 't-cal' },
    { k: 'drop', ab: 'D', lb: 'Drop set', desc: 'Baja el peso y continúa sin descanso', cls: 't-drop' },
    { k: 'fallo', ab: 'F', lb: 'Al fallo', desc: 'Empuja hasta el fallo muscular completo', cls: 't-fallo' },
  ],
  profile: {
    nombre: 'Jaume', sexo: 'h', edad: 28, altura: 178, peso: 61.4, pesoInicial: 58.9,
    meta: 'subir', actividad: 'moderado', pesoMeta: 70, kcal: 2637, macros: { p: 116, c: 345, g: 88 }, ajuste: 150,
    metas: [
      { k: 'subir', lb: 'Subir de peso', d: 'Superávit moderado para ganar masa' },
      { k: 'recomp', lb: 'Recomposición', d: 'Mantener peso, cambiar composición' },
      { k: 'bajar', lb: 'Bajar de peso', d: 'Déficit sostenible para perder grasa' },
    ],
    actividades: [
      { k: 'sedentario', lb: 'Sedentario', d: 'Trabajo de oficina, poco movimiento' },
      { k: 'ligero', lb: 'Ligero', d: 'Caminas a diario, 1–2 entrenos' },
      { k: 'moderado', lb: 'Moderado', d: '3–4 entrenos por semana' },
      { k: 'activo', lb: 'Activo', d: '5–6 entrenos, trabajo en movimiento' },
      { k: 'muy', lb: 'Muy activo', d: 'Trabajo físico y entreno diario' },
    ],
  },
  routines,
  nutrition: {
    goal: 2637,
    macros: [
      { k: 'P', name: 'Proteína', goal: 116 },
      { k: 'C', name: 'Hidratos', goal: 345 },
      { k: 'G', name: 'Grasas', goal: 88 },
    ],
    meals: [
      { key: 'des', name: 'Desayuno', items: [
        { n: 'Avena con leche', q: 80, u: 'g', k: 312, p: 12, c: 46, g: 8 },
        { n: 'Plátano', q: 1, u: 'ud', k: 107, p: 1, c: 27, g: 0 },
        { n: 'Café con leche', q: 200, u: 'ml', k: 96, p: 6, c: 9, g: 4 },
      ] },
      { key: 'com', name: 'Comida', items: [
        { n: 'Pechuga de pollo a la plancha', q: 180, u: 'g', k: 297, p: 56, c: 0, g: 7 },
        { n: 'Arroz basmati cocido', q: 200, u: 'g', k: 260, p: 5, c: 56, g: 1 },
        { n: 'Ensalada mixta con aceite', q: 150, u: 'g', k: 143, p: 2, c: 6, g: 12 },
      ] },
      { key: 'mer', name: 'Merienda', items: [
        { n: 'Yogur griego natural', q: 150, u: 'g', k: 130, p: 15, c: 6, g: 5 },
        { n: 'Almendras crudas', q: 20, u: 'g', k: 120, p: 4, c: 2, g: 11 },
      ] },
      { key: 'cen', name: 'Cena', items: [] },
    ],
    /* catálogo: valores por 100 g / 100 ml / 1 ud */
    foods: [
      { n: 'Batido de proteína', brand: 'Whey 80', u: 'g', k: 393, p: 80, c: 7, g: 7, mine: true },
      { n: 'Huevos revueltos', brand: '', u: 'g', k: 141, p: 12, c: 1, g: 10, mine: false },
      { n: 'Salmón al horno', brand: '', u: 'g', k: 208, p: 21, c: 0, g: 13, mine: false },
      { n: 'Pan integral', brand: 'Panadería', u: 'g', k: 240, p: 9, c: 43, g: 3, mine: true },
      { n: 'Pechuga de pollo a la plancha', brand: '', u: 'g', k: 165, p: 31, c: 0, g: 4, mine: false },
      { n: 'Arroz basmati cocido', brand: '', u: 'g', k: 130, p: 3, c: 28, g: 0, mine: false },
      { n: 'Yogur griego natural', brand: 'Fage', u: 'g', k: 97, p: 9, c: 4, g: 5, mine: true },
      { n: 'Plátano', brand: '', u: 'ud', k: 107, p: 1, c: 27, g: 0, mine: false },
      { n: 'Avena con leche', brand: '', u: 'g', k: 390, p: 15, c: 58, g: 10, mine: false },
      { n: 'Leche semidesnatada', brand: 'Hacendado', u: 'ml', k: 46, p: 3, c: 5, g: 2, mine: true },
      { n: 'Almendras crudas', brand: '', u: 'g', k: 600, p: 21, c: 9, g: 54, mine: false },
      { n: 'Atún en conserva al natural', brand: 'Calvo', u: 'g', k: 100, p: 24, c: 0, g: 1, mine: false },
    ],
    recientes: [
      { n: 'Batido de proteína', q: 30, u: 'g' },
      { n: 'Huevos revueltos', q: 165, u: 'g' },
      { n: 'Salmón al horno', q: 150, u: 'g' },
      { n: 'Pan integral', q: 70, u: 'g' },
      { n: 'Yogur griego natural', q: 150, u: 'g' },
    ],
    misComidas: [
      { n: 'Mi desayuno de siempre', items: [{ n: 'Avena con leche', q: 80, u: 'g' }, { n: 'Plátano', q: 1, u: 'ud' }, { n: 'Leche semidesnatada', q: 200, u: 'ml' }] },
      { n: 'Comida post-entreno', items: [{ n: 'Pechuga de pollo a la plancha', q: 180, u: 'g' }, { n: 'Arroz basmati cocido', q: 200, u: 'g' }, { n: 'Yogur griego natural', q: 150, u: 'g' }, { n: 'Plátano', q: 1, u: 'ud' }] },
    ],
    water: { ml: 1500, step: 250 },
  },
  weights,
  weightGoal: 70,
  history: [
    mkHist(routines[2], 1, 3724, ''),
    mkHist(routines[6], 2, 1830, 'Rodaje suave, sin molestias.'),
    mkHist(routines[3], 3, 4312, 'Dormí poco, molestia en el hombro derecho.'),
    mkHist(routines[1], 5, 3480, ''),
    mkHist(routines[5], 7, 2040, ''),
    mkHist(routines[2], 8, 3660, ''),
    mkHist(routines[4], 12, 2110, ''),
    mkHist(routines[3], 15, 4190, ''),
  ],
  prs: [
    { n: 'Press banca con barra', d: fCorta(5), v: '50 kg × 8' },
    { n: 'Sentadilla trasera', d: fCorta(3), v: '82 kg × 6' },
    { n: 'Remo con barra', d: fCorta(1), v: '46 kg × 10' },
  ],
  volume: [
    { m: 'Pecho', kg: 7420 },
    { m: 'Espalda', kg: 6840 },
    { m: 'Pierna', kg: 6180 },
    { m: 'Hombro', kg: 3960 },
    { m: 'Brazo', kg: 2740 },
    { m: 'Core', kg: 980 },
  ],
  adherence: { days: 30, trained: [1, 3, 4, 6, 8, 9, 11, 13, 15, 16, 18, 20, 22, 23, 25, 27, 29], logged: [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 24, 25, 26, 27, 29] },
};

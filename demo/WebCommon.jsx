/* WebCommon.jsx — Bastion Web: tema, estado persistente y piezas compartidas. */
const WEB_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", system-ui, Roboto, sans-serif';
const WEB_T = {
  dark: { bg: '#101113', card: '#191B1E', inner: '#212327', text: '#F3F4F2', sub: '#9DA2A8', muted: '#5F646B', light: '#C8CDD3', accSub: 'rgba(163,224,108,0.12)', border: 'rgba(255,255,255,0.06)', borderMid: 'rgba(255,255,255,0.10)', track: 'rgba(255,255,255,0.08)', danger: '#f87171' },
  light: { bg: '#F7F8F5', card: '#FFFFFF', inner: '#F2F3F0', text: '#1A1C1F', sub: '#666B72', muted: '#A4AAB0', light: '#4A5058', accSub: 'rgba(163,224,108,0.16)', border: 'rgba(0,0,0,0.06)', borderMid: 'rgba(0,0,0,0.09)', track: 'rgba(0,0,0,0.06)', danger: '#DC2626' },
};
const webVars = (theme) => {
  const t = WEB_T[theme];
  return {
    '--font': WEB_FONT, '--accent': '#a3e06c', '--on-accent': '#0E1410', '--accent-text': '#a3e06c', '--accent-subtle': t.accSub,
    '--accent-border': '#a3e06c48', '--accent-border-strong': '#a3e06c8C', '--blue': '#4da6e9', '--sky': '#5cc7ff', '--amber': '#eea753',
    '--purple': '#a18bf3', '--violet': '#a18bf3', '--positive': '#67d283', '--danger': t.danger, '--danger-border': t.danger + '66',
    '--screen': t.bg, '--surface': t.card, '--surface2': t.inner, '--line': t.border, '--line-mid': t.borderMid,
    '--text': t.text, '--text-light': t.light, '--dim': t.sub, '--faint': t.muted, '--track': t.track,
  };
};

const W_KEY = 'bastion.web.v1';
const W_DAY = 864e5;
const wClone = (o) => JSON.parse(JSON.stringify(o));
let wSeq = 0;
const wUid = () => Date.now().toString(36) + (++wSeq);
const wToday = () => { const t = new Date(); t.setHours(12, 0, 0, 0); return t; };
const wKey = (off = 0) => { const t = wToday(); t.setDate(t.getDate() - off); return t.toISOString().slice(0, 10); };
const wDaysAgo = (ts) => Math.round((wToday().getTime() - ts) / W_DAY);
const wInit = (name) => (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
const wClock = (sec) => { const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s2 = String(sec % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${s2}` : `${m}:${s2}`; };
const wDur = (sec) => { const h = Math.floor(sec / 3600), m = Math.round(sec / 60) % 60; return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${Math.max(1, m)} min`; };
const w1rm = (x) => (+x.kg || 0) * (1 + (+x.r || 0) / 30);

const wFoodOf = (s, name) => s.foods.find(f => f.n === name);
const wItem = (food, q) => { const f = food.u === 'ud' ? q : q / 100; return { n: food.n, q, u: food.u, k: Math.round(food.k * f), p: Math.round(food.p * f), c: Math.round(food.c * f), g: Math.round(food.g * f) }; };
const wSum = (items) => items.reduce((a, i) => ({ k: a.k + i.k, p: a.p + i.p, c: a.c + i.c, g: a.g + i.g }), { k: 0, p: 0, c: 0, g: 0 });

function wSeed() {
  const D = window.D3, now = wToday().getTime();
  return {
    v: 1, theme: 'dark', rest: 90,
    user: { name: D.user.name, email: D.user.email },
    profile: { ...wClone(D.profile), metas: undefined, actividades: undefined, notif: { entreno: true, descanso: true, comidas: false, pesaje: true } },
    days: { [wKey(0)]: { meals: wClone(D.nutrition.meals), water: D.nutrition.water.ml } },
    foods: wClone(D.nutrition.foods), recientes: wClone(D.nutrition.recientes), misComidas: wClone(D.nutrition.misComidas),
    routines: D.routines.map(r => ({ id: wUid(), name: r.name, exercises: r.exercises.map(e => ({ name: e.name, mode: e.mode || 'peso_reps', sets: e.sets, prev: wClone(e.prev).map(p => p || null) })) })),
    weights: D.weights.map(w => ({ t: now - w.d * W_DAY, v: w.v })),
    weightGoal: D.weightGoal,
    history: D.history.map(h => ({ ...wClone(h), t: now - h.daysAgo * W_DAY })),
    session: null,
  };
}

const WCtx = React.createContext(null);
const useW = () => React.useContext(WCtx);
function WProvider({ children }) {
  const [s, setS] = React.useState(() => { try { const r = JSON.parse(localStorage.getItem(W_KEY)); if (r && r.v === 1) return r; } catch (e) {} return wSeed(); });
  React.useEffect(() => { try { localStorage.setItem(W_KEY, JSON.stringify(s)); } catch (e) {} }, [s]);
  const set = React.useCallback(fn => setS(p => { const n = wClone(p); fn(n); return n; }), []);
  const [toast, setToast] = React.useState(null);
  const say = React.useCallback((msg, undo) => setToast({ msg, undo, k: Date.now() }), []);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 4500); return () => clearTimeout(t); }, [toast]);
  return <WCtx.Provider value={{ s, set, setS, say, toast, setToast }}>{children}</WCtx.Provider>;
}
const WToast = () => {
  const { toast, setToast } = useW();
  if (!toast) return null;
  return <div className="wtoast" key={toast.k}><span>{toast.msg}</span>{toast.undo && <button onClick={() => { toast.undo(); setToast(null); }}>Deshacer</button>}</div>;
};

const useTick = (on = true, ms = 1000) => { const [, f] = React.useState(0); React.useEffect(() => { if (!on) return; const t = setInterval(() => f(x => x + 1), ms); return () => clearInterval(t); }, [on, ms]); };
const useEsc = (fn) => React.useEffect(() => { const h = e => { if (e.key === 'Escape') fn(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [fn]);
const wBeep = () => { try { const a = new (window.AudioContext || window.webkitAudioContext)(); [0, .22].forEach(d => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.14, a.currentTime + d); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + d + .18); o.connect(g).connect(a.destination); o.start(a.currentTime + d); o.stop(a.currentTime + d + .2); }); } catch (e) {} };

const WCard = ({ label, action, children, className = '', style }) => (
  <section className={'wcard ' + className} style={style}>
    {(label || action) && <div className="wc-h"><span className="wc-l">{label}</span>{action}</div>}
    {children}
  </section>
);
const WModal = ({ title, sub, onClose, children, foot, wide }) => {
  useEsc(onClose);
  return (
    <div className="wov" onMouseDown={onClose}>
      <div className={'wmodal' + (wide ? ' wide' : '')} onMouseDown={e => e.stopPropagation()} role="dialog">
        <div className="wm-h"><div><div className="wm-t">{title}</div>{sub && <div className="wm-s">{sub}</div>}</div><button className="wic" onClick={onClose} aria-label="Cerrar"><I3 n="x" s={18} /></button></div>
        <div className="wm-b">{children}</div>
        {foot && <div className="wm-f">{foot}</div>}
      </div>
    </div>
  );
};
const WDrawer = ({ title, onClose, onBack, children }) => {
  useEsc(onClose);
  return (
    <>
      <div className="wdrawer-ov" onMouseDown={onClose} />
      <aside className="wdrawer" role="dialog">
        <div className="wm-h">{onBack && <button className="wic" onClick={onBack} aria-label="Volver"><I3 n="chevL" s={18} /></button>}<div><div className="wm-t">{title}</div></div><button className="wic" onClick={onClose} aria-label="Cerrar"><I3 n="x" s={18} /></button></div>
        <div className="wm-b">{children}</div>
      </aside>
    </>
  );
};
const WConfirm = ({ title, msg, actions, onClose }) => (
  <div className="wov" onMouseDown={onClose}>
    <div className="wal" onMouseDown={e => e.stopPropagation()} role="alertdialog">
      <div className="wal-t">{title}</div>
      {msg && <p>{msg}</p>}
      <div className="wal-a">{actions.map(a => <button key={a.lb} className={'wb ' + (a.kind || '')} onClick={() => { onClose(); a.on && a.on(); }}>{a.lb}</button>)}</div>
    </div>
  </div>
);
const WMenu = ({ items, onClose }) => (
  <>
    <div className="wmenu-ov" onClick={onClose} />
    <div className="wmenu">{items.map(it => <button key={it.lb} className={it.danger ? 'danger' : ''} onClick={() => { onClose(); it.on(); }}><I3 n={it.ic} s={17} />{it.lb}</button>)}</div>
  </>
);
const WSeg = ({ opts, v, on }) => <div className="wseg">{opts.map(o => <button key={o.k} className={v === o.k ? 'on' : ''} onClick={() => on(o.k)}>{o.lb}</button>)}</div>;
const WBar = ({ v, max, color = 'var(--accent)' }) => <div className="wbar"><span style={{ width: Math.max(0, Math.min(100, max ? v / max * 100 : 0)) + '%', background: color }} /></div>;
const WRing = ({ v, max, size = 180, sw = 14, color = 'var(--accent)', children }) => {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, max ? v / max : 0));
  return (
    <div className="wring" style={{ width: size, height: size }}>
      <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={sw} /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} style={{ transition: 'stroke-dasharray .4s' }} /></svg>
      <div className="wring-c">{children}</div>
    </div>
  );
};

/* gráfica de línea a ancho real del contenedor, con punto bajo el cursor */
function WChart({ pts, days, h = 220, unit = 'kg', spark = false }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(640);
  const [hov, setHov] = React.useState(null);
  const gid = React.useMemo(() => 'wg' + Math.random().toString(36).slice(2, 8), []);
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const m = () => { const cw = el.clientWidth; if (cw) setW(Math.max(220, cw)); };
    m(); const raf = requestAnimationFrame(m);
    const ro = window.ResizeObserver ? new ResizeObserver(m) : null; ro && ro.observe(el);
    window.addEventListener('resize', m);
    return () => { cancelAnimationFrame(raf); ro && ro.disconnect(); window.removeEventListener('resize', m); };
  }, []);
  const inWin = pts.filter(p => p.d <= days && p.d >= 0).sort((a, b) => b.d - a.d);
  let body;
  if (!inWin.length) body = <div className="wempty">Sin registros en este periodo.</div>;
  else {
    const padT = spark ? 6 : 14, padB = spark ? 6 : 28, x0 = spark ? 4 : 46, x1 = w - (spark ? 8 : 14), y0 = padT, y1 = h - padB;
    const vals = inWin.map(p => p.v);
    let lo = Math.min(...vals), hi = Math.max(...vals); const sp = Math.max(hi - lo, 1); lo -= sp * .18; hi += sp * .18;
    const step = [0.2, 0.5, 1, 2, 5, 10, 20, 50, 100].find(st => (hi - lo) / st <= 5) || 100;
    const ticks = []; for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(+t.toFixed(2));
    const x = d => x0 + ((days - d) / days) * (x1 - x0);
    const y = v => y0 + (1 - (v - lo) / (hi - lo)) * (y1 - y0);
    const line = inWin.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
    const last = inWin[inWin.length - 1];
    const area = `${line} L${x(last.d).toFixed(1)} ${y1} L${x(inWin[0].d).toFixed(1)} ${y1} Z`;
    const at = d => { const t = wToday(); t.setDate(t.getDate() - d); return t; };
    const xl = [];
    if (spark) {}
    else if (days <= 10) for (let d = days; d >= 0; d--) xl.push({ d, lb: at(d).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '') });
    else if (days <= 45) for (let d = 0; d <= days; d += 7) { const t = at(d); xl.push({ d, lb: `${t.getDate()} ${MESES3[t.getMonth()]}` }); }
    else for (let d = days; d >= 0; d--) { const t = at(d); if (t.getDate() === 1) xl.push({ d, lb: MESES3[t.getMonth()] }); }
    const move = e => { const r = e.currentTarget.getBoundingClientRect(), px = e.clientX - r.left; let b = inWin[0]; inWin.forEach(p => { if (Math.abs(x(p.d) - px) < Math.abs(x(b.d) - px)) b = p; }); setHov(b); };
    body = (
      <>
        <svg width={w} height={h} onMouseMove={spark ? undefined : move} onMouseLeave={() => setHov(null)} style={spark ? { cursor: 'default' } : undefined}>
          <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--violet)" stopOpacity=".24" /><stop offset="100%" stopColor="var(--violet)" stopOpacity="0" /></linearGradient></defs>
          {!spark && ticks.map(t => <g key={t}><line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke="var(--line)" /><text x={x0 - 10} y={y(t) + 4} textAnchor="end" className="wch-y">{t.toLocaleString('es-ES')}</text></g>)}
          {xl.map(l => <text key={l.d} x={x(l.d)} y={h - 6} textAnchor="middle" className="wch-x">{l.lb}</text>)}
          {inWin.length > 1 && <path d={area} fill={`url(#${gid})`} />}
          {inWin.length > 1 && <path d={line} fill="none" stroke="var(--violet)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
          {!spark && inWin.map((p, i) => <circle key={i} cx={x(p.d)} cy={y(p.v)} r="2" fill="var(--violet)" opacity=".6" />)}
          {hov && <line x1={x(hov.d)} x2={x(hov.d)} y1={y0} y2={y1} stroke="var(--line-mid)" strokeDasharray="3 3" />}
          <circle cx={x((hov || last).d)} cy={y((hov || last).v)} r="5" fill="var(--violet)" stroke="var(--surface)" strokeWidth="2.5" />
        </svg>
        {hov && <div className="wch-tip" style={{ left: Math.min(Math.max(x(hov.d), 60), w - 60), top: y(hov.v) }}><b>{window.SERIE.kg(hov.v)} {unit}</b> · {window.D3.fmt.corta(hov.d)}</div>}
      </>
    );
  }
  return <div className="wch" ref={ref}>{body}</div>;
}

const WPageHead = ({ title, sub, actions, tabs, tab, onTab }) => (
  <header className={'wph' + (tabs ? ' has-tabs' : '')}>
    <div className="wph-r"><div className="wph-t"><h1>{title}</h1>{sub && <span>{sub}</span>}</div>{actions && <div className="wph-a">{actions}</div>}</div>
    {tabs && <nav className="wtabs" role="tablist">{tabs.map(t => <button key={t.k} role="tab" aria-selected={tab === t.k} className={tab === t.k ? 'on' : ''} onClick={() => onTab(t.k)}>{t.lb}{t.n != null && <i>{t.n}</i>}</button>)}</nav>}
  </header>
);
Object.assign(window, { WPageHead, WEB_T, webVars, W_KEY, wClone, wUid, wToday, wKey, wDaysAgo, wInit, wClock, wDur, w1rm, wFoodOf, wItem, wSum, wSeed, WProvider, WToast, useW, useTick, useEsc, wBeep, WCard, WModal, WDrawer, WConfirm, WMenu, WSeg, WBar, WRing, WChart });

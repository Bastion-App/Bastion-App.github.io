/* Core3.jsx — piezas compartidas de la arquitectura de 3 pestañas. */

const n3 = (v) => v.toLocaleString('es-ES');

/* Ionicons (variante -outline), como en la app real */
const ION3 = { dumbbell: 'barbell-outline', fork: 'restaurant-outline', chart: 'trending-up-outline', plus: 'add', minus: 'remove', check: 'checkmark', play: 'play', x: 'close', xc: 'close-circle', chev: 'chevron-forward', chevL: 'chevron-back', chevD: 'chevron-down', chevU: 'chevron-up', swap: 'swap-horizontal', bell: 'notifications-outline', save: 'save-outline', images: 'images-outline', create: 'create-outline', arrowL: 'arrow-back', arrowR: 'arrow-forward', search: 'search-outline', barcode: 'barcode-outline', drop: 'water-outline', star: 'star-outline', bookmark: 'bookmark-outline', clock: 'time-outline', list: 'list-outline', settings: 'settings-outline', camera: 'camera-outline', image: 'image-outline', share: 'share-outline', download: 'download-outline', trophy: 'trophy-outline', more: 'ellipsis-horizontal', trash: 'trash-outline', pencil: 'pencil-outline', lock: 'lock-closed-outline', unlock: 'lock-open-outline', sparkles: 'sparkles', refresh: 'refresh-outline', copy: 'copy-outline', link: 'link-outline', sun: 'sunny-outline', moon: 'moon-outline', user: 'person-outline', flag: 'flag-outline', globe: 'globe-outline', upload: 'cloud-upload-outline', grid: 'grid-outline', clipboard: 'clipboard-outline' };
const ION3_CACHE = {}, ION3_WAIT = {};
const ionLoad3 = (name) => {
  if (ION3_CACHE[name] || ION3_WAIT[name]) return ION3_WAIT[name] || Promise.resolve(ION3_CACHE[name]);
  ION3_WAIT[name] = fetch('https://unpkg.com/ionicons@7.4.0/dist/svg/' + name + '.svg').then(r => r.ok ? r.text() : '').then(t => {
    const inner = (t.match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
    ION3_CACHE[name] = inner.replace(/<title>[\s\S]*?<\/title>/, '').replace(/class="ionicon-fill-none ionicon-stroke-width"/g, 'fill="none" stroke="currentColor" stroke-width="32"').replace(/class="ionicon-fill-none"/g, 'fill="none"').replace(/class="ionicon-stroke-width"/g, 'stroke="currentColor" stroke-width="32"');
    return ION3_CACHE[name];
  }).catch(() => '');
  return ION3_WAIT[name];
};
const Ion3 = ({ name, s, fb }) => {
  const [svg, setSvg] = React.useState(ION3_CACHE[name] || '');
  React.useEffect(() => { let on = true; if (!svg) ionLoad3(name).then(v => { if (on && v) setSvg(v); }); return () => { on = false; }; }, [name]);
  if (!svg) return fb;
  return <svg width={s} height={s} viewBox="0 0 512 512" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto', display: 'block' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
};
const I3 = ({ n, s = 22, w = 1.9 }) => {
  const p = {
    dumbbell: <><path d="M4 9v6" /><path d="M7 6.5v11" /><path d="M17 6.5v11" /><path d="M20 9v6" /><path d="M7 12h10" /></>,
    fork: <><path d="M5 3v7a2 2 0 0 0 2 2v9" /><path d="M7 3v5" /><path d="M9 3v5" /><path d="M17 3c-1.6 0-2.6 2-2.6 5s1 4 2.6 4v9" /></>,
    chart: <><path d="M4 20h16" /><path d="M6 16l4-5 3.5 3L19 7" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="M4.5 12.5 9.5 17.5 20 6.5" />,
    play: <path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    chev: <path d="M9 5l7 7-7 7" />,
    chevL: <path d="M15 5l-7 7 7 7" />,
    chevD: <path d="M5 9l7 7 7-7" />,
    bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20h4" />,
    save: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 4v5h7V4" /></>,
    swap: <><path d="M4 8h14l-3-3M20 16H6l3 3" /></>,
    images: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" /></>,
    chevU: <path d="M5 15l7-7 7 7" />,
    create: <path d="M4 20l4.5-1 10-10-3.5-3.5-10 10z" />,
    arrowL: <><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>,
    arrowR: <><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
    barcode: <><path d="M4 6v12M7.5 6v12M11 6v9M14.5 6v12M18 6v12M20.5 6v9" /></>,
    drop: <path d="M12 3.5s5.5 5.6 5.5 9.4A5.5 5.5 0 0 1 12 18.4a5.5 5.5 0 0 1-5.5-5.5C6.5 9.1 12 3.5 12 3.5Z" />,
    star: <path d="m12 3.6 2.6 5.3 5.8.85-4.2 4.1 1 5.8-5.2-2.75-5.2 2.75 1-5.8-4.2-4.1 5.8-.85z" />,
    bookmark: <path d="M6 4h12v16l-6-4.2L6 20z" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    list: <><path d="M8 7h12M8 12h12M8 17h12" /><path d="M4 7h.01M4 12h.01M4 17h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M19.8 7.5l-1.9 1.1M6.1 15.4l-1.9 1.1" /></>,
    camera: <><path d="M4 8.5h3l1.4-2h7.2L17 8.5h3v10H4z" /><circle cx="12" cy="13" r="3.4" /></>,
    image: <><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="M5 17l4.5-4.2 3 2.6 3-2.4 3.5 3" /></>,
    share: <><path d="M12 16V4" /><path d="M8 7.5 12 3.5l4 4" /><path d="M5 13v6.5a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19.5V13" /></>,
    download: <><path d="M12 4v12" /><path d="M8 12.5l4 4 4-4" /><path d="M5 20h14" /></>,
    trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 5.5H5.5V7a3 3 0 0 0 3 3M16 5.5h2.5V7a3 3 0 0 1-3 3" /><path d="M12 13v3M9 20h6M10.5 16.5h3" /></>,
    more: <><circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
    trash: <><path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 13h8l1-13" /><path d="M10 11v6M14 11v6" /></>,
    pencil: <><path d="M4 20l4.5-1 10-10-3.5-3.5-10 10z" /><path d="M13.5 7l3.5 3.5" /></>,
    lock: <><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    unlock: <><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 7.5-2" /></>,
    sparkles: <><path d="M12 4l1.8 4.7L18.5 10.5l-4.7 1.8L12 17l-1.8-4.7L5.5 10.5l4.7-1.8z" /><path d="M19 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
    refresh: <><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" /><path d="M20 4v4.5h-4.5" /><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" /><path d="M4 20v-4.5h4.5" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
    user: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 4h11l-1.5 3.5L16 11H5" /></>,
    globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" /></>,
    upload: <><path d="M12 16V4" /><path d="M8 7.5 12 3.5l4 4" /><path d="M5 13v6.5a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19.5V13" /></>,
    clipboard: <><rect x="6" y="5" width="12" height="16" rx="2" /><path d="M9 5V3.5h6V5" /></>,
    grid: <><rect x="4" y="5" width="16" height="14" rx="2.5" /><path d="M4 10h16M4 14.5h16M12 5v14" /></>,
  }[n];
  const fb = <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
  return ION3[n] ? <Ion3 name={ION3[n]} s={s} fb={fb} /> : fb;
};

const StatusBar3 = () => (
  <div className="statusbar">
    <span className="sb-time">9:41</span>
    <span className="sb-right">
      <span className="sb-5g">5G</span>
      <span className="sb-batt"><span className="sb-batt-num">78</span></span>
    </span>
  </div>
);

/* avatar: foto de perfil o iniciales */
const Avatar3 = ({ size = 38, onClick, className = '' }) => {
  const U = window.D3.user;
  return (
    <button className={'avatar ' + className} style={{ width: size, height: size, fontSize: size > 40 ? 20 : 15 }} onClick={onClick} title="Perfil y ajustes" aria-label="Perfil y ajustes">
      {U.photo ? <img src={U.photo} alt="" /> : U.initials}
    </button>
  );
};

/* cabecera común: fija, fuera del scroll; título 34 + acciones + avatar, sin línea (0.11.5) */
const ScreenHead = ({ title, action, onAvatar }) => (
  <header className="sh">
    <div className="sh-row">
      <h1>{title}</h1>
      <div className="sh-r">{action}<Avatar3 onClick={onAvatar} /></div>
    </div>
  </header>
);

const TABS3 = [
  { k: 'workout', ic: 'dumbbell', lb: 'Entreno' },
  { k: 'nutrition', ic: 'fork', lb: 'Nutrición' },
  { k: 'progress', ic: 'chart', lb: 'Progreso' },
];

const TabBar3 = ({ active, onChange }) => (
  <nav className="tabbar">
    {TABS3.map(t => (
      <button key={t.k} className={'tab' + (active === t.k ? ' active' : '')} onClick={() => onChange(t.k)}>
        <I3 n={t.ic} s={22} />
        <span>{t.lb}</span>
      </button>
    ))}
  </nav>
);

const Sheet = ({ title, sub, onClose, children, tall }) => (
  <div className="sheet-ov" onClick={onClose}>
    <div className={'sheet' + (tall ? ' tall' : '')} onClick={e => e.stopPropagation()}>
      <div className="sheet-drag" />
      {title && <div className="sheet-t">{title}</div>}
      {sub && <p className="sheet-sub">{sub}</p>}
      <div style={{ overflowY: 'auto', minHeight: 0 }}>{children}</div>
    </div>
  </div>
);

const SheetRow = ({ icon, name, desc, onClick, danger }) => (
  <button className={'sheet-row' + (danger ? ' danger' : '')} onClick={onClick}>
    <span className="sheet-row-i"><I3 n={icon} s={20} /></span>
    <span className="sheet-row-b">
      <span className="sheet-row-n" style={{ display: 'block' }}>{name}</span>
      {desc && <span className="sheet-row-d" style={{ display: 'block' }}>{desc}</span>}
    </span>
    <span style={{ color: 'var(--faint)', display: 'flex' }}><I3 n="chev" s={17} /></span>
  </button>
);

/* alerta del sistema: título, mensaje y botones apilados */
const Alert3 = ({ title, msg, actions, onClose }) => (
  <div className="al-ov" onClick={onClose}>
    <div className="al" onClick={e => e.stopPropagation()}>
      <div className="al-t">{title}</div>
      {msg && <div className="al-m">{msg}</div>}
      <div className="al-acts">
        {actions.map(a => (
          <button key={a.lb} className={'al-b' + (a.kind ? ' ' + a.kind : '')} onClick={() => { a.onClick && a.onClick(); if (!a.keep) onClose(); }}>{a.lb}</button>
        ))}
      </div>
    </div>
  </div>
);

const Card3 = ({ label, action, children, style, className = '' }) => (
  <section className={'card ' + className} style={style}>
    {label && <div className="card-head"><span className="card-label">{label}</span>{action}</div>}
    {children}
  </section>
);

/* ---- gráfica de línea compartida (peso corporal, 1RM) ----
   pts: [{ d: días atrás (0 = hoy), v }]; days: ventana; sin suavizar. */
const MESES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DOW3 = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const LineChart3 = ({ pts, days, H = 136, yCol = 34, emptyText, axis = true }) => {
  const W = 340, pad = 10, axB = axis ? 16 : 0;
  const inWin = pts.filter(p => p.d <= days).sort((a, b) => b.d - a.d);
  if (!inWin.length) return <div className="lc-empty">{emptyText || 'Sin registros suficientes en este periodo.'}</div>;
  const vals = inWin.map(p => p.v);
  let lo = Math.min(...vals) - 0.4, hi = Math.max(...vals) + 0.4;
  if (inWin.length === 1) { lo = vals[0] - 1.5; hi = vals[0] + 1.5; }
  const step = [0.5, 1, 2, 5, 10, 20].find(s => (hi - lo) / s <= 4) || 20;
  const ticks = []; for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) ticks.push(+t.toFixed(2));
  const x0 = yCol, x1 = W - pad, y0 = pad, y1 = H - pad - axB;
  const x = d => x0 + ((days - d) / days) * (x1 - x0);
  const y = v => y0 + (1 - (v - lo) / (hi - lo)) * (y1 - y0);
  const line = inWin.map((p, i) => `${i ? 'L' : 'M'}${x(p.d).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
  const last = inWin[inWin.length - 1];
  const area = `${line} L${x(last.d).toFixed(1)} ${y1} L${x(inWin[0].d).toFixed(1)} ${y1} Z`;
  const today = new Date();
  const dateAt = d => { const t = new Date(today); t.setDate(t.getDate() - d); return t; };
  const xl = [];
  if (axis) {
    if (days <= 10) { for (let d = days; d >= 0; d--) xl.push({ d, lb: dateAt(d).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '') }); }
    else if (days <= 45) { for (let d = 0; d <= days; d += 7) { const t = dateAt(d); xl.push({ d, lb: `${t.getDate()} ${MESES3[t.getMonth()]}` }); } }
    else { for (let d = days; d >= 0; d--) { const t = dateAt(d); if (t.getDate() === 1) xl.push({ d, lb: MESES3[t.getMonth()] }); } }
  }
  const place = (l) => { const px = x(l.d), w = l.lb.length * 5.4; return px - w / 2 < x0 ? { x: x0, a: 'start' } : px + w / 2 > x1 ? { x: x1, a: 'end' } : { x: px, a: 'middle' }; };
  const gid = 'lc' + Math.round(H) + '-' + days;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }} className="lc">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--violet)" stopOpacity=".22" /><stop offset="100%" stopColor="var(--violet)" stopOpacity="0" /></linearGradient></defs>
      {ticks.map(t => <g key={t}><line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" /><text x={x0 - 7} y={y(t) + 3.5} textAnchor="end" className="lc-y">{Number.isInteger(t) ? t : t.toFixed(1)}</text></g>)}
      {xl.map(l => { const p = place(l); return <text key={l.d} x={p.x} y={H - 3} textAnchor={p.a} className="lc-x">{l.lb}</text>; })}
      {inWin.map((p, i) => <circle key={i} cx={x(p.d)} cy={y(p.v)} r="1.7" fill="var(--faint)" opacity=".55" />)}
      {inWin.length > 1 && <path d={area} fill={`url(#${gid})`} />}
      {inWin.length > 1 && <path d={line} fill="none" stroke="var(--violet)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
      <circle cx={x(last.d)} cy={y(last.v)} r="4.6" fill="var(--violet)" stroke="var(--surface)" strokeWidth="2.5" />
    </svg>
  );
};

/* ---- campos de serie según tipo de registro ---- */
const TimeIn3 = ({ value, onChange, className = 'sx-in' }) => {
  const S = window.SERIE;
  return <input className={className} inputMode="numeric" placeholder="—" value={S.has(value) ? S.mmss(value) : ''} onChange={e => onChange(S.parseT(e.target.value))} />;
};
const KmIn3 = ({ value, onChange, className = 'sx-in' }) => {
  const S = window.SERIE;
  const [txt, setTxt] = React.useState(S.has(value) ? S.km(value) : '');
  return <input className={className} inputMode="decimal" placeholder="—" value={txt}
    onChange={e => { const v = e.target.value.replace(/[^\d.,]/g, '').replace(/^(\d*[.,]\d).*$/, '$1'); setTxt(v); onChange(parseFloat(v.replace(',', '.')) || ''); }}
    onBlur={() => setTxt(S.has(value) ? S.km(value) : '')} />;
};
const SetField3 = ({ col, value, onChange, className = 'sx-in' }) => {
  if (col === 't') return <TimeIn3 value={value} onChange={onChange} className={className} />;
  if (col === 'km') return <KmIn3 value={value} onChange={onChange} className={className} />;
  return <input className={className} type="number" step={col === 'kg' ? 2.5 : 1} placeholder="—" value={value == null || value === 0 && col === 'kg' ? '' : value} onChange={e => onChange(e.target.value)} />;
};
/* hoja «Cómo se registra»: el tipo viene del catálogo, pero se puede cambiar */
const ModeSheet3 = ({ current, onPick, onClose }) => (
  <Sheet title="Cómo se registra" onClose={onClose}>
    {window.SERIE.modes.map(m => (
      <button className="sheet-row" key={m.k} onClick={() => onPick(m.k)}>
        <span className="mode-cols">{m.cols.map(c => <em key={c}>{window.SERIE.colLb[c]}</em>)}</span>
        <span className="sheet-row-b">
          <span className="sheet-row-n" style={{ display: 'block' }}>{m.lb}</span>
          <span className="sheet-row-d" style={{ display: 'block' }}>{m.d}</span>
        </span>
        {current === m.k && <span style={{ color: 'var(--accent)', display: 'flex' }}><I3 n="check" s={18} w={2.4} /></span>}
      </button>
    ))}
  </Sheet>
);

Object.assign(window, { n3, I3, Ion3, StatusBar3, Avatar3, ScreenHead, TabBar3, Sheet, SheetRow, Alert3, Card3, TABS3, LineChart3, MESES3, DOW3, TimeIn3, KmIn3, SetField3, ModeSheet3 });

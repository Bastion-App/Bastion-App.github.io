/* WebProgress.jsx — Progreso en escritorio: peso, meta, historial de entrenos, récords, volumen y constancia. */
const W_RANGES = [{ k: 7, lb: '1S' }, { k: 30, lb: '1M' }, { k: 90, lb: '3M' }, { k: 180, lb: '6M' }];
const W_RLB = { 7: 'última semana', 30: 'último mes', 90: 'últimos 3 meses', 180: 'últimos 6 meses' };
const W_DOWH = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function WProgress() {
  const { s, set, setS, say } = useW();
  const S = window.SERIE, F = window.D3.fmt;
  const [range, setRange] = React.useState(7);
  const [val, setVal] = React.useState('');
  const [ask, setAsk] = React.useState(null);
  const [goalEd, setGoalEd] = React.useState(null);
  const [allW, setAllW] = React.useState(false);
  const [det, setDet] = React.useState(null);
  const [tab, setTabS] = React.useState(() => localStorage.getItem('bastion.web.ptab') || 'body');
  const setTab = (k) => { setTabS(k); localStorage.setItem('bastion.web.ptab', k); };
  const pts = s.weights.map(w => ({ d: wDaysAgo(w.t), v: w.v }));
  const sorted = [...s.weights].sort((a, b) => b.t - a.t), cur = sorted[0];
  const inR = pts.filter(p => p.d <= range).sort((a, b) => b.d - a.d);
  const delta = inR.length > 1 ? inR[inR.length - 1].v - inR[0].v : 0;
  const goal = s.weightGoal, startW = +s.profile.pesoInicial || (sorted[sorted.length - 1] || {}).v || 0;
  const pct = cur && goal !== startW ? Math.max(0, Math.min(1, (cur.v - startW) / (goal - startW))) : 0;
  const add = (v) => {
    const snap = s, k = wKey(0);
    set(n => { n.weights = n.weights.filter(w => new Date(w.t).toISOString().slice(0, 10) !== k); n.weights.push({ t: wToday().getTime(), v }); n.profile.peso = v; });
    setVal(''); say(`Peso registrado: ${S.kg(v)} kg`, () => setS(snap));
  };
  const submit = (e) => {
    e.preventDefault();
    const v = Math.round(parseFloat(val.replace(',', '.')) * 10) / 10;
    if (!v || v < 25 || v > 350) { say('Introduce un peso válido'); return; }
    if (cur && Math.abs(v - cur.v) > 10) setAsk(v); else add(v);
  };
  const saveGoal = () => {
    const v = Math.round(parseFloat(String(goalEd).replace(',', '.')) * 10) / 10;
    if (!v || v < 25 || v > 350) { say('Introduce una meta válida'); return; }
    const snap = s; set(n => { n.weightGoal = v; n.profile.pesoMeta = v; }); setGoalEd(null); say(`Meta actualizada a ${S.kg(v)} kg`, () => setS(snap));
  };
  /* récords: mejor serie (1RM estimado) por ejercicio, sin calentamientos */
  const prs = {};
  s.history.forEach(h => h.exercises.forEach(e => { if ((e.mode || 'peso_reps') !== 'peso_reps') return; e.sets.forEach(x => { if (x.type === 'cal' || !(+x.kg > 0)) return; const v = w1rm(x); if (!prs[e.name] || v > prs[e.name].v) prs[e.name] = { v, x, t: h.t }; }); }));
  const prList = Object.entries(prs).sort((a, b) => b[1].v - a[1].v).slice(0, 6);
  /* volumen por músculo, últimos 30 días */
  const vm = {};
  s.history.filter(h => wDaysAgo(h.t) <= 30).forEach(h => h.exercises.forEach(e => { const m = (wLibOf(e.name) || {}).m || 'Otros'; const v = e.sets.reduce((a, x) => a + S.vol(x, e.mode || 'peso_reps'), 0); if (v) vm[m] = (vm[m] || 0) + v; }));
  const vList = Object.entries(vm).sort((a, b) => b[1] - a[1]), vMax = vList.length ? vList[0][1] : 1;
  /* constancia: 4 semanas, de lunes a domingo */
  const trained = new Set(s.history.map(h => wDaysAgo(h.t)));
  const logged = new Set(Object.entries(s.days).filter(([, d]) => d.meals.some(m => m.items.length)).map(([k]) => Math.round((wToday().getTime() - new Date(k + 'T12:00:00').getTime()) / 864e5)));
  const dow = (wToday().getDay() + 6) % 7, cells = [];
  for (let i = 21 + dow; i >= 0 - (6 - dow); i--) cells.push(i);
  const nT = cells.filter(d => d >= 0 && trained.has(d)).length, nL = cells.filter(d => d >= 0 && logged.has(d)).length;
  const wl = allW ? sorted : sorted.slice(0, 5);
  return (
    <div className="wpage">
      <WPageHead title="Progreso" sub="Peso corporal y rendimiento en el gimnasio" tab={tab} onTab={setTab} tabs={[{ k: 'body', lb: 'Cuerpo' }, { k: 'perf', lb: 'Rendimiento' }]} />
      {tab === 'body' && <div className="wp-grid">
        <WCard className="s8" label="Peso corporal" action={<WSeg opts={W_RANGES} v={range} on={setRange} />}>
          <div className="wp-big">
            <b>{cur ? S.kg(cur.v) : '—'}<i>kg</i></b>
            {inR.length > 1 && <span>{delta > 0 ? '+' : delta < 0 ? '−' : ''}{S.kg(Math.abs(delta))} kg en la {W_RLB[range]}</span>}
          </div>
          <WChart pts={pts} days={range} h={250} />
        </WCard>
        <div className="s4 wcol">
          <WCard label="Registrar peso">
            <form className="wform" onSubmit={submit}>
              <div className="win big"><input inputMode="decimal" placeholder={cur ? S.kg(cur.v) : '0,0'} value={val} onChange={e => setVal(e.target.value.replace(/[^\d.,]/g, '').replace(/^(\d*[.,]\d).*$/, '$1'))} aria-label="Peso de hoy" /><i>kg</i></div>
              <button className="wb tint" type="submit" disabled={!val}>Guardar peso de hoy</button>
              {cur && <div className="wnote">Último registro: {S.kg(cur.v)} kg · {F.corta(wDaysAgo(cur.t))}</div>}
            </form>
          </WCard>
          <WCard label="Meta" action={goalEd == null && <button className="wic sm" onClick={() => setGoalEd(S.kg(goal))} aria-label="Cambiar meta"><I3 n="pencil" s={16} /></button>}>
            {goalEd != null ? (
              <form className="wform" onSubmit={e => { e.preventDefault(); saveGoal(); }}>
                <div className="win big"><input autoFocus inputMode="decimal" value={goalEd} onChange={e => setGoalEd(e.target.value)} aria-label="Peso meta" /><i>kg</i></div>
                <div className="wrow"><button type="button" className="wb" onClick={() => setGoalEd(null)}>Cancelar</button><button type="submit" className="wb acc">Guardar</button></div>
              </form>
            ) : <>
              <div className="wp-goal"><b>{S.kg(goal)} kg</b><span>{cur ? (Math.abs(goal - cur.v) < .05 ? 'Meta alcanzada' : `Te ${Math.abs(goal - cur.v) === 1 ? 'falta' : 'faltan'} ${S.kg(Math.abs(goal - cur.v))} kg`) : ''}</span></div>
              <WBar v={pct} max={1} />
              <div className="wp-goal-l"><span>{S.kg(startW)} kg</span><span>{Math.round(pct * 100)} %</span></div>
            </>}
          </WCard>
        <WCard label="Pesajes" action={sorted.length > 5 && <button className="wb ghost sm" onClick={() => setAllW(!allW)}>{allW ? 'Ver menos' : `Ver todos (${sorted.length})`}<I3 n={allW ? 'chevU' : 'chevD'} s={15} /></button>}>
          <div className={'wlist' + (allW ? ' wscroll' : '')}>
            {wl.map((w, i) => { const prev = sorted[sorted.indexOf(w) + 1]; const df = prev ? w.v - prev.v : 0; return (
              <div className="wli static" key={w.t}>
                <div className="wli-b"><b>{S.kg(w.v)} kg</b><span>{F.dia(wDaysAgo(w.t))}</span></div>
                {prev && <span className="wli-s">{df > 0 ? '+' : df < 0 ? '−' : '±'}{S.kg(Math.abs(df))}</span>}
                <button className="wic sm hov" aria-label="Eliminar pesaje" onClick={() => { const snap = s; set(n => { n.weights = n.weights.filter(x => x.t !== w.t); }); say('Pesaje eliminado', () => setS(snap)); }}><I3 n="trash" s={16} /></button>
              </div>); })}
          </div>
        </WCard>
        </div>
      </div>}
      {tab === 'perf' && <div className="wp-grid">
        <WCard className="s4" label="Récords">
          {prList.length ? <div className="wlist">{prList.map(([n, r]) => (
            <div className="wli static" key={n}><span className="wtro sm"><I3 n="trophy" s={16} /></span><div className="wli-b"><b>{n}</b><span>{F.corta(wDaysAgo(r.t))}</span></div><span className="wli-s">{S.fmt(r.x, 'peso_reps')}</span></div>
          ))}</div> : <div className="wempty">Aún no hay récords.</div>}
        </WCard>
        <WCard className="s4" label="Volumen por músculo · 30 días">
          {vList.length ? <div className="wvol">{vList.map(([m, v]) => <div className="wvol-r" key={m}><span>{m}</span><WBar v={v} max={vMax} color="var(--violet)" /><span>{n3(Math.round(v))} kg</span></div>)}</div> : <div className="wempty">Sin volumen registrado.</div>}
        </WCard>
        <WCard className="s4" label="Constancia · 4 semanas">
          <div className="wadh">
            {W_DOWH.map(d => <span key={d} className="wadh-h">{d}</span>)}
            {cells.map(d => { const t = wToday(); t.setDate(t.getDate() - d); return <span key={d} className={'wadh-d' + (d < 0 ? ' fut' : '') + (trained.has(d) ? ' tr' : '') + (logged.has(d) ? ' lg' : '') + (d === 0 ? ' today' : '')} title={d >= 0 ? F.dia(d) : ''}>{t.getDate()}</span>; })}
          </div>
          <div className="wleg"><span><i style={{ background: 'var(--accent)' }} />{nT} {nT === 1 ? 'entreno' : 'entrenos'}</span><span><i style={{ background: 'var(--violet)', borderRadius: 5 }} />{nL} {nL === 1 ? 'día' : 'días'} con comidas</span></div>
        </WCard>
      </div>}
      {ask != null && <WConfirm title="¿Seguro que es correcto?" msg={`${S.kg(ask)} kg es más de 10 kg de diferencia con tu último registro (${S.kg(cur.v)} kg).`} onClose={() => setAsk(null)} actions={[{ lb: 'Guardar igualmente', kind: 'acc', on: () => add(ask) }, { lb: 'Corregir' }]} />}
      {det && <WSesDetail h={det} onClose={() => setDet(null)} />}
    </div>
  );
}

function WSesDetail({ h, onClose }) {
  const { s, set, setS, say } = useW(); const S = window.SERIE;
  const [ask, setAsk] = React.useState(false);
  const stats = [['Duración', wDur(h.dur)], ['Volumen', `${n3(h.vol)} kg`], ['Series', h.sets], h.km > 0 && ['Distancia', `${S.km(h.km)} km`]].filter(Boolean);
  const del = () => { const snap = s; set(n => { n.history = n.history.filter(x => x.id !== h.id); }); onClose(); say('Entreno eliminado', () => setS(snap)); };
  return (
    <>
      <WModal wide title={h.name} sub={window.D3.fmt.largaMes(wDaysAgo(h.t))} onClose={onClose} foot={<><button className="wb danger" onClick={() => setAsk(true)}><I3 n="trash" s={16} />Eliminar</button><span style={{ flex: 1 }} /><button className="wb acc" onClick={onClose}>Cerrar</button></>}>
        <div className="wsum-st">{stats.map(([l, v]) => <div key={l} className="wstat"><b>{v}</b><span>{l}</span></div>)}</div>
        {h.note && <div className="wnote-box">{h.note}</div>}
        <div className="wdet">
          {h.exercises.map(e => (
            <div key={e.name} className="wdet-e">
              <b>{e.name}</b>
              <ol>{e.sets.map((x, i) => { const st = x.type && x.type !== 'normal' ? window.D3.setTypes.find(t => t.k === x.type) : null; return <li key={i}><span className={st ? st.cls : ''}>{st ? st.ab : i + 1}</span>{S.fmt(x, e.mode || 'peso_reps')}</li>; })}</ol>
            </div>
          ))}
        </div>
      </WModal>
      {ask && <WConfirm title="¿Eliminar este entreno?" msg="Desaparecerá del historial y de tus estadísticas." onClose={() => setAsk(false)} actions={[{ lb: 'Eliminar', kind: 'danger', on: del }, { lb: 'Cancelar' }]} />}
    </>
  );
}

Object.assign(window, { WProgress, WSesDetail });

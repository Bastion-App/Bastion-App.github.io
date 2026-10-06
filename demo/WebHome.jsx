/* WebHome.jsx — Inicio (escritorio): actividad reciente a la izquierda, resumen del día y de la semana a la derecha. */
const wMuscleSplit = (h) => {
  const m = {};
  h.exercises.forEach(e => { const k = (wLibOf(e.name) || {}).m || 'Otros'; m[k] = (m[k] || 0) + e.sets.length; });
  const tot = Object.values(m).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ k, v, p: v / tot }));
};

function WHome({ go }) {
  const { s, set } = useW();
  const S = window.SERIE, F = window.D3.fmt;
  const [det, setDet] = React.useState(null);
  const start = (r) => { if (!s.session) set(n => { n.session = wNewSession(r); }); go('session'); };
  const day = s.days[wKey(0)];
  const tot = wSum(day ? day.meals.flatMap(m => m.items) : []);
  const P = s.profile, goal = +P.kcal || 0;
  const dow = (wToday().getDay() + 6) % 7;
  const week = Array.from({ length: 7 }, (_, i) => dow - i);
  const wk = s.history.filter(h => { const d = wDaysAgo(h.t); return d >= 0 && d <= dow; });
  const trained = new Set(s.history.map(h => wDaysAgo(h.t)));
  const wkVol = wk.reduce((a, h) => a + (h.vol || 0), 0), wkDur = wk.reduce((a, h) => a + (h.dur || 0), 0);
  const ws = [...s.weights].sort((a, b) => b.t - a.t), cur = ws[0];
  const wPts = s.weights.map(w => ({ d: wDaysAgo(w.t), v: w.v }));
  const w30 = wPts.filter(p => p.d <= 30).sort((a, b) => b.d - a.d), wd = w30.length > 1 ? w30[w30.length - 1].v - w30[0].v : 0;
  const last = s.history[0];
  const first = (s.user.name || '').split(' ')[0];
  return (
    <div className="wpage">
      <WPageHead title={`Hola, ${first}`} sub={F.largaMes(0)}
        actions={<><button className="wb" onClick={() => go('nutrition')}><I3 n="plus" s={16} />Añadir comida</button><button className="wb acc" onClick={() => start(null)}><I3 n="play" s={15} />{s.session ? 'Volver al entreno' : 'Empezar entreno'}</button></>} />
      <div className="wh-kpis">
        <WCard label="Calorías de hoy" action={<button className="wlink" onClick={() => go('nutrition')}>Diario</button>}>
          <div className="wh-kpi"><b>{n3(tot.k)}</b><span>/ {n3(goal)} kcal</span></div>
          <WBar v={tot.k} max={goal} color={tot.k > goal ? 'var(--danger)' : 'var(--accent)'} />
          <div className="wh-mm">{[['P', tot.p, P.macros.p, 'var(--blue)'], ['H', tot.c, P.macros.c, 'var(--amber)'], ['G', tot.g, P.macros.g, 'var(--purple)']].map(([l, v, g, c]) => <span key={l}><i style={{ background: c }} />{l} {v}/{g} g</span>)}</div>
        </WCard>
        <WCard label="Esta semana" action={<button className="wlink" onClick={() => go('workout', 'history')}>Historial</button>}>
          <div className="wh-kpi"><b>{wk.length}</b><span>{wk.length === 1 ? 'entreno' : 'entrenos'} · {wkDur ? wDur(wkDur) : '0 min'}</span></div>
          <div className="wh-week">
            {week.map((d, i) => <div key={i} className={'wh-wd' + (d < 0 ? ' fut' : '') + (trained.has(d) ? ' on' : '') + (d === 0 ? ' today' : '')} title={d >= 0 ? F.dia(d) : ''}><i>{trained.has(d) && <I3 n="check" s={12} w={2.6} />}</i><span>{['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}</span></div>)}
          </div>
          <div className="wh-mm"><span>{n3(Math.round(wkVol))} kg de volumen</span></div>
        </WCard>
        <WCard label="Peso" action={<button className="wlink" onClick={() => go('progress')}>Registrar</button>}>
          <div className="wh-kpi"><b>{cur ? S.kg(cur.v) : '—'}</b><span>kg</span></div>
          <div className="wh-spark"><WChart pts={wPts} days={30} h={52} spark /></div>
          <div className="wh-mm"><span>{w30.length > 1 ? `${wd > 0 ? '+' : wd < 0 ? '−' : ''}${S.kg(Math.abs(wd))} kg en 30 días · meta ${S.kg(s.weightGoal)} kg` : `Meta ${S.kg(s.weightGoal)} kg`}</span></div>
        </WCard>
      </div>
      <div className="wh-grid">
        <div className="wcol">
          <div className="wsec-t">Último entreno</div>
          {last ? (() => { const split = wMuscleSplit(last), recs = (last.records || []).length; return (
            <section className="wcard wfeed" onClick={() => setDet(last)}>
              <div className="wfeed-h">
                <div><b>{last.name}</b><span>{F.dia(wDaysAgo(last.t))}</span></div>
                <span className="wlink">Ver detalle</span>
              </div>
              <div className="wfeed-st">
                <div><span>Duración</span><b>{wDur(last.dur)}</b></div>
                {last.vol > 0 && <div><span>Volumen</span><b>{n3(last.vol)} kg</b></div>}
                {last.km > 0 && <div><span>Distancia</span><b>{S.km(last.km)} km</b></div>}
                <div><span>Series</span><b>{last.sets}</b></div>
                {recs > 0 && <div><span>Récords</span><b className="rec"><I3 n="trophy" s={15} />{recs}</b></div>}
              </div>
              <div className="wfeed-b">
                <ul className="wr-ex">
                  {last.exercises.slice(0, 5).map(e => <li key={e.name}><i>{e.sets.length} ×</i>{e.name}</li>)}
                  {last.exercises.length > 5 && <li className="more">+{last.exercises.length - 5} ejercicios más</li>}
                </ul>
                <div className="wsplit">{split.slice(0, 4).map(m => <div key={m.k} className="wsplit-r"><span>{m.k}</span><WBar v={m.p} max={1} color="var(--violet)" /><i>{Math.round(m.p * 100)} %</i></div>)}</div>
              </div>
            </section>); })() : <WCard><div className="wempty">Cuando termines tu primer entreno aparecerá aquí.</div></WCard>}
          {s.history.length > 1 && <>
            <div className="wsec-t">Anteriores <button className="wlink" onClick={() => go('workout', 'history')}>Ver todo el historial</button></div>
            <WCard className="flush">
              <div className="wtb">
                {s.history.slice(1, 5).map(h => (
                  <div className="wtb-r" key={h.id} onClick={() => setDet(h)}>
                    <span className="dim">{F.corta(wDaysAgo(h.t))}</span><span className="nm">{h.name}</span><span>{wDur(h.dur)}</span><span>{h.vol ? `${n3(h.vol)} kg` : h.km ? `${S.km(h.km)} km` : '—'}</span><span>{h.sets} series</span><span /><span className="chev"><I3 n="chev" s={16} /></span>
                  </div>
                ))}
              </div>
            </WCard>
          </>}
        </div>
        <div className="wcol">
          <div className="wsec-t">Empezar rápido</div>
          <WCard className="flush">
            <div className="wlist">
              {s.routines.slice(0, 5).map(r => (
                <div className="wli" key={r.id} onClick={() => start(r)}>
                  <div className="wli-b"><b>{r.name}</b><span>{wRoutMeta(r)}</span></div>
                  <span className="wqs"><I3 n="play" s={13} /></span>
                </div>
              ))}
            </div>
            <button className="wlink pad" onClick={() => go('workout', 'routines')}>Todas las rutinas ({s.routines.length})</button>
          </WCard>
        </div>
      </div>
      {det && <WSesDetail h={det} onClose={() => setDet(null)} />}
    </div>
  );
}

/* Ejercicios: biblioteca a la izquierda, ficha y progreso del ejercicio a la derecha */
function WExercises() {
  const { s } = useW();
  const S = window.SERIE, F = window.D3.fmt;
  const done = {};
  s.history.forEach(h => h.exercises.forEach(e => { (done[e.name] = done[e.name] || []).push({ h, e }); }));
  const all = [...W_LIB.map(e => e.n), ...Object.keys(done).filter(n => !wLibOf(n))];
  const [sel, setSel] = React.useState(() => Object.keys(done)[0] || all[0]);
  const [q, setQ] = React.useState('');
  const [mus, setMus] = React.useState(null);
  const [only, setOnly] = React.useState(false);
  const MUS = [...new Set(W_LIB.map(e => e.m))];
  const ql = q.trim().toLowerCase();
  const rows = all.filter(n => { const L = wLibOf(n); return (!ql || n.toLowerCase().includes(ql)) && (!mus || (L && L.m === mus)) && (!only || done[n]); });
  const L = wLibOf(sel), hist = done[sel] || [];
  const mode = (hist[0] && hist[0].e.mode) || (L && L.mode) || 'peso_reps';
  const isW = mode === 'peso_reps';
  const work = hist.flatMap(({ h, e }) => e.sets.filter(x => x.type !== 'cal' && +x.kg > 0).map(x => ({ x, h })));
  const best = work.length ? work.reduce((a, b) => w1rm(b.x) > w1rm(a.x) ? b : a) : null;
  const heavy = work.length ? work.reduce((a, b) => +b.x.kg > +a.x.kg ? b : a) : null;
  const pts = hist.map(({ h, e }) => { const w = e.sets.filter(x => x.type !== 'cal' && +x.kg > 0); return w.length ? { d: wDaysAgo(h.t), v: Math.round(Math.max(...w.map(w1rm)) * 10) / 10 } : null; }).filter(Boolean);
  const [range, setRange] = React.useState(90);
  return (
    <div className="wx-grid">
        <WCard className="wx-list">
          <div className="wform">
            <div className="wsrch"><I3 n="search" s={18} /><input placeholder="Buscar ejercicio" value={q} onChange={e => setQ(e.target.value)} /></div>
            <div className="wchips">
              <button className={'wchip' + (only ? ' on' : '')} onClick={() => setOnly(!only)}>Hechos por mí</button>
              {MUS.map(m => <button key={m} className={'wchip' + (mus === m ? ' on' : '')} onClick={() => setMus(mus === m ? null : m)}>{m}</button>)}
            </div>
          </div>
          <div className="wlist wx-scroll">
            {rows.length ? rows.map(n => { const l = wLibOf(n); return (
              <div key={n} className={'wli' + (n === sel ? ' sel' : '')} onClick={() => setSel(n)}>
                <div className="wli-b"><b>{n}</b><span>{l ? `${l.m} · ${l.eq}` : 'Personalizado'}</span></div>
                {done[n] && <span className="wli-s">{done[n].length}×</span>}
              </div>); }) : <div className="wempty">Sin resultados.</div>}
          </div>
        </WCard>
        <div className="wcol">
          <WCard>
            <div className="wx-h">
              <div className="wx-media"><I3 n="dumbbell" s={34} /></div>
              <div><h2>{sel}</h2><span>{[L && L.m, L && L.eq, S.modeOf(mode).lb].filter(Boolean).join(' · ')}</span></div>
            </div>
            <div className="wx-st">
              {isW && <div className="wstat"><b>{best ? `${n3(Math.round(w1rm(best.x)))} kg` : '—'}</b><span>1RM estimado</span></div>}
              {isW && <div className="wstat"><b>{heavy ? `${S.kg(heavy.x.kg)} kg` : '—'}</b><span>Peso máximo</span></div>}
              <div className="wstat"><b>{hist.length}</b><span>Veces realizado</span></div>
              <div className="wstat"><b>{hist.length ? F.corta(wDaysAgo(hist[0].h.t)) : '—'}</b><span>Última vez</span></div>
            </div>
          </WCard>
          {isW && (
            <WCard label="1RM estimado" action={<WSeg opts={[{ k: 30, lb: '1M' }, { k: 90, lb: '3M' }, { k: 180, lb: '6M' }]} v={range} on={setRange} />}>
              {pts.length ? <WChart pts={pts} days={range} h={220} /> : <div className="wempty">Aún no hay registros con peso de este ejercicio.</div>}
            </WCard>
          )}
          <WCard label="Historial">
            {hist.length ? (
              <div className="wx-hist">
                {hist.map(({ h, e }) => (
                  <div key={h.id} className="wx-hr">
                    <div className="wx-hd"><b>{F.larga(wDaysAgo(h.t))}</b><span>{h.name}</span></div>
                    <ol>{e.sets.map((x, i) => { const st = x.type && x.type !== 'normal' ? window.D3.setTypes.find(t => t.k === x.type) : null; return <li key={i}><span className={st ? st.cls : ''}>{st ? st.ab : i + 1}</span>{S.fmt(x, e.mode || 'peso_reps')}{best && best.x === x && <em>Mejor</em>}</li>; })}</ol>
                  </div>
                ))}
              </div>
            ) : <div className="wempty">Todavía no has hecho este ejercicio.</div>}
          </WCard>
        </div>
      </div>
  );
}

Object.assign(window, { WHome, WExercises, wMuscleSplit });

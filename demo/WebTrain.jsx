/* WebTrain.jsx — Entreno en escritorio: rutinas, editor, biblioteca, sesión activa y resumen. */
const W_LIB = [
  ['Press banca con barra', 'Pecho', 'Barra'], ['Press banca con mancuernas', 'Pecho', 'Mancuernas'], ['Press inclinado con mancuernas', 'Pecho', 'Mancuernas'], ['Aperturas en polea', 'Pecho', 'Polea'], ['Fondos en paralelas', 'Pecho', 'Peso corporal'],
  ['Press militar sentado', 'Hombro', 'Mancuernas'], ['Elevaciones laterales', 'Hombro', 'Mancuernas'], ['Face pull', 'Hombro', 'Polea'],
  ['Dominadas', 'Espalda', 'Peso corporal'], ['Remo con barra', 'Espalda', 'Barra'], ['Jalón al pecho', 'Espalda', 'Máquina'], ['Remo en polea baja', 'Espalda', 'Polea'], ['Remo con mancuerna', 'Espalda', 'Mancuernas'], ['Peso muerto', 'Espalda', 'Barra'],
  ['Curl con barra Z', 'Brazo', 'Barra'], ['Curl martillo', 'Brazo', 'Mancuernas'], ['Extensión de tríceps en polea', 'Brazo', 'Polea'], ['Press francés', 'Brazo', 'Barra'],
  ['Sentadilla trasera', 'Pierna', 'Barra'], ['Sentadilla goblet', 'Pierna', 'Mancuernas'], ['Prensa de pierna', 'Pierna', 'Máquina'], ['Peso muerto rumano', 'Pierna', 'Barra'], ['Extensión de cuádriceps', 'Pierna', 'Máquina'], ['Curl femoral tumbado', 'Pierna', 'Máquina'], ['Gemelo de pie', 'Pierna', 'Máquina'], ['Zancadas caminando', 'Pierna', 'Mancuernas'], ['Hip thrust', 'Pierna', 'Barra'],
  ['Plancha', 'Core', 'Peso corporal', 'peso_tiempo'], ['Plancha frontal', 'Core', 'Peso corporal', 'tiempo'], ['Rueda abdominal', 'Core', 'Peso corporal', 'reps'], ['Pallof press', 'Core', 'Polea'], ['Elevación de piernas colgado', 'Core', 'Peso corporal', 'reps'], ['Movilidad de cadera', 'Core', 'Peso corporal', 'tiempo'],
  ['Carrera suave', 'Cardio', 'Ninguno', 'tiempo_distancia'], ['Correr', 'Cardio', 'Ninguno', 'tiempo_distancia'], ['Bici estática', 'Cardio', 'Máquina', 'tiempo_distancia'], ['Remo ergómetro', 'Cardio', 'Máquina', 'tiempo_distancia'], ['Burpee', 'Cardio', 'Peso corporal', 'tiempo_reps'], ['Comba', 'Cardio', 'Ninguno', 'tiempo_reps'],
].map(([n, m, eq, mode = 'peso_reps']) => ({ n, m, eq, mode }));
const wLibOf = (n) => W_LIB.find(e => e.n === n);
const W_RESTS = [0, 15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 270, 300];
const wRoutMeta = (r) => { const n = r.exercises.length, k = r.exercises.reduce((a, e) => a + e.sets, 0); return `${n} ejercicio${n === 1 ? '' : 's'} · ${k} serie${k === 1 ? '' : 's'}`; };
const wBlank = (mode) => Object.fromEntries(window.SERIE.modeOf(mode).cols.map(c => [c, '']));
const wSesEx = (name, mode = 'peso_reps', n = 3, prev = []) => ({ id: wUid(), name, mode, sets: Array.from({ length: n }, (_, i) => ({ type: 'normal', done: false, ...wBlank(mode), prev: prev[i] || null })) });
const wNewSession = (r) => ({ id: wUid(), name: r ? r.name : 'Entreno libre', routineId: r ? r.id : null, start: Date.now(), note: '', restEnd: null, restTotal: 0, exercises: (r ? r.exercises : []).map(e => wSesEx(e.name, e.mode, e.sets, e.prev)) });
const wLastSets = (s, name) => { const h = s.history.find(h => h.exercises.some(e => e.name === name)); return h ? h.exercises.find(e => e.name === name).sets : []; };
const wBest = (e) => { const S = window.SERIE; if (e.mode === 'peso_reps') { const w = e.sets.filter(x => +x.kg > 0); if (w.length) return S.fmt(w.reduce((a, x) => w1rm(x) > w1rm(a) ? x : a), e.mode); } return S.fmt(e.sets[e.sets.length - 1], e.mode); };

function wBuildSummary(s) {
  const S = window.SERIE, ses = s.session;
  const exercises = ses.exercises.map(e => ({ name: e.name, mode: e.mode, sets: e.sets.filter(x => x.done && !S.isEmpty(x, e.mode)).map(x => { const o = { type: x.type }; S.modeOf(e.mode).cols.forEach(c => { o[c] = x[c] === '' ? '' : +x[c]; }); return o; }) })).filter(e => e.sets.length);
  const sets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const vol = Math.round(exercises.reduce((a, e) => a + e.sets.reduce((b, x) => b + S.vol(x, e.mode), 0), 0));
  const km = Math.round(exercises.reduce((a, e) => a + e.sets.reduce((b, x) => b + S.dist(x, e.mode), 0), 0) * 10) / 10;
  const records = [];
  exercises.forEach(e => {
    if (e.mode !== 'peso_reps') return;
    const work = e.sets.filter(x => x.type !== 'cal' && +x.kg > 0);
    if (!work.length) return;
    const best = work.reduce((a, x) => w1rm(x) > w1rm(a) ? x : a);
    const se = ses.exercises.find(z => z.name === e.name);
    const past = [...s.history.flatMap(h => h.exercises.filter(z => z.name === e.name).flatMap(z => z.sets.filter(x => x.type !== 'cal'))), ...(se ? se.sets.map(x => x.prev).filter(Boolean) : [])];
    const pb = Math.max(0, ...past.map(w1rm));
    if (pb > 0 && w1rm(best) > pb) records.push({ n: e.name, v: S.fmt(best, 'peso_reps') });
  });
  return { id: wUid(), name: ses.name.trim() || 'Entreno', t: Date.now(), dur: Math.floor((Date.now() - ses.start) / 1000), vol, km, sets, exercises, note: ses.note, routineId: ses.routineId, records };
}

function WWorkout({ go, sub }) {
  const { s, set, setS, say } = useW();
  const [tab, setTabS] = React.useState(() => sub || localStorage.getItem('bastion.web.wtab') || 'routines');
  React.useEffect(() => { if (sub) setTabS(sub); }, [sub]);
  const setTab = (k) => { setTabS(k); localStorage.setItem('bastion.web.wtab', k); };
  const [edit, setEdit] = React.useState(null);
  const [menu, setMenu] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null);
  useTick(!!s.session);
  const start = (r) => {
    if (s.session) { setConfirm({ title: 'Ya tienes un entreno en curso', msg: 'Termínalo o descártalo antes de empezar otro.', actions: [{ lb: 'Ir a la sesión', kind: 'acc', on: () => go('session') }, { lb: 'Cancelar' }] }); return; }
    set(n => { n.session = wNewSession(r); }); go('session');
  };
  const lastOf = (r) => { const h = s.history.find(h => h.name === r.name); return h ? window.D3.fmt.corta(wDaysAgo(h.t)) : 'nunca'; };
  return (
    <div className="wpage">
      <WPageHead title="Entreno" sub="Tus rutinas, el historial y la biblioteca de ejercicios" tab={tab} onTab={setTab}
        tabs={[{ k: 'routines', lb: 'Rutinas', n: s.routines.length }, { k: 'history', lb: 'Historial', n: s.history.length }, { k: 'exercises', lb: 'Ejercicios' }]}
        actions={<><button className="wb" onClick={() => start(null)}><I3 n="play" s={15} />Entreno vacío</button><button className="wb acc" onClick={() => setEdit('new')}><I3 n="plus" s={17} />Nueva rutina</button></>} />
      {tab === 'routines' && <>
      {s.session && (
        <button className="wlive" onClick={() => go('session')}>
          <span className="wdot" />
          <span className="wlive-b"><b>{s.session.name}</b><i>En curso · {wClock(Math.floor((Date.now() - s.session.start) / 1000))}</i></span>
          <span className="wb acc sm">Volver a la sesión</span>
        </button>
      )}
      {s.routines.length === 0 ? <WCard><div className="wempty">Crea tu primera rutina para empezar a entrenar con un plan.</div></WCard> : (
        <div className="wr-grid">
          {s.routines.map(r => (
            <section className="wcard wr" key={r.id}>
              <div className="wr-h">
                <div><b>{r.name}</b><span>{wRoutMeta(r)}</span></div>
                <div className="wmenu-w">
                  <button className="wic" onClick={() => setMenu(menu === r.id ? null : r.id)} aria-label="Acciones"><I3 n="more" s={18} /></button>
                  {menu === r.id && <WMenu onClose={() => setMenu(null)} items={[
                    { ic: 'pencil', lb: 'Editar', on: () => setEdit(r) },
                    { ic: 'copy', lb: 'Duplicar', on: () => set(n => { const i = n.routines.findIndex(x => x.id === r.id); n.routines.splice(i + 1, 0, { ...wClone(r), id: wUid(), name: r.name + ' (copia)' }); }) },
                    { ic: 'trash', lb: 'Eliminar', danger: true, on: () => { const snap = s; set(n => { n.routines = n.routines.filter(x => x.id !== r.id); }); say(`«${r.name}» eliminada`, () => setS(snap)); } },
                  ]} />}
                </div>
              </div>
              <ul className="wr-ex">
                {r.exercises.slice(0, 5).map((e, i) => <li key={i}><i>{e.sets} ×</i>{e.name}</li>)}
                {r.exercises.length > 5 && <li className="more">+{r.exercises.length - 5} más</li>}
              </ul>
              <div className="wr-f"><span>Última vez · {lastOf(r)}</span><button className="wb acc sm" onClick={() => start(r)}><I3 n="play" s={14} />Empezar</button></div>
            </section>
          ))}
        </div>
      )}
      </>}
      {tab === 'history' && <WHistory />}
      {tab === 'exercises' && <WExercises />}
      {edit && <WRoutineEditor routine={edit === 'new' ? null : edit} onClose={() => setEdit(null)} />}
      {confirm && <WConfirm {...confirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}

function WHistory() {
  const { s } = useW(); const S = window.SERIE, F = window.D3.fmt;
  const [det, setDet] = React.useState(null);
  const [q, setQ] = React.useState('');
  const ql = q.trim().toLowerCase();
  const rows = s.history.filter(h => !ql || h.name.toLowerCase().includes(ql) || h.exercises.some(e => e.name.toLowerCase().includes(ql)));
  return (
    <WCard>
      <div className="wtb-tools">
        <div className="wsrch"><I3 n="search" s={17} /><input placeholder="Buscar por entreno o ejercicio" value={q} onChange={e => setQ(e.target.value)} /></div>
        <span className="wnote">{rows.length} {rows.length === 1 ? 'entreno' : 'entrenos'}</span>
      </div>
      {rows.length ? (
        <div className="wtb" role="table">
          <div className="wtb-r head" role="row"><span>Fecha</span><span>Entreno</span><span>Duración</span><span>Volumen</span><span>Series</span><span>Récords</span><span /></div>
          {rows.map(h => (
            <div className="wtb-r" role="row" key={h.id} onClick={() => setDet(h)}>
              <span className="dim">{F.corta(wDaysAgo(h.t))}</span>
              <span className="nm">{h.name}</span>
              <span>{wDur(h.dur)}</span>
              <span>{h.vol ? `${n3(h.vol)} kg` : h.km ? `${S.km(h.km)} km` : '—'}</span>
              <span>{h.sets}</span>
              <span>{(h.records || []).length ? <b className="rec"><I3 n="trophy" s={14} />{h.records.length}</b> : '—'}</span>
              <span className="chev"><I3 n="chev" s={16} /></span>
            </div>
          ))}
        </div>
      ) : <div className="wempty">{ql ? `No hay entrenos que coincidan con «${q}».` : 'Tus entrenos terminados aparecerán aquí.'}</div>}
      {det && <WSesDetail h={det} onClose={() => setDet(null)} />}
    </WCard>
  );
}

function WRoutineEditor({ routine, onClose }) {
  const { set, say } = useW();
  const [init] = React.useState(() => routine ? wClone(routine) : { id: wUid(), name: '', exercises: [] });
  const [d, setD] = React.useState(() => wClone(init));
  const [lib, setLib] = React.useState(false);
  const [ask, setAsk] = React.useState(false);
  const dirty = JSON.stringify(d) !== JSON.stringify(init);
  const ch = (fn) => setD(p => { const n = wClone(p); fn(n); return n; });
  const close = () => dirty ? setAsk(true) : onClose();
  const save = () => {
    set(n => { const r = { ...d, name: d.name.trim() || 'Rutina sin nombre' }; const i = n.routines.findIndex(x => x.id === d.id); if (i >= 0) n.routines[i] = r; else n.routines.unshift(r); });
    say(routine ? 'Rutina guardada' : 'Rutina creada'); onClose();
  };
  const mv = (i, j) => ch(n => { const [x] = n.exercises.splice(i, 1); n.exercises.splice(j, 0, x); });
  return (
    <>
      <WModal wide title={routine ? 'Editar rutina' : 'Nueva rutina'} onClose={close}
        foot={<><button className="wb" onClick={close}>Cancelar</button><button className="wb acc" disabled={!d.exercises.length || !dirty} onClick={save}>Guardar</button></>}>
        <div className="wform">
          <label className="wfld"><span>Nombre</span><input autoFocus={!routine} value={d.name} placeholder="p. ej. Empuje · Pecho y hombro" onChange={e => ch(n => { n.name = e.target.value; })} /></label>
          <div className="wfld"><span>Ejercicios</span>
            {d.exercises.length === 0 ? <div className="wempty sm">Añade ejercicios desde la biblioteca.</div> : (
              <div className="wre-list">
                {d.exercises.map((e, i) => (
                  <div className="wre" key={i}>
                    <div className="wre-mv"><button className="wic xs" disabled={i === 0} onClick={() => mv(i, i - 1)} aria-label="Subir"><I3 n="chevU" s={14} /></button><button className="wic xs" disabled={i === d.exercises.length - 1} onClick={() => mv(i, i + 1)} aria-label="Bajar"><I3 n="chevD" s={14} /></button></div>
                    <div className="wre-b"><b>{e.name}</b>
                      <select value={e.mode} onChange={ev => ch(n => { n.exercises[i].mode = ev.target.value; n.exercises[i].prev = []; })}>{window.SERIE.modes.map(m => <option key={m.k} value={m.k}>{m.lb}</option>)}</select>
                    </div>
                    <div className="wstep"><button onClick={() => ch(n => { n.exercises[i].sets = Math.max(1, e.sets - 1); })} aria-label="Menos series"><I3 n="minus" s={14} /></button><span>{e.sets} {e.sets === 1 ? 'serie' : 'series'}</span><button onClick={() => ch(n => { n.exercises[i].sets = Math.min(12, e.sets + 1); })} aria-label="Más series"><I3 n="plus" s={14} /></button></div>
                    <button className="wic sm" onClick={() => ch(n => { n.exercises.splice(i, 1); })} aria-label="Quitar"><I3 n="trash" s={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="wb" onClick={() => setLib(true)}><I3 n="plus" s={17} />Añadir ejercicios</button>
        </div>
      </WModal>
      {lib && <WLibrary onClose={() => setLib(false)} onPick={names => ch(n => { names.forEach(nm => n.exercises.push({ name: nm, mode: (wLibOf(nm) || {}).mode || 'peso_reps', sets: 3, prev: [] })); })} />}
      {ask && <WConfirm title="¿Descartar los cambios?" msg="Has hecho cambios en la rutina que no se han guardado." onClose={() => setAsk(false)}
        actions={[...(d.exercises.length ? [{ lb: 'Guardar', kind: 'acc', on: save }] : []), { lb: 'Descartar', kind: 'danger', on: onClose }, { lb: 'Seguir editando' }]} />}
    </>
  );
}

function WLibrary({ onPick, onClose }) {
  const [q, setQ] = React.useState('');
  const [mus, setMus] = React.useState(null);
  const [eq, setEq] = React.useState(null);
  const [sel, setSel] = React.useState([]);
  const MUS = [...new Set(W_LIB.map(e => e.m))], EQ = [...new Set(W_LIB.map(e => e.eq))];
  const ql = q.trim().toLowerCase();
  const rows = W_LIB.filter(e => (!mus || e.m === mus) && (!eq || e.eq === eq) && (!ql || e.n.toLowerCase().includes(ql)));
  const tog = (n) => setSel(sel.includes(n) ? sel.filter(x => x !== n) : [...sel, n]);
  return (
    <WModal wide title="Biblioteca de ejercicios" onClose={onClose}
      foot={<><span className="wnote" style={{ flex: 1 }}>{sel.length ? `${sel.length} seleccionado${sel.length === 1 ? '' : 's'}` : 'Selecciona uno o varios'}</span><button className="wb" onClick={onClose}>Cancelar</button><button className="wb acc" disabled={!sel.length} onClick={() => { onPick(sel); onClose(); }}>Añadir{sel.length ? ` (${sel.length})` : ''}</button></>}>
      <div className="wform">
        <div className="wsrch"><I3 n="search" s={18} /><input autoFocus placeholder="Buscar ejercicio" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="wchips"><button className={'wchip' + (!mus ? ' on' : '')} onClick={() => setMus(null)}>Todos los músculos</button>{MUS.map(m => <button key={m} className={'wchip' + (mus === m ? ' on' : '')} onClick={() => setMus(mus === m ? null : m)}>{m}</button>)}</div>
        <div className="wchips"><button className={'wchip' + (!eq ? ' on' : '')} onClick={() => setEq(null)}>Todo el material</button>{EQ.map(m => <button key={m} className={'wchip' + (eq === m ? ' on' : '')} onClick={() => setEq(eq === m ? null : m)}>{m}</button>)}</div>
        <div className="wlist">
          {rows.length ? rows.map(e => (
            <div key={e.n} className="wli" onClick={() => tog(e.n)}>
              <span className={'wck' + (sel.includes(e.n) ? ' on' : '')}><I3 n="check" s={14} w={2.6} /></span>
              <div className="wli-b"><b>{e.n}</b><span>{e.m} · {e.eq} · {window.SERIE.modeOf(e.mode).lb}</span></div>
            </div>
          )) : <div className="wempty">No hay ejercicios con esos filtros.</div>}
        </div>
      </div>
    </WModal>
  );
}

function WSession({ go, onFinish }) {
  const { s, set, say } = useW();
  const [lib, setLib] = React.useState(false);
  const [ask, setAsk] = React.useState(null);
  const [info, setInfo] = React.useState(null);
  const [menu, setMenu] = React.useState(null);
  useTick(true, 500);
  const ses = s.session, S = window.SERIE;
  if (!ses) return (
    <div className="wpage">
      <header className="whead"><h1>Sesión</h1></header>
      <WCard><div className="wempty">No hay ningún entreno en curso.</div><div className="wrow" style={{ justifyContent: 'center' }}><button className="wb tint" onClick={() => go('workout')}>Ir a Entreno</button></div></WCard>
    </div>
  );
  const up = (fn) => set(n => { if (n.session) fn(n.session); });
  const el = Math.floor((Date.now() - ses.start) / 1000);
  const done = ses.exercises.flatMap(e => e.sets.filter(x => x.done).map(x => ({ x, e })));
  const vol = done.reduce((a, { x, e }) => a + S.vol(x, e.mode), 0);
  const toggle = (ei, si) => {
    const e = ses.exercises[ei], x = e.sets[si];
    if (!x.done && S.isEmpty(x, e.mode) && (!x.prev || S.isEmpty(x.prev, e.mode))) { say('Rellena la serie antes de marcarla'); return; }
    up(z => {
      const y = z.exercises[ei].sets[si];
      if (y.done) { y.done = false; return; }
      if (S.isEmpty(y, e.mode) && y.prev) S.modeOf(e.mode).cols.forEach(c => { if (!S.has(y[c])) y[c] = y.prev[c]; });
      y.done = true;
      if (s.rest > 0) { z.restEnd = Date.now() + s.rest * 1000; z.restTotal = s.rest; }
    });
  };
  const restLeft = ses.restEnd ? Math.max(0, Math.ceil((ses.restEnd - Date.now()) / 1000)) : 0;
  const finish = () => done.length ? onFinish() : setAsk('empty');
  const discard = () => { set(n => { n.session = null; }); go('workout'); say('Entreno descartado'); };
  return (
    <div className="wpage">
      <header className="whead">
        <div className="wses-t">
          <input className="wses-name" value={ses.name} onChange={e => up(z => { z.name = e.target.value; })} aria-label="Nombre del entreno" />
          <span><I3 n="clock" s={15} />{wClock(el)} · {done.length} {done.length === 1 ? 'serie' : 'series'} · {n3(Math.round(vol))} kg</span>
        </div>
        <label className="wsel">Descanso<select value={s.rest} onChange={e => set(n => { n.rest = +e.target.value; })}>{W_RESTS.map(r => <option key={r} value={r}>{r ? S.mmss(r) : 'Sin descanso'}</option>)}</select></label>
        <button className="wb danger" onClick={() => setAsk('discard')}>Descartar</button>
        <button className="wb acc" onClick={finish}><I3 n="check" s={17} w={2.4} />Terminar</button>
      </header>
      <div className="wses-list">
        {ses.exercises.length === 0 && <WCard><div className="wempty">Añade el primer ejercicio para empezar a registrar.</div></WCard>}
        {ses.exercises.map((e, ei) => {
          const M = S.modeOf(e.mode); let num = 0;
          const tpl = { gridTemplateColumns: `48px minmax(80px,1fr) repeat(${M.cols.length}, minmax(72px,120px)) 44px 28px` };
          return (
            <section className="wcard wse" key={e.id}>
              <div className="wse-h">
                <button className="wse-n" onClick={() => setInfo(e.name)}>{e.name}</button>
                <span className="wse-m">{M.lb}</span>
                <div className="wmenu-w">
                  <button className="wic" onClick={() => setMenu(menu === e.id ? null : e.id)} aria-label="Acciones"><I3 n="more" s={18} /></button>
                  {menu === e.id && <WMenu onClose={() => setMenu(null)} items={[
                    ei > 0 && { ic: 'chevU', lb: 'Subir', on: () => up(z => { const [x] = z.exercises.splice(ei, 1); z.exercises.splice(ei - 1, 0, x); }) },
                    ei < ses.exercises.length - 1 && { ic: 'chevD', lb: 'Bajar', on: () => up(z => { const [x] = z.exercises.splice(ei, 1); z.exercises.splice(ei + 1, 0, x); }) },
                    { ic: 'clipboard', lb: 'Ver historial', on: () => setInfo(e.name) },
                    { ic: 'trash', lb: 'Quitar ejercicio', danger: true, on: () => up(z => { z.exercises.splice(ei, 1); }) },
                  ].filter(Boolean)} />}
                </div>
              </div>
              <div className="wst head" style={tpl}><span>SERIE</span><span>ANTERIOR</span>{M.cols.map(c => <span key={c}>{S.colLb[c]}</span>)}<span><I3 n="check" s={14} /></span><span /></div>
              {e.sets.map((x, si) => {
                const st = window.D3.setTypes.find(t => t.k === x.type) || window.D3.setTypes[0];
                if (x.type === 'normal') num++;
                return (
                  <div key={si} className={'wst' + (x.done ? ' done' : '')} style={tpl}>
                    <button className={'wst-ty ' + st.cls} title={`${st.lb} · clic para cambiar el tipo`} onClick={() => up(z => { const o = ['normal', 'cal', 'drop', 'fallo'], y = z.exercises[ei].sets[si]; y.type = o[(o.indexOf(y.type) + 1) % 4]; })}>{x.type === 'normal' ? num : st.ab}</button>
                    <button className="wst-prev" disabled={!x.prev} title={x.prev ? 'Usar estos valores' : ''} onClick={() => up(z => { const y = z.exercises[ei].sets[si]; M.cols.forEach(c => { y[c] = x.prev[c] == null ? '' : x.prev[c]; }); })}>{S.prev(x.prev, e.mode)}</button>
                    {M.cols.map(c => <SetField3 key={c + si + e.mode} col={c} value={x[c]} className="wsx" onChange={v => up(z => { z.exercises[ei].sets[si][c] = v; })} />)}
                    <button className={'wst-ck' + (x.done ? ' on' : '')} onClick={() => toggle(ei, si)} aria-label="Completar serie"><I3 n="check" s={17} w={2.4} /></button>
                    <button className="wic xs hov" onClick={() => up(z => { z.exercises[ei].sets.splice(si, 1); })} aria-label="Quitar serie"><I3 n="x" s={14} /></button>
                  </div>
                );
              })}
              <button className="wb ghost sm" onClick={() => up(z => { const E = z.exercises[ei]; E.sets.push({ type: 'normal', done: false, ...wBlank(E.mode), prev: null }); })}><I3 n="plus" s={15} />Añadir serie</button>
            </section>
          );
        })}
        <button className="wb" onClick={() => setLib(true)}><I3 n="plus" s={17} />Añadir ejercicio</button>
        <WCard label="Notas">
          <textarea className="wnotes" placeholder="Cómo te has sentido, molestias, ajustes para la próxima…" value={ses.note} onChange={e => up(z => { z.note = e.target.value; })} />
        </WCard>
      </div>
      {restLeft > 0 && (
        <div className="wrest">
          <div className="wrest-b">
            <div><span>Descanso</span><b>{S.mmss(restLeft)}</b></div>
            <WBar v={restLeft} max={ses.restTotal || s.rest} />
          </div>
          <button className="wb sm" onClick={() => up(z => { z.restEnd = Math.max(Date.now() + 1000, z.restEnd - 15000); })}>−15 s</button>
          <button className="wb sm" onClick={() => up(z => { z.restEnd += 15000; z.restTotal += 15; })}>+15 s</button>
          <button className="wb tint sm" onClick={() => up(z => { z.restEnd = null; })}>Saltar</button>
        </div>
      )}
      {lib && <WLibrary onClose={() => setLib(false)} onPick={names => up(z => { names.forEach(nm => { const m = (wLibOf(nm) || {}).mode || 'peso_reps'; z.exercises.push(wSesEx(nm, m, 3, wLastSets(s, nm))); }); })} />}
      {info && <WExInfo name={info} onClose={() => setInfo(null)} />}
      {ask === 'discard' && <WConfirm title="¿Descartar este entreno?" msg="Se perderán todas las series registradas en esta sesión." onClose={() => setAsk(null)} actions={[{ lb: 'Descartar entreno', kind: 'danger', on: discard }, { lb: 'Seguir entrenando' }]} />}
      {ask === 'empty' && <WConfirm title="No has completado ninguna serie" msg="Marca al menos una serie para guardar el entreno." onClose={() => setAsk(null)} actions={[{ lb: 'Seguir entrenando', kind: 'acc' }, { lb: 'Descartar entreno', kind: 'danger', on: discard }]} />}
    </div>
  );
}

function WExInfo({ name, onClose }) {
  const { s } = useW(); const S = window.SERIE; const L = wLibOf(name);
  const hist = s.history.filter(h => h.exercises.some(e => e.name === name)).map(h => ({ h, e: h.exercises.find(e => e.name === name) }));
  const mode = (hist[0] && hist[0].e.mode) || (L && L.mode) || 'peso_reps';
  const pts = mode === 'peso_reps' ? hist.map(({ h, e }) => { const w = e.sets.filter(x => x.type !== 'cal' && +x.kg > 0); return w.length ? { d: wDaysAgo(h.t), v: Math.round(Math.max(...w.map(w1rm)) * 10) / 10 } : null; }).filter(Boolean) : [];
  const span = Math.max(30, ...pts.map(p => p.d + 2));
  return (
    <WModal wide title={name} sub={[L && L.m, L && L.eq, S.modeOf(mode).lb].filter(Boolean).join(' · ')} onClose={onClose}>
      {mode === 'peso_reps' && <>
        <div className="wsec-t sm first">1RM estimado</div>
        {pts.length ? <WChart pts={pts} days={span} h={190} /> : <div className="wempty sm">Aún no hay registros con peso.</div>}
      </>}
      <div className={'wsec-t sm' + (mode === 'peso_reps' ? '' : ' first')}>Historial</div>
      {hist.length ? (
        <div className="wlist">{hist.slice(0, 8).map(({ h, e }) => (
          <div className="wli static" key={h.id}><div className="wli-b"><b>{window.D3.fmt.larga(wDaysAgo(h.t))}</b><span>{e.sets.map(x => S.fmt(x, e.mode)).join(' · ')}</span></div></div>
        ))}</div>
      ) : <div className="wempty sm">Todavía no has hecho este ejercicio.</div>}
    </WModal>
  );
}

function WSummary({ sum, onClose }) {
  const { say } = useW(); const S = window.SERIE;
  const stats = [['Duración', wDur(sum.dur)], ['Volumen', `${n3(sum.vol)} kg`], ['Series', sum.sets], sum.km > 0 && ['Distancia', `${S.km(sum.km)} km`]].filter(Boolean);
  const text = [`${sum.name} · ${window.D3.fmt.largaMes(0)}`, stats.map(([l, v]) => `${l}: ${v}`).join(' · '), '', ...sum.exercises.map(e => `${e.name}: ${e.sets.map(x => S.fmt(x, e.mode)).join(', ')}`), ...(sum.records.length ? ['', ...sum.records.map(r => `Nuevo récord · ${r.n}: ${r.v}`)] : []), '', 'Registrado con Bastion'].join('\n');
  const copy = () => { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => say('Resumen copiado'), () => say('No se pudo copiar')); };
  return (
    <WModal title="Entreno completado" sub={`${sum.name} · ${window.D3.fmt.largaMes(0)}`} onClose={onClose}
      foot={<><button className="wb" onClick={copy}><I3 n="copy" s={16} />Copiar resumen</button><button className="wb acc" onClick={onClose}>Hecho</button></>}>
      <div className="wsum-st">{stats.map(([l, v]) => <div key={l} className="wstat"><b>{v}</b><span>{l}</span></div>)}</div>
      {sum.records.length > 0 && <div className="wsum-rec">{sum.records.map(r => <div key={r.n}><span className="wtro"><I3 n="trophy" s={18} /></span><div><b>Nuevo récord · {r.n}</b><span>{r.v}</span></div></div>)}</div>}
      <div className="wlist">{sum.exercises.map(e => <div className="wli static" key={e.name}><div className="wli-b"><b>{e.name}</b><span>{e.sets.length} {e.sets.length === 1 ? 'serie' : 'series'}</span></div><span className="wli-s">{wBest(e)}</span></div>)}</div>
    </WModal>
  );
}

Object.assign(window, { WHistory, W_LIB, wLibOf, wRoutMeta, wNewSession, wSesEx, wBlank, wBuildSummary, WWorkout, WRoutineEditor, WLibrary, WSession, WExInfo, WSummary });

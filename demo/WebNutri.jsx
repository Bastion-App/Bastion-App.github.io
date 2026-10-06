/* WebNutri.jsx — Nutrición en escritorio: resumen del día, comidas, agua y panel «Añadir alimento». */
const W_MCOL = { P: 'var(--blue)', C: 'var(--amber)', G: 'var(--purple)' };
const W_MK = { P: 'p', C: 'c', G: 'g' };
const W_WATER_GOAL = 2500, W_WATER_STEP = 250;
const wEmptyDay = () => ({ meals: window.D3.nutrition.meals.map(m => ({ key: m.key, name: m.name, items: [] })), water: 0 });
const wBaseOf = (s, it) => wFoodOf(s, it.n) || (() => { const f = it.u === 'ud' ? it.q : it.q / 100 || 1; return { n: it.n, u: it.u, k: it.k / f, p: it.p / f, c: it.c / f, g: it.g / f }; })();

function WNutrition() {
  const { s, set, setS, say } = useW();
  const [off, setOff] = React.useState(0);
  const [adding, setAdding] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const key = wKey(off);
  const day = s.days[key] || wEmptyDay();
  const upd = (fn) => set(n => { if (!n.days[key]) n.days[key] = wEmptyDay(); fn(n.days[key], n); });
  const tot = wSum(day.meals.flatMap(m => m.items));
  const P = s.profile, goal = +P.kcal || 0, left = goal - tot.k;
  const fl = (v) => (v / 1000).toLocaleString('es-ES', { maximumFractionDigits: 2 });
  const meal = adding && day.meals.find(m => m.key === adding);
  const ed = editing && day.meals.find(m => m.key === editing.meal).items[editing.idx];
  return (
    <div className="wpage">
      <WPageHead title="Nutrición" sub="Diario de comidas, macros y agua" actions={
        <div className="wdate">
          <button className="wic" onClick={() => setOff(off + 1)} aria-label="Día anterior"><I3 n="chevL" s={18} /></button>
          <span>{window.D3.fmt.dia(off)}</span>
          <button className="wic" disabled={off === 0} onClick={() => setOff(off - 1)} aria-label="Día siguiente"><I3 n="chev" s={18} /></button>
        </div>} />
      <section className="wcard wn-sum">
        <div className="wn-sum-k">
          <WRing v={tot.k} max={goal} size={124} sw={10} color={left < 0 ? 'var(--danger)' : 'var(--accent)'}><b className="sm">{n3(Math.abs(left))}</b><span>{left < 0 ? 'kcal de más' : 'restantes'}</span></WRing>
          <dl><div><dt>Objetivo</dt><dd>{n3(goal)} kcal</dd></div><div><dt>Consumidas</dt><dd>{n3(tot.k)} kcal</dd></div></dl>
        </div>
        <div className="wn-sum-m">
          {window.D3.nutrition.macros.map(m => {
            const v = tot[W_MK[m.k]], g = +P.macros[W_MK[m.k]] || 0;
            return <div key={m.k}><div className="wn-m-t"><span>{m.name}</span><span><b>{v}</b> / {g} g</span></div><WBar v={v} max={g} color={W_MCOL[m.k]} /></div>;
          })}
        </div>
        <div className="wn-sum-w">
          <div className="wn-m-t"><span>Agua</span><span><b>{fl(day.water)}</b> / {fl(W_WATER_GOAL)} L</span></div>
          <div className="wn-water">
            {Array.from({ length: W_WATER_GOAL / W_WATER_STEP }, (_, i) => (
              <button key={i} className={'wn-glass' + (i < day.water / W_WATER_STEP ? ' on' : '')} title={`${(i + 1) * W_WATER_STEP} ml`}
                onClick={() => upd(d => { d.water = d.water === (i + 1) * W_WATER_STEP ? i * W_WATER_STEP : (i + 1) * W_WATER_STEP; })}><I3 n="drop" s={15} /></button>
            ))}
          </div>
          <div className="wrow sm">
            <button className="wb sm" disabled={!day.water} onClick={() => upd(d => { d.water = Math.max(0, d.water - W_WATER_STEP); })}><I3 n="minus" s={14} />250 ml</button>
            <button className="wb tint sm" onClick={() => upd(d => { d.water += W_WATER_STEP; })}><I3 n="plus" s={14} />250 ml</button>
          </div>
        </div>
      </section>
      <div className="wn-diary">
        <div className="wcol">
          {day.meals.map(m => {
            const t = wSum(m.items);
            const yd = s.days[wKey(off + 1)], ym = yd && yd.meals.find(x => x.key === m.key);
            const canCopy = !m.items.length && ym && ym.items.length;
            return (
              <WCard key={m.key} label={m.name} action={<div className="wrow sm">{canCopy ? <button className="wb ghost sm" onClick={() => { upd(d => { d.meals.find(x => x.key === m.key).items.push(...wClone(ym.items)); }); say(`${m.name} copiada del día anterior`); }}><I3 n="copy" s={15} />Copiar del día anterior</button> : null}<button className="wb tint sm" onClick={() => setAdding(m.key)}><I3 n="plus" s={16} />Añadir</button></div>}>
                {m.items.length === 0 ? <div className="wempty sm">Sin alimentos todavía.</div> : (
                  <div className="wnt">
                    <div className="wnt-r head"><span>Alimento</span><span>Cantidad</span><span>Kcal</span><span>Prot.</span><span>Hidr.</span><span>Grasa</span><span /></div>
                    {m.items.map((it, i) => (
                      <div key={i} className="wnt-r it" onClick={() => setEditing({ meal: m.key, idx: i })}>
                        <span className="wnt-n">{it.n}</span><span>{n3(it.q)} {it.u}</span><span className="k">{n3(it.k)}</span><span>{it.p}</span><span>{it.c}</span><span>{it.g}</span>
                        <button className="wic xs hov" aria-label="Eliminar" onClick={e => { e.stopPropagation(); const snap = s; upd(d => { d.meals.find(x => x.key === m.key).items.splice(i, 1); }); say(`${it.n} eliminado`, () => setS(snap)); }}><I3 n="trash" s={15} /></button>
                      </div>
                    ))}
                    <div className="wnt-r sub"><span>Total {m.name.toLowerCase()}</span><span /><span className="k">{n3(t.k)}</span><span>{t.p}</span><span>{t.c}</span><span>{t.g}</span><span /></div>
                  </div>
                )}
              </WCard>
            );
          })}
          <WCard label="Totales del día">
            <div className="wnt">
              <div className="wnt-r head"><span /><span /><span>Kcal</span><span>Prot.</span><span>Hidr.</span><span>Grasa</span><span /></div>
              <div className="wnt-r sub"><span>Total</span><span /><span className="k">{n3(tot.k)}</span><span>{tot.p}</span><span>{tot.c}</span><span>{tot.g}</span><span /></div>
              <div className="wnt-r"><span className="dim">Objetivo diario</span><span /><span>{n3(goal)}</span><span>{P.macros.p}</span><span>{P.macros.c}</span><span>{P.macros.g}</span><span /></div>
              <div className="wnt-r rem"><span>Restante</span><span />{[[goal, tot.k], [P.macros.p, tot.p], [P.macros.c, tot.c], [P.macros.g, tot.g]].map(([g, v], i) => { const r = (+g || 0) - v; return <span key={i} className={r < 0 ? 'neg' : 'pos'}>{n3(r)}</span>; })}<span /></div>
            </div>
          </WCard>
        </div>
      </div>
      {meal && <WAddFood meal={meal} onClose={() => setAdding(null)} onAdd={(items) => upd((d, n) => {
        d.meals.find(x => x.key === adding).items.push(...items);
        items.forEach(it => { n.recientes = [{ n: it.n, q: it.q, u: it.u }, ...n.recientes.filter(r => r.n !== it.n)].slice(0, 10); });
      })} />}
      {ed && <WEditItem item={ed} onClose={() => setEditing(null)}
        onSave={(q) => { upd(d => { const arr = d.meals.find(x => x.key === editing.meal).items; arr[editing.idx] = wItem(wBaseOf(s, ed), q); }); setEditing(null); say('Cantidad actualizada'); }}
        onDelete={() => { const snap = s; upd(d => { d.meals.find(x => x.key === editing.meal).items.splice(editing.idx, 1); }); setEditing(null); say(`${ed.n} eliminado`, () => setS(snap)); }} />}
    </div>
  );
}

const WMacroPreview = ({ it }) => (
  <div className="wn-prev">
    {[['kcal', it.k, 'var(--text)'], ['Proteína', it.p + ' g', 'var(--blue)'], ['Hidratos', it.c + ' g', 'var(--amber)'], ['Grasas', it.g + ' g', 'var(--purple)']].map(([l, v, c]) => (
      <div key={l} className="wstat"><b style={{ color: c }}>{typeof v === 'number' ? n3(v) : v}</b><span>{l}</span></div>
    ))}
  </div>
);

const WQtyField = ({ food, q, setQ }) => {
  const chips = food.u === 'ud' ? [1, 2, 3] : [50, 100, 150, 200];
  return (
    <>
      <label className="wfld"><span>Cantidad</span><div className="win"><input autoFocus type="number" min="0" step={food.u === 'ud' ? 1 : 5} value={q} onChange={e => setQ(e.target.value)} /><i>{food.u}</i></div></label>
      <div className="wchips">{chips.map(c => <button key={c} className={'wchip' + (+q === c ? ' on' : '')} onClick={() => setQ(String(c))}>{c} {food.u}</button>)}</div>
    </>
  );
};

function WEditItem({ item, onClose, onSave, onDelete }) {
  const { s } = useW();
  const food = wBaseOf(s, item);
  const [q, setQ] = React.useState(String(item.q));
  const ok = +q > 0;
  return (
    <WModal title={item.n} sub={`Por ${food.u === 'ud' ? '1 ud' : '100 ' + food.u}: ${Math.round(food.k)} kcal`} onClose={onClose}
      foot={<><button className="wb danger" onClick={onDelete}><I3 n="trash" s={16} />Eliminar</button><span style={{ flex: 1 }} /><button className="wb" onClick={onClose}>Cancelar</button><button className="wb acc" disabled={!ok} onClick={() => onSave(+q)}>Guardar</button></>}>
      <div className="wform">
        <WQtyField food={food} q={q} setQ={setQ} />
        <WMacroPreview it={wItem(food, ok ? +q : 0)} />
      </div>
    </WModal>
  );
}

function WAddFood({ meal, onClose, onAdd }) {
  const { s, set, say } = useW();
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('rec');
  const [pick, setPick] = React.useState(null);
  const [creating, setCreating] = React.useState(false);
  const ql = q.trim().toLowerCase();
  const add = (items) => { onAdd(items); say(items.length > 1 ? `${items.length} alimentos añadidos a ${meal.name}` : `${items[0].n} añadido a ${meal.name}`); };
  let rows = [];
  if (ql) rows = s.foods.filter(f => f.n.toLowerCase().includes(ql) || (f.brand || '').toLowerCase().includes(ql)).map(f => ({ f }));
  else if (tab === 'rec') rows = s.recientes.map(r => ({ f: wFoodOf(s, r.n), q: r.q })).filter(r => r.f);
  else if (tab === 'mine') rows = s.foods.filter(f => f.mine).map(f => ({ f }));
  else if (tab === 'all') rows = s.foods.map(f => ({ f }));
  const back = (pick || creating) ? () => { setPick(null); setCreating(false); } : null;
  return (
    <WDrawer title={pick ? pick.food.n : creating ? 'Crear alimento' : `Añadir a ${meal.name}`} onClose={onClose} onBack={back}>
      {pick ? <WPickQty pick={pick} meal={meal} onAdd={(it) => { add([it]); setPick(null); }} />
        : creating ? <WNewFood initial={q} onSave={(f) => { set(n => { n.foods.unshift(f); }); setCreating(false); setPick({ food: f, q: f.u === 'ud' ? 1 : 100 }); say('Alimento creado'); }} />
          : <>
            <div className="wsrch"><I3 n="search" s={18} /><input autoFocus placeholder="Buscar alimento o marca" value={q} onChange={e => setQ(e.target.value)} />{q && <button className="wic sm" onClick={() => setQ('')} aria-label="Borrar"><I3 n="x" s={14} /></button>}</div>
            {!ql && <WSeg opts={[{ k: 'rec', lb: 'Recientes' }, { k: 'mine', lb: 'Mis alimentos' }, { k: 'meals', lb: 'Mis comidas' }, { k: 'all', lb: 'Todos' }]} v={tab} on={setTab} />}
            <div className="wlist wdr-list">
              {!ql && tab === 'meals' ? s.misComidas.map(c => {
                const items = c.items.map(i => { const f = wFoodOf(s, i.n); return f && wItem(f, i.q); }).filter(Boolean);
                return (
                  <div key={c.n} className="wli" onClick={() => { add(items); onClose(); }}>
                    <div className="wli-b"><b>{c.n}</b><span>{items.map(i => i.n).join(' · ')}</span></div>
                    <span className="wli-v">{n3(wSum(items).k)}<i>kcal</i></span>
                    <span className="wic sm"><I3 n="plus" s={16} /></span>
                  </div>
                );
              }) : rows.length ? rows.map(r => (
                <div key={r.f.n} className="wli" onClick={() => setPick({ food: r.f, q: r.q || (r.f.u === 'ud' ? 1 : 100) })}>
                  <div className="wli-b"><b>{r.f.n}</b><span>{[r.f.brand, r.q ? `${r.q} ${r.f.u}` : `por ${r.f.u === 'ud' ? '1 ud' : '100 ' + r.f.u}`].filter(Boolean).join(' · ')}</span></div>
                  <span className="wli-v">{n3(r.q ? wItem(r.f, r.q).k : r.f.k)}<i>kcal</i></span>
                  <span className="wic sm"><I3 n="chev" s={16} /></span>
                </div>
              )) : <div className="wempty">{ql ? `No hay resultados para «${q}».` : 'Todavía no hay nada aquí.'}</div>}
            </div>
            <button className="wb" onClick={() => setCreating(true)}><I3 n="create" s={17} />Crear alimento</button>
          </>}
    </WDrawer>
  );
}

function WPickQty({ pick, meal, onAdd }) {
  const f = pick.food;
  const [q, setQ] = React.useState(String(pick.q));
  const ok = +q > 0;
  return (
    <>
      <div className="wnote">{[f.brand, `Por ${f.u === 'ud' ? '1 ud' : '100 ' + f.u}: ${f.k} kcal · P ${f.p} · H ${f.c} · G ${f.g}`].filter(Boolean).join(' · ')}</div>
      <WQtyField food={f} q={q} setQ={setQ} />
      <WMacroPreview it={wItem(f, ok ? +q : 0)} />
      <button className="wb acc" disabled={!ok} onClick={() => onAdd(wItem(f, +q))}>Añadir a {meal.name}</button>
    </>
  );
}

function WNewFood({ initial, onSave }) {
  const [f, setF] = React.useState({ n: initial ? initial.charAt(0).toUpperCase() + initial.slice(1) : '', brand: '', u: 'g', k: '', p: '', c: '', g: '' });
  const ch = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.n.trim() && +f.k >= 0 && f.k !== '';
  const per = f.u === 'ud' ? '1 ud' : '100 ' + f.u;
  return (
    <>
      <label className="wfld"><span>Nombre</span><input autoFocus value={f.n} onChange={ch('n')} placeholder="p. ej. Tortilla de patatas" /></label>
      <label className="wfld"><span>Marca (opcional)</span><input value={f.brand} onChange={ch('brand')} /></label>
      <div className="wfld"><span>Unidad</span><WSeg opts={[{ k: 'g', lb: 'Gramos' }, { k: 'ml', lb: 'Mililitros' }, { k: 'ud', lb: 'Unidades' }]} v={f.u} on={u => setF({ ...f, u })} /></div>
      <div className="wgrid2">
        <label className="wfld"><span>Calorías por {per}</span><div className="win"><input type="number" min="0" value={f.k} onChange={ch('k')} /><i>kcal</i></div></label>
        <label className="wfld"><span>Proteína</span><div className="win"><input type="number" min="0" value={f.p} onChange={ch('p')} /><i>g</i></div></label>
        <label className="wfld"><span>Hidratos</span><div className="win"><input type="number" min="0" value={f.c} onChange={ch('c')} /><i>g</i></div></label>
        <label className="wfld"><span>Grasas</span><div className="win"><input type="number" min="0" value={f.g} onChange={ch('g')} /><i>g</i></div></label>
      </div>
      <button className="wb acc" disabled={!ok} onClick={() => onSave({ n: f.n.trim(), brand: f.brand.trim(), u: f.u, k: +f.k || 0, p: +f.p || 0, c: +f.c || 0, g: +f.g || 0, mine: true })}>Guardar alimento</button>
    </>
  );
}

Object.assign(window, { WNutrition });

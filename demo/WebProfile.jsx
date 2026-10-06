/* WebProfile.jsx — Perfil y ajustes en escritorio. Todo se aplica con «Guardar cambios», salvo el tema. */
const W_ACT = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muy: 1.9 };
const W_ADJ = { subir: 300, recomp: 0, bajar: -400 };
const wCalc = (P) => {
  const bmr = 10 * (+P.peso || 0) + 6.25 * (+P.altura || 0) - 5 * (+P.edad || 0) + (P.sexo === 'h' ? 5 : -161);
  const kcal = Math.round((bmr * (W_ACT[P.actividad] || 1.4) + (W_ADJ[P.meta] || 0)) / 10) * 10;
  const p = Math.round((+P.peso || 0) * 1.9), g = Math.round(kcal * .3 / 9), c = Math.max(0, Math.round((kcal - p * 4 - g * 9) / 4));
  return { kcal, macros: { p, c, g } };
};
const W_NOTIF = [
  { k: 'entreno', lb: 'Recordatorio de entreno', d: 'Un aviso los días que sueles entrenar' },
  { k: 'descanso', lb: 'Fin del descanso', d: 'Sonido y aviso cuando termina el descanso' },
  { k: 'comidas', lb: 'Registrar comidas', d: 'Si a mediodía no has apuntado nada' },
  { k: 'pesaje', lb: 'Pesaje semanal', d: 'Los lunes por la mañana' },
];

function WProfile({ guard }) {
  const { s, set, setS, say } = useW();
  const base = { user: s.user, profile: s.profile };
  const [d, setD] = React.useState(() => wClone(base));
  const [ask, setAsk] = React.useState(false);
  const [perm, setPerm] = React.useState(window.Notification ? Notification.permission : 'unsupported');
  const fileRef = React.useRef(null);
  const dirty = JSON.stringify(d) !== JSON.stringify(base);
  guard.current = dirty;
  React.useEffect(() => () => { guard.current = false; }, []);
  const ch = (fn) => setD(p => { const n = wClone(p); fn(n); return n; });
  const P = d.profile, O = window.D3.profile;
  const num = (k) => (e) => { const v = e.target.value; ch(n => { n.profile[k] = v === '' ? '' : +v; }); };
  const save = () => { set(n => { n.user = d.user; n.profile = d.profile; if (+d.profile.pesoMeta) n.weightGoal = +d.profile.pesoMeta; }); say('Cambios guardados'); };
  const exp = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }));
    a.download = `bastion-copia-${wKey(0)}.json`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000); say('Copia descargada');
  };
  const imp = (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    f.text().then(t => { const o = JSON.parse(t); if (o.v !== 1 || !o.profile || !o.routines) throw 0; setS(o); setD(wClone({ user: o.user, profile: o.profile })); say('Copia restaurada'); }).catch(() => say('El archivo no es una copia válida de Bastion'));
  };
  const resetAll = () => { const f = wSeed(); f.theme = s.theme; setS(f); setD(wClone({ user: f.user, profile: f.profile })); say('Datos de ejemplo restablecidos'); };
  const mk = (+P.macros.p || 0) * 4 + (+P.macros.c || 0) * 4 + (+P.macros.g || 0) * 9;
  return (
    <div className="wpage">
      <WPageHead title="Perfil y ajustes" sub={`${d.user.name} · ${d.user.email}`} />
      <div className="wpf-grid">
        <div className="wcol">
          <WCard label="Cuenta">
            <div className="wform">
              <label className="wfld"><span>Nombre</span><input value={d.user.name} onChange={e => ch(n => { n.user.name = e.target.value; })} /></label>
              <label className="wfld"><span>Correo</span><input type="email" value={d.user.email} onChange={e => ch(n => { n.user.email = e.target.value; })} /></label>
            </div>
          </WCard>
          <WCard label="Datos personales">
            <div className="wform">
              <div className="wfld"><span>Sexo</span><WSeg opts={[{ k: 'h', lb: 'Hombre' }, { k: 'm', lb: 'Mujer' }]} v={P.sexo} on={v => ch(n => { n.profile.sexo = v; })} /></div>
              <div className="wgrid3">
                <label className="wfld"><span>Edad</span><div className="win"><input type="number" min="12" max="100" value={P.edad} onChange={num('edad')} /><i>años</i></div></label>
                <label className="wfld"><span>Altura</span><div className="win"><input type="number" min="100" max="230" value={P.altura} onChange={num('altura')} /><i>cm</i></div></label>
                <label className="wfld"><span>Peso actual</span><div className="win"><input type="number" step="0.1" value={P.peso} onChange={num('peso')} /><i>kg</i></div></label>
              </div>
            </div>
          </WCard>
          <WCard label="Objetivo">
            <div className="wform">
              <div className="wradio">{O.metas.map(m => <button key={m.k} className={P.meta === m.k ? 'on' : ''} onClick={() => ch(n => { n.profile.meta = m.k; })}><i /><div><b>{m.lb}</b><span>{m.d}</span></div></button>)}</div>
              <div className="wgrid2">
                <label className="wfld"><span>Peso meta</span><div className="win"><input type="number" step="0.1" value={P.pesoMeta} onChange={num('pesoMeta')} /><i>kg</i></div></label>
                <label className="wfld"><span>Actividad</span><select value={P.actividad} onChange={e => ch(n => { n.profile.actividad = e.target.value; })}>{O.actividades.map(a => <option key={a.k} value={a.k}>{a.lb} · {a.d}</option>)}</select></label>
              </div>
            </div>
          </WCard>
        </div>
        <div className="wcol">
          <WCard label="Nutrición" action={<button className="wb ghost sm" onClick={() => ch(n => { const r = wCalc(n.profile); n.profile.kcal = r.kcal; n.profile.macros = r.macros; })}><I3 n="refresh" s={15} />Recalcular con mis datos</button>}>
            <div className="wform">
              <label className="wfld"><span>Calorías diarias</span><div className="win"><input type="number" step="10" value={P.kcal} onChange={num('kcal')} /><i>kcal</i></div></label>
              <div className="wgrid3">
                {[['p', 'Proteína'], ['c', 'Hidratos'], ['g', 'Grasas']].map(([k, lb]) => <label key={k} className="wfld"><span>{lb}</span><div className="win"><input type="number" value={P.macros[k]} onChange={e => { const v = e.target.value; ch(n => { n.profile.macros[k] = v === '' ? '' : +v; }); }} /><i>g</i></div></label>)}
              </div>
              <div className="wnote">Los macros suman {n3(mk)} kcal{Math.abs(mk - (+P.kcal || 0)) > 50 ? ` · ${n3(Math.abs(mk - (+P.kcal || 0)))} kcal de diferencia con tu objetivo` : ''}.</div>
            </div>
          </WCard>
          <WCard label="Apariencia">
            <div className="wfld"><span>Tema</span><WSeg opts={[{ k: 'dark', lb: 'Oscuro' }, { k: 'light', lb: 'Claro' }]} v={s.theme} on={v => set(n => { n.theme = v; })} /></div>
          </WCard>
          <WCard label="Notificaciones">
            <div className="wform">
              {W_NOTIF.map(t => (
                <div className="wtog-r" key={t.k}>
                  <div><b>{t.lb}</b><span>{t.d}</span></div>
                  <button className={'wtog' + (P.notif && P.notif[t.k] ? ' on' : '')} role="switch" aria-checked={!!(P.notif && P.notif[t.k])} aria-label={t.lb} onClick={() => ch(n => { n.profile.notif = n.profile.notif || {}; n.profile.notif[t.k] = !n.profile.notif[t.k]; })} />
                </div>
              ))}
              {perm === 'default' && <button className="wb tint" onClick={() => Notification.requestPermission().then(setPerm)}><I3 n="bell" s={16} />Permitir avisos del navegador</button>}
              {perm === 'denied' && <div className="wnote">Los avisos están bloqueados en este navegador. Puedes activarlos desde la configuración del sitio.</div>}
              {perm === 'granted' && <div className="wnote">Avisos del navegador activados.</div>}
            </div>
          </WCard>
          <WCard label="Datos y copia">
            <div className="wform">
              <div className="wnote">Tus datos se guardan en este navegador. Descarga una copia para pasarlos a otro ordenador.</div>
              <div className="wrow">
                <button className="wb" onClick={exp}><I3 n="download" s={16} />Exportar copia</button>
                <button className="wb" onClick={() => fileRef.current.click()}><I3 n="upload" s={16} />Importar copia</button>
                <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={imp} />
              </div>
              <button className="wb danger" onClick={() => setAsk(true)}>Restablecer datos de ejemplo</button>
              <div className="wnote">{window.D3.labels.version} · Web</div>
            </div>
          </WCard>
        </div>
      </div>
      {dirty && (
        <div className="wsave">
          <span>Tienes cambios sin guardar</span>
          <button className="wb sm" onClick={() => setD(wClone(base))}>Descartar</button>
          <button className="wb acc sm" onClick={save}>Guardar cambios</button>
        </div>
      )}
      {ask && <WConfirm title="¿Restablecer todos los datos?" msg="Se borrarán tus comidas, pesajes, rutinas y entrenos de este navegador y se cargarán los de ejemplo." onClose={() => setAsk(false)} actions={[{ lb: 'Restablecer', kind: 'danger', on: resetAll }, { lb: 'Cancelar' }]} />}
    </div>
  );
}

Object.assign(window, { WProfile });

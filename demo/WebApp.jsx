/* WebApp.jsx — Bastion Web: barra lateral, navegación entre secciones y avisos de descanso. */
const W_NAV = [
  { k: 'home', ic: 'grid', lb: 'Inicio' },
  { k: 'workout', ic: 'dumbbell', lb: 'Entreno' },
  { k: 'nutrition', ic: 'fork', lb: 'Nutrición' },
  { k: 'progress', ic: 'chart', lb: 'Progreso' },
];

function WApp() {
  const { s, set, say } = useW();
  const [page, setPage] = React.useState(() => localStorage.getItem('bastion.web.page') || 'home');
  const [summary, setSummary] = React.useState(null);
  const [leave, setLeave] = React.useState(null);
  const [sub, setSub] = React.useState(null);
  const guard = React.useRef(false);
  const ses = s.session;
  useTick(!!ses, 500);
  React.useEffect(() => { localStorage.setItem('bastion.web.page', page); window.scrollTo(0, 0); }, [page]);
  React.useEffect(() => { document.body.style.background = WEB_T[s.theme].bg; document.documentElement.style.colorScheme = s.theme; }, [s.theme]);
  React.useEffect(() => {
    if (!ses || !ses.restEnd || Date.now() < ses.restEnd) return;
    set(n => { if (n.session) n.session.restEnd = null; });
    if (s.profile.notif && s.profile.notif.descanso) {
      wBeep();
      if (document.hidden && window.Notification && Notification.permission === 'granted') new Notification('Bastion', { body: 'Descanso terminado. A por la siguiente serie.' });
    }
    say('Descanso terminado');
  });
  React.useEffect(() => { document.title = ses ? `${wClock(Math.floor((Date.now() - ses.start) / 1000))} · ${ses.name} — Bastion` : 'Bastion'; });
  const go = (p, tab) => { setSub(tab ? { tab, k: Date.now() } : null); if (p === page) return; if (guard.current) { setLeave(p); return; } setPage(p === 'exercises' ? 'workout' : p); if (p === 'exercises') setSub({ tab: 'exercises', k: Date.now() }); };
  const finish = () => {
    const sum = wBuildSummary(s);
    set(n => {
      n.history.unshift(sum);
      const r = n.routines.find(r => r.id === sum.routineId);
      if (r) r.exercises.forEach(e => { const z = sum.exercises.find(x => x.name === e.name); if (z) e.prev = z.sets.map(({ type, ...v }) => v); });
      n.session = null;
    });
    setSummary(sum); setPage('workout');
  };
  const restLeft = ses && ses.restEnd ? Math.max(0, Math.ceil((ses.restEnd - Date.now()) / 1000)) : 0;
  return (
    <div className={'wapp t-' + s.theme} style={webVars(s.theme)}>
      <header className="wside">
        <div className="wbrand">BASTION</div>
        {W_NAV.map(t => <button key={t.k} className={'wnav' + (page === t.k ? ' on' : '')} onClick={() => go(t.k)} title={t.lb}><I3 n={t.ic} s={21} /><span className="wnl">{t.lb}</span></button>)}
        {ses && (
          <button className={'wnav live' + (page === 'session' ? ' on' : '')} onClick={() => go('session')} title="Sesión en curso">
            <span className="wdot" />
            <span className="wnl wlive-b"><b>{ses.name}</b><i>{restLeft ? `Descanso ${window.SERIE.mmss(restLeft)}` : wClock(Math.floor((Date.now() - ses.start) / 1000))}</i></span>
          </button>
        )}
        <div className="wside-sp" />
        <button className="wnav wtheme" onClick={() => set(n => { n.theme = n.theme === 'dark' ? 'light' : 'dark'; })} title={s.theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} aria-label="Cambiar tema"><I3 n={s.theme === 'dark' ? 'sun' : 'moon'} s={19} /></button>
        <button className={'wnav wme' + (page === 'profile' ? ' on' : '')} onClick={() => go('profile')} title="Perfil y ajustes">
          <span className="wav">{wInit(s.user.name)}</span>
          <span className="wnl wlive-b"><b>{s.user.name}</b><i>Perfil y ajustes</i></span>
        </button>
      </header>
      <main className="wmain">
        {page === 'home' && <WHome go={go} />}
        {page === 'nutrition' && <WNutrition />}
        {(page === 'workout' || page === 'exercises') && <WWorkout go={go} sub={sub && sub.tab} key={sub ? sub.k : 'w'} />}
        {page === 'session' && <WSession go={go} onFinish={finish} />}
        {page === 'progress' && <WProgress />}
        {page === 'profile' && <WProfile guard={guard} />}
      </main>
      {/* bastionfit.app: Ayuda y Privacidad llevan a las páginas reales de la web */}
      <footer className="wfoot"><div className="wfoot-in"><b>BASTION</b><nav><a href="#" onClick={e => { e.preventDefault(); go('profile'); }}>Ajustes</a><a href="/soporte.html">Ayuda</a><a href="/privacidad.html">Privacidad</a><a href="#" onClick={e => e.preventDefault()}>Términos</a></nav><span>{window.D3.labels.version} · Web</span></div></footer>
      {summary && <WSummary sum={summary} onClose={() => setSummary(null)} />}
      {leave && <WConfirm title="Tienes cambios sin guardar" msg="Si sales ahora, se perderán los cambios del perfil." onClose={() => setLeave(null)} actions={[{ lb: 'Salir sin guardar', kind: 'danger', on: () => { guard.current = false; setPage(leave); } }, { lb: 'Seguir editando' }]} />}
      <WToast />
    </div>
  );
}

/* bastionfit.app: se abre la web directamente (en Claude Design había además una vista «monitor») */
ReactDOM.createRoot(document.getElementById('root')).render(<WProvider><WApp /></WProvider>);

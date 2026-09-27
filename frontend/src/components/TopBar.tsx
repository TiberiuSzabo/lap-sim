import './TopBar.css'

const LINKS = [
  { href: '#masini', label: 'Mașinile' },
  { href: '#aderenta', label: 'Aderența' },
  { href: '#configurator', label: 'Configurator' },
]

export function TopBar() {
  return (
    <header className="topbar dark">
      <p className="topbar__notice">
        <strong>Demo</strong> · Proiect de portofoliu, neafiliat cu Porsche AG
      </p>
      <div className="topbar__bar">
        <a href="#top" className="topbar__wordmark">
          Lap Sim
        </a>
        <nav aria-label="Principal">
          <ul className="topbar__links">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

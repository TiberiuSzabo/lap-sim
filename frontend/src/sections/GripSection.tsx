import { SectionHeader } from '../components/SectionHeader'
import './GripSection.css'

// Numbers come from `python -m app` on the Cluj Test Ring.
const PILLARS = [
  {
    title: 'Cauciucul',
    text: 'Pe pistă udă, cauciucul de ploaie e cu 26 de secunde mai rapid decât slick-ul.',
  },
  {
    title: 'Condiția pistei',
    text: 'Pe ud, chiar cu cele mai bune cauciucuri, turul e cu peste 13 secunde mai lent decât pe uscat.',
  },
  {
    title: 'Downforce',
    text: 'Aripa apasă mașina pe asfalt. Cu cât merge mai repede, cu atât virajul ține mai bine.',
  },
  {
    title: 'Puterea',
    text: 'Taycan-ul e cu 860 kg mai greu, dar cei 580 kW îl aduc la două sutimi de GT3 pe uscat.',
  },
]

export function GripSection() {
  return (
    <section id="aderenta" className="section" aria-labelledby="aderenta-title">
      <div className="container">
        <SectionHeader id="aderenta-title" eyebrow="Fizica" title="De ce contează" accent="aderența.">
          Modelul tratează mașina ca un punct pe traseu. Patru lucruri decid cât de repede ajunge la
          linia de sosire.
        </SectionHeader>

        <ol className="pillars">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.title} className="pillar">
              <span className="pillar__number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="pillar__title">{pillar.title}</h3>
              <p className="pillar__text">{pillar.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

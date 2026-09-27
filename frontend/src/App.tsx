import { useEffect, useState } from 'react'
import { getCars, type Car } from './api'
import { Footer } from './components/Footer'
import { TopBar } from './components/TopBar'
import { CarsSection } from './sections/CarsSection'
import { Configurator } from './sections/Configurator'
import { GripSection } from './sections/GripSection'
import { Hero } from './sections/Hero'

function App() {
  // Loaded here, not in CarsSection, because the configurator will need the same list.
  const [cars, setCars] = useState<Car[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCars()
      .then(setCars)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <>
      <a href="#continut" className="skip-link">
        Sari la conținut
      </a>
      <TopBar />
      <main id="continut">
        <Hero />
        <CarsSection cars={cars} error={error} />
        <GripSection />
        <div className="kerb" aria-hidden="true" />
        <Configurator cars={cars} />
      </main>
      <Footer />
    </>
  )
}

export default App

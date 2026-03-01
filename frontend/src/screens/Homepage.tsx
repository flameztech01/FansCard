import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import Packages from "../components/Packages"
import HowItWorks from "../components/HowItWorks"
import Support from '../components/Support';

const Homepage = () => {
  return (
    <div>
      <Navbar />
      <section id="home">
        <Hero />
      </section>
      <section>
        <Packages />
      </section>

      <section>
        <HowItWorks />
      </section>

      <section>
        <Support />
      </section>
    </div>
  )
}

export default Homepage

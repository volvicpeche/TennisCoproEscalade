import './App.css'
import Calendar from './components/Calendar'

export default function App() {
  return (
    <div className="app-container">
      <h1>Réservations</h1>
      <p>
        Les créneaux apparaissent en orange tant qu&rsquo;ils ne sont pas validés.
        Utilisez les flèches pour naviguer entre les semaines ; une flèche est
        désactivée lorsqu&rsquo;aucune autre semaine n&rsquo;est disponible.
      </p>
      <Calendar />
    </div>
  )
}

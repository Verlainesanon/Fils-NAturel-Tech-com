'use client'

import { useEffect, useRef, useState } from 'react'

type MessageChat = { id: string; auteur: string; nomAuteur?: string; corps: string; creeLe: string }

export default function Chat() {
  const [ouvert, setOuvert] = useState(false)
  const [messages, setMessages] = useState<MessageChat[]>([])
  const [brouillon, setBrouillon] = useState('')
  const [nom, setNom] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const filRef = useRef<HTMLDivElement>(null)

  // Sondage : uniquement quand le panneau est ouvert, pour ne rien consommer
  // en arrière-plan.
  useEffect(() => {
    if (!ouvert) return
    let actif = true

    const charger = async () => {
      try {
        const reponse = await fetch('/api/chat', { cache: 'no-store' })
        const donnees = await reponse.json()
        if (actif && Array.isArray(donnees.messages)) setMessages(donnees.messages)
      } catch {
        // hors ligne : on réessaiera au prochain tour
      }
    }

    charger()
    const minuterie = setInterval(charger, 5000)
    return () => {
      actif = false
      clearInterval(minuterie)
    }
  }, [ouvert])

  useEffect(() => {
    filRef.current?.scrollTo({ top: filRef.current.scrollHeight })
  }, [messages])

  const envoyer = async (evenement: React.FormEvent) => {
    evenement.preventDefault()
    const corps = brouillon.trim()
    if (!corps || envoi) return

    setEnvoi(true)
    setBrouillon('')
    try {
      const reponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ corps, nom }),
      })
      const donnees = await reponse.json()
      if (donnees.message) setMessages((liste) => [...liste, donnees.message])
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <>
      <button
        className="bulle-chat"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-label={ouvert ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {ouvert ? '×' : 'Chat'}
      </button>

      {ouvert && (
        <section className="panneau-chat panneau" aria-label="Chat avec l’équipe">
          <header className="chat-entete">
            <span className="surtitre">Support</span>
            <p className="mono">Réponse le jour même, sans inscription.</p>
          </header>

          <div className="chat-fil" ref={filRef}>
            {messages.length === 0 && (
              <p className="mono chat-vide">Posez votre question : quelqu’un de l’équipe la lira.</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`chat-message ${m.auteur === 'client' ? 'de-moi' : 'de-equipe'}`}>
                {m.auteur === 'admin' && <span className="mono">{m.nomAuteur}</span>}
                <p>{m.corps}</p>
              </div>
            ))}
          </div>

          <form className="chat-forme" onSubmit={envoyer}>
            {messages.length === 0 && (
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Votre prénom (facultatif)"
                aria-label="Votre prénom"
              />
            )}
            <div className="chat-envoi">
              <input
                value={brouillon}
                onChange={(e) => setBrouillon(e.target.value)}
                placeholder="Votre message"
                aria-label="Votre message"
              />
              <button className="bouton" type="submit" disabled={envoi || !brouillon.trim()}>
                Envoyer
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  )
}

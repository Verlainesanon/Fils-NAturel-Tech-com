'use client'

/**
 * Page affichée quand une erreur serveur remonte jusqu'à la vitrine. Elle nomme
 * les causes réelles au lieu du message générique de Next.js : en production,
 * c'est presque toujours la base de données qui n'est pas joignable.
 */
export default function Erreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="sec">
      <div className="wrap" style={{ maxWidth: '46rem' }}>
        <span className="eyebrow">Erreur</span>
        <h1 className="sec-titre">Le site n’a pas pu afficher cette page</h1>

        <p className="lede">
          Dans la quasi-totalité des cas, la base de données n’est pas joignable. Trois choses à
          vérifier dans cet ordre, côté hébergeur :
        </p>

        <ol className="lede" style={{ lineHeight: 1.9, maxWidth: '54ch' }}>
          <li>
            La variable <code>DATABASE_URL</code> est bien définie sur le service web, et pointe sur
            la base PostgreSQL.
          </li>
          <li>
            Les tables ont été créées : <code>npx prisma migrate deploy</code>.
          </li>
          <li>
            Les données de départ ont été chargées : <code>npm run db:seed</code>.
          </li>
        </ol>

        <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-solid" onClick={reset}>
            Réessayer
          </button>
          <a className="lien-souligne" href="/">
            Retour à l’accueil
          </a>
        </div>

        {error.digest && (
          <p className="mono" style={{ marginTop: '1.5rem' }}>
            Référence technique : {error.digest}
          </p>
        )}
      </div>
    </main>
  )
}

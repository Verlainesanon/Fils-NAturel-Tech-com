import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { formaterDateHeure } from '@/lib/format'
import { repondreConversation, changerStatutConversation } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Messages' }

export default async function Messages({ searchParams }: { searchParams: { c?: string } }) {
  const conversations = await prisma.conversation.findMany({
    orderBy: { majLe: 'desc' },
    take: 60,
    include: {
      messages: { orderBy: { creeLe: 'desc' }, take: 1 },
      _count: { select: { messages: { where: { auteur: 'client', luParAdmin: false } } } },
    },
  })

  const idActif = searchParams.c ?? conversations[0]?.id
  const active = idActif
    ? await prisma.conversation.findUnique({
        where: { id: idActif },
        include: { messages: { orderBy: { creeLe: 'asc' } }, client: true },
      })
    : null

  // Ouvrir une conversation vaut lecture : la pastille du menu se met à jour.
  if (active) {
    await prisma.message.updateMany({
      where: { conversationId: active.id, auteur: 'client', luParAdmin: false },
      data: { luParAdmin: true },
    })
  }

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Messages</h1>
          <p>Chat de la boutique et demandes de contact, dans un seul fil.</p>
        </div>
      </header>

      <div className="grille-messagerie">
        <div className="liste-conversations">
          {conversations.length === 0 && (
            <p className="doux" style={{ padding: '1rem' }}>
              Aucune conversation pour l’instant.
            </p>
          )}
          {conversations.map((c) => (
            <a
              key={c.id}
              href={`/admin/messages?c=${c.id}`}
              className={`item-conversation ${c.id === idActif ? 'actif' : ''}`}
            >
              <strong>
                {c.nomVisiteur}
                {c._count.messages > 0 && <span className="admin-pastille"> {c._count.messages} </span>}
              </strong>
              <span className="mono">{formaterDateHeure(c.majLe)}</span>
              <p className="doux" style={{ margin: '0.3rem 0 0', fontSize: '0.85rem' }}>
                {c.messages[0]?.corps.slice(0, 60) ?? 'Conversation vide'}
              </p>
              <span className={`etat etat-${c.statut}`}>{c.statut}</span>
            </a>
          ))}
        </div>

        {active ? (
          <div>
            <div className="admin-entete" style={{ marginBottom: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.15rem' }}>{active.nomVisiteur}</h1>
                <p>
                  {active.client ? active.client.email : (active.emailVisiteur ?? 'visiteur sans compte')}
                  {active.assigneA ? ` · suivi par ${active.assigneA}` : ''}
                </p>
              </div>
              <div className="admin-actions">
                {['ouvert', 'en_attente', 'resolu'].map((statut) => (
                  <FormulaireAdmin
                    key={statut}
                    action={changerStatutConversation.bind(null, active.id, statut)}
                    className="ligne-action"
                  >
                    <button className="bouton-mini" type="submit" disabled={active.statut === statut}>
                      {statut === 'ouvert' ? 'Rouvrir' : statut === 'en_attente' ? 'En attente' : 'Résolu'}
                    </button>
                  </FormulaireAdmin>
                ))}
              </div>
            </div>

            <div className="fil-admin">
              {active.messages.map((m) => (
                <div key={m.id} className={`chat-message ${m.auteur === 'admin' ? 'de-moi' : 'de-equipe'}`}>
                  <span className="mono">
                    {m.nomAuteur} · {formaterDateHeure(m.creeLe)}
                  </span>
                  <p>{m.corps}</p>
                </div>
              ))}
            </div>

            <FormulaireAdmin action={repondreConversation} className="admin-formulaire" >
              <input type="hidden" name="conversationId" value={active.id} />
              <div className="champ large">
                <label htmlFor="corps">Votre réponse</label>
                <textarea id="corps" name="corps" rows={3} required />
              </div>
              <div className="pied-formulaire">
                <button className="bouton" type="submit">
                  Envoyer
                </button>
              </div>
            </FormulaireAdmin>
          </div>
        ) : (
          <p className="vide">Sélectionnez une conversation pour la lire.</p>
        )}
      </div>
    </>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { lireDevises, deviseDeBase } from '@/lib/devises'
import { formaterPrix, formaterDateHeure } from '@/lib/format'
import { changerStatutCommande, changerPaiementCommande, noterCommande } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'

export const metadata: Metadata = { title: 'Détail de commande' }

export default async function DetailCommande({ params }: { params: { id: string } }) {
  const commande = await prisma.order.findUnique({
    where: { id: params.id },
    include: { lignes: true, evenements: { orderBy: { creeLe: 'desc' } }, client: true, promo: true },
  })
  if (!commande) notFound()
  const symbole = deviseDeBase(await lireDevises()).symbole

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>{commande.numero}</h1>
          <p>
            Reçue le {formaterDateHeure(commande.creeLe)} ·{' '}
            {commande.client ? (
              <Link href={`/admin/clients/${commande.client.id}`} className="or">
                {commande.nomContact}
              </Link>
            ) : (
              commande.nomContact
            )}
          </p>
        </div>
        <Link className="btn btn-line" href="/admin/commandes">
          Retour à la liste
        </Link>
      </header>

      <div className="deux-colonnes">
        <div>
          <div className="cadre-tableau">
            <table className="admin-tableau">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Prix unitaire</th>
                  <th>Quantité</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {commande.lignes.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {l.produitId ? (
                        <Link href={`/admin/produits/${l.produitId}`}>{l.nomProduit}</Link>
                      ) : (
                        l.nomProduit
                      )}
                      <br />
                      <span className="mono">{l.referenceProduit ?? ''}</span>
                    </td>
                    <td>{formaterPrix(l.prixCentimes, symbole)}</td>
                    <td>{l.quantite}</td>
                    <td>
                      <strong>{formaterPrix(l.prixCentimes * l.quantite, symbole)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-formulaire" style={{ marginTop: '1.2rem' }}>
            <h2>Montants</h2>
            <div className="large">
              <div className="ligne-resume">
                <span>Sous-total</span>
                <span>{formaterPrix(commande.sousTotalCentimes, symbole)}</span>
              </div>
              {commande.remiseCentimes > 0 && (
                <div className="ligne-resume or">
                  <span>Remise {commande.promo ? `(${commande.promo.code})` : ''}</span>
                  <span>−{formaterPrix(commande.remiseCentimes, symbole)}</span>
                </div>
              )}
              <div className="ligne-resume">
                <span>Livraison</span>
                <span>{formaterPrix(commande.livraisonCentimes, symbole)}</span>
              </div>
              <div className="ligne-resume total">
                <span>Total</span>
                <span>{formaterPrix(commande.totalCentimes, symbole)}</span>
              </div>
            </div>

            <h2>Livraison</h2>
            <p className="large lede" style={{ margin: 0 }}>
              {commande.nomContact}
              <br />
              {commande.adresseTexte}
              <br />
              {commande.villeLivraison}
              <br />
              {commande.emailContact}
              {commande.telContact ? ` · ${commande.telContact}` : ''}
            </p>
          </div>
        </div>

        <div>
          {/* Les gestes courants sont des boutons : le sélecteur ne sert qu'aux
              cas particuliers, on ne devrait pas avoir à le chercher. */}
          <div className="admin-formulaire">
            <h2>Où en est cette commande</h2>
            <p className="large lede" style={{ margin: 0 }}>
              État actuel : <span className={`etat etat-${commande.statutTraitement}`}>{commande.statutTraitement}</span>{' '}
              · paiement : <span className={`etat etat-${commande.statutPaiement}`}>{commande.statutPaiement}</span>
            </p>
            <div className="large actions-commande">
              {commande.statutTraitement !== 'preparee' && commande.statutTraitement !== 'annulee' && (
                <FormulaireAdmin action={changerStatutCommande}>
                  <input type="hidden" name="id" value={commande.id} />
                  <input type="hidden" name="statutTraitement" value="preparee" />
                  <button className="btn btn-line" type="submit">
                    Marquer préparée
                  </button>
                </FormulaireAdmin>
              )}
              {commande.statutTraitement !== 'expediee' && commande.statutTraitement !== 'annulee' && (
                <FormulaireAdmin action={changerStatutCommande}>
                  <input type="hidden" name="id" value={commande.id} />
                  <input type="hidden" name="statutTraitement" value="expediee" />
                  <button className="btn btn-line" type="submit">
                    Marquer expédiée
                  </button>
                </FormulaireAdmin>
              )}
              {commande.statutTraitement !== 'livree' && commande.statutTraitement !== 'annulee' && (
                <FormulaireAdmin action={changerStatutCommande}>
                  <input type="hidden" name="id" value={commande.id} />
                  <input type="hidden" name="statutTraitement" value="livree" />
                  <button className="btn btn-solid" type="submit">
                    Le client a reçu la commande
                  </button>
                </FormulaireAdmin>
              )}
              {commande.statutTraitement !== 'annulee' && (
                <FormulaireAdmin
                  action={changerStatutCommande}
                  confirmation={`Annuler la commande ${commande.numero} ? Les articles retournent en stock.`}
                >
                  <input type="hidden" name="id" value={commande.id} />
                  <input type="hidden" name="statutTraitement" value="annulee" />
                  <button className="btn btn-sig" type="submit">
                    Annuler la commande
                  </button>
                </FormulaireAdmin>
              )}
              {commande.statutTraitement === 'annulee' && (
                <p className="lede" style={{ margin: 0 }}>
                  Commande annulée : le stock a été remis. Pour la rouvrir, choisissez un autre état ci-dessous.
                </p>
              )}
            </div>
            {commande.statutPaiement !== 'payee' && commande.statutTraitement !== 'annulee' && (
              <div className="large actions-commande">
                <FormulaireAdmin action={changerPaiementCommande}>
                  <input type="hidden" name="id" value={commande.id} />
                  <input type="hidden" name="statutPaiement" value="payee" />
                  <input type="hidden" name="modePaiement" value={commande.modePaiement} />
                  <button className="btn btn-line" type="submit">
                    Marquer payée
                  </button>
                </FormulaireAdmin>
              </div>
            )}
          </div>

          <FormulaireAdmin action={changerStatutCommande} className="admin-formulaire">
            <h2>Changer l’état à la main</h2>
            <input type="hidden" name="id" value={commande.id} />
            <div className="champ large">
              <label htmlFor="statutTraitement">État</label>
              <select id="statutTraitement" name="statutTraitement" defaultValue={commande.statutTraitement}>
                <option value="nouvelle">Nouvelle</option>
                <option value="preparee">Préparée</option>
                <option value="expediee">Expédiée</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée (remet le stock)</option>
              </select>
            </div>
            <div className="pied-formulaire">
              <button className="btn btn-solid" type="submit">
                Mettre à jour
              </button>
            </div>
          </FormulaireAdmin>

          <FormulaireAdmin action={changerPaiementCommande} className="admin-formulaire" >
            <h2>Paiement</h2>
            <input type="hidden" name="id" value={commande.id} />
            <div className="champ">
              <label htmlFor="statutPaiement">Statut</label>
              <select id="statutPaiement" name="statutPaiement" defaultValue={commande.statutPaiement}>
                <option value="en_attente">En attente</option>
                <option value="payee">Payée</option>
                <option value="echouee">Échouée</option>
                <option value="remboursee">Remboursée</option>
              </select>
            </div>
            <div className="champ">
              <label htmlFor="modePaiement">Mode</label>
              <select id="modePaiement" name="modePaiement" defaultValue={commande.modePaiement}>
                <option value="hors_ligne">À la livraison</option>
                <option value="especes">Espèces</option>
                <option value="virement">Virement</option>
                <option value="carte">Carte bancaire</option>
              </select>
            </div>
            <div className="pied-formulaire">
              <button className="btn btn-solid" type="submit">
                Enregistrer
              </button>
            </div>
          </FormulaireAdmin>

          <FormulaireAdmin action={noterCommande} className="admin-formulaire">
            <h2>Suivi et note interne</h2>
            <input type="hidden" name="id" value={commande.id} />
            <div className="champ large">
              <label htmlFor="suivi">Numéro de suivi</label>
              <input id="suivi" name="suivi" defaultValue={commande.suivi ?? ''} />
            </div>
            <div className="champ large">
              <label htmlFor="noteInterne">Note interne</label>
              <textarea id="noteInterne" name="noteInterne" rows={3} defaultValue={commande.noteInterne ?? ''} />
            </div>
            <div className="pied-formulaire">
              <button className="btn btn-solid" type="submit">
                Enregistrer
              </button>
            </div>
          </FormulaireAdmin>

          <div className="admin-formulaire">
            <h2>Historique</h2>
            <div className="large journal-evenements">
              {commande.evenements.map((e) => (
                <p key={e.id} className="mono">
                  {formaterDateHeure(e.creeLe)} — {e.libelle}
                  {e.auteur ? ` (${e.auteur})` : ''}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

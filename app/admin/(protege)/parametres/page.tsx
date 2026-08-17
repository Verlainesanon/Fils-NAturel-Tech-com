import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { adminActuel } from '@/lib/auth'
import { peut } from '@/lib/roles'
import { lireReglages } from '@/lib/settings'
import { enregistrerReglages } from '@/app/admin/actions'
import FormulaireAdmin from '@/components/admin/FormulaireAdmin'
import ChampImages from '@/components/admin/ChampImages'

export const metadata: Metadata = { title: 'Paramètres' }

export default async function Parametres() {
  const admin = await adminActuel()
  if (!peut(admin?.role, 'proprietaire')) redirect('/admin')

  const reglages = await lireReglages()
  const enUnites = (centimes: string) => (Number.parseInt(centimes, 10) / 100 || 0).toFixed(2)

  return (
    <>
      <header className="admin-entete">
        <div>
          <h1>Paramètres</h1>
          <p>Ce que le site affiche partout : identité, livraison, paiement, fidélité.</p>
        </div>
      </header>

      <FormulaireAdmin action={enregistrerReglages} className="admin-formulaire">
        <h2>Identité</h2>

        <div className="champ">
          <label htmlFor="SITE_NOM">Nom de la boutique</label>
          <input id="SITE_NOM" name="SITE_NOM" defaultValue={reglages.SITE_NOM} />
        </div>

        <div className="champ">
          <label htmlFor="SITE_SLOGAN">Slogan</label>
          <input id="SITE_SLOGAN" name="SITE_SLOGAN" defaultValue={reglages.SITE_SLOGAN} />
        </div>

        <div className="champ">
          <label htmlFor="SITE_EMAIL">Email de contact</label>
          <input id="SITE_EMAIL" name="SITE_EMAIL" type="email" defaultValue={reglages.SITE_EMAIL} />
        </div>

        <div className="champ">
          <label htmlFor="SITE_TELEPHONE">Téléphone</label>
          <input id="SITE_TELEPHONE" name="SITE_TELEPHONE" defaultValue={reglages.SITE_TELEPHONE} />
        </div>

        <div className="champ large">
          <label htmlFor="SITE_ADRESSE">Adresse</label>
          <input id="SITE_ADRESSE" name="SITE_ADRESSE" defaultValue={reglages.SITE_ADRESSE} />
        </div>

        <h2>Logo</h2>
        <ChampImages nom="SITE_LOGO_LISTE" multiple={false} valeurInitiale={JSON.stringify(reglages.SITE_LOGO ? [reglages.SITE_LOGO] : [])} />

        <h2>Réseaux sociaux</h2>

        <div className="champ">
          <label htmlFor="RESEAU_FACEBOOK">Facebook</label>
          <input id="RESEAU_FACEBOOK" name="RESEAU_FACEBOOK" defaultValue={reglages.RESEAU_FACEBOOK} />
        </div>

        <div className="champ">
          <label htmlFor="RESEAU_INSTAGRAM">Instagram</label>
          <input id="RESEAU_INSTAGRAM" name="RESEAU_INSTAGRAM" defaultValue={reglages.RESEAU_INSTAGRAM} />
        </div>

        <div className="champ">
          <label htmlFor="RESEAU_WHATSAPP">WhatsApp</label>
          <input id="RESEAU_WHATSAPP" name="RESEAU_WHATSAPP" defaultValue={reglages.RESEAU_WHATSAPP} />
        </div>

        <h2>Prix et livraison</h2>

        <div className="champ">
          <label htmlFor="DEVISE_SYMBOLE">Symbole de la devise</label>
          <input id="DEVISE_SYMBOLE" name="DEVISE_SYMBOLE" defaultValue={reglages.DEVISE_SYMBOLE} />
        </div>

        <div className="champ">
          <label htmlFor="LIVRAISON_CENTIMES">Frais de livraison (en centimes)</label>
          <input
            id="LIVRAISON_CENTIMES"
            name="LIVRAISON_CENTIMES"
            type="number"
            min={0}
            defaultValue={reglages.LIVRAISON_CENTIMES}
          />
          <span className="mono">soit {enUnites(reglages.LIVRAISON_CENTIMES)} {reglages.DEVISE_SYMBOLE}</span>
        </div>

        <div className="champ">
          <label htmlFor="LIVRAISON_GRATUITE_DES">Livraison offerte à partir de (centimes)</label>
          <input
            id="LIVRAISON_GRATUITE_DES"
            name="LIVRAISON_GRATUITE_DES"
            type="number"
            min={0}
            defaultValue={reglages.LIVRAISON_GRATUITE_DES}
          />
          <span className="mono">0 pour désactiver</span>
        </div>

        <div className="champ">
          <label htmlFor="LIVRAISON_DELAI">Délai annoncé</label>
          <input id="LIVRAISON_DELAI" name="LIVRAISON_DELAI" defaultValue={reglages.LIVRAISON_DELAI} />
        </div>

        <h2>Paiement</h2>

        <label className="case-a-cocher large">
          <input type="checkbox" name="PAIEMENT_HORS_LIGNE" defaultChecked={reglages.PAIEMENT_HORS_LIGNE === 'oui'} />
          Autoriser le paiement à la livraison et le virement
        </label>

        <label className="case-a-cocher large">
          <input type="checkbox" name="PAIEMENT_CARTE" defaultChecked={reglages.PAIEMENT_CARTE === 'oui'} />
          Proposer la carte bancaire (nécessite les clés Stripe)
        </label>

        <h2>Badges de fidélité</h2>

        <div className="champ">
          <label htmlFor="BADGE_BRONZE">Bronze à partir de</label>
          <input id="BADGE_BRONZE" name="BADGE_BRONZE" type="number" min={1} defaultValue={reglages.BADGE_BRONZE} />
        </div>

        <div className="champ">
          <label htmlFor="BADGE_ARGENT">Argent à partir de</label>
          <input id="BADGE_ARGENT" name="BADGE_ARGENT" type="number" min={1} defaultValue={reglages.BADGE_ARGENT} />
        </div>

        <div className="champ">
          <label htmlFor="BADGE_OR">Or à partir de</label>
          <input id="BADGE_OR" name="BADGE_OR" type="number" min={1} defaultValue={reglages.BADGE_OR} />
        </div>

        <div className="pied-formulaire">
          <button className="bouton" type="submit">
            Enregistrer les paramètres
          </button>
        </div>
      </FormulaireAdmin>
    </>
  )
}

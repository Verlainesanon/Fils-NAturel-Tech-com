import Link from 'next/link'
import { lirePanier } from '@/lib/cart'
import { lireReglages } from '@/lib/settings'
import { clientActuel } from '@/lib/auth'
import { contexteAffichage } from '@/lib/affichage'
import { LANGUES } from '@/lib/i18n'
import SelecteursVisiteur from '@/components/SelecteursVisiteur'

export default async function EnTete() {
  const [reglages, client, affichage] = await Promise.all([
    lireReglages(),
    clientActuel(),
    contexteAffichage(),
  ])
  const articles = lirePanier().reduce((t, l) => t + l.quantite, 0)
  const { t } = affichage
  const [premier, ...reste] = reglages.SITE_NOM.split(' ')

  return (
    <header>
      <div className="wrap hd">
        <Link href="/" className="brand" aria-label={`${t('nav.accueil')} ${reglages.SITE_NOM}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={reglages.SITE_LOGO || '/logo.jpeg'} alt="" />
          <svg className="wordmark" viewBox="0 0 150 26" role="img" aria-label={reglages.SITE_NOM}>
            <text x="0" y="12">{premier}</text>
            <path className="wire" d="M25,8 C31,8 31,14 37,14 C43,14 43,8 49,8" />
            <circle className="sol" cx="25" cy="8" r="1.7" />
            <circle className="sol" cx="49" cy="8" r="1.7" />
            <text x="53" y="12">{reste[0] ?? ''}</text>
            <text className="tc" x="0" y="22">
              {reste.slice(1).join(' ').toUpperCase() || 'TECH-COM'}
            </text>
          </svg>
        </Link>

        <nav aria-label={t('nav.catalogue')}>
          <Link href="/">{t('nav.accueil')}</Link>
          <Link href="/boutique">{t('nav.catalogue')}</Link>
          <Link href="/boutique?tri=promo">{t('nav.speciaux')}</Link>
          <Link href="/commande/suivi">{t('nav.suivi')}</Link>
        </nav>

        <div className="hd-r">
          <SelecteursVisiteur
            langues={LANGUES.map((l) => ({ code: l.code, libelle: l.nom }))}
            langueActive={affichage.langue}
            devises={affichage.devises.map((d) => ({ code: d.code, libelle: `${d.code} ${d.symbole}` }))}
            deviseActive={affichage.devise.code}
            libelleLangue={t('langue.choisir')}
            libelleDevise={t('devise.choisir')}
          />

          <Link className="btn btn-line" href={client ? '/compte' : '/compte/connexion'}>
            {client ? client.nom.split(' ')[0] : t('nav.connexion')}
          </Link>
          <Link className="btn btn-solid" href="/panier">
            {t('nav.panier')} · {articles}
          </Link>
        </div>
      </div>
    </header>
  )
}

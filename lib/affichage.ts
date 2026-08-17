import { lireDevises, deviseChoisie, formaterMontant, type Devise } from '@/lib/devises'
import { langueActuelle, traducteur, type Langue } from '@/lib/i18n'

/**
 * Tout ce dont une page a besoin pour s'afficher dans la langue et la devise
 * du visiteur. Un seul appel par page, passé ensuite aux composants.
 */
export type Affichage = {
  langue: Langue
  t: (cle: string) => string
  devise: Devise
  devises: Devise[]
  prix: (centimesBase: number) => string
}

export async function contexteAffichage(): Promise<Affichage> {
  const devises = await lireDevises()
  const devise = deviseChoisie(devises)
  const langue = langueActuelle()

  return {
    langue,
    t: traducteur(langue),
    devise,
    devises: devises.filter((d) => d.actif),
    prix: (centimesBase: number) => formaterMontant(centimesBase, devise, langue),
  }
}

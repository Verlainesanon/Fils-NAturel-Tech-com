'use client'

import { useState } from 'react'

const LARGEUR_MAX = 1400
const POIDS_VISE = 260 * 1024 // par image, en octets une fois encodée
const QUALITES = [0.82, 0.72, 0.62, 0.52, 0.42]
const MAX_IMAGES = 8

/**
 * Les images sont redimensionnées et compressées dans le navigateur, puis
 * stockées en data URL. Pas de service de fichiers à configurer : ce qui
 * marche en local marche à l'identique une fois en ligne. La compression
 * descend d'un cran tant que l'image dépasse le poids visé, pour que le
 * formulaire reste sous la limite d'envoi du serveur.
 */
function preparer(fichier: File): Promise<string> {
  return new Promise((resoudre, rejeter) => {
    const lecteur = new FileReader()
    lecteur.onerror = () => rejeter(new Error('Lecture impossible'))
    lecteur.onload = () => {
      const image = new Image()
      image.onerror = () => rejeter(new Error('Image illisible'))
      image.onload = () => {
        const echelle = Math.min(1, LARGEUR_MAX / image.width)
        const toile = document.createElement('canvas')
        toile.width = Math.round(image.width * echelle)
        toile.height = Math.round(image.height * echelle)
        const contexte = toile.getContext('2d')
        if (!contexte) return rejeter(new Error('Canvas indisponible'))
        contexte.drawImage(image, 0, 0, toile.width, toile.height)

        let resultat = toile.toDataURL('image/jpeg', QUALITES[0])
        for (const qualite of QUALITES.slice(1)) {
          if (resultat.length <= POIDS_VISE) break
          resultat = toile.toDataURL('image/jpeg', qualite)
        }
        resoudre(resultat)
      }
      image.src = String(lecteur.result)
    }
    lecteur.readAsDataURL(fichier)
  })
}

const enKo = (chaine: string) => Math.round(chaine.length / 1024)

export default function ChampImages({
  nom = 'images',
  valeurInitiale = '[]',
  multiple = true,
}: {
  nom?: string
  valeurInitiale?: string
  multiple?: boolean
}) {
  const [images, setImages] = useState<string[]>(() => {
    try {
      const analyse = JSON.parse(valeurInitiale)
      return Array.isArray(analyse) ? analyse : []
    } catch {
      return []
    }
  })
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  const ajouter = async (fichiers: FileList | null) => {
    if (!fichiers?.length) return
    setErreur(null)
    setEnCours(true)
    try {
      const converties = await Promise.all(Array.from(fichiers).map(preparer))
      setImages((liste) => {
        const suite = multiple ? [...liste, ...converties] : converties.slice(0, 1)
        if (suite.length > MAX_IMAGES) {
          setErreur(`Huit photos au maximum par produit : les suivantes ont été ignorées.`)
        }
        return suite.slice(0, multiple ? MAX_IMAGES : 1)
      })
    } catch {
      setErreur('Une image n’a pas pu être lue. Essayez un fichier JPEG ou PNG.')
    } finally {
      setEnCours(false)
    }
  }

  const deplacerEnPremier = (index: number) =>
    setImages((liste) => [liste[index], ...liste.filter((_, i) => i !== index)])

  const poidsTotal = images.reduce((t, i) => t + enKo(i), 0)

  return (
    <div className="champ large">
      <label htmlFor={`fichier-${nom}`}>{multiple ? 'Photos du produit' : 'Image'}</label>

      <input
        id={`fichier-${nom}`}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => {
          void ajouter(e.target.files)
          e.target.value = ''
        }}
      />
      <input type="hidden" name={nom} value={JSON.stringify(images)} />

      {enCours && <p className="mono">Préparation des photos…</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}

      {images.length > 0 && (
        <div className="grille-images">
          {images.map((image, i) => (
            <figure key={i} className="image-choisie">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" />
              <button
                type="button"
                onClick={() => setImages((liste) => liste.filter((_, index) => index !== i))}
                aria-label={`Retirer la photo ${i + 1}`}
              >
                ×
              </button>
              {i === 0 ? (
                <figcaption>Principale</figcaption>
              ) : (
                <button type="button" className="mettre-en-premier" onClick={() => deplacerEnPremier(i)}>
                  Mettre en premier
                </button>
              )}
            </figure>
          ))}
        </div>
      )}

      <span className="mono">
        {images.length > 0
          ? `${images.length} photo(s), ${poidsTotal} Ko au total. La première est le visuel principal.`
          : `Prenez la photo au téléphone puis choisissez-la ici. Redimensionnée à ${LARGEUR_MAX} px automatiquement.`}
      </span>
    </div>
  )
}

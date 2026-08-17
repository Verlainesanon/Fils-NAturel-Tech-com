'use client'

import { useState } from 'react'

const LARGEUR_MAX = 1200
const QUALITE = 0.82

/**
 * Les images sont redimensionnées et converties en JPEG dans le navigateur,
 * puis stockées en data URL. Pas de service de fichiers à configurer : ce qui
 * marche en local marche à l'identique une fois en ligne.
 */
function redimensionner(fichier: File): Promise<string> {
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
        resoudre(toile.toDataURL('image/jpeg', QUALITE))
      }
      image.src = String(lecteur.result)
    }
    lecteur.readAsDataURL(fichier)
  })
}

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

  const ajouter = async (fichiers: FileList | null) => {
    if (!fichiers?.length) return
    setErreur(null)
    try {
      const converties = await Promise.all(Array.from(fichiers).map(redimensionner))
      setImages((liste) => (multiple ? [...liste, ...converties] : converties.slice(0, 1)))
    } catch {
      setErreur('Une image n’a pas pu être lue. Essayez un fichier JPEG ou PNG.')
    }
  }

  return (
    <div className="champ large">
      <label htmlFor={`fichier-${nom}`}>Images</label>
      <input
        id={`fichier-${nom}`}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => ajouter(e.target.files)}
      />
      <input type="hidden" name={nom} value={JSON.stringify(images)} />

      {erreur && <p className="message-erreur">{erreur}</p>}

      {images.length > 0 && (
        <div className="grille-images">
          {images.map((image, i) => (
            <div key={i} className="image-choisie">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" />
              <button
                type="button"
                onClick={() => setImages((liste) => liste.filter((_, index) => index !== i))}
                aria-label="Retirer cette image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <span className="mono">
        La première image sert de visuel principal. Redimensionnées automatiquement à {LARGEUR_MAX} px.
      </span>
    </div>
  )
}

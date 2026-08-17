'use client'

import { useState } from 'react'

export default function Galerie({ images, nom }: { images: string[]; nom: string }) {
  const [actif, setActif] = useState(0)

  if (images.length === 0) {
    return (
      <div className="galerie-principale">
        <span className="mono">Visuel à venir</span>
      </div>
    )
  }

  return (
    <div className="galerie">
      <div className="galerie-principale">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[actif]} alt={nom} />
      </div>
      {images.length > 1 && (
        <div className="galerie-vignettes">
          {images.map((image, i) => (
            <button
              key={i}
              type="button"
              className={`vignette ${i === actif ? 'actif' : ''}`}
              onClick={() => setActif(i)}
              aria-label={`Voir le visuel ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

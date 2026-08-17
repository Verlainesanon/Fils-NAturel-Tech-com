/**
 * Feuille nervurée en circuit, reprise du logo FNTC : la nervure centrale et
 * ses ramifications sont dessinées comme des pistes, avec des pastilles aux
 * extrémités. Sert de marqueur de navigation et d'ornement de section.
 */
export default function Feuille({
  taille = 16,
  className,
}: {
  taille?: number
  className?: string
}) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        d="M20 3C11 3 4 8 4 15c0 2.2.7 4.1 2 5.6C8 17 12 14 17 12.5 12.6 15 9 18 7.4 21.6c1.4.9 3 1.4 4.6 1.4 6 0 8-6 8-11V3Z"
        fill="url(#feuille-fond)"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* nervure principale */}
      <path d="M19 4.5C15 9 11 12.5 6.5 19.5" stroke="currentColor" strokeWidth="0.9" fill="none" />
      {/* ramifications, terminées par une pastille de soudure */}
      <path d="M16.5 7.2 12.4 6.6M15 9.6l-4.4.6M13 12.2l-3.6 1.6" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <circle cx="12.2" cy="6.5" r="0.9" fill="currentColor" />
      <circle cx="10.4" cy="10.3" r="0.9" fill="currentColor" />
      <circle cx="9.2" cy="13.9" r="0.9" fill="currentColor" />
      <defs>
        <linearGradient id="feuille-fond" x1="4" y1="3" x2="20" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * Corde tressée du logo, en filet horizontal. Sépare les grandes zones de la
 * page sans ajouter un trait droit de plus.
 */
export function Tresse({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 8" preserveAspectRatio="none" aria-hidden focusable="false">
      <path
        d="M0 4c10-4 20-4 30 0s20 4 30 0 20-4 30 0 20 4 30 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M0 4c10 4 20 4 30 0s20-4 30 0 20 4 30 0 20-4 30 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  )
}

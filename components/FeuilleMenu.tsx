/**
 * La feuille-circuit de la maquette : c'est le menu des rayons. Chaque pastille
 * de soudure est une catégorie, avec son nombre de références. Les quatre
 * emplacements sont dessinés à la main ; au-delà, les rayons suivants sont
 * listés sous la feuille.
 */
export type Rayon = { slug: string; nom: string; nombre: number }

const EMPLACEMENTS = [
  { branche: 'M250,170 L250,112 L306,112', x: 308, y: 112, texte: 320, ancre: 'start' as const, retard: '2.55s' },
  { branche: 'M370,170 L370,238 L426,238', x: 428, y: 238, texte: 440, ancre: 'start' as const, retard: '2.65s' },
  { branche: 'M560,170 L560,120 L604,120', x: 606, y: 120, texte: 618, ancre: 'start' as const, retard: '2.75s' },
  { branche: 'M160,170 L160,222 L120,222', x: 118, y: 222, texte: 106, ancre: 'end' as const, retard: '2.85s' },
]

export default function FeuilleMenu({ rayons, total }: { rayons: Rayon[]; total: number }) {
  const places = rayons.slice(0, EMPLACEMENTS.length)
  const surplus = rayons.slice(EMPLACEMENTS.length)

  return (
    <div className="leafwrap">
      <svg className="leaf" viewBox="0 0 860 340" role="navigation" aria-label="Rayons">
        <path
          className="fill"
          d="M430,318 C210,318 76,232 76,170 C76,108 210,22 430,22 C650,22 784,108 784,170 C784,232 650,318 430,318 Z"
        />
        <path
          className="out dash"
          style={{ '--L': 1720 } as React.CSSProperties}
          d="M430,318 C210,318 76,232 76,170 C76,108 210,22 430,22 C650,22 784,108 784,170 C784,232 650,318 430,318 Z"
        />
        <path className="stem dash" style={{ '--L': 710 } as React.CSSProperties} d="M76,170 L784,170" />

        <path className="vein dash" style={{ '--L': 210 } as React.CSSProperties} d="M210,170 C242,134 292,108 352,96" />
        <path className="vein dash" style={{ '--L': 210 } as React.CSSProperties} d="M210,170 C242,206 292,232 352,244" />
        <path className="vein dash" style={{ '--L': 200 } as React.CSSProperties} d="M330,170 C362,138 416,116 480,108" />
        <path className="vein dash" style={{ '--L': 200 } as React.CSSProperties} d="M330,170 C362,202 416,224 480,232" />
        <path className="vein dash" style={{ '--L': 180 } as React.CSSProperties} d="M470,170 C502,144 556,126 614,120" />
        <path className="vein dash" style={{ '--L': 180 } as React.CSSProperties} d="M470,170 C502,196 556,214 614,220" />
        <path className="vein dash" style={{ '--L': 150 } as React.CSSProperties} d="M600,170 C626,150 668,138 712,134" />
        <path className="vein dash" style={{ '--L': 150 } as React.CSSProperties} d="M600,170 C626,190 668,202 712,206" />

        {/* puce centrale */}
        <g className="late" style={{ animationDelay: '2.35s' }}>
          <rect className="chip" x="392" y="146" width="58" height="48" rx="5" />
          <path
            className="chiplead"
            d="M392,158 L378,158 M392,170 L378,170 M392,182 L378,182 M450,158 L464,158 M450,170 L464,170 M450,182 L464,182"
          />
          <text className="padcount" x="421" y="174" textAnchor="middle">
            FNTC
          </text>
        </g>

        {/* pastilles = rayons */}
        {places.map((rayon, i) => {
          const e = EMPLACEMENTS[i]
          return (
            <a
              key={rayon.slug}
              href={`/boutique?categorie=${rayon.slug}`}
              className="node-g late" style={{ animationDelay: e.retard }} aria-label={`${rayon.nom}, ${rayon.nombre} références`}>
                <path className="branch" d={e.branche} />
                <circle className="padring" cx={e.x} cy={e.y} r="6" />
                <circle className="pad" cx={e.x} cy={e.y} r="5.5" />
                <text className="padlabel" x={e.texte} y={e.y - 3} textAnchor={e.ancre}>
                  {rayon.nom}
                </text>
                <text className="padcount" x={e.texte} y={e.y + 9} textAnchor={e.ancre}>
                  {rayon.nombre} réf.
                </text>
            </a>
          )
        })}

        {/* cotes de dessin technique */}
        <g className="late" style={{ animationDelay: '3s' }}>
          <path className="dim" d="M76,300 L76,312 M784,300 L784,312 M76,306 L784,306" />
          <path className="dim" d="M76,306 l7,-3 v6 z M784,306 l-7,-3 v6 z" stroke="none" fill="var(--ink-3)" opacity=".5" />
          <rect x="380" y="298" width="100" height="16" fill="var(--bone)" />
          <text className="dimtxt" x="430" y="310" textAnchor="middle">
            {total} RÉFÉRENCES
          </text>
        </g>
      </svg>

      <p className="leafhint">
        {surplus.length > 0
          ? `Aussi : ${surplus.map((r) => r.nom).join(' · ')}`
          : 'Chaque pastille est un rayon — cliquez pour l’ouvrir'}
      </p>
    </div>
  )
}

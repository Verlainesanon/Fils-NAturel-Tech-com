// Hiérarchie des rôles admin. Un rôle donne accès à tout ce que permettent
// les rôles inférieurs. Vérifié côté serveur avant chaque action modifiante.

export const ROLES = ['viewer', 'vendeur', 'gestionnaire', 'proprietaire'] as const

export type Role = (typeof ROLES)[number]

export const LIBELLES_ROLES: Record<Role, string> = {
  viewer: 'Lecture seule',
  vendeur: 'Vendeur — commandes, stock, messages',
  gestionnaire: 'Gestionnaire — catalogue et contenus',
  proprietaire: 'Propriétaire — accès total',
}

export function estRole(valeur: string): valeur is Role {
  return (ROLES as readonly string[]).includes(valeur)
}

/** Vrai si `role` atteint au moins le niveau `minimum`. */
export function peut(role: string | undefined | null, minimum: Role): boolean {
  if (!role || !estRole(role)) return false
  return ROLES.indexOf(role) >= ROLES.indexOf(minimum)
}

import { prisma } from '@/lib/db'

/**
 * Journalise une action modifiante. Appelé par les Server Actions de l'admin.
 * Le journal est en lecture seule côté interface : rien ne le purge.
 */
export async function journaliser(
  auteur: string,
  action: string,
  cible: string,
  details = ''
): Promise<void> {
  await prisma.auditLog.create({ data: { auteur, action, cible, details } })
}

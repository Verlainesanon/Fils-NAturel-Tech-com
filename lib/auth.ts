import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { peut, type Role } from '@/lib/roles'

const COOKIE_ADMIN = 'fntc_admin'
const COOKIE_CLIENT = 'fntc_client'
const DUREE_SESSION_MS = 8 * 60 * 60 * 1000 // 8 h d'inactivité
const MAX_ECHECS = 5
const DUREE_BLOCAGE_MS = 15 * 60 * 1000

function secret(): string {
  return process.env.SESSION_SECRET || 'fntc-secret-de-developpement-a-remplacer'
}

// ------------------------------------------------------------ mots de passe

export function hacherMotDePasse(motDePasse: string): string {
  const sel = randomBytes(16).toString('hex')
  const empreinte = scryptSync(motDePasse, sel, 64).toString('hex')
  return `${sel}:${empreinte}`
}

export function verifierMotDePasse(motDePasse: string, stocke: string): boolean {
  const [sel, empreinte] = stocke.split(':')
  if (!sel || !empreinte) return false
  const candidat = scryptSync(motDePasse, sel, 64)
  const attendu = Buffer.from(empreinte, 'hex')
  if (candidat.length !== attendu.length) return false
  return timingSafeEqual(candidat, attendu)
}

// --------------------------------------------------------------- admin

export type AdminConnecte = {
  id: string
  nom: string
  identifiant: string
  role: Role
}

export async function connecterAdmin(
  identifiant: string,
  motDePasse: string
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  const admin = await prisma.adminUser.findUnique({ where: { identifiant: identifiant.trim() } })
  if (!admin || !admin.actif) return { ok: false, erreur: 'Identifiants incorrects.' }

  if (admin.bloqueJusqua && admin.bloqueJusqua > new Date()) {
    return { ok: false, erreur: 'Compte temporairement bloqué après trop d’échecs. Réessayez plus tard.' }
  }

  if (!verifierMotDePasse(motDePasse, admin.motDePasse)) {
    const echecs = admin.echecs + 1
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        echecs,
        bloqueJusqua: echecs >= MAX_ECHECS ? new Date(Date.now() + DUREE_BLOCAGE_MS) : null,
      },
    })
    return { ok: false, erreur: 'Identifiants incorrects.' }
  }

  const jeton = randomBytes(32).toString('hex')
  await prisma.adminSession.create({
    data: { jeton, adminId: admin.id, expireLe: new Date(Date.now() + DUREE_SESSION_MS) },
  })
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { echecs: 0, bloqueJusqua: null, derniereConnexion: new Date() },
  })

  cookies().set(COOKIE_ADMIN, jeton, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DUREE_SESSION_MS / 1000,
  })
  return { ok: true }
}

export async function deconnecterAdmin(): Promise<void> {
  const jeton = cookies().get(COOKIE_ADMIN)?.value
  if (jeton) await prisma.adminSession.deleteMany({ where: { jeton } })
  cookies().delete(COOKIE_ADMIN)
}

export async function adminActuel(): Promise<AdminConnecte | null> {
  const jeton = cookies().get(COOKIE_ADMIN)?.value
  if (!jeton) return null
  const session = await prisma.adminSession.findUnique({ where: { jeton }, include: { admin: true } })
  if (!session || session.expireLe < new Date() || !session.admin.actif) return null
  return {
    id: session.admin.id,
    nom: session.admin.nom,
    identifiant: session.admin.identifiant,
    role: session.admin.role as Role,
  }
}

/** À appeler au début de chaque Server Action modifiante. */
export async function exigerRole(minimum: Role): Promise<AdminConnecte> {
  const admin = await adminActuel()
  if (!admin) throw new Error('Session expirée. Reconnectez-vous.')
  if (!peut(admin.role, minimum)) throw new Error('Votre rôle ne permet pas cette action.')
  return admin
}

// -------------------------------------------------------------- client

function signer(valeur: string): string {
  return createHmac('sha256', secret()).update(valeur).digest('hex').slice(0, 32)
}

export function ouvrirSessionClient(clientId: string): void {
  cookies().set(COOKIE_CLIENT, `${clientId}.${signer(clientId)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 3600,
  })
}

export function fermerSessionClient(): void {
  cookies().delete(COOKIE_CLIENT)
}

export function clientIdActuel(): string | null {
  const brut = cookies().get(COOKIE_CLIENT)?.value
  if (!brut) return null
  const separateur = brut.lastIndexOf('.')
  if (separateur < 1) return null
  const id = brut.slice(0, separateur)
  const signature = brut.slice(separateur + 1)
  return signer(id) === signature ? id : null
}

export async function clientActuel() {
  const id = clientIdActuel()
  if (!id) return null
  const client = await prisma.customer.findUnique({ where: { id } })
  return client && !client.supprimeLe ? client : null
}

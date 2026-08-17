import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { clientActuel } from '@/lib/auth'

// Chat support sans inscription : le visiteur est identifié par un jeton en
// cookie. Le client sonde cette route ; pas de service temps réel externe.

const COOKIE_CHAT = 'fntc_chat'

export const dynamic = 'force-dynamic'

async function conversationCourante(creer: boolean) {
  const jeton = cookies().get(COOKIE_CHAT)?.value
  if (jeton) {
    const existante = await prisma.conversation.findUnique({ where: { jeton } })
    if (existante) return existante
  }
  if (!creer) return null

  const client = await clientActuel()
  const nouveau = randomBytes(16).toString('hex')
  const conversation = await prisma.conversation.create({
    data: {
      jeton: nouveau,
      clientId: client?.id ?? null,
      nomVisiteur: client?.nom ?? 'Visiteur',
      emailVisiteur: client?.email ?? null,
    },
  })
  cookies().set(COOKIE_CHAT, nouveau, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 90 * 24 * 3600,
  })
  return conversation
}

export async function GET() {
  const conversation = await conversationCourante(false)
  if (!conversation) return NextResponse.json({ messages: [] })

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { creeLe: 'asc' },
    take: 100,
  })

  await prisma.message.updateMany({
    where: { conversationId: conversation.id, auteur: 'admin', luParClient: false },
    data: { luParClient: true },
  })

  return NextResponse.json({
    statut: conversation.statut,
    messages: messages.map((m) => ({
      id: m.id,
      auteur: m.auteur,
      nomAuteur: m.nomAuteur,
      corps: m.corps,
      creeLe: m.creeLe,
    })),
  })
}

export async function POST(requete: Request) {
  const corpsRequete = await requete.json().catch(() => null)
  const corps = String(corpsRequete?.corps ?? '').trim()
  const nom = String(corpsRequete?.nom ?? '').trim()

  if (!corps) return NextResponse.json({ erreur: 'Message vide.' }, { status: 400 })
  if (corps.length > 2000) return NextResponse.json({ erreur: 'Message trop long.' }, { status: 400 })

  const conversation = await conversationCourante(true)
  if (!conversation) return NextResponse.json({ erreur: 'Conversation indisponible.' }, { status: 500 })

  if (nom && conversation.nomVisiteur === 'Visiteur') {
    await prisma.conversation.update({ where: { id: conversation.id }, data: { nomVisiteur: nom } })
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      auteur: 'client',
      nomAuteur: nom || conversation.nomVisiteur,
      corps,
      luParClient: true,
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { statut: 'ouvert' },
  })

  return NextResponse.json({ message: { id: message.id, auteur: 'client', corps, creeLe: message.creeLe } })
}

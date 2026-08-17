'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import {
  hacherMotDePasse,
  verifierMotDePasse,
  ouvrirSessionClient,
  fermerSessionClient,
} from '@/lib/auth'

export async function inscrire(formData: FormData) {
  const nom = String(formData.get('nom') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const motDePasse = String(formData.get('motDePasse') ?? '')
  const telephone = String(formData.get('telephone') ?? '').trim()

  if (nom.length < 2) return { erreur: 'Indiquez votre nom.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erreur: 'Cette adresse email n’est pas valide.' }
  if (motDePasse.length < 8) return { erreur: 'Le mot de passe doit faire au moins 8 caractères.' }

  const existant = await prisma.customer.findUnique({ where: { email } })

  // Un invité a déjà une fiche sans mot de passe : on l'active plutôt que
  // d'en créer une seconde, ce qui rattache ses commandes passées.
  if (existant?.motDePasse) return { erreur: 'Un compte existe déjà avec cet email.' }

  const client = existant
    ? await prisma.customer.update({
        where: { id: existant.id },
        data: { nom, telephone: telephone || existant.telephone, motDePasse: hacherMotDePasse(motDePasse) },
      })
    : await prisma.customer.create({
        data: { nom, email, telephone: telephone || null, motDePasse: hacherMotDePasse(motDePasse) },
      })

  ouvrirSessionClient(client.id)
  redirect('/compte')
}

export async function connecter(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const motDePasse = String(formData.get('motDePasse') ?? '')

  const client = await prisma.customer.findUnique({ where: { email } })
  if (!client || !client.motDePasse || client.supprimeLe || !verifierMotDePasse(motDePasse, client.motDePasse)) {
    return { erreur: 'Email ou mot de passe incorrect.' }
  }

  ouvrirSessionClient(client.id)
  redirect('/compte')
}

export async function deconnecter() {
  fermerSessionClient()
  redirect('/')
}

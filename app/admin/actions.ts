'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { connecterAdmin, deconnecterAdmin, exigerRole, hacherMotDePasse } from '@/lib/auth'
import { journaliser } from '@/lib/audit'
import { ecrireReglages, type Reglages } from '@/lib/settings'
import { slugifier } from '@/lib/format'
import { estRole } from '@/lib/roles'

const texte = (f: FormData, cle: string) => String(f.get(cle) ?? '').trim()
const nombre = (f: FormData, cle: string, defaut = 0) => {
  const n = Number.parseInt(texte(f, cle), 10)
  return Number.isFinite(n) ? n : defaut
}
const centimes = (f: FormData, cle: string): number => {
  const valeur = texte(f, cle).replace(',', '.')
  const n = Number.parseFloat(valeur)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}
const coche = (f: FormData, cle: string) => f.get(cle) === 'on' || f.get(cle) === 'true'
const dateOuNull = (f: FormData, cle: string) => {
  const valeur = texte(f, cle)
  if (!valeur) return null
  const d = new Date(valeur)
  return Number.isNaN(d.getTime()) ? null : d
}

// ------------------------------------------------------------------ session

export async function connexionAdmin(formData: FormData) {
  const identifiant = texte(formData, 'identifiant')
  const motDePasse = String(formData.get('motDePasse') ?? '')
  const resultat = await connecterAdmin(identifiant, motDePasse)
  if (!resultat.ok) return { erreur: resultat.erreur }
  await journaliser(identifiant, 'connexion', `AdminUser#${identifiant}`)
  redirect('/admin')
}

export async function deconnexionAdmin() {
  await deconnecterAdmin()
  redirect('/admin/connexion')
}

// ----------------------------------------------------------------- produits

export async function enregistrerProduit(formData: FormData) {
  const admin = await exigerRole('gestionnaire')
  const id = texte(formData, 'id')
  const nom = texte(formData, 'nom')
  if (!nom) return { erreur: 'Le nom est obligatoire.' }

  const slugDemande = texte(formData, 'slug') || slugifier(nom)
  const conflit = await prisma.product.findFirst({
    where: { slug: slugDemande, ...(id ? { id: { not: id } } : {}) },
  })
  const slug = conflit ? `${slugDemande}-${Date.now().toString(36).slice(-4)}` : slugDemande

  const donnees = {
    nom,
    slug,
    reference: texte(formData, 'reference') || null,
    marque: texte(formData, 'marque') || null,
    descriptionCourte: texte(formData, 'descriptionCourte'),
    description: texte(formData, 'description'),
    prixCentimes: centimes(formData, 'prix'),
    promoCentimes: texte(formData, 'promo') ? centimes(formData, 'promo') : null,
    promoDebut: dateOuNull(formData, 'promoDebut'),
    promoFin: dateOuNull(formData, 'promoFin'),
    stock: nombre(formData, 'stock'),
    seuilAlerte: nombre(formData, 'seuilAlerte', 3),
    poidsGrammes: texte(formData, 'poids') ? nombre(formData, 'poids') : null,
    images: texte(formData, 'images') || '[]',
    caracteristiques: texte(formData, 'caracteristiques') || '[]',
    statut: texte(formData, 'statut') || 'publie',
    miseEnAvant: coche(formData, 'miseEnAvant'),
    seoTitre: texte(formData, 'seoTitre') || null,
    seoDescription: texte(formData, 'seoDescription') || null,
    categorieId: texte(formData, 'categorieId'),
  }

  if (!donnees.categorieId) return { erreur: 'Choisissez une catégorie.' }
  if (donnees.prixCentimes <= 0) return { erreur: 'Le prix doit être supérieur à zéro.' }

  if (id) {
    const avant = await prisma.product.findUnique({ where: { id } })
    await prisma.product.update({ where: { id }, data: donnees })
    if (avant && avant.stock !== donnees.stock) {
      await prisma.stockMovement.create({
        data: {
          produitId: id,
          variation: donnees.stock - avant.stock,
          stockApres: donnees.stock,
          motif: 'correction',
          note: 'Modifié depuis la fiche produit',
          auteur: admin.nom,
        },
      })
    }
    await journaliser(admin.nom, 'modification', `Product#${id}`, nom)
  } else {
    const cree = await prisma.product.create({ data: donnees })
    await prisma.stockMovement.create({
      data: {
        produitId: cree.id,
        variation: donnees.stock,
        stockApres: donnees.stock,
        motif: 'reception',
        note: 'Stock initial',
        auteur: admin.nom,
      },
    })
    await journaliser(admin.nom, 'creation', `Product#${cree.id}`, nom)
  }

  revalidatePath('/admin/produits')
  revalidatePath('/boutique')
  redirect('/admin/produits')
}

export async function archiverProduit(id: string) {
  const admin = await exigerRole('gestionnaire')
  await prisma.product.update({ where: { id }, data: { statut: 'archive' } })
  await journaliser(admin.nom, 'archivage', `Product#${id}`)
  revalidatePath('/admin/produits')
  revalidatePath('/boutique')
}

export async function publierProduit(id: string) {
  const admin = await exigerRole('gestionnaire')
  await prisma.product.update({ where: { id }, data: { statut: 'publie' } })
  await journaliser(admin.nom, 'publication', `Product#${id}`)
  revalidatePath('/admin/produits')
  revalidatePath('/boutique')
}

// --------------------------------------------------------------- catégories

export async function enregistrerCategorie(formData: FormData) {
  const admin = await exigerRole('gestionnaire')
  const id = texte(formData, 'id')
  const nom = texte(formData, 'nom')
  if (!nom) return { erreur: 'Le nom est obligatoire.' }

  const donnees = {
    nom,
    slug: texte(formData, 'slug') || slugifier(nom),
    description: texte(formData, 'description') || null,
    ordre: nombre(formData, 'ordre'),
    visible: coche(formData, 'visible'),
    parentId: texte(formData, 'parentId') || null,
  }

  if (id) {
    await prisma.category.update({ where: { id }, data: donnees })
    await journaliser(admin.nom, 'modification', `Category#${id}`, nom)
  } else {
    const cree = await prisma.category.create({ data: donnees })
    await journaliser(admin.nom, 'creation', `Category#${cree.id}`, nom)
  }
  revalidatePath('/admin/categories')
  revalidatePath('/boutique')
}

export async function supprimerCategorie(id: string) {
  const admin = await exigerRole('gestionnaire')
  const produits = await prisma.product.count({ where: { categorieId: id } })
  if (produits > 0) return { erreur: `Cette catégorie contient ${produits} produit(s).` }
  await prisma.category.delete({ where: { id } })
  await journaliser(admin.nom, 'suppression', `Category#${id}`)
  revalidatePath('/admin/categories')
}

// -------------------------------------------------------------------- stock

export async function ajusterStock(formData: FormData) {
  const admin = await exigerRole('vendeur')
  const produitId = texte(formData, 'produitId')
  const variation = nombre(formData, 'variation')
  const motif = texte(formData, 'motif') || 'correction'
  if (variation === 0) return { erreur: 'Indiquez une quantité différente de zéro.' }

  const produit = await prisma.product.findUnique({ where: { id: produitId } })
  if (!produit) return { erreur: 'Produit introuvable.' }

  const stockApres = Math.max(0, produit.stock + variation)
  await prisma.product.update({ where: { id: produitId }, data: { stock: stockApres } })
  await prisma.stockMovement.create({
    data: {
      produitId,
      variation: stockApres - produit.stock,
      stockApres,
      motif,
      note: texte(formData, 'note') || null,
      auteur: admin.nom,
    },
  })
  await journaliser(admin.nom, 'stock', `Product#${produitId}`, `${variation > 0 ? '+' : ''}${variation} (${motif})`)
  revalidatePath('/admin/stock')
  revalidatePath('/boutique')
}

// --------------------------------------------------------------- promotions

export async function enregistrerPromo(formData: FormData) {
  const admin = await exigerRole('gestionnaire')
  const id = texte(formData, 'id')
  const code = texte(formData, 'code').toUpperCase()
  if (!code) return { erreur: 'Le code est obligatoire.' }

  const type = texte(formData, 'type') || 'pourcentage'
  const donnees = {
    code,
    type,
    valeur: type === 'montant' ? centimes(formData, 'valeur') : nombre(formData, 'valeur'),
    portee: texte(formData, 'portee') || 'tout',
    cibleIds: JSON.stringify(formData.getAll('cibles').map(String)),
    minimumCentimes: centimes(formData, 'minimum'),
    debut: dateOuNull(formData, 'debut'),
    fin: dateOuNull(formData, 'fin'),
    usagesMax: texte(formData, 'usagesMax') ? nombre(formData, 'usagesMax') : null,
    usagesMaxParClient: texte(formData, 'usagesMaxParClient') ? nombre(formData, 'usagesMaxParClient') : null,
    actif: coche(formData, 'actif'),
  }

  const conflit = await prisma.promo.findFirst({ where: { code, ...(id ? { id: { not: id } } : {}) } })
  if (conflit) return { erreur: 'Ce code existe déjà.' }

  if (id) {
    await prisma.promo.update({ where: { id }, data: donnees })
    await journaliser(admin.nom, 'modification', `Promo#${id}`, code)
  } else {
    const cree = await prisma.promo.create({ data: donnees })
    await journaliser(admin.nom, 'creation', `Promo#${cree.id}`, code)
  }
  revalidatePath('/admin/promos')
}

export async function basculerPromo(id: string, actif: boolean) {
  const admin = await exigerRole('gestionnaire')
  await prisma.promo.update({ where: { id }, data: { actif } })
  await journaliser(admin.nom, 'modification', `Promo#${id}`, actif ? 'activée' : 'désactivée')
  revalidatePath('/admin/promos')
}

// ---------------------------------------------------------------- commandes

const LIBELLES_TRAITEMENT: Record<string, string> = {
  nouvelle: 'Commande reçue',
  preparee: 'Commande préparée',
  expediee: 'Commande expédiée',
  livree: 'Commande livrée',
  annulee: 'Commande annulée',
}

export async function changerStatutCommande(formData: FormData) {
  const admin = await exigerRole('vendeur')
  const id = texte(formData, 'id')
  const statut = texte(formData, 'statutTraitement')
  const commande = await prisma.order.findUnique({ where: { id }, include: { lignes: true } })
  if (!commande) return { erreur: 'Commande introuvable.' }

  // L'annulation remet le stock : sinon les articles resteraient bloqués.
  if (statut === 'annulee' && commande.statutTraitement !== 'annulee') {
    for (const ligne of commande.lignes) {
      if (!ligne.produitId) continue
      const produit = await prisma.product.update({
        where: { id: ligne.produitId },
        data: { stock: { increment: ligne.quantite } },
      })
      await prisma.stockMovement.create({
        data: {
          produitId: ligne.produitId,
          variation: ligne.quantite,
          stockApres: produit.stock,
          motif: 'annulation',
          note: `Commande ${commande.numero}`,
          auteur: admin.nom,
        },
      })
    }
  }

  await prisma.order.update({ where: { id }, data: { statutTraitement: statut } })
  await prisma.orderEvent.create({
    data: { commandeId: id, libelle: LIBELLES_TRAITEMENT[statut] ?? statut, auteur: admin.nom },
  })
  await journaliser(admin.nom, 'modification', `Order#${id}`, `statut → ${statut}`)
  revalidatePath('/admin/commandes')
}

export async function changerPaiementCommande(formData: FormData) {
  const admin = await exigerRole('vendeur')
  const id = texte(formData, 'id')
  const statutPaiement = texte(formData, 'statutPaiement')
  const modePaiement = texte(formData, 'modePaiement')

  await prisma.order.update({ where: { id }, data: { statutPaiement, modePaiement } })
  await prisma.orderEvent.create({
    data: { commandeId: id, libelle: `Paiement : ${statutPaiement} (${modePaiement})`, auteur: admin.nom },
  })
  await journaliser(admin.nom, 'modification', `Order#${id}`, `paiement → ${statutPaiement}`)
  revalidatePath('/admin/commandes')
}

export async function noterCommande(formData: FormData) {
  const admin = await exigerRole('vendeur')
  const id = texte(formData, 'id')
  await prisma.order.update({
    where: { id },
    data: { noteInterne: texte(formData, 'noteInterne') || null, suivi: texte(formData, 'suivi') || null },
  })
  await journaliser(admin.nom, 'modification', `Order#${id}`, 'note interne / suivi')
  revalidatePath('/admin/commandes')
}

// ------------------------------------------------------------------ clients

export async function majClient(formData: FormData) {
  const admin = await exigerRole('vendeur')
  const id = texte(formData, 'id')
  await prisma.customer.update({
    where: { id },
    data: {
      badge: texte(formData, 'badge') || 'aucun',
      notesInternes: texte(formData, 'notesInternes') || null,
    },
  })
  await journaliser(admin.nom, 'modification', `Customer#${id}`)
  revalidatePath('/admin/clients')
}

// --------------------------------------------------------------- messagerie

export async function repondreConversation(formData: FormData) {
  const admin = await exigerRole('vendeur')
  const conversationId = texte(formData, 'conversationId')
  const corps = texte(formData, 'corps')
  if (!corps) return { erreur: 'Le message est vide.' }

  await prisma.message.create({
    data: { conversationId, auteur: 'admin', nomAuteur: admin.nom, corps, luParAdmin: true },
  })
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { statut: 'en_attente', assigneA: admin.nom },
  })
  revalidatePath('/admin/messages')
}

export async function changerStatutConversation(id: string, statut: string) {
  await exigerRole('vendeur')
  await prisma.conversation.update({ where: { id }, data: { statut } })
  revalidatePath('/admin/messages')
}

// ---------------------------------------------------------------- contenus

export async function enregistrerBloc(formData: FormData) {
  const admin = await exigerRole('gestionnaire')
  const cle = texte(formData, 'cle')
  if (!cle) return { erreur: 'La clé est obligatoire.' }

  const donnees = {
    zone: texte(formData, 'zone') || 'accueil',
    type: texte(formData, 'type') || 'texte',
    valeur: texte(formData, 'valeur'),
    valeurAlt: texte(formData, 'valeurAlt') || null,
    ordre: nombre(formData, 'ordre'),
    statut: texte(formData, 'statut') || 'publie',
  }

  await prisma.contentBlock.upsert({
    where: { cle },
    update: donnees,
    create: { cle, ...donnees },
  })
  await journaliser(admin.nom, 'modification', `ContentBlock#${cle}`)
  revalidatePath('/admin/contenus')
  revalidatePath('/', 'layout')
}

export async function reinitialiserBloc(cle: string) {
  const admin = await exigerRole('gestionnaire')
  await prisma.contentBlock.deleteMany({ where: { cle } })
  await journaliser(admin.nom, 'suppression', `ContentBlock#${cle}`, 'retour au texte de départ')
  revalidatePath('/admin/contenus')
  revalidatePath('/', 'layout')
}

// ------------------------------------------------------------------ médias

export async function ajouterMedia(formData: FormData) {
  const admin = await exigerRole('gestionnaire')
  // Le champ image renvoie toujours une liste JSON ; ici on n'en garde qu'une.
  let donnees = ''
  try {
    const liste = JSON.parse(texte(formData, 'donneesListe') || '[]')
    if (Array.isArray(liste) && typeof liste[0] === 'string') donnees = liste[0]
  } catch {
    donnees = ''
  }
  if (!donnees.startsWith('data:image/')) return { erreur: 'Choisissez une image.' }

  await prisma.media.create({
    data: {
      nom: texte(formData, 'nom') || 'Image',
      alt: texte(formData, 'alt'),
      donnees,
      tailleKo: Math.round(donnees.length / 1024),
    },
  })
  await journaliser(admin.nom, 'creation', 'Media')
  revalidatePath('/admin/medias')
}

export async function supprimerMedia(id: string) {
  const admin = await exigerRole('gestionnaire')
  await prisma.media.delete({ where: { id } })
  await journaliser(admin.nom, 'suppression', `Media#${id}`)
  revalidatePath('/admin/medias')
}

// --------------------------------------------------------------- bannières

export async function enregistrerBanniere(formData: FormData) {
  const admin = await exigerRole('gestionnaire')
  const id = texte(formData, 'id')
  const donnees = {
    texte: texte(formData, 'texte'),
    lien: texte(formData, 'lien') || null,
    couleur: texte(formData, 'couleur') || 'rouge',
    debut: dateOuNull(formData, 'debut'),
    fin: dateOuNull(formData, 'fin'),
    actif: coche(formData, 'actif'),
    ordre: nombre(formData, 'ordre'),
  }
  if (!donnees.texte) return { erreur: 'Le texte est obligatoire.' }

  if (id) await prisma.banner.update({ where: { id }, data: donnees })
  else await prisma.banner.create({ data: donnees })

  await journaliser(admin.nom, id ? 'modification' : 'creation', `Banner#${id || 'nouveau'}`)
  revalidatePath('/admin/bannieres')
  revalidatePath('/', 'layout')
}

export async function supprimerBanniere(id: string) {
  const admin = await exigerRole('gestionnaire')
  await prisma.banner.delete({ where: { id } })
  await journaliser(admin.nom, 'suppression', `Banner#${id}`)
  revalidatePath('/admin/bannieres')
  revalidatePath('/', 'layout')
}

// -------------------------------------------------------------- paramètres

export async function enregistrerReglages(formData: FormData) {
  const admin = await exigerRole('proprietaire')
  const entrees: Partial<Reglages> = {}
  formData.forEach((valeur, cle) => {
    if (typeof valeur === 'string') entrees[cle as keyof Reglages] = valeur
  })
  // Les cases non cochées n'apparaissent pas dans le formulaire.
  for (const cle of ['PAIEMENT_CARTE', 'PAIEMENT_HORS_LIGNE'] as const) {
    entrees[cle] = formData.get(cle) ? 'oui' : 'non'
  }

  // Le logo passe par le champ image, qui renvoie une liste JSON.
  const listeLogo = texte(formData, 'SITE_LOGO_LISTE')
  if (listeLogo) {
    try {
      const analyse = JSON.parse(listeLogo)
      entrees.SITE_LOGO = Array.isArray(analyse) && typeof analyse[0] === 'string' ? analyse[0] : ''
    } catch {
      entrees.SITE_LOGO = ''
    }
  }
  await ecrireReglages(entrees)
  await journaliser(admin.nom, 'modification', 'Setting', Object.keys(entrees).join(', '))
  revalidatePath('/admin/parametres')
  revalidatePath('/', 'layout')
}

// ----------------------------------------------------------- comptes admin

export async function creerAdmin(formData: FormData) {
  const admin = await exigerRole('proprietaire')
  const identifiant = texte(formData, 'identifiant')
  const nom = texte(formData, 'nom')
  const motDePasse = String(formData.get('motDePasse') ?? '')
  const role = texte(formData, 'role')

  if (identifiant.length < 3) return { erreur: 'Identifiant trop court.' }
  if (motDePasse.length < 12) return { erreur: 'Le mot de passe doit faire 12 caractères minimum.' }
  if (!estRole(role)) return { erreur: 'Rôle inconnu.' }

  const existe = await prisma.adminUser.findUnique({ where: { identifiant } })
  if (existe) return { erreur: 'Cet identifiant est déjà pris.' }

  const cree = await prisma.adminUser.create({
    data: { identifiant, nom: nom || identifiant, motDePasse: hacherMotDePasse(motDePasse), role },
  })
  await journaliser(admin.nom, 'creation', `AdminUser#${cree.id}`, `${identifiant} (${role})`)
  revalidatePath('/admin/comptes')
}

export async function changerRoleAdmin(formData: FormData) {
  const admin = await exigerRole('proprietaire')
  const id = texte(formData, 'id')
  const role = texte(formData, 'role')
  if (!estRole(role)) return { erreur: 'Rôle inconnu.' }

  const cible = await prisma.adminUser.findUnique({ where: { id } })
  if (!cible) return { erreur: 'Compte introuvable.' }

  if (cible.role === 'proprietaire' && role !== 'proprietaire') {
    const proprietaires = await prisma.adminUser.count({ where: { role: 'proprietaire', actif: true } })
    if (proprietaires <= 1) return { erreur: 'Il doit rester au moins un propriétaire.' }
  }

  await prisma.adminUser.update({ where: { id }, data: { role } })
  await journaliser(admin.nom, 'modification', `AdminUser#${id}`, `rôle → ${role}`)
  revalidatePath('/admin/comptes')
}

export async function changerMotDePasseAdmin(formData: FormData) {
  const admin = await exigerRole('proprietaire')
  const id = texte(formData, 'id')
  const motDePasse = String(formData.get('motDePasse') ?? '')
  if (motDePasse.length < 12) return { erreur: 'Le mot de passe doit faire 12 caractères minimum.' }

  await prisma.adminUser.update({ where: { id }, data: { motDePasse: hacherMotDePasse(motDePasse) } })
  await prisma.adminSession.deleteMany({ where: { adminId: id } })
  await journaliser(admin.nom, 'modification', `AdminUser#${id}`, 'mot de passe réinitialisé')
  revalidatePath('/admin/comptes')
}

export async function supprimerAdmin(id: string) {
  const admin = await exigerRole('proprietaire')
  const cible = await prisma.adminUser.findUnique({ where: { id } })
  if (!cible) return { erreur: 'Compte introuvable.' }

  if (cible.role === 'proprietaire') {
    const proprietaires = await prisma.adminUser.count({ where: { role: 'proprietaire', actif: true } })
    if (proprietaires <= 1) return { erreur: 'Il doit rester au moins un propriétaire.' }
  }

  await prisma.adminUser.delete({ where: { id } })
  await journaliser(admin.nom, 'suppression', `AdminUser#${id}`, cible.identifiant)
  revalidatePath('/admin/comptes')
}

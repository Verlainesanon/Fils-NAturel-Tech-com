'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const AN = 365 * 24 * 3600

/** Langue forcée par le visiteur : elle prime sur celle de son navigateur. */
export async function choisirLangue(code: string) {
  cookies().set('fntc_langue', code, { path: '/', maxAge: AN, sameSite: 'lax' })
  revalidatePath('/', 'layout')
}

/** Devise d'affichage. Les prix restent enregistrés dans la devise de base. */
export async function choisirDevise(code: string) {
  cookies().set('fntc_devise', code, { path: '/', maxAge: AN, sameSite: 'lax' })
  revalidatePath('/', 'layout')
}

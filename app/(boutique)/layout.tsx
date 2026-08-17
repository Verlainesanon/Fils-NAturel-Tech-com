import EnTete from '@/components/EnTete'
import PiedDePage from '@/components/PiedDePage'
import Chat from '@/components/Chat'

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EnTete />
      <main>{children}</main>
      <PiedDePage />
      <Chat />
    </>
  )
}

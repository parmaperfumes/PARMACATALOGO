import { Header } from "@/components/Header"
import { WhatsAppProvider } from "@/context/WhatsAppContext"
import { WhatsAppButton } from "@/components/WhatsAppButton"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WhatsAppProvider>
      <Header />
      {children}
      <WhatsAppButton />
    </WhatsAppProvider>
  )
}


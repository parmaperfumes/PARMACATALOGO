import { AnnouncementBar } from "@/components/AnnouncementBar"
import { Header } from "@/components/Header"
import { WhatsAppProvider } from "@/context/WhatsAppContext"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { SearchProvider } from "@/context/SearchContext"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
	return (
		<SearchProvider>
			<WhatsAppProvider>
				<AnnouncementBar />
				<Header />
				{children}
				<WhatsAppButton />
			</WhatsAppProvider>
		</SearchProvider>
	)
}


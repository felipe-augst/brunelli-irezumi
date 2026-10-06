import Link from 'next/link'
import { MAPS_URL, WHATSAPP_URL } from '@/data/projects'
import { MapPinned, Phone, MessageCircleCheck } from 'lucide-react'

export function MobileNav() {
  return (
    <nav className="bg-surface-container-low/90 fixed bottom-0 left-0 z-50 flex w-full items-center justify-around px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md md:hidden">
      <Link
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-secondary text-accent flex flex-col items-center justify-center transition-all duration-300"
      >
        <MessageCircleCheck size={24} />
        <span className="font-body mt-1 pt-2 text-[10px] tracking-widest uppercase">
          WhatsApp
        </span>
      </Link>

      <Link
        href="tel:11976624286"
        className="hover:text-secondary text-accent flex flex-col items-center justify-center transition-all duration-300"
      >
        <Phone size={24} />
        <span className="font-body mt-1 pt-2 text-[10px] tracking-widest uppercase">
          Ligar
        </span>
      </Link>

      <Link
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-secondary text-accent flex flex-col items-center justify-center transition-all duration-300"
      >
        <MapPinned size={24} />
        <span className="font-body mt-1 pt-2 text-[10px] tracking-widest uppercase">
          Localização
        </span>
      </Link>
    </nav>
  )
}

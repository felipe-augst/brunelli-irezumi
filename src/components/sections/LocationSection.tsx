import Link from 'next/link'
import { MAPS_URL, STUDIO_ADDRESS, STUDIO_HOURS } from '@/data/projects'
import { Clock, MapPinned } from 'lucide-react'

export function LocationSection() {
  return (
    <section
      className="border-outline-variant from-bg-surface to-surface-container-high border-t bg-linear-to-b py-12 md:py-24"
      id="localizacao"
    >
      <div className="mx-auto max-w-7xl px-3 lg:px-6">
        <div className="bg-outline-variant/10 grid gap-px md:grid-cols-2">
          {/* Info */}
          <div className="bg-surface-container-low flex flex-col items-center p-12">
            <h2 className="font-headline mb-8 text-center text-4xl font-black tracking-wide uppercase md:text-left">
              Onde estamos
            </h2>

            <div className="flex flex-col space-y-8">
              <div className="flex gap-4">
                <MapPinned
                  className="text-accent shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-on-surface font-bold">
                    {STUDIO_ADDRESS.complement}
                  </p>
                  <p className="text-on-surface-variant">
                    {STUDIO_ADDRESS.street}
                    <br />
                    {STUDIO_ADDRESS.city} - {STUDIO_ADDRESS.state},{' '}
                    {STUDIO_ADDRESS.cep}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="text-accent shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-bold">
                    Horário de Atendimento
                  </p>
                  <p className="text-on-surface-variant">{STUDIO_HOURS}</p>
                </div>
              </div>

              <Link
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-headline hover:text-on-surface border-accent text-accent hover:bg-accent/10 inline-block border px-8 py-4 text-center text-sm font-bold uppercase transition-all"
              >
                Como Chegar
              </Link>
            </div>
          </div>

          {/* Map */}
          <div className="bg-surface-variant relative min-h-100 overflow-hidden brightness-75 contrast-125">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d916.8592970852643!2d-46.8869884!3d-23.1907328!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf26938a08c8c9%3A0xb4d85dec7fadb797!2sThe%20Garden%20Custom!5e0!3m2!1spt-BR!2sbr!4v1775154788917!5m2!1spt-BR!2sbr"
              title="Localização do Estúdio no Google Maps"
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', inset: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

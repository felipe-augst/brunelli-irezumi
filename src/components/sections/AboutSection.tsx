import Image from 'next/image'
import { ABOUT_IMG } from '@/data/projects'

export function AboutSection() {
  return (
    <section className="bg-surface overflow-hidden py-24" id="sobre">
      <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 md:grid-cols-2">
        {/* Image column */}
        <div className="relative">
          <div className="font-headline text-accent/10 lg:text-accent/30 absolute top-96 left-48 z-0 text-center text-[10rem] leading-none font-black md:-top-20 md:left-72 lg:-left-7 xl:-top-5 xl:-left-10">
            ブ<br />ル<br />ネ<br />リ
          </div>
          <div className="relative z-10 aspect-square w-full overflow-hidden lg:ml-14">
            <Image
              src={ABOUT_IMG.src}
              alt={ABOUT_IMG.alt}
              fill
              quality={90}
              className="object-cover object-[center_20%] lg:object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Text column */}
        <div>
          <span className="font-headline text-accent text-sm font-bold tracking-[0.3em] uppercase">
            O Artista
          </span>
          <h2 className="font-headline mt-4 mb-8 text-4xl font-black tracking-wide uppercase md:text-6xl md:tracking-wide lg:tracking-widest">
            GANBATTE
          </h2>

          <div className="text-on-surface lg:text-on-surface-variant space-y-6 text-lg leading-relaxed">
            <p>
              Felipe Brunelli é adepto da poderosa expressão japonesa{' '}
              <strong className="text-accent">Ganbatte</strong> (頑張って):{' '}
              Diferente apenas do nosso "boa sorte", ela trás mais o sentido de
              "faça o seu melhor", "esforce-se sempre" e "persista diante das
              dificuldades".
            </p>
            <p>
              Com mais de uma década imerso na cultura e estética japonesa, seu
              trabalho é baseado em trazer a riqueza da tatuagem tradicional
              para seus clientes. Respeitando a tradição, seu principal objetivo
              é garantir um trabalho clássico, limpo, duradouro e significativo
            </p>
            <p>
              Cada projeto é iniciado do zero, respeitando a anatomia do corpo,
              a profundidade simbólica da arte e a estética tradicional da
              tatuagem japonesa.
            </p>
          </div>

          <blockquote className="bg-surface-container-high text-on-surface-variant border-accent mt-10 border-l-4 p-6 italic">
            &ldquo;A tatuagem japonesa é um processo que exige paciência,
            persistência e dedicação. Tanto minha quanto do cliente.&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  )
}

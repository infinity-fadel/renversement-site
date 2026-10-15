import { QUOTE_BANNER } from "@/config/v2.content";

/**
 * Bandeau citation (maquette, nœud `24:27`) : la phrase entre deux grands
 * guillemets, sur le visuel du globe doré assombri (fond `#422807`, image à
 * 48 % d'opacité).
 */
export default function QuoteBanner() {
  return (
    <section aria-label="Citation" className="relative overflow-hidden bg-[#422807]">
      <img
        src="/v2/bandeau-citation.webp"
        alt=""
        width={1672}
        height={941}
        className="absolute inset-0 h-full w-full object-cover object-[50%_30%] opacity-[0.48]"
      />
      <figure className="relative mx-auto flex max-w-[1512px] items-center gap-1 px-6 py-10 sm:px-10 md:min-h-[201px] md:px-32 md:py-12">
        <img
          src="/v2/guillemet-ouvrant.svg"
          alt=""
          width={65}
          height={84}
          className="h-auto w-8 shrink-0 self-start md:w-[65px] md:self-center"
        />
        <blockquote className="max-w-[533px] text-center font-display text-xl italic leading-[1.4] tracking-[0.01em] text-light-grey sm:text-[30px]">
          <p>{QUOTE_BANNER}</p>
        </blockquote>
        <img
          src="/v2/guillemet-fermant.svg"
          alt=""
          width={49}
          height={99}
          className="h-auto w-6 shrink-0 self-end md:w-[49px] md:self-center"
        />
      </figure>
    </section>
  );
}

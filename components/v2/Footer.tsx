import { ANCHORS, FOOTER } from "@/config/v2.content";
import SocialLinks from "./SocialLinks";

/** Pied de page de la V2 (maquette, nœud `45:1122`). */
export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-[1512px] flex-col gap-6 px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between min-[1400px]:px-24">
        <a
          href={`#${ANCHORS.home}`}
          aria-label="RENVERSEMENT — retour en haut de page"
          className="flex shrink-0 items-center gap-4"
        >
          <img src="/v2/monogramme.svg" alt="" width={36} height={32} />
          <img src="/v2/wordmark-footer.svg" alt="" width={193} height={53} />
        </a>

        <div className="flex flex-col gap-4 font-semibold text-light-grey/65 lg:w-[985px] lg:max-w-[70%] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <p className="flex items-center gap-1.5 leading-[1.6]">
              <img src="/v2/copyright.svg" alt="©" width={20} height={20} />
              {FOOTER.domain}
            </p>
            <p className="leading-[1.6]">{FOOTER.rights}</p>
          </div>
          <div className="flex items-center gap-6">
            <p className="whitespace-nowrap leading-[1.6]">{FOOTER.follow}</p>
            <SocialLinks />
          </div>
        </div>
      </div>
    </footer>
  );
}

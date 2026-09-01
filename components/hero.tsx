// components/hero.tsx — Drop 001 opening statement, closing on the flyover scene.

import Link from "next/link";
import { DROP } from "@/lib/products";
import { Flyover } from "./flyover";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="relative mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24 lg:pt-32">
        <h1>
          <span className="rise label block text-paper-dim">JUST RSA</span>
          <span className="rise label mt-2 block text-gold [animation-delay:80ms]">
            {DROP.code}
            <span className="mx-2 text-paper-dim">/</span>
            {DROP.location} · {DROP.date}
          </span>

          <span aria-hidden="true" className="rise mt-7 block sm:mt-9 [animation-delay:160ms]">
            <span className="block h-px w-full bg-gold/50" />
          </span>

          <span className="display mt-7 block text-[3.25rem] leading-[0.86] xs:text-6xl sm:mt-9 sm:text-8xl lg:text-[9.5rem]">
            <span className="rise block [animation-delay:200ms]">You couldn&rsquo;t</span>
            <span className="rise block [animation-delay:280ms]">make this</span>
            <span className="rise block [animation-delay:360ms]">stuff up.</span>
          </span>
        </h1>

        <p className="rise mt-8 max-w-md text-base leading-relaxed text-paper-dim sm:mt-10 sm:text-lg [animation-delay:460ms]">
          Two jets. One stadium.
          <br />
          Just another Saturday in South Africa.
        </p>

        <Link
          href="#drop-001"
          className="rise label mt-10 inline-flex items-center border border-paper px-6 py-4 text-paper transition-colors hover:bg-paper hover:text-ink sm:mt-12 [animation-delay:540ms]"
        >
          [ Shop Drop 001 ]
        </Link>
      </div>

      <div className="mt-12 sm:mt-16">
        <Flyover />
      </div>
    </section>
  );
}

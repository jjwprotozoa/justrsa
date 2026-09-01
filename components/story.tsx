// components/story.tsx — the moment, in as few words as possible.

export function Story() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <p className="reveal label text-gold">
          29.08.26
          <br />
          <span className="text-paper-dim">Cape Town, South Africa</span>
        </p>
        <p className="reveal display text-3xl sm:text-5xl lg:text-6xl">
          For a few seconds,
          <br />
          everyone looked up.
        </p>
      </div>
    </section>
  );
}

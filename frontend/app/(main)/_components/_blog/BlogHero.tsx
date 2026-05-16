import Image from "next/image";

export default function BlogHero() {
  return (
    <section className="relative h-[320px] overflow-hidden rounded-[32px] md:h-[480px]">
      <Image
        src="/images/blog-detail.jpg"
        alt="blog"
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute bottom-8 left-8 z-10 space-y-4 text-white md:left-12 md:bottom-12">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium">
            Hidden Gems
          </span>

          <span className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium">
            Coastal Dining
          </span>
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">
          Hidden Gems of the Coastal Pier
        </h1>

        <div className="flex items-center gap-5 text-sm md:text-base">
          <span>October 24, 2023</span>
          <span>8 min read</span>
        </div>
      </div>
    </section>
  );
}
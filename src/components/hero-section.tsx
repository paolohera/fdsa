import HeroIntro from "@/components/hero-intro";

export default function HeroSection({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <section className="w-full">
      <HeroIntro>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-animate
          src={imageUrl || "/hero-background.png"}
          alt="FDSA campus and students"
          className="w-full h-auto"
        />
      </HeroIntro>
    </section>
  );
}
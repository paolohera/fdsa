import HeroIntro from "@/components/hero-intro";

export default function HeroSection() {
  return (
    <section className="w-full">
      <HeroIntro>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-animate
          src="/hero-background.png"
          alt="FDSA campus and students"
          className="w-full h-auto"
        />
      </HeroIntro>
    </section>
  );
}
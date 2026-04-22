import WebNav from "@/components/WebNav";
import Image from "next/image";
import ProductsSection from "@/components/ProductsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import type { IconType } from "react-icons";
import { FaGem, FaHeadset, FaPalette, FaTruckFast } from "react-icons/fa6";
import BG from "../images/HomeScreen.webp";
import BGMobile from "../images/HomeScreenMobileResponse.webp";
import ProductBG from "../images/ProductBG.webp";
import ContactBG from "../images/ContactBG.webp"

const HOME_FEATURES: ReadonlyArray<{
  title: string;
  desc: string;
  Icon: IconType;
}> = [
    {
      title: "Prime Quality",
      desc: "Durable teak and clean finish.",
      Icon: FaGem,
    },
    {
      title: "Fast Work",
      desc: "On-time delivery and support.",
      Icon: FaTruckFast,
    },
    {
      title: "Unique Art",
      desc: "Modern, minimal wood designs.",
      Icon: FaPalette,
    },
    {
      title: "Top Support",
      desc: "Friendly service from start.",
      Icon: FaHeadset,
    },
  ];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <WebNav />

      <main className="w-full  ">
        <section
          id="home"
          className="relative isolate min-h-svh scroll-mt-20 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <div className="relative h-full w-full">
              <Image
                src={BGMobile}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover sm:hidden"
              />
              <Image
                src={BG}
                alt=""
                fill
                priority
                sizes="100vw"
                className="hidden object-cover sm:block"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          </div>

          <div className="relative z-10 flex min-h-svh flex-col">
            <div className="w-full px-4 pt-40 sm:px-26 sm:pt-44">
              <div className="flex flex-col items-center gap-6  ">
                <div>
                  <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
                    Living<span className="text-emerald-300">Teak</span>
                  </h1>
                  <p className="text-sm font-medium text-white text-start">
                    From wood to wow
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#contact"
                    className="inline-flex items-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-400"
                  >
                    Contact us
                  </a>
                  <a
                    href="#products"
                    className="inline-flex items-center rounded-xl border border-emerald-500/40 px-6 py-3 text-sm font-semibold text-white hover:border-emerald-400/70 hover:text-emerald-300"
                  >
                    View products
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-auto w-full  ">
              <div className=" bg-black/60 px-4 py-6 text-center backdrop-blur sm:px-6 sm:py-8">
                <p className="text-3xl font-bold tracking-tight text-white sm:text-6xl">
                  Professional
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-emerald-300 sm:text-4xl">
                  Carpentry Service
                </p>
              </div>
            </div>

            <div className="w-full bg-black/90 px-4 py-3 sm:px-6">
              <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2 text-center md:grid-cols-4">
                {HOME_FEATURES.map(({ title, Icon }) => (
                  <div key={title} className="py-1">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-black/40 sm:h-14 sm:w-14">
                      <Icon className="text-base text-emerald-300 sm:text-xl" />
                    </div>
                    <p className="mt-3 text-xs font-semibold text-white sm:text-sm">
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className=" w-full bg-black" />

        <section
          id="products"
          className="relative isolate min-h-svh scroll-mt-0 py-6 sm:py-10"
        >
          <div className="absolute inset-0 z-0">
            <Image
              src={ProductBG}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>
          <div className="relative z-10 px-4 sm:px-12">
            <ProductsSection />
          </div>
        </section>

        <div className="h-px w-full bg-black" />

        <section
          id="about"
          className="relative min-h-svh scroll-mt-0 py-8 sm:py-8 sm:px-4"
        >
          <div className="absolute inset-0 -z-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_55%)]" />
            <div className="absolute inset-0 bg-black/70" />
          </div>

          <div className="mx-auto w-full  px-4 sm:px-8">
            <div>
              <div className="max-w-xl">
                <div className="border border-emerald-400 rounded-lg px-4 py-1  sm:w-30">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    About
                  </h2>
                </div>
              </div>
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16 xl:gap-24 mt-8">
                <div className="flex-1 lg:max-w-2xl xl:max-w-3xl">
                  <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
                    Mastering the art
                    <span className="block bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent mt-2 pb-2">
                      of premium teak
                    </span>
                  </h2>
                  <p className="mt-8 text-base leading-relaxed text-white/80 sm:text-lg">
                    We don't just build furniture; we breathe life into raw timber. Every piece of teak is hand-selected and meticulously sculpted to create statement pieces that command attention and stand the test of time.
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                    Every piece that leaves our space carries a story of absolute dedication, careful sourcing, and uncompromising attention to detail.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 lg:w-[450px] shrink-0">
                  {[
                    { label: "Projects", value: "10+" },
                    { label: "Clients", value: "20+" },
                    { label: "Years", value: "02" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="group flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20"
                    >
                      <p className="text-3xl font-bold text-emerald-300 drop-shadow-md group-hover:scale-105 transition-transform duration-300">
                        {stat.value}
                      </p>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-emerald-200 transition-colors">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>


            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                <Image
                  src={BG}
                  alt="Workshop craftsmanship"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 lg:p-8 backdrop-blur-sm">
                <div className="grid gap-4 sm:grid-cols-2 h-full content-center">
                  {[
                    {
                      title: "Artisan Craftsmanship",
                      desc: "Forged by hands mastering the subtle language of wood over decades.",
                      icon: "✨"
                    },
                    {
                      title: "Premium Teak",
                      desc: "Exclusively using grade-A teak for rich oils and immortal durability.",
                      icon: "💎"
                    },
                    {
                      title: "Eco-Conscious",
                      desc: "Luxury that respects the earth. All materials are ethically sourced.",
                      icon: "🌱"
                    },
                    {
                      title: "Bespoke Service",
                      desc: "A white-glove experience from first inquiry to final installation.",
                      icon: "🤝"
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/10"
                    >
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                        {card.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {card.title}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-white/60 group-hover:text-white/80 transition-colors">
                          {card.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-black" />

        <section
          id="contact"
          className="relative isolate min-h-svh scroll-mt-0 py-8 sm:py-8 "
        >
          <div className="absolute inset-0 z-0">
            <Image
              src={ContactBG}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-black/70" />
          </div>
          <div className="relative z-10 px-4 sm:px-12">
            <ContactSection />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

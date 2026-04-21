import WebNav from "@/components/WebNav";
import Image from "next/image";
import ProductsSection from "@/components/ProductsSection";
import type { IconType } from "react-icons";
import { FaGem, FaHeadset, FaPalette, FaTruckFast } from "react-icons/fa6";
import BG from "../images/HomeScreen.webp";
import BGMobile from "../images/HomeScreenMobileResponse.webp";
import ProductBG from "../images/ProductBG.webp";

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

        <section id="about" className="min-h-svh scroll-mt-20 py-16 sm:py-24">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            About
          </h2>
          <p className="mt-4 max-w-2xl text-white/80">
            We focus on authentic materials, careful craftsmanship, and
            customer-first service.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Craftsmanship",
                desc: "Built with attention to detail.",
              },
              { title: "Teak Quality", desc: "Strong wood, natural beauty." },
              {
                title: "Support",
                desc: "Friendly help from order to delivery.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-sm font-semibold text-white">{card.title}</p>
                <p className="mt-2 text-sm text-white/75">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px w-full bg-black" />

        <section id="contact" className="min-h-svh scroll-mt-20 py-16 sm:py-24">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Contact us
          </h2>
          <p className="mt-4 max-w-2xl text-white/80">
            Send us a message and we’ll get back to you.
          </p>

          <div className="mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="text-white/80">Name</span>
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="Your name"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="text-white/80">Email</span>
                <input
                  type="email"
                  className="h-11 rounded-xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="you@example.com"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="text-white/80">Message</span>
                <textarea
                  className="min-h-28 resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="Write your message"
                />
              </label>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-black hover:bg-emerald-400"
              >
                Send
              </button>
            </div>
          </div>
        </section>

        <footer className="py-10 text-sm text-white/60">
          <div className="h-px w-full bg-white/10" />
          <p className="mt-6">© {new Date().getFullYear()} LivingTeak</p>
        </footer>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { FaStar } from "react-icons/fa6";

type Testimonial = {
  _id: string;
  clientName: string;
  rating: number;
  feedback: string;
  active?: boolean;
};

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    _id: "fallback-1",
    clientName: "Living Teak Client",
    rating: 5,
    feedback:
      "Beautiful teak work, careful finishing, and friendly service from the first call to delivery.",
    active: true,
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials?active=true", { cache: "no-store" });
        const data = (await response.json()) as Testimonial[];
        if (!response.ok || !Array.isArray(data) || data.length === 0) return;
        setTestimonials(data);
        setActiveIndex(0);
      } catch {
        setTestimonials(FALLBACK_TESTIMONIALS);
      }
    };

    void loadTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [testimonials.length]);

  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];
  const previewTestimonials = useMemo(
    () => testimonials.slice(0, Math.min(testimonials.length, 3)),
    [testimonials]
  );

  return (
    <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-black/50 p-5 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
         
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            What clients says
          </h3>
        </div>
        <div className="flex gap-2">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial._id}
              type="button"
              aria-label={`Show testimonial ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={
                index === activeIndex
                  ? "h-2.5 w-8 rounded-full bg-emerald-300 transition-all"
                  : "h-2.5 w-2.5 rounded-full bg-white/30 transition-all hover:bg-white/60"
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-500/15 via-white/5 to-black p-6 sm:p-8">
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={testimonial._id}
                className={
                  "absolute inset-0 flex flex-col justify-between p-6 transition-all duration-700 ease-out sm:p-8 " +
                  (isActive
                    ? "translate-x-0 opacity-100"
                    : index < activeIndex
                      ? "-translate-x-8 opacity-0"
                      : "translate-x-8 opacity-0")
                }
              >
                <div>
                  <div className="flex gap-1 text-emerald-300">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <FaStar
                        key={starIndex}
                        className={
                          starIndex < testimonial.rating ? "h-4 w-4" : "h-4 w-4 opacity-25"
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-6 text-xl font-semibold leading-relaxed text-white sm:text-2xl">
                    &ldquo;{testimonial.feedback}&rdquo;
                  </p>
                </div>
                <div className="mt-8">
                  <p className="text-base font-bold text-emerald-200">
                    {testimonial.clientName}
                  </p>
                  
                </div>
              </article>
            );
          })}
        </div>

        <div className="grid gap-3">
          {previewTestimonials.map((testimonial, index) => (
            <button
              key={testimonial._id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={
                testimonial._id === activeTestimonial?._id
                  ? "rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-left"
                  : "rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-bold text-white">{testimonial.clientName}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                  <FaStar className="h-3 w-3" />
                  {testimonial.rating}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">
                {testimonial.feedback}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="relative mt-0 bg-black pt-16">
            {/* Top Gradient Border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-4 lg:gap-8 pb-12">
                    {/* Brand & Description */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            Living<span className="text-emerald-400">Teak</span>
                        </h2>
                        <p className="max-w-md text-sm leading-relaxed text-white/60">
                            Transforming raw, premium teak timber into immortal statement pieces.
                            We bring decades of artisan craftsmanship to create modern, minimal,
                            and highly durable wooden furniture for your spaces.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-emerald-500 hover:text-black">
                                <FaFacebookF className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-emerald-500 hover:text-black">
                                <FaInstagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-emerald-500 hover:text-black">
                                <FaTwitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-emerald-500 hover:text-black">
                                <FaLinkedinIn className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                            Quick Links
                        </h3>
                        <ul className="mt-6 space-y-4">
                            {['Home', 'Products', 'About', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a
                                        href={`#${item.toLowerCase()}`}
                                        className="text-sm text-white/60 transition-colors hover:text-emerald-400"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Details */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                            Contact
                        </h3>
                        <ul className="mt-6 space-y-4 text-sm text-white/60">
                            <li>
                                <span className="block text-white/40 mb-1">Phone</span>
                                <a href="tel:0764783031" className="hover:text-emerald-400 transition-colors">076 478 3031</a>
                            </li>
                            <li>
                                <span className="block text-white/40 mb-1">Email</span>
                                <a href="mailto:woodmaxlk@gmail.com" className="hover:text-emerald-400 transition-colors">woodmaxlk@gmail.com</a>
                            </li>
                            <li>
                                <span className="block text-white/40 mb-1">Address</span>
                                <span>Gallenbindunuwewa, Sri Lanka</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 md:flex-row">
                    <p className="text-sm text-white/40">
                        © {new Date().getFullYear()} LivingTeak. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

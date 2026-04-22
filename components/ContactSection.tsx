"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Message sent successfully!");
                setFormData({ name: "", email: "", phone: "", message: "" });
            } else {
                toast.error(data.error || "Failed to send message.");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="min-h-svh scroll-mt-20 py-16 sm:py-24 px-4 sm:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                    Contact us
                </h2>
                <p className="mt-4 max-w-2xl text-white/80">
                    Get in touch with us for inquiries, custom orders, or any questions. We’re here to help you turn wood into wow.
                </p>

                <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Contact Details & Map */}
                    <div className="flex flex-col gap-8">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <div className="mb-6 grid gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                                        Phone
                                    </h3>
                                    <p className="mt-2 text-xl font-medium text-white transition-colors hover:text-emerald-400">
                                        <a href="tel:071021694">071021694</a>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                                        Email
                                    </h3>
                                    <p className="mt-2 text-lg font-medium text-white transition-colors hover:text-emerald-400">
                                        <a href="mailto:dlshantharindu8@gmail.com">dlshantharindu8@gmail.com</a>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                                        Address
                                    </h3>
                                    <p className="mt-2 max-w-xs text-lg font-medium text-white leading-relaxed">
                                        Gallenbindunuwewa, Sri Lanka
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-white/10">
                                <iframe
                                    width="100%"
                                    height="250"
                                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                    loading="lazy"
                                    allowFullScreen
                                    src="https://maps.google.com/maps?q=Galenbindunuwewa&t=&z=11&ie=UTF8&iwloc=&output=embed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
                        <form onSubmit={handleSubmit} className="grid gap-6">
                            <label className="grid gap-2 text-sm">
                                <span className="text-white/80 font-medium">Name <span className="text-emerald-400">*</span></span>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    placeholder="Your name"
                                    required
                                />
                            </label>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <label className="grid gap-2 text-sm">
                                    <span className="text-white/80 font-medium">Email <span className="text-emerald-400">*</span></span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </label>
                                <label className="grid gap-2 text-sm">
                                    <span className="text-white/80 font-medium">Phone number</span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                        placeholder="Your mobile number"
                                    />
                                </label>
                            </div>

                            <label className="grid gap-2 text-sm">
                                <span className="text-white/80 font-medium">Message <span className="text-emerald-400">*</span></span>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="min-h-32 resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    placeholder="Write your message here"
                                    required
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-500 px-6 sm:w-auto sm:self-start text-sm font-bold text-black hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

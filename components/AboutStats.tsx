"use client";

import { useEffect, useState } from "react";

type SiteSettings = {
  projectsCompleted: number;
  happyClients: number;
  yearsExperience: number;
};

const DEFAULT_SETTINGS: SiteSettings = {
  projectsCompleted: 10,
  happyClients: 20,
  yearsExperience: 2,
};

function formatStat(value: number, suffix = "+") {
  return `${String(value).padStart(value < 10 ? 2 : 1, "0")}${suffix}`;
}

export default function AboutStats() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const data = (await response.json()) as Partial<SiteSettings>;
        if (!response.ok) return;

        setSettings({
          projectsCompleted:
            typeof data.projectsCompleted === "number"
              ? data.projectsCompleted
              : DEFAULT_SETTINGS.projectsCompleted,
          happyClients:
            typeof data.happyClients === "number"
              ? data.happyClients
              : DEFAULT_SETTINGS.happyClients,
          yearsExperience:
            typeof data.yearsExperience === "number"
              ? data.yearsExperience
              : DEFAULT_SETTINGS.yearsExperience,
        });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    };

    void loadSettings();
  }, []);

  const stats = [
    { label: "Projects", value: formatStat(settings.projectsCompleted) },
    { label: "Clients", value: formatStat(settings.happyClients) },
    { label: "Years", value: formatStat(settings.yearsExperience, "") },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:w-[450px] shrink-0">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20"
        >
          <p className="text-3xl font-bold text-emerald-300 drop-shadow-md transition-transform duration-300 group-hover:scale-105">
            {stat.value}
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors group-hover:text-emerald-200">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

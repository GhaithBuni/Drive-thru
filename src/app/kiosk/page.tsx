"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Drive‑Thru Fönsterkiosk — SVENSKA
// 1‑kolumn med fyra val: "Ensam", "Presenterar", "Runner", "Delar".
// LOGIK:
// • "Ensam" = en person gör ALLA roller (presenterar, runner, delar). Kan inte kombineras med övriga val.
// • Annars: välj valfri kombination av roller (minst en), och stämpla in person(er) per roll.
// • Start kräver att rätt antal personer är valda utifrån läget.

const STAFF = [
  { id: "1001", name: "Alex Kim" },
  { id: "1002", name: "Maria Lopez" },
  { id: "1003", name: "Omar Hassan" },
  { id: "1004", name: "Sara Nilsson" },
];

const TIPS = [
  "Hälsa med ett leende och bekräfta beställningen tydligt.",
  "Upprepa kundens anpassningar för att undvika misstag.",
  "Erbjud såser och servetter utan att invänta fråga.",
  "Lämna över betalning, växel och kvitto prydligt.",
  "Håll fönsterområdet rent; torka av mellan bilar om möjligt.",
  "Vid väntan: sätt förväntningar och tacka kunden för tålamodet.",
];

// ---- Typer -----------------------------------------------------------------
export type Emp = { id: string; name: string };
export type Roles = { presenterar: boolean; runner: boolean; delar: boolean };
export type RoleMap = {
  presenterar: Emp | null;
  runner: Emp | null;
  delar: Emp | null;
};

// ---- Huvudsida -------------------------------------------------------------
export default function KioskWindow() {
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(new Date());

  const [solo, setSolo] = useState<boolean | null>(null);
  const [roles, setRoles] = useState<Roles>({
    presenterar: false,
    runner: false,
    delar: false,
  });

  const [soloStaff, setSoloStaff] = useState<Emp | null>(null);
  const [roleStaff, setRoleStaff] = useState<RoleMap>({
    presenterar: null,
    runner: null,
    delar: null,
  });

  const [clockInAt, setClockInAt] = useState<string | null>(null);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      clearInterval(t);
    };
  }, []);

  const enableSolo = () => {
    setSolo(true);
    setRoles({ presenterar: true, runner: true, delar: true });
    setRoleStaff({ presenterar: null, runner: null, delar: null });
  };

  const toggleRoleMulti = (key: keyof Roles) => {
    if (solo === true) {
      setSolo(false);
      setSoloStaff(null);
    }
    setRoles((r) => {
      const next = { ...r, [key]: !r[key] } as Roles;
      if (!next.presenterar && !next.runner && !next.delar) {
        setSolo(null);
      } else if (solo === null) {
        setSolo(false);
      }
      return next;
    });
  };

  const anyRole =
    solo === true ? true : roles.presenterar || roles.runner || roles.delar;

  const ready = (() => {
    if (!anyRole) return false;
    if (solo === true) return !!soloStaff;
    if (solo === false) {
      if (roles.presenterar && !roleStaff.presenterar) return false;
      if (roles.runner && !roleStaff.runner) return false;
      if (roles.delar && !roleStaff.delar) return false;
      return true;
    }
    return false;
  })();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="p-4 border-b border-white/10 bg-neutral-900 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center font-black text-black">
              DT
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">
                Drive‑Thru Fönsterkiosk
              </div>
              <div className="text-xs text-white/60">
                Plats: STORE‑123 • Enhet: WINDOW‑KIOSK‑01
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <OnlineBadge online={online} />
            <span className="text-white/60">
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Bemanning/roller */}
        {!clockInAt && (
          <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5">
            <div className="text-2xl font-semibold mb-3">Välj bemanning</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <ToggleChip
                active={solo === true}
                onClick={enableSolo}
                label="Ensam"
                subtitle="En person (alla roller)"
              />
              <ToggleChip
                active={roles.presenterar}
                onClick={() => toggleRoleMulti("presenterar")}
                label="Presenterar"
                subtitle="Tar beställning"
                disabled={solo === true}
              />
              <ToggleChip
                active={roles.runner}
                onClick={() => toggleRoleMulti("runner")}
                label="Runner"
                subtitle="Hämtar maten"
                disabled={solo === true}
              />
              <ToggleChip
                active={roles.delar}
                onClick={() => toggleRoleMulti("delar")}
                label="Delar"
                subtitle="Lämnar ut maten"
                disabled={solo === true}
              />
            </div>
            {solo === true && (
              <div className="mt-2 text-xs text-emerald-300">
                Läge: <strong>Ensam</strong> – en person gör alla roller.
              </div>
            )}
            {solo === false &&
              !(roles.presenterar || roles.runner || roles.delar) && (
                <div className="mt-2 text-xs text-yellow-300">
                  Välj minst en roll.
                </div>
              )}
          </section>
        )}

        {/* Val av personal */}
        {!clockInAt &&
          (solo === null ? (
            <div className="text-white/60 text-sm">
              Välj läge (Ensam eller kombination av roller) för att fortsätta.
            </div>
          ) : (
            <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-4">
              <div className="text-xl font-semibold">Välj personal</div>
              {solo ? (
                <div>
                  <div className="text-white/60 text-sm mb-2">
                    En person för <strong>alla roller</strong>.
                  </div>
                  <EmployeePicker
                    selected={soloStaff}
                    onSelect={setSoloStaff}
                    placeholder="Sök namn eller nummer..."
                  />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {roles.presenterar && (
                    <div>
                      <div className="text-sm text-white/70 mb-1">
                        Presenterar
                      </div>
                      <EmployeePicker
                        selected={roleStaff.presenterar}
                        onSelect={(s) =>
                          setRoleStaff((m) => ({ ...m, presenterar: s }))
                        }
                        placeholder="Sök till Presenterar..."
                      />
                    </div>
                  )}
                  {roles.runner && (
                    <div>
                      <div className="text-sm text-white/70 mb-1">Runner</div>
                      <EmployeePicker
                        selected={roleStaff.runner}
                        onSelect={(s) =>
                          setRoleStaff((m) => ({ ...m, runner: s }))
                        }
                        placeholder="Sök till Runner..."
                      />
                    </div>
                  )}
                  {roles.delar && (
                    <div>
                      <div className="text-sm text-white/70 mb-1">Delar</div>
                      <EmployeePicker
                        selected={roleStaff.delar}
                        onSelect={(s) =>
                          setRoleStaff((m) => ({ ...m, delar: s }))
                        }
                        placeholder="Sök till Delar..."
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  disabled={!ready}
                  onClick={() => {
                    const nowIso = new Date().toISOString();
                    setClockInAt(nowIso);
                    const payload = solo
                      ? {
                          mode: "solo",
                          roles: {
                            presenterar: true,
                            runner: true,
                            delar: true,
                          },
                          staff: soloStaff,
                          clockInAt: nowIso,
                        }
                      : {
                          mode: "multi",
                          roles,
                          staff: roleStaff,
                          clockInAt: nowIso,
                        };
                    alert(
                      `Stämplade in!\n\n${JSON.stringify(payload, null, 2)}`
                    );
                  }}
                  className={`h-12 px-5 rounded-xl font-semibold border ${
                    ready
                      ? "bg-white text-black border-white"
                      : "bg-neutral-700 text-white/40 border-white/10"
                  }`}
                >
                  Starta
                </button>
                <button
                  onClick={() => {
                    setSolo(null);
                    setRoles({
                      presenterar: false,
                      runner: false,
                      delar: false,
                    });
                    setSoloStaff(null);
                    setRoleStaff({
                      presenterar: null,
                      runner: null,
                      delar: null,
                    });
                    setClockInAt(null);
                  }}
                  className="h-12 px-5 rounded-xl border border-white/10 bg-neutral-800 hover:bg-neutral-700"
                >
                  Rensa
                </button>
              </div>
            </section>
          ))}

        {/* Tips + Carousel + Video efter in‑stämpling */}
        {clockInAt && (
          <TipsScreen
            solo={!!solo}
            roles={roles}
            soloStaff={soloStaff}
            roleStaff={roleStaff}
            clockInAt={clockInAt}
            onChangeStaff={() => setClockInAt(null)}
            onClockOut={() => {
              const payload = solo
                ? {
                    mode: "solo",
                    roles: { presenterar: true, runner: true, delar: true },
                    staff: soloStaff,
                    clockInAt,
                    clockOutAt: new Date().toISOString(),
                  }
                : {
                    mode: "multi",
                    roles,
                    staff: roleStaff,
                    clockInAt,
                    clockOutAt: new Date().toISOString(),
                  };
              alert(`Stämplade ut!\n\n${JSON.stringify(payload, null, 2)}`);
              setClockInAt(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

// ---- Småkomponenter -------------------------------------------------------
function OnlineBadge({ online }: { online: boolean }) {
  return (
    <div
      className={`px-3 h-8 rounded-full text-sm flex items-center gap-2 border ${
        online
          ? "bg-emerald-600/20 text-emerald-300 border-emerald-700/50"
          : "bg-red-600/20 text-red-300 border-red-700/50"
      }`}
    >
      <span
        className={`size-2 rounded-full ${
          online ? "bg-emerald-400" : "bg-red-400"
        }`}
      />
      {online ? "Online" : "Offline (köad)"}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  label,
  subtitle,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  subtitle?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-xl border text-left ${
        active
          ? "bg-white text-black border-white"
          : "bg-neutral-800 border-white/10 text-white"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="font-semibold">{label}</div>
      {subtitle && <div className="text-xs opacity-70">{subtitle}</div>}
    </button>
  );
}

function EmployeePicker({
  selected,
  onSelect,
  placeholder,
}: {
  selected: Emp | null;
  onSelect: (e: Emp) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STAFF;
    return STAFF.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <input
        className="h-12 rounded-xl bg-neutral-800 border border-white/10 px-4 focus:outline-none focus:ring-2 focus:ring-white/30"
        placeholder={placeholder || "Sök..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        {matches.length === 0 ? (
          <div className="p-3 text-white/50 text-sm">Inga träffar.</div>
        ) : (
          matches.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`w-full text-left p-3 hover:bg-white/5 ${
                selected?.id === s.id ? "bg-emerald-600/30" : ""
              }`}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-white/50">#{s.id}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function humanizeRoles(roles: Roles) {
  const labels: string[] = [];
  if (roles.presenterar) labels.push("Presenterar");
  if (roles.runner) labels.push("Runner");
  if (roles.delar) labels.push("Delar");
  return labels.length ? labels.join(", ") : "(inga)";
}

// ---- Tips + Carousel -------------------------------------------------------
function TipsScreen({
  solo,
  roles,
  soloStaff,
  roleStaff,
  clockInAt,
  onChangeStaff,
  onClockOut,
}: {
  solo: boolean;
  roles: Roles;
  soloStaff: Emp | null;
  roleStaff: RoleMap;
  clockInAt: string;
  onChangeStaff: () => void;
  onClockOut: () => void;
}) {
  const [now, setNow] = useState(new Date());
  const [tipIndex, setTipIndex] = useState(0);

  const imgSrcs = ["/kalgomal.jpg", "/kalgomal2.jpg", "/kalgomal3.jpg"];
  const [imgBroken, setImgBroken] = useState<boolean[]>([false, false, false]);

  const videoUrl = "/tips-video.mp4";
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    const rot = setInterval(
      () => setTipIndex((i) => (i + 1) % TIPS.length),
      6000
    );
    return () => {
      clearInterval(t);
      clearInterval(rot);
    };
  }, []);

  const durationMs = new Date(now).getTime() - new Date(clockInAt).getTime();
  const hh = Math.floor(durationMs / 3600000)
    .toString()
    .padStart(2, "0");
  const mm = Math.floor((durationMs % 3600000) / 60000)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor((durationMs % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  const summary: string[] = [];
  if (solo && soloStaff) {
    summary.push(`${soloStaff.name} • Roller: Alla`);
  } else if (!solo) {
    if (roles.presenterar && roleStaff.presenterar)
      summary.push(`Presenterar: ${roleStaff.presenterar.name}`);
    if (roles.runner && roleStaff.runner)
      summary.push(`Runner: ${roleStaff.runner.name}`);
    if (roles.delar && roleStaff.delar)
      summary.push(`Delar: ${roleStaff.delar.name}`);
  }

  const resolvePublic = (p: string) => (p.startsWith("/") ? p : "/" + p);

  return (
    <section className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">Tips</div>
          <div className="text-white/60 text-sm">
            In‑stämplad kl{" "}
            {new Date(clockInAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60">Förfluten tid</div>
          <div className="text-2xl font-mono tabular-nums">
            {hh}:{mm}:{ss}
          </div>
        </div>
      </div>
      {/* Bemanning sammanfattning */}
      {summary.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-4">
          <div className="text-sm text-white/50 mb-1">Bemanning</div>
          <ul className="list-disc pl-5 text-sm">
            {summary.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Snabbtips */}
      <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-4">
        <div className="text-sm text-white/50 mb-2">Snabbtips</div>
        <div className="text-lg">{TIPS[tipIndex]}</div>
        <div className="mt-3 flex gap-2">
          {TIPS.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1 flex-1 rounded ${
                i <= tipIndex ? "bg-white" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carousel med 3 bilder + fallback */}
      <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-4">
        <Carousel className="w-full">
          <CarouselContent>
            {imgSrcs.map((u, i) => (
              <CarouselItem key={i}>
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {!imgBroken[i] && u ? (
                    <img
                      src={resolvePublic(u)}
                      alt={`Bild ${i + 1}`}
                      className="w-full h-full max-h-[60vh] object-contain"
                      onError={() =>
                        setImgBroken((prev) => {
                          const next = [...prev];
                          next[i] = true;
                          return next;
                        })
                      }
                    />
                  ) : (
                    <div className="text-white/50 text-sm p-4 text-center">
                      Kunde inte ladda bilden ({u || "ingen källa"}).
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Video‑tips med fallback */}
      <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/50">Video‑tips</div>
          <div className="text-xs text-white/40">Källa: {videoUrl}</div>
        </div>
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
          {!videoError ? (
            <video
              src={resolvePublic(videoUrl)}
              controls
              className="w-full h-full"
              onError={() => setVideoError(true)}
            />
          ) : (
            <div className="text-white/50 text-sm p-4 text-center">
              Kunde inte ladda videon ({videoUrl}).
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onClockOut}
          className="h-12 px-5 rounded-xl font-semibold bg-red-500 hover:bg-red-400 text-black"
        >
          Stämpla ut
        </button>
        <button
          onClick={onChangeStaff}
          className="h-12 px-5 rounded-xl border border-white/10 bg-neutral-800 hover:bg-neutral-700"
        >
          Byt bemanning
        </button>
      </div>
    </section>
  );
}

/* -----------------------------------------------------------
   TESTFÖRSLAG (lägg i __tests__/kiosk.test.tsx)
--------------------------------------------------------------
import { render, screen, fireEvent } from "@testing-library/react";
import KioskWindow from "../app/kiosk/page";

test("solo-läget aktiverar alla roller och kräver bara en person", () => {
  render(<KioskWindow />);
  fireEvent.click(screen.getByText(/Ensam/i));
  expect(screen.getByText(/En person för alla roller/i)).toBeInTheDocument();
});

test("multi-läge kräver person per vald roll", () => {
  render(<KioskWindow />);
  fireEvent.click(screen.getByText(/Presenterar/i));
  fireEvent.click(screen.getByText(/Runner/i));
  const start = screen.getByText(/Starta/i);
  expect(start).toHaveAttribute("disabled");
});

test("tips-sidan visar carousel och video efter start", () => {
  render(<KioskWindow />);
  fireEvent.click(screen.getByText(/Ensam/i));
  fireEvent.change(screen.getByPlaceholderText(/Sök namn/i), { target: { value: "Alex" } });
  fireEvent.click(screen.getByText(/Alex Kim/i));
  fireEvent.click(screen.getByText(/Starta/i));
  expect(screen.getByText(/Video‑tips/i)).toBeInTheDocument();
});
*/

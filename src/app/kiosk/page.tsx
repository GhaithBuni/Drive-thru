"use client";

import React, { useEffect, useMemo, useState } from "react";

// Drive‑Thru Fönsterkiosk — SVENSKA
// Nu med val: En person (en roll) eller Två personer (två roller)
// När man klickar på en person i listan markeras den för att visa att den är vald.

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

export default function KioskWindow() {
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(new Date());

  const [mode, setMode] = useState<"one" | "two" | null>(null);

  const [packStaff, setPackStaff] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [handoutStaff, setHandoutStaff] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [clockInAt, setClockInAt] = useState<string | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);
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

  const ready = mode === "one" ? !!packStaff : packStaff && handoutStaff;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-neutral-900 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center font-black text-black">
            DT
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">
              Drive‑Thru Fönsterkiosk
            </div>
            <div className="text-xs text-white/60">
              Plats: STORE‑123 • Enhet: WINDOW‑KIOSK‑01
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <OnlineBadge online={online} />
          <span className="text-white/60 hidden sm:inline">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6 flex flex-col items-center justify-center text-center">
          <div className="text-7xl md:text-8xl font-black tracking-tight tabular-nums">
            {now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="mt-2 text-white/70 text-xl">
            {now.toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="mt-8 text-white/60">"Snabbt, vänligt, korrekt."</div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6">
          {ready ? (
            <TipsScreen
              packStaff={packStaff!}
              handoutStaff={mode === "one" ? packStaff! : handoutStaff!}
              clockInAt={clockInAt!}
              onClockOut={() => {
                const payload = {
                  pack: packStaff,
                  handout: mode === "one" ? packStaff : handoutStaff,
                  clockInAt,
                  clockOutAt: new Date().toISOString(),
                  deviceId: "WINDOW-KIOSK-01",
                  locationId: "STORE-123",
                };
                alert(`Stämplade ut!\n\n${JSON.stringify(payload, null, 2)}`);
                setPackStaff(null);
                setHandoutStaff(null);
                setClockInAt(null);
                setMode(null);
              }}
            />
          ) : mode === null ? (
            <ModeSelect onSelect={setMode} />
          ) : mode === "one" ? (
            <SingleClockIn
              selected={packStaff}
              onSubmit={(s) => {
                setPackStaff(s);
                if (!clockInAt) setClockInAt(new Date().toISOString());
              }}
            />
          ) : (
            <RoleClockIn
              packSelected={packStaff}
              handoutSelected={handoutStaff}
              onPack={(s) => {
                setPackStaff(s);
                if (!clockInAt) setClockInAt(new Date().toISOString());
              }}
              onHandout={(s) => {
                setHandoutStaff(s);
                if (!clockInAt) setClockInAt(new Date().toISOString());
              }}
            />
          )}
        </section>
      </main>

      <footer className="p-6 border-t border-white/10 bg-neutral-900 text-center text-white/60">
        Genom att använda den här kiosken samtycker du till tidsloggning enligt
        restaurangens policy.
      </footer>
    </div>
  );
}

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

function ModeSelect({ onSelect }: { onSelect: (m: "one" | "two") => void }) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="text-2xl font-semibold">Välj bemanning</div>
      <div className="text-white/60">
        Är ni en eller två personer vid fönstret?
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => onSelect("one")}
          className="h-12 px-5 rounded-xl font-semibold bg-white text-black"
        >
          En person
        </button>
        <button
          onClick={() => onSelect("two")}
          className="h-12 px-5 rounded-xl font-semibold bg-white text-black"
        >
          Två personer
        </button>
      </div>
    </div>
  );
}

function SingleClockIn({
  onSubmit,
  selected,
}: {
  onSubmit: (s: { id: string; name: string }) => void;
  selected: { id: string; name: string } | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-2xl font-semibold">Stämpla in (En person)</div>
        <div className="text-white/60">Ange ditt namn eller nummer.</div>
      </div>
      <RoleClockInForm
        role="Medarbetare"
        onSubmit={onSubmit}
        selected={selected}
      />
    </div>
  );
}

function RoleClockIn({
  onPack,
  onHandout,
  packSelected,
  handoutSelected,
}: {
  onPack: (s: { id: string; name: string }) => void;
  onHandout: (s: { id: string; name: string }) => void;
  packSelected: { id: string; name: string } | null;
  handoutSelected: { id: string; name: string } | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-2xl font-semibold">Stämpla in (Två personer)</div>
        <div className="text-white/60">
          En person för Packare och en för Utdelare.
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <RoleClockInForm
          role="Packare"
          onSubmit={onPack}
          selected={packSelected}
        />
        <RoleClockInForm
          role="Utdelare"
          onSubmit={onHandout}
          selected={handoutSelected}
        />
      </div>
    </div>
  );
}

function RoleClockInForm({
  role,
  onSubmit,
  selected,
}: {
  role: string;
  onSubmit: (s: { id: string; name: string }) => void;
  selected: { id: string; name: string } | null;
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
    <div className="flex flex-col gap-3 max-w-md">
      <label className="text-sm text-white/70">{role}</label>
      <input
        className="h-12 rounded-xl bg-neutral-800 border border-white/10 px-4 focus:outline-none focus:ring-2 focus:ring-white/30"
        placeholder="Ange namn eller nummer..."
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
              onClick={() => onSubmit(s)}
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

function TipsScreen({
  packStaff,
  handoutStaff,
  clockInAt,
  onClockOut,
}: {
  packStaff: { id: string; name: string };
  handoutStaff: { id: string; name: string };
  clockInAt: string;
  onClockOut: () => void;
}) {
  const [tipIndex, setTipIndex] = useState(0);
  const [now, setNow] = useState(new Date());

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-2xl font-semibold">
          Packare: {packStaff.name} • Utdelare: {handoutStaff.name}
        </div>
        <div className="text-white/60 text-sm">
          Stämplade in kl{" "}
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

      <div className="rounded-2xl border border-white/10 bg-neutral-800/50 p-5">
        <div className="text-sm text-white/50 mb-2">Tips för drive‑thru</div>
        <div className="text-xl">{TIPS[tipIndex]}</div>
        <div className="mt-4 flex gap-2">
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

      <div className="flex gap-3">
        <button
          onClick={onClockOut}
          className="h-12 px-5 rounded-xl font-semibold bg-red-500 hover:bg-red-400 text-black"
        >
          Stämpla ut
        </button>
        <button
          onClick={() => setTipIndex((i) => (i + 1) % TIPS.length)}
          className="h-12 px-5 rounded-xl border border-white/10 bg-neutral-800 hover:bg-neutral-700"
        >
          Nästa tips
        </button>
      </div>
    </div>
  );
}

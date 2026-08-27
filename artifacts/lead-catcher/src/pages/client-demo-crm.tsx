import React, { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useListAdminLeads, useGetPublicSettings } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock, ShieldCheck, UserCheck, MessageSquare, Phone, Mail,
  Calendar, CheckCircle2, FileText, ArrowLeft, RefreshCw, Sparkles,
  ChevronRight, ExternalLink, Lock, Eye, Check, Sliders, Database,
  ArrowUpRight, Info
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return format(new Date(iso), "dd MMM yyyy, HH:mm", { locale: pl });
  } catch {
    return iso;
  }
}

export default function ClientDemoCrmPage() {
  const [, params] = useRoute("/demo/:hash/crm");
  const hash = params?.hash || "demo";

  const { data: allLeads = [], isLoading, refetch } = useListAdminLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Filter or show demo leads
  const demoLeads = allLeads.slice(0, 10);
  const selectedLead = demoLeads.find(l => l.id === selectedLeadId) || demoLeads[0];

  // Demo validity countdown. Length and on/off come from the admin panel, and the
  // start is pinned per demo so a page reload does not hand out a fresh 24 hours.
  const { data: publicSettings } = useGetPublicSettings({
    query: { queryKey: ["/api/public/settings"], retry: false },
  });
  const timerEnabled = (publicSettings?.timerMode ?? "disabled") !== "disabled";
  const timerHours = publicSettings?.timerHours ?? 24;

  const [timeLeftStr, setTimeLeftStr] = useState<string>("—");

  useEffect(() => {
    if (!timerEnabled) return;

    const startKey = `demo_started_${hash}`;
    let startedAt = Number(localStorage.getItem(startKey));
    if (!startedAt || Number.isNaN(startedAt)) {
      startedAt = Date.now();
      localStorage.setItem(startKey, String(startedAt));
    }
    const expiresAt = startedAt + timerHours * 60 * 60 * 1000;

    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeftStr("Wygasło");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeftStr(`${hours}h ${mins}m ${secs}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [hash, timerEnabled, timerHours]);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      {/* Subtle ambient light effects for Frosted Milk Glass */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-blue-200/30 blur-[130px]" />
        <div className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] bg-indigo-200/25 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[50vw] bg-sky-200/30 blur-[150px]" />
      </div>

      {/* ─── Top 24h Warning Bar (Glass Panel) ─── */}
      <div className="glass-panel border-b border-white/80 px-4 sm:px-8 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white text-[10px] font-mono uppercase px-2 py-0.5 font-bold tracking-wider rounded-xs">
            DEMO PREVIEW CRM
          </span>
          <span className="text-slate-600 hidden sm:inline font-medium text-[11px]">
            Podgląd panelu CRM wygenerowanego dla Twojego doradcy.
          </span>
        </div>
        <div className="flex items-center gap-3">
          {timerEnabled && (
            <div className="flex items-center gap-1.5 glass-matte px-3 py-1 font-mono text-[11px] text-amber-800 rounded-xs border border-amber-300/60 shadow-2xs">
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
              <span className="font-bold">Ważność podglądu: {timeLeftStr}</span>
            </div>
          )}
          <Link href={`/demo/${hash}`}>
            <button className="h-7 px-3 text-xs glass-btn text-slate-700 hover:text-slate-900 font-medium flex items-center gap-1 rounded-xs cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              Do Czatu Demo
            </button>
          </Link>
        </div>
      </div>

      {/* ─── Header (Glass Panel with Minimalist Metro Aesthetic) ─── */}
      <header className="px-6 py-5 glass-panel border-b border-white/80 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Panel Pozyskanych Leadów & Podsumowań AI
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Wszystkie kontakty, wyliczone budżety oraz transkrypcje rozmów z doradcą pojawiają się tutaj natychmiast.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="h-8 px-3 text-xs glass-btn flex items-center gap-1.5 text-slate-700 font-semibold rounded-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Odśwież leady</span>
            </button>

            <Link href="/simulator">
              <button className="h-8 px-3.5 text-xs bg-slate-900 hover:bg-black text-white font-semibold flex items-center gap-1.5 rounded-xs cursor-pointer shadow-2xs">
                <Sliders className="w-3.5 h-3.5" />
                <span>Kreator RPG</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-1 relative z-10">
        {demoLeads.length === 0 ? (
          <div className="glass-panel p-12 text-center space-y-4 rounded-xs border shadow-lg">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 flex items-center justify-center mx-auto rounded-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Brak leadów w wersji demonstracyjnej</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Przejdź do czatu demonstracyjnego i podaj numer telefonu lub e-mail doradcy, aby zobaczyć, jak natychmiast zapisuje się w tym panelu.
            </p>
            <Link href={`/demo/${hash}`}>
              <button className="h-9 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xs shadow-2xs cursor-pointer">
                Przetestuj doradcę na żywo
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Lista Leadów (Lewa Kolumna) */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-800">
                  Ostatnie Zgłoszenia ({demoLeads.length}):
                </span>
                <span className="text-[10px] font-mono text-slate-500">Aktualizowane live</span>
              </div>

              <div className="space-y-2">
                {demoLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`w-full p-3.5 text-left transition-all cursor-pointer rounded-xs border ${
                        isSelected
                          ? "glass-tile-active"
                          : "glass-btn border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center font-bold text-xs rounded-xs">
                            {lead.contactInfo?.name ? lead.contactInfo.name.charAt(0) : "L"}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 truncate">
                              {lead.contactInfo?.name || "Anonimowy Rozmówca"}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500">
                              {lead.contactInfo?.phone || lead.contactInfo?.email || "Brak danych kontaktowych"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {fmtDate(lead.createdAt)}
                        </span>
                      </div>

                      {lead.summary && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-2 leading-snug">
                          {lead.summary}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Szczegóły Wybranego Leada (Prawa Kolumna) */}
            <div className="lg:col-span-7">
              {selectedLead ? (
                <div className="glass-panel p-5 space-y-4 rounded-xs border shadow-lg">
                  {/* Nagłówek Szczegółów */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900 uppercase">
                          {selectedLead.contactInfo?.name || "Szczegóły Zgłoszenia"}
                        </h3>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border border-emerald-300">
                          ZWERYFIKOWANY
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Data zapisu: {fmtDate(selectedLead.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedLead.contactInfo?.phone && (
                        <a
                          href={`tel:${selectedLead.contactInfo?.phone}`}
                          className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 rounded-xs"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Zadzwoń</span>
                        </a>
                      )}
                      {selectedLead.contactInfo?.email && (
                        <a
                          href={`mailto:${selectedLead.contactInfo?.email}`}
                          className="h-7 px-2.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 rounded-xs"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Napisz</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Kafelki Danych Kontaktowych */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="glass-matte p-3 rounded-xs border border-slate-200/80">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Numer Telefonu:</span>
                      <p className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                        {selectedLead.contactInfo?.phone || "—"}
                      </p>
                    </div>
                    <div className="glass-matte p-3 rounded-xs border border-slate-200/80">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Adres E-mail:</span>
                      <p className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                        {selectedLead.contactInfo?.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Automatyczna Diagnoza Potrzeb AI */}
                  {selectedLead.summary && (
                    <div className="glass-matte p-3.5 rounded-xs border border-blue-200 space-y-1.5">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase font-mono text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Podsumowanie i Kwalifikacja AI:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {selectedLead.summary}
                      </p>
                    </div>
                  )}

                  {/* Wyciągnięte Wymagania */}
                  {selectedLead.requirements && (
                    <div className="glass-matte p-3.5 rounded-xs border border-slate-200/80 space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 uppercase font-mono text-[11px]">
                        Wymagania i Zakres Prac:
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selectedLead.requirements}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap,
  Layers, Sliders, Database, MessageSquare, Code2,
  Lock, Award, Check, ChevronRight, HelpCircle,
  Clock, Play, Laptop, Scale, Wrench, Building,
  ShoppingCart, Home, Hammer, Landmark, FileText,
  Activity, Compass, ShieldAlert, TrendingUp, Search,
  Cpu, GitCommit, FileSpreadsheet, ClipboardCheck,
  SlidersHorizontal, Wand2, Star, Filter, Copy, CheckCheck,
  Radio, Eye, Sparkle, Terminal, Shield, ArrowUpRight,
  Headphones, Mic, MessageSquareCode
} from "lucide-react";
import { FRAMEWORKS_REGISTRY, FRAMEWORK_CATEGORIES, FrameworkItem } from "@/lib/frameworks-data";
import { ADVISOR_REAL_AVATARS } from "@/lib/advisor-avatars";

export default function LandingOfferPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>("spice");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [activeTabPreview, setActiveTabPreview] = useState<"genui" | "cot" | "voice">("genui");

  const filteredFrameworks = useMemo(() => {
    return FRAMEWORKS_REGISTRY.filter(fw => {
      const matchCat = selectedCategory === "all" || fw.category === selectedCategory;
      const matchSearch = searchQuery.trim() === "" ||
        fw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fw.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fw.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeFramework = FRAMEWORKS_REGISTRY.find(f => f.id === selectedFrameworkId) || FRAMEWORKS_REGISTRY[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activeFramework.systemPromptModifier);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#04060b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* ─── Tactile Noise & Lighting Orbs ──────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 noise-texture opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-gradient-to-b from-blue-600/12 via-indigo-600/08 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-cyan-500/08 blur-[180px] rounded-full" />
        <div className="absolute top-2/3 left-0 w-[450px] h-[450px] bg-indigo-600/08 blur-[180px] rounded-full" />
      </div>

      {/* ─── TOP NAVBAR (Editorial Design) ──────────────────────────────── */}
      <header className="relative z-30 border-b border-slate-800/60 bg-[#060911]/85 backdrop-blur-xl px-4 sm:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#060911] rounded-[14px] flex items-center justify-center font-mono font-black text-white text-base">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-lg tracking-tight text-white">AURA<span className="text-cyan-400">.CORE</span></span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-wider font-mono uppercase">
                STUDIO WDROŻEŃ 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Generative UI • Reasoning CoT • Dedykowany Model Doradztwa Biznesowego
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#paradygmaty"
            className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Standardy GenUI & CoT</span>
          </a>

          <a
            href="#frameworks"
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Katalog Metodologii (16+)</span>
          </a>

          <Link href="/simulator">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-slate-950 hover:text-white text-xs font-black transition-all shadow-lg shadow-cyan-500/20 cursor-pointer">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Otwórz Symulator & Generator</span>
            </button>
          </Link>
        </div>
      </header>

      {/* ─── HERO SECTION (Human-Crafted, Anti-Generic) ──────────────────── */}
      <section className="relative z-10 pt-16 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-7">
        
        {/* Micro-Pill Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-xl shadow-cyan-950/30">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200 tracking-wide font-mono">
            NOWOCZESNE PARADYGMATY UI/UX W GENERATORACH AI
          </span>
        </div>

        {/* Punchline Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Koniec z nudnym tekstem. <br />
            Wdrażaj asystentów z <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">Generative UI i transparentnym wnioskowaniem.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Zastąp archaiczne okna czatu dynamicznymi, interaktywnymi kalkulatorami, łańcuchem myśli CoT oraz ugruntowaną bazą wiedzy. Brak halucynacji, 100% precyzji w kwalifikacji leadów.
          </p>
        </div>

        {/* CTA Button Block */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
          <Link href="/simulator">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer">
              <span>Uruchom Symulator na Żywo</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </Link>

          <a href="#paradygmaty" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Poznaj Architekturę GenUI & Voice</span>
            </button>
          </a>
        </div>

        {/* 4 Feature Metrics */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bento-card flex items-center gap-3.5">
            <Sparkles className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-100">Generative UI</div>
              <div className="text-[11px] text-slate-400">Karty, wyceny i formularze w czacie</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bento-card flex items-center gap-3.5">
            <Cpu className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-100">Reasoning CoT</div>
              <div className="text-[11px] text-slate-400">Akordeon procesu myślenia AI</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bento-card flex items-center gap-3.5">
            <Mic className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-100">Voice Orb Mode</div>
              <div className="text-[11px] text-slate-400">Kula audio-reaktywna w czasie rzecz.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bento-card flex items-center gap-3.5">
            <Code2 className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-100">IBM Carbon Embed</div>
              <div className="text-[11px] text-slate-400">Bezpieczny, lekki asynchroniczny kod</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE PARADIGMS SHOWCASE (GenUI, CoT, Voice Orb) ─────── */}
      <section id="paradygmaty" className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 border-t border-slate-800/60">
        
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            3 Rewolucyjne Paradygmaty UI/UX
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Doświadczenie użytkownika klasy Premium
          </h2>
          <p className="text-sm text-slate-400">
            Zobacz, jak interaktywne elementy zastępują tradycyjny, monotonny tekst i budują zaufanie klienta.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setActiveTabPreview("genui")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTabPreview === "genui"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Generative UI (Mini-Aplikacje w Czacie)</span>
            </button>

            <button
              onClick={() => setActiveTabPreview("cot")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTabPreview === "cot"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>2. Transparentne Wnioskowanie (CoT)</span>
            </button>

            <button
              onClick={() => setActiveTabPreview("voice")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTabPreview === "voice"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>3. Kula Głosowa (Voice Orb)</span>
            </button>
          </div>
        </div>

        {/* Interactive Preview Container */}
        <div className="p-6 sm:p-8 rounded-3xl bento-card border border-blue-500/30 max-w-5xl mx-auto shadow-2xl">
          {activeTabPreview === "genui" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
                  STATIC & DECLARATIVE GEN-UI
                </div>
                <h3 className="text-2xl font-black text-white">
                  Zamiast ściany tekstu – interaktywny kalkulator w strumieniu czatu
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Gdy klient pyta o wycenę lub szacunkowy kosztorys, doradca AI nie odpisuje generycznym tekstem, lecz renderuje w locie interaktywny widżet kalkulacji z natychmiastowym suwakiem i przyciskiem rezerwacji.
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>+340% większa gotowość do zostawienia numeru telefonu</span>
                </div>
              </div>

              {/* GenUI Interactive Card Mockup */}
              <div className="p-5 rounded-2xl bg-[#080d1a] border border-cyan-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Kalkulator Wstępnej Wyceny
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    Na Żywo
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Szacowany Metraż / Zakres:</span>
                    <span className="font-bold text-cyan-300 font-mono">45 m²</span>
                  </div>
                  <input type="range" min="10" max="150" defaultValue="45" className="w-full accent-cyan-400 cursor-pointer" />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Orientacyjny Koszt:</div>
                    <div className="text-base font-black text-white font-mono">8 500 – 11 200 PLN</div>
                  </div>
                  <button className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:opacity-90">
                    Zamów Pomiar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTabPreview === "cot" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">
                  THOUGHT PROCESS ACCORDION (CoT)
                </div>
                <h3 className="text-2xl font-black text-white">
                  Transparentność wnioskowania budująca zaufanie
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Zamiast ukrywać czas kalkulacji, interaktywny akordeon myśli informuje rozmówcę o analizie intencji, persony i sprawdzaniu bazy wiedzy. Zmniejsza to obciążenie poznawcze i buduje autorytet eksperta.
                </p>
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Eliminacja poczucia "zawieszenia bota" podczas złożonych zapytań</span>
                </div>
              </div>

              {/* CoT Accordion Mockup */}
              <div className="p-5 rounded-2xl bg-[#080d1a] border border-indigo-500/40 space-y-3 shadow-xl">
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-indigo-300 font-bold">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
                      Proces Myślowy Modelu (Kwalifikacja Intencji)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">120ms</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 leading-relaxed pl-2 border-l-2 border-indigo-500/50 space-y-1">
                    <div>1. Zidentyfikowano zamiar: <em>Pytanie o termin realizacji i montaż</em></div>
                    <div>2. Persona: <em>Klient indywidualny (priorytet: czas & gwarancja)</em></div>
                    <div>3. Ugruntowanie: <em>Pobrano dostępne sloty montażowe z bazy wiedzy</em></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  „Dzień dobry! Najbliższy wolny termin pomiaru i wyceny w Państwa rejonie to najbliższy czwartek. Czy zarezerwować to spotkanie?”
                </div>
              </div>
            </div>
          )}

          {activeTabPreview === "voice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-in fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
                  VOICE ORB & REAL-TIME AUDIO
                </div>
                <h3 className="text-2xl font-black text-white">
                  Organiczna Kula Głosowa reagująca na ton mowy
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Nowoczesny interfejs mowy w standardzie 2026. Kula płynnie przechodzi między stanami <em>idle</em>, <em>listening</em>, <em>thinking</em> i <em>speaking</em> z natychmiastowym przerywaniem (barge-in).
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ultra-niskie opóźnienie &lt;200ms</span>
                </div>
              </div>

              {/* Voice Orb Mockup */}
              <div className="p-6 rounded-2xl bg-[#080d1a] border border-cyan-500/40 flex flex-col items-center justify-center space-y-5 text-center shadow-xl">
                <div className="w-24 h-24 voice-orb voice-orb-active flex items-center justify-center">
                  <Mic className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Aktywny Nasłuch Głosowy (Listening)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 h-6">
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                    <span className="audio-bar" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── BENTO GRID: CZYM JEST AUTONOMICZNY DORADCA AI ──────────────── */}
      <section id="czym-jest-chatbot" className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
        
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            Architektura & Wyjaśnienie Technologii
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Czym właściwie jest nasz Asystent AI?
          </h2>
          <p className="text-sm text-slate-400">
            Większość firm instaluje sztywne drzewka decyzyjne, które zniechęcają klientów. 
            Nasz system łączy zaawansowane modelowanie języka z twardymi regułami biznesowymi.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Tile 1 */}
          <div className="md:col-span-7 p-7 rounded-2xl bento-card space-y-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              1. Ugruntowany Wsad Wiedzy (Grounding & Voice of Customer)
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Zgodnie z żelazną zasadą <strong className="text-cyan-300">„Garbage in, garbage out”</strong>, model zasilany jest konkretnymi procedurami, cennikami, profilami Buyer Person oraz transkrypcjami udanych rozmów handlowych. 
              Asystent przejmuje naturalny ton Twojej firmy, ale nigdy nie wymyśla faktów spoza bazy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Przykłady Few-Shot z realnych rozmów</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero halucynacji o rabatach i terminach</span>
              </div>
            </div>
          </div>

          {/* Tile 2 */}
          <div className="md:col-span-5 p-7 rounded-2xl bento-card border-indigo-500/30 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              2. Dedykowany Model Konwersacyjny
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Autorska architektura neuronowa wstępnie dostrojona do analizowania zachowań zakupowych, obiekcji i pytań o kosztorysy. 
              Chroniona warstwą bezpieczeństwa i pełnej poufności danych.
            </p>
            <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs font-mono text-indigo-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Dostrojony do badania potrzeb & pobierania telefonów</span>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="md:col-span-4 p-6 rounded-2xl bento-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Odwrócony Wywiad (Interaktywność)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Asystent nie zasypuje klienta ścianą tekstu. Zadaje dokładnie 1 pytanie na raz, aktywnie słucha i prowadzi klienta za rękę do kalkulacji.
            </p>
          </div>

          {/* Tile 4 */}
          <div className="md:col-span-4 p-6 rounded-2xl bento-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Płynne Suwaki Temperamentu</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pełna kontrola: od poziomu determinacji w zbieraniu leada, przez zwięzłość, empatię, po temperaturę i eliminację żargonu.
            </p>
          </div>

          {/* Tile 5 */}
          <div className="md:col-span-4 p-6 rounded-2xl bento-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Siatka Human-in-the-loop (HITL)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              W przypadku spraw spornych, reklamacji lub skomplikowanych umów, asystent natychmiast przekazuje sprawę żywemu kierownikowi.
            </p>
          </div>

        </div>
      </section>

      {/* ─── EXPANDED FRAMEWORK STUDIO EXPLORER ─────────────────────────── */}
      <section id="frameworks" className="relative z-10 py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-800/80">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-mono font-bold">
            <Layers className="w-4 h-4" />
            KROK 1: WYBÓR METODOLOGII I STRUKTURY LOGICZNEJ
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Wybierz Metodologię, w której ma operować Twój Asystent
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Zanim asystent rozpocznie rozmowę z klientem, przyjmuje określoną strukturę logiczną. 
            Wybierz framework z poniższej bazy wiedzy, aby zobaczyć jego formułę, psychologiczny mechanizm działania oraz gotowy prompt systemowy.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {FRAMEWORK_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Szukaj frameworka (np. SPICE, AIDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Big Spacious Studio Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: List of Framework Cards */}
          <div className="lg:col-span-5 space-y-3.5 max-h-[720px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredFrameworks.map(fw => {
              const isSelected = fw.id === selectedFrameworkId;
              return (
                <div
                  key={fw.id}
                  onClick={() => setSelectedFrameworkId(fw.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-950/80 to-indigo-950/60 border-cyan-400 shadow-xl shadow-cyan-500/10 scale-[1.01]"
                      : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isSelected ? "text-cyan-300" : "text-white"}`}>
                        {fw.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                      {fw.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {fw.shortDesc}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-800/60">
                    {fw.tags.slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                    {isSelected && (
                      <span className="ml-auto text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                        Wybrany <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Full Inspector & Details for Active Framework */}
          <div className="lg:col-span-7 p-7 rounded-3xl bento-card border-blue-500/30 space-y-6 shadow-2xl">
            
            {/* Header with Title & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  SZCZEGÓŁOWY PROFIL METODOLOGII
                </span>
                <h3 className="text-2xl font-black text-white">{activeFramework.name}</h3>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 text-cyan-300 border border-blue-500/30 text-xs font-bold font-mono self-start sm:self-center">
                {activeFramework.badge}
              </span>
            </div>

            {/* Step-by-Step Formula Visual Pipeline */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <span>📐 Formuła i Przebieg Myślenia:</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#04060c] border border-blue-500/20 text-xs sm:text-sm font-mono text-cyan-300 leading-relaxed shadow-inner">
                {activeFramework.formula}
              </div>
            </div>

            {/* How It Works In Practice */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <span>💡 Mechanizm Psychologiczny & Działanie:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
                {activeFramework.howItWorks}
              </p>
            </div>

            {/* Measurable ROI Benefit */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-300">Wymierna Korzyść Biznesowa (ROI):</div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">{activeFramework.businessBenefit}</div>
              </div>
            </div>

            {/* System Prompt Code Box with Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wide">
                <span>Wstrzykiwana Instrukcja Systemowa AI:</span>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-mono transition-colors cursor-pointer"
                >
                  {copiedPrompt ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? "Skopiowano!" : "Kopiuj Prompt"}</span>
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-[#03050a] border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed custom-scrollbar">
                {activeFramework.systemPromptModifier}
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/simulator">
                <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer">
                  <span>Przetestuj w Symulatorze</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <button
                onClick={handleCopyPrompt}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Pobierz Szablon do Wklejenia</span>
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* ─── 8 BRANŻ BIZNESOWYCH & GOTOWE PERSONY ───────────────────────── */}
      <section className="relative z-10 py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-10 border-t border-slate-800/60">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
            Gotowe Wdrożenia Dziedzinowe
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Dopasowany do Twojej Branży
          </h2>
          <p className="text-sm text-slate-400">
            Od budownictwa i mebli na wymiar, przez kancelarie B2B, aż po medycynę estetyczną i nieruchomości.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Meble & Budownictwo", icon: Hammer, desc: "Pomiary & Wyceny na Miejscu" },
            { name: "Kancelaria Prawna", icon: Scale, desc: "Poufny Audyt Umów B2B" },
            { name: "Serwis Samochodowy", icon: Wrench, desc: "Wstępny Kosztorys & Terminy" },
            { name: "Klinika Beauty", icon: Sparkles, desc: "Konsultacje Zabiegowe" },
            { name: "Nieruchomości", icon: Home, desc: "Rzuty Mieszkań na E-mail" },
            { name: "IT & Oprogramowanie", icon: Laptop, desc: "Kalkulacje Wdrożeń SaaS" },
            { name: "E-Commerce", icon: ShoppingCart, desc: "Domykanie Porzuconych Koszyków" },
            { name: "Finanse & Leasing", icon: Landmark, desc: "Obliczanie Raty w 2 Minuty" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bento-card hover:border-cyan-500/50 transition-all space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── FINAL TEST BANNER ──────────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mx-auto">
            <Zap className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Przetestuj Cały System w Wersji Demo
            </h3>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Wszystkie 16 frameworków logicznych, suwaki parametryzacji, Generative UI oraz asynchroniczny skrypt instalacyjny są w pełni odblokowane do testów.
            </p>
          </div>
          <Link href="/simulator">
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all inline-flex items-center gap-2.5 cursor-pointer">
              <span>Otwórz Symulator i Skonfiguruj Doradcę</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-900 bg-[#04060c] py-10 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-mono text-slate-400">
          <span>AURA SUITE</span>
          <span>•</span>
          <span>AUTONOMICZNE DORADZTWO AI</span>
          <span>•</span>
          <span>WERSJA TESTOWA DEMO</span>
        </div>
        <p className="text-xs text-slate-400">
          Projekt stworzony dla firm wymagających najwyższego standardu obsługi klienta i precyzyjnej kwalifikacji leadów.
        </p>
      </footer>

    </div>
  );
}

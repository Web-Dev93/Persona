import React, { useState } from "react";
import {
  Sparkles, CheckCircle2, Copy, CheckCheck, X, Layers,
  FileText, ShieldCheck, Zap, ArrowRight, Code2, BookOpen,
  HelpCircle, Eye, Check, AlertTriangle, Lightbulb, Terminal
} from "lucide-react";
import { FRAMEWORKS_REGISTRY } from "@/lib/frameworks-data";
import { useToast } from "@/hooks/use-toast";

interface SpiceAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySpice: () => void;
}

export default function SpiceAcademyModal({ isOpen, onClose, onApplySpice }: SpiceAcademyModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"breakdown" | "howToGet" | "beforeAfter" | "code">("breakdown");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  if (!isOpen) return null;

  const spiceFramework = FRAMEWORKS_REGISTRY.find(f => f.id === "spice") || FRAMEWORKS_REGISTRY[0];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(spiceFramework.systemPromptModifier);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
    toast({
      title: "Skopiowano Prompt SPICE do schowka!",
      description: "Możesz wkleić go do OpenAI (GPT-4o), Claude 3.5 Sonnet lub Gemini 2.0 Pro."
    });
  };

  const handleCopyCodeSnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    toast({
      title: "Skopiowano kod do schowka!"
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="bg-[#070b14] border border-blue-500/30 rounded-3xl max-w-6xl w-full p-5 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] flex flex-col relative text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>AKADEMIA INŻYNIERII PROMPTÓW • STANDARD 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              Czym jest Framework <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">SPICE</span> i jak go wdrożyć?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Kompletny przewodnik po najbardziej niezawodnej architekturze promptów biznesowych na świecie.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: "breakdown", label: "1. Dekompozycja [S-P-I-C-E]", icon: Layers },
            { id: "howToGet", label: "2. Jak uzyskać i używać?", icon: Zap },
            { id: "beforeAfter", label: "3. Porównanie Przed i Po", icon: Eye },
            { id: "code", label: "4. Gotowy Kod API & Embed", icon: Code2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">

          {/* ════ TAB 1: DEKOMPOZYCJA ════ */}
          {activeTab === "breakdown" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-500/30 space-y-2">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Dlaczego SPICE jest fundamentem skutecznego doradcy AI?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Tradycyjne prompty to zazwyczaj chaotyczne „ściany tekstu”, w których model gubi się i zaczyna halucynować. 
                  Metodologia <strong>SPICE</strong> (autorstwa topowych architektów LLM) izoluje procesy poznawcze na <strong>5 nienaruszalnych warstw</strong>. Model dokładnie wie, kim jest, jakie ma zakazy, czym dysponuje i jaki ma być następny krok handlowy.
                </p>
              </div>

              {/* 5 Letters Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* S */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2.5 relative overflow-hidden group hover:border-cyan-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-black text-cyan-300 text-lg">
                    S
                  </div>
                  <h4 className="text-sm font-bold text-white">Sections (Rola i Tożsamość)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Definiuje archetyp doradcy, poziom doświadczenia, styl wypowiedzi i zakres uprawnień. Zapewnia stałą tożsamość bez wychodzenia z roli.
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#04060c] border border-slate-800 text-[11px] font-mono text-cyan-400">
                    „Jesteś Aleksandra – doradca ds. wycen wnętrz z 6-letnim stażem.”
                  </div>
                </div>

                {/* P */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-2.5 relative overflow-hidden group hover:border-blue-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-mono font-black text-blue-300 text-lg">
                    P
                  </div>
                  <h4 className="text-sm font-bold text-white">Parameters (Zmienne i Długość)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Określa parametry techniczne: maksymalną długość odpowiedzi (2-3 zdania), temperaturę modelu (0.3 dla faktów) i zmienne rejestrowane w sesji.
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#04060c] border border-slate-800 text-[11px] font-mono text-blue-400">
                    „Długość: max 50 słów. Zbieraj: &#123;metraż&#125;, &#123;termin&#125;, &#123;telefon&#125;.”
                  </div>
                </div>

                {/* I */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-2.5 relative overflow-hidden group hover:border-emerald-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-black text-emerald-300 text-lg">
                    I
                  </div>
                  <h4 className="text-sm font-bold text-white">Instructions (Instrukcje & Zakazy)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Twarde reguły logiczne (Guardrails): zakaz obietnic nierealnych rabatów, zakaz mówienia „jestem botem”, nakaz kończenia pytaniem kwalifikującym.
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#04060c] border border-slate-800 text-[11px] font-mono text-emerald-400">
                    „Nigdy nie podawaj stawek bez zastrzeżenia. Zawsze pytaj o 1 parametr.”
                  </div>
                </div>

                {/* C */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-2.5 relative overflow-hidden group hover:border-purple-400 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-mono font-black text-purple-300 text-lg">
                    C
                  </div>
                  <h4 className="text-sm font-bold text-white">Context (Baza Wiedzy / Grounding)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Zweryfikowane fakty biznesowe: oficjalny cennik, czas oczekiwania (2-4 tyg.), 5 lat pisemnej gwarancji, obszar dojazdu do klienta (50 km).
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#04060c] border border-slate-800 text-[11px] font-mono text-purple-400">
                    „Ceny od 14k zł. Pomiar gratis. Gwarancja 5 lat.”
                  </div>
                </div>

                {/* E */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2.5 relative overflow-hidden group hover:border-amber-400 transition-colors md:col-span-2 lg:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-black text-amber-300 text-lg">
                    E
                  </div>
                  <h4 className="text-sm font-bold text-white">Examples (Few-Shot Prompting)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Kluczowe wzorce dialogowe. Model uczy się tonu i dynamiki poprzez idealne przykłady: klient pyta o rabat → doradca uprzejmie tłumaczy wartość i proponuje darmowy audyt.
                  </p>
                  <div className="p-2.5 rounded-xl bg-[#04060c] border border-slate-800 text-[11px] font-mono text-amber-400">
                    „Q: Robicie w soboty? → A: Tak, ekipa pomiarowa dojeżdża w soboty. O której godzinie wolałby Pan spotkanie?”
                  </div>
                </div>

              </div>

              {/* ROI Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-sm text-emerald-200">Mierzalna skuteczność w liczbach:</span>
                    <p className="text-xs text-slate-300">
                      Redukcja halucynacji o <strong>99.4%</strong> • Wzrost współczynnika zapisu numeru telefonu o <strong>+380%</strong> w stosunku do zwykłych chatbotów.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onApplySpice();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap cursor-pointer"
                >
                  Aktywuj SPICE w Symulatorze
                </button>
              </div>

            </div>
          )}

          {/* ════ TAB 2: JAK UZYSKAĆ I UŻYWAĆ ════ */}
          {activeTab === "howToGet" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center font-mono">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-white">W Symulatorze / Generatorze</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    W naszym symulatorze framework SPICE jest <strong>domyślnie aktywny</strong>. Wystarczy wybrać branżę, a system automatycznie wypełni zmienne [S], [P], [I], [C], [E].
                  </p>
                  <button
                    onClick={() => {
                      onApplySpice();
                      onClose();
                    }}
                    className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Przejdź do Generatora
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center font-mono">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-white">W OpenAI / Claude / Gemini</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Możesz skopiować gotowy prompt systemowy i wkleić go do swojego API lub w Custom GPT. Działa bez dodatkowych bibliotek.
                  </p>
                  <button
                    onClick={handleCopyPrompt}
                    className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {copiedPrompt ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? "Skopiowano!" : "Kopiuj System Prompt"}</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center font-mono">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-white">Jako Widget na Twojej Stronie WWW</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Wklej 1 linijkę kodu HTML/JS na swoją stronę (WordPress, Webflow, Shopify, Next.js). Widget z protokołem SPICE uruchamia się od razu.
                  </p>
                  <button
                    onClick={() => setActiveTab("code")}
                    className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Zobacz Kod Widgetu
                  </button>
                </div>

              </div>

              {/* Pełny Prompt Systemowy SPICE Preview */}
              <div className="p-5 rounded-2xl bg-[#03050a] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                      Oficjalny Szablon System Prompt SPICE (Gotowy do Użycia)
                    </span>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-mono border border-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedPrompt ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? "Skopiowano!" : "Kopiuj Szablon"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#010204] border border-slate-800/80 text-xs font-mono text-cyan-300/90 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
                  {spiceFramework.systemPromptModifier}
                </div>
              </div>

            </div>
          )}

          {/* ════ TAB 3: PORÓWNANIE PRZED I PO ════ */}
          {activeTab === "beforeAfter" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Zwykły Prompt */}
                <div className="p-5 rounded-2xl bg-red-950/15 border border-red-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase font-mono">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Naiwny Prompt (Bez Frameworka)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#03050a] border border-red-900/40 text-xs font-mono text-slate-400">
                    „Jesteś botem na stronie meblowej. Odpowiadaj miło klientom i pomagaj w wycenach.”
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <div className="font-bold text-red-300">❌ Skutek w rozmowie z klientem:</div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 italic">
                      „Witaj! Jestem sztuczną inteligencją. Chętnie odpowiem na wszelkie Twoje pytania dotyczące historii naszej firmy, rodzajów drewna i wszystkiego innego. W czym mogę Ci dzisiaj służyć?”
                    </div>
                  </div>
                  <ul className="text-[11px] text-red-300/80 space-y-1 list-disc list-inside pt-1">
                    <li>Klient natychmiast wie, że to bezużyteczny bot</li>
                    <li>Zero konkretów cenowych i brak pytań domykających</li>
                    <li>Porażka konwersji (lead utracony)</li>
                  </ul>
                </div>

                {/* Z Frameworkiem SPICE */}
                <div className="p-5 rounded-2xl bg-emerald-950/15 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Z Frameworkiem SPICE (Architektura 2026)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#03050a] border border-emerald-900/40 text-xs font-mono text-emerald-300">
                    [S: Rola Aleksandra] + [P: max 50 słów] + [I: Badaj 1 parametr] + [C: Baza cen] + [E: Few-Shot]
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1">
                    <div className="font-bold text-emerald-300">✅ Rezultat w rozmowie:</div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
                      „Dzień dobry! Kuchnie na wymiar realizujemy w granicach 14 000 - 26 000 zł wraz z montażem i 5-letnią gwarancją. Jaki orientacyjny metraż lub układ pomieszczenia Pan planuje?”
                    </div>
                  </div>
                  <ul className="text-[11px] text-emerald-300/90 space-y-1 list-disc list-inside pt-1">
                    <li>Natychmiastowe podanie bezpiecznych widełek cenowych</li>
                    <li>Precyzyjne, pojedyncze pytanie kwalifikujące</li>
                    <li>Wysoka gotowość klienta do podania numeru telefonu</li>
                  </ul>
                </div>

              </div>

              {/* Summary Conclusion */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong>Wniosek inżynierski:</strong> SPICE eliminuje potrzebę ciągłych poprawek promptu metodą prób i błędów. Daje powtarzalny, stabilny silnik sprzedażowy działający 24/7 na każdej stronie.
                </p>
              </div>

            </div>
          )}

          {/* ════ TAB 4: GOTOWY KOD ════ */}
          {activeTab === "code" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  Wdrożenie w Node.js / Python / Next.js z OpenAI lub Claude API:
                </h4>
                <div className="p-4 rounded-2xl bg-[#03050a] border border-slate-800 text-xs font-mono text-cyan-300 relative group">
                  <pre className="overflow-x-auto custom-scrollbar">
{`import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askAdvisor(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3, // Zgodnie z wytycznymi SPICE
    messages: [
      {
        role: "system",
        content: \`\${SPICE_SYSTEM_PROMPT}\`
      },
      { role: "user", content: userMessage }
    ]
  });

  return completion.choices[0].message.content;
}`}
                  </pre>
                  <button
                    onClick={() => handleCopyCodeSnippet(`import OpenAI from "openai";\n\nconst openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });\n\nexport async function askAdvisor(userMessage: string) {\n  const completion = await openai.chat.completions.create({\n    model: "gpt-4o",\n    temperature: 0.3,\n    messages: [\n      {\n        role: "system",\n        content: \`\${SPICE_SYSTEM_PROMPT}\`\n      },\n      { role: "user", content: userMessage }\n    ]\n  });\n  return completion.choices[0].message.content;\n}`)}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-mono border border-slate-800 cursor-pointer"
                  >
                    Kopiuj Kod
                  </button>
                </div>
              </div>

              {/* Widget HTML */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  1-Linijkowy Kod Widgetu na dowolną stronę WWW:
                </h4>
                <div className="p-4 rounded-2xl bg-[#03050a] border border-slate-800 text-xs font-mono text-emerald-400 relative">
                  <code>{`<script async src="${window.location.origin}/widget.js" data-aura-framework="spice" data-theme="whatsapp"></script>`}</code>
                  <button
                    onClick={() => handleCopyCodeSnippet(`<script async src="${window.location.origin}/widget.js" data-aura-framework="spice" data-theme="whatsapp"></script>`)}
                    className="absolute top-2.5 right-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-mono border border-slate-800 cursor-pointer"
                  >
                    Kopiuj Widget
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 hidden sm:inline">
            AURA Protocol v4.2 • Zgodność z modelami GPT-4o, Claude 3.5 i Gemini
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Zamknij
            </button>
            <button
              onClick={() => {
                onApplySpice();
                onClose();
              }}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aktywuj SPICE i Rozpocznij Test</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

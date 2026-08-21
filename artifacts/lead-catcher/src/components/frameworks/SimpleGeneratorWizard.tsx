import React, { useState } from "react";
import {
  Sparkles, CheckCircle2, ArrowRight, User, Target,
  Zap, Hammer, Scale, Wrench, Sparkle, Home, Laptop,
  ShoppingCart, Building, ChevronRight, Check, SlidersHorizontal,
  Flame, HelpCircle, Layers, Lightbulb, Compass
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface SimpleGeneratorWizardProps {
  industries: any[];
  selectedIndustryId: string;
  selectedGender: "female" | "male";
  onSelectIndustry: (id: string, gender: "female" | "male") => void;
  onOpenAdvancedMode: () => void;
  onOpenSpiceAcademy: () => void;
  onGenerateSuccess: (customAdvantage: string, selectedGoal: string) => void;
}

export default function SimpleGeneratorWizard({
  industries,
  selectedIndustryId,
  selectedGender,
  onSelectIndustry,
  onOpenAdvancedMode,
  onOpenSpiceAcademy,
  onGenerateSuccess
}: SimpleGeneratorWizardProps) {
  const { toast } = useToast();

  const [selectedGoal, setSelectedGoal] = useState<string>("lead_phone");
  const [customAdvantage, setCustomAdvantage] = useState<string>("Darmowy pomiar na miejscu, 5 lat gwarancji i realizacja w 2-4 tygodnie");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const currentIndustry = industries.find(i => i.id === selectedIndustryId) || industries[0];
  const activePersona = selectedGender === "female" ? currentIndustry.femalePersona : currentIndustry.malePersona;

  const BUSINESS_GOALS = [
    {
      id: "lead_phone",
      title: "Wyceny & Pozyskiwanie Telefonów (Lead Gen)",
      desc: "Doradca bada metraż/zakres i prosi o numer telefonu do bezpłatnej kalkulacji.",
      icon: Zap,
      recommendedFramework: "SPICE"
    },
    {
      id: "booking",
      title: "Rezerwacja Wizyty / Darmowego Pomiaru",
      desc: "Ustala dogodny termin spotkania i przekazuje go bezpośrednio do kalendarza.",
      icon: Target,
      recommendedFramework: "TABULA RASA"
    },
    {
      id: "consulting",
      title: "Odciążenie Infolinii & Doradztwo Techniczne",
      desc: "Odpowiada na częste pytania, rozwiewa wątpliwości i filtruje zapytania.",
      icon: HelpCircle,
      recommendedFramework: "DELTA"
    }
  ];

  const QUICK_ADVANTAGES = [
    "Darmowy pomiar w 48h i pisemna gwarancja 5 lat",
    "Kompleksowa obsługa od projektu po montaż pod klucz",
    "Możliwość płatności w ratach 0% i dedykowany opiekun",
    "Zwrot inwestycji w mniej niż 12 miesięcy i certyfikaty ISO"
  ];

  const handleRunGenerator = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onGenerateSuccess(customAdvantage, selectedGoal);
      toast({
        title: "✨ Doradca AI wygenerowany!",
        description: `Aktywowano profil ${activePersona.name} z protokołem SPICE. Możesz przetestować rozmowę w prawym panelu.`
      });
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      {/* ─── KROK 1: BRANŻA I PERSONA ───────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bento-card border-blue-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-white">KROK 1: Wybierz Branżę i Doradcę AI</h3>
              <p className="text-xs text-slate-400">1 kliknięciem ładuje dopasowaną wiedzę i procedury</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectIndustry(selectedIndustryId, "female")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGender === "female"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Doradczyni
            </button>
            <button
              onClick={() => onSelectIndustry(selectedIndustryId, "male")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedGender === "male"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Doradca
            </button>
          </div>
        </div>

        {/* 8 Branż Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {industries.map((ind) => {
            const isSelected = selectedIndustryId === ind.id;
            const Icon = ind.icon;
            const pers = selectedGender === "female" ? ind.femalePersona : ind.malePersona;
            return (
              <button
                key={ind.id}
                onClick={() => onSelectIndustry(ind.id, selectedGender)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-cyan-400 shadow-md shadow-cyan-500/10 scale-[1.02]"
                    : "bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <Avatar className="w-7 h-7 rounded-lg border border-slate-700 shrink-0">
                    <AvatarImage src={pers.photoUrl} alt={pers.name} className="object-cover" />
                    <AvatarFallback>{pers.name[0]}</AvatarFallback>
                  </Avatar>
                </div>

                <div className={`font-bold text-xs line-clamp-1 ${isSelected ? "text-cyan-300" : "text-white"}`}>
                  {ind.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {pers.name} • {pers.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Wybrana Persona Banner */}
        <div className="p-3.5 rounded-2xl bg-[#04060c] border border-blue-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11 rounded-xl border border-cyan-500/30 shadow-md">
              <AvatarImage src={activePersona.photoUrl} alt={activePersona.name} className="object-cover" />
              <AvatarFallback>{activePersona.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{activePersona.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {activePersona.years} lat doświadczenia
                </span>
              </div>
              <p className="text-xs text-slate-400">{activePersona.title}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            {activePersona.specs.slice(0, 2).map((s: string, idx: number) => (
              <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── KROK 2: GŁÓWNY CEL BIZNESOWY ───────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bento-card border-blue-500/30 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-white">KROK 2: Wybierz Główny Cel Biznesowy</h3>
            <p className="text-xs text-slate-400">Jakie zadanie ma realizować asystent podczas rozmowy z klientem?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUSINESS_GOALS.map(goal => {
            const isSelected = selectedGoal === goal.id;
            const Icon = goal.icon;
            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-cyan-400 shadow-md shadow-cyan-500/10 scale-[1.01]"
                    : "bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      <Check className="w-3 h-3" /> Wybrano
                    </span>
                  )}
                </div>

                <h4 className={`font-bold text-xs sm:text-sm ${isSelected ? "text-cyan-300" : "text-white"}`}>
                  {goal.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {goal.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── KROK 3: ATUTY OFERTY ───────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bento-card border-blue-500/30 space-y-4 shadow-xl">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-white">KROK 3: Czym wyróżnia się Twoja oferta?</h3>
            <p className="text-xs text-slate-400">Podaj kluczowy atut (np. gwarancja, szybkość, darmowy dojazd)</p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={customAdvantage}
            onChange={(e) => setCustomAdvantage(e.target.value)}
            placeholder="np. Bezpłatny pomiar na miejscu, realizacja w 21 dni, 5 lat gwarancji..."
            className="w-full px-4 py-3 rounded-2xl bg-[#04060c] border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
          />

          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Szybkie szablony atutów (kliknij, aby wstawić):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ADVANTAGES.map((adv, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomAdvantage(adv)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
                >
                  + {adv}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── PRZYCISK GENEROWANIA & PRZEŁĄCZNIK ZAAWANSOWANY ─────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-indigo-950/60 border border-blue-500/30 space-y-4 shadow-2xl">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Gotowy do wdrożenia w 5 sekund
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                SPICE Protocol Core
              </span>
            </div>
            <h4 className="text-base font-black text-white">
              Wygeneruj Doradcę AI i Przetestuj Rozmowę
            </h4>
          </div>

          <button
            onClick={handleRunGenerator}
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-slate-950 hover:text-white font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Generowanie..." : "✨ Wygeneruj i Uruchom Doradcę"}</span>
          </button>
        </div>

        {/* Dolny pasek: Edukacja & Zaawansowane */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={onOpenSpiceAcademy}
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🎓 Jak działa framework SPICE? (Otwórz Przewodnik Edukacyjny)</span>
          </button>

          <button
            onClick={onOpenAdvancedMode}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>⚙️ Otwórz Pełne Studio Zaawansowane (16 Frameworków, Suwaki, Baza Wiedzy)</span>
          </button>
        </div>

      </div>

    </div>
  );
}

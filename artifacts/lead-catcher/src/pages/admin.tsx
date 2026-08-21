import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  useListAdminLeads,
  useGetAdminLead,
  useDeleteAdminLead,
  useSummarizeLead,
  useGetAdminSettings,
  useUpdateAdminSettings,
  useListPersonaTypes,
  useCreatePersonaType,
  useUpdatePersonaType,
  useDeletePersonaType,
  useCreatePersona,
  useUpdatePersona,
  useDeletePersona,
  useActivatePersona,
  PersonaTypeWithPersonas,
  Persona,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Trash2, MessageSquare, ArrowLeft, ArrowRight, ImagePlus,
  CheckCircle2, Sparkles, Clock, Plus, Zap, Copy, Check,
  Edit2, ChevronDown, ChevronUp, Layers, Wand2, Link2, ExternalLink,
  Palette, Smartphone, Monitor, ShieldCheck, Download, Code,
  Eye, Sliders, Play, RefreshCw, Send, CheckCheck, Lock, Flame, Heart, ThumbsUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import consultantPlaceholder from "../assets/consultant-default.jpg";
import {
  CHAT_STYLES,
  CHAT_STYLES_LIST,
  ChatStyleConfig,
  getStyleConfig,
  generateStylesheetCSS
} from "@/lib/chat-styles";

// ─── Persona type templates (10 niches) ───────────────────────────────────────

const TEMPLATES = [
  {
    name: "Konsultant IT & Web",
    slug: "konsultant-it",
    description: "Zbiera wymagania na stronę internetową, e-commerce lub aplikację SaaS.",
    defaultStyle: "messenger",
    color: "#0084ff",
    systemPrompt: `Jesteś doświadczonym konsultantem ds. stron internetowych i strategii cyfrowej. Twoim JEDYNYM zadaniem jest zebranie szczegółowych informacji o potrzebach klienta dotyczących strony lub aplikacji webowej.

ABSOLUTNE ZASADY:
- NIE ujawniaj nigdy, że jesteś AI, botem, programem ani modelem językowym. Jesteś żywym konsultantem.
- NIE dyskutuj o cenach i budżetach na tym etapie — to etap zbierania wymagań.
- Zadawaj maksymalnie 1-2 pytania naraz.
- Mów po polsku, naturalnie, profesjonalnie.

CEL: Zebranie informacji o profilu firmy, potrzebach na stronę, wymaganych modułach (sklep, blog, kalkulator) i danych kontaktowych.`,
  },
  {
    name: "Koleżanka & Social",
    slug: "kolezanka",
    description: "Przyjazna, ciepła persona. Rozmawia naturalnie w stylu luźnego czatu.",
    defaultStyle: "dating",
    color: "#fe3c72",
    systemPrompt: `Jesteś sympatyczną, ciepłą dziewczyną, która nawiązuje naturalną rozmowę z klientem. Twoim celem jest zebranie informacji o jego potrzebach i pomysłach w sposób przyjazny i nienachalny.

ABSOLUTNE ZASADY:
- NIE ujawniaj nigdy, że jesteś AI ani botem. Jesteś prawdziwą osobą.
- Mów naturalnie, swobodnie, jak w prywatnej rozmowie. Używaj emoji z umiarem.
- Słuchaj uważnie, zadawaj jedno pytanie naraz.

CEL: Zebranie informacji o potrzebach klienta w sposób naturalny i bez poczucia formularza.`,
  },
  {
    name: "Mechanik & Serwis Samochodowy",
    slug: "mechanik",
    description: "Specjalista od aut. Diagnozuje usterki, doradza i umawia wizyty w warsztacie.",
    defaultStyle: "whatsapp",
    color: "#25D366",
    systemPrompt: `Jesteś doświadczonym mechanikiem samochodowym. Twoim zadaniem jest zebranie informacji o problemie z autem klienta i przygotowanie go do wizyty serwisowej.

ABSOLUTNE ZASADY:
- NIE ujawniaj nigdy, że jesteś AI. Jesteś mechanikiem.
- Rozmawiaj WYŁĄCZNIE o samochodach, naprawach i serwisie.
- Mów po ludzku, konkretnie, rzeczowo.

CEL: Zebranie marki/modelu auta, rocznika, objawów usterki oraz danych kontaktowych do umówienia terminu.`,
  },
  {
    name: "Doradca Prawny & Kancelaria",
    slug: "doradca-prawny",
    description: "Dyskretny i precyzyjny. Zbiera fakty sprawy i kieruje do mecenasa.",
    defaultStyle: "banking",
    color: "#1e3a5f",
    systemPrompt: `Jesteś doradcą w renomowanej kancelarii prawnej. Twoim zadaniem jest zebranie wstępnych informacji o sprawie klienta i przygotowanie gruntu pod konsultację prawną.

ABSOLUTNE ZASADY:
- NIE ujawniaj nigdy, że jesteś AI.
- Zachowaj najwyższą dyskrecję, kulturę osobistą i formalny język.
- NIE wydawaj ostatecznych porad prawnych — analiza nastąpi na konsultacji z mecenasem.

CEL: Zebranie rodzaju sprawy (cywilna, karna, gospodarcza), okoliczności i kontaktu.`,
  },
  {
    name: "Pośrednik Nieruchomości",
    slug: "posrednik-nieruchomosci",
    description: "Zbiera wymagania mieszkaniowe, budżet i preferencje lokalizacyjne.",
    defaultStyle: "messenger",
    color: "#059669",
    systemPrompt: `Jesteś profesjonalnym agentem nieruchomości. Twoim zadaniem jest zebranie preferencji klienta (kupno, sprzedaż, wynajem) i zaplanowanie prezentacji.

ABSOLUTNE ZASADY:
- NIE ujawniaj, że jesteś AI. Jesteś licencjonowanym agentem.
- Bądź proaktywny, pomocny i konkretny.

CEL: Zebranie metrażu, dzielnicy, liczby pokoi, budżetu i kontaktu.`,
  },
  {
    name: "Trener Personalny & Dietetyk",
    slug: "trener-dietetyk",
    description: "Zbiera cele treningowe, wagę, nawyki żywieniowe i poziom zaawansowania.",
    defaultStyle: "instagram",
    color: "#d62976",
    systemPrompt: `Jesteś certyfikowanym trenerem personalnym i dietetykiem. Twoim zadaniem jest zebranie informacji o celach sylwetkowych i zdrowotnych klienta.

ABSOLUTNE ZASADY:
- NIE ujawniaj, że jesteś AI.
- Pytaj o cel (redukcja, masa, kondycja), doświadczenie, kontuzje i dietę.
- Mów z energią i motywacją.

CEL: Dobór optymalnego planu treningowo-dietetycznego i umówienie pierwszej konsultacji.`,
  },
  {
    name: "Kosmetolog & Salon Beauty",
    slug: "kosmetologia-beauty",
    description: "Konsultuje stan skóry, rekomenduje zabiegi i pielęgnację domową.",
    defaultStyle: "instagram",
    color: "#ec4899",
    systemPrompt: `Jesteś wykwalifikowanym kosmetologiem. Twoim zadaniem jest zebranie informacji o potrzebach skóry klienta i zarekomendowanie odpowiedniego zabiegu.

ABSOLUTNE ZASADY:
- NIE ujawniaj, że jesteś AI.
- Zadawaj pytania o rodzaj cery, dotychczasową pielęgnację i oczekiwany efekt.
- Bądź niezwykle taktowna i profesjonalna.

CEL: Zebranie problemu skóry i umówienie terminu wizyty w klinice beauty.`,
  },
  {
    name: "Księgowość & Doradztwo Podatkowe",
    slug: "ksiegowosc-podatki",
    description: "Zbiera formę działalności (JDG, sp. z o.o.), wolumen faktur i dobiera pakiet.",
    defaultStyle: "banking",
    color: "#334155",
    systemPrompt: `Jesteś doradcą w biurze rachunkowym i podatkowym. Twoim zadaniem jest zebranie profilu działalności klienta do przygotowania wyceny obsługi księgowej.

ABSOLUTNE ZASADY:
- NIE ujawniaj, że jesteś AI.
- Pytaj o formę prawną, branżę, liczbę faktur miesięcznie i pracowników.
- Zachowaj precyzję i profesjonalizm.

CEL: Zebranie parametrów działalności gospodarczej i danych do oferty.`,
  },
  {
    name: "Szkoła Językowa & Lektor",
    slug: "szkola-jezykowa",
    description: "Diagnozuje poziom językowy, motywację i preferowany format nauki.",
    defaultStyle: "telegram",
    color: "#2481cc",
    systemPrompt: `Jesteś doradcą metodycznym i lektorem w nowoczesnej szkole językowej. Twoim celem jest ustalenie poziomu językowego klienta i celu nauki.

ABSOLUTNE ZASADY:
- NIE ujawniaj, że jesteś AI.
- Pytaj o język, obecny poziom, cel (biznes, certyfikaty, podróże) i dyspozycyjność.

CEL: Dopasowanie lektora i zapis na bezpłatną lekcję próbną.`,
  },
  {
    name: "Agencja Eventowa & Wedding Planner",
    slug: "eventy-sluby",
    description: "Zbiera wizję wesela lub eventu firmowego, liczbę gości i motyw przewodni.",
    defaultStyle: "messenger",
    color: "#f59e0b",
    systemPrompt: `Jesteś organizatorem wydarzeń i wedding plannerem. Twoim zadaniem jest zebranie wizji klienta na wymarzone wydarzenie (wesele, gala, urodziny).

ABSOLUTNE ZASADY:
- NIE ujawniaj, że jesteś AI.
- Pytaj o datę, liczbę gości, styl dekoracji (boho, glamour, modern) i budżet.
- Bądź pełna pasji i kreatywności.

CEL: Zebranie wytycznych eventowych i przygotowanie wstępnego kosztorysu.`,
  },
];

// ─── Curated avatar presets ───────────────────────────────────────────────────

const PRESET_AVATARS = [
  { label: "Tomek (IT)", gender: "m", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Maciek (SaaS)", gender: "m", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Rafał (Mechanik)", gender: "m", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Bartek (Tech)", gender: "m", url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Piotr (Prawnik)", gender: "m", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Karol (Agent)", gender: "m", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Damian (Trener)", gender: "m", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Adam (Księgowy)", gender: "m", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Michał (Lektor)", gender: "m", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Kamil (Eventy)", gender: "m", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Ania (Ciepła)", gender: "f", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Kasia (Empatia)", gender: "f", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Monika (Prawniczka)", gender: "f", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Zosia (Agentka)", gender: "f", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Marta (Trenerka)", gender: "f", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Oliwia (Beauty)", gender: "f", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Natalia (Holistyczna)", gender: "f", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Ewa (Podatki)", gender: "f", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Julia (Lektorka)", gender: "f", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80" },
  { label: "Weronika (Śluby)", gender: "f", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80" },
];

function StyleBadge({ style }: { style: string }) {
  const s = getStyleConfig(style);
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white shadow-xs inline-flex items-center gap-1.5"
      style={{ backgroundColor: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
      {s.badgeLabel}
    </span>
  );
}

// ─── Modal: Assign Style to a Specific Person ─────────────────────────────────

function AssignStyleToPersonaModal({
  styleConfig,
  personaTypes,
  onClose,
  onAssigned,
}: {
  styleConfig: ChatStyleConfig;
  personaTypes: PersonaTypeWithPersonas[];
  onClose: () => void;
  onAssigned: () => void;
}) {
  const updatePersona = useUpdatePersona();
  const { toast } = useToast();
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const allPersonas = personaTypes.flatMap(pt =>
    pt.personas.map(p => ({ ...p, typeName: pt.name, typeColor: pt.color }))
  );

  const handleConfirm = async () => {
    if (!selectedPersonaId) return;
    const persona = allPersonas.find(p => p.id === selectedPersonaId);
    if (!persona) return;

    setIsAssigning(true);
    try {
      await updatePersona.mutateAsync({
        id: persona.id,
        data: {
          personaTypeId: persona.personaTypeId,
          name: persona.name,
          title: persona.title,
          photoUrl: persona.photoUrl,
          additionalPrompt: persona.additionalPrompt,
          style: styleConfig.id,
        },
      });
      toast({
        title: `Styl ${styleConfig.name} przypisany do postaci: ${persona.name}!`,
        description: `Wszystkie rozmowy z ${persona.name} będą teraz wyświetlane w tym stylu.`,
      });
      onAssigned();
      onClose();
    } catch {
      toast({ title: "Błąd przypisywania stylu", variant: "destructive" });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in-50 zoom-in-95">
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderLeft: `6px solid ${styleConfig.color}` }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Przypisywanie Stylu & Motywu
            </span>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mt-0.5">
              <Palette className="w-5 h-5" style={{ color: styleConfig.color }} />
              {styleConfig.name}
            </h3>
          </div>
          <StyleBadge style={styleConfig.id} />
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <p className="text-sm text-muted-foreground">
            Wybierz postać, która otrzyma ten indywidualny styl interfejsu czatu:
          </p>

          <div className="space-y-2">
            {allPersonas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak dostępnych person w systemie. Utwórz najpierw postać.
              </p>
            ) : (
              allPersonas.map(p => {
                const isSelected = selectedPersonaId === p.id;
                const isCurrentStyle = (p.style || "messenger") === styleConfig.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersonaId(p.id)}
                    className={`w-full flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                        : "border-border/70 hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <Avatar className="w-10 h-10 border shadow-xs shrink-0">
                      <AvatarImage src={p.photoUrl || consultantPlaceholder} className="object-cover" />
                      <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{p.name}</span>
                        {p.isActive && (
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] py-0">
                            Aktywna
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">({p.typeName})</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        Obecny styl: <strong>{getStyleConfig(p.style).name}</strong>
                      </p>
                    </div>
                    {isCurrentStyle && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                        Już przypisany
                      </span>
                    )}
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 p-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Anuluj
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isAssigning || !selectedPersonaId}
            className="gap-2 font-semibold shadow-md"
            style={{ backgroundColor: styleConfig.color, color: "#ffffff" }}
          >
            {isAssigning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Zatwierdź przypisanie stylu
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Visual Style Picker for a Specific Persona ─────────────────────────

function PickStyleForPersonaModal({
  persona,
  onClose,
  onSaved,
}: {
  persona: Persona & { typeName?: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const updatePersona = useUpdatePersona();
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<string>(persona.style || "messenger");
  const [isSaving, setIsSaving] = useState(false);

  const activeStyleConfig = getStyleConfig(selectedStyle);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePersona.mutateAsync({
        id: persona.id,
        data: {
          personaTypeId: persona.personaTypeId,
          name: persona.name,
          title: persona.title,
          photoUrl: persona.photoUrl,
          additionalPrompt: persona.additionalPrompt,
          style: selectedStyle,
        },
      });
      toast({
        title: `Styl zmieniony na: ${activeStyleConfig.name}`,
        description: `Persona ${persona.name} ma teraz unikalny interfejs.`,
      });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Błąd zmiany stylu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 shadow-xs">
              <AvatarImage src={persona.photoUrl || consultantPlaceholder} className="object-cover" />
              <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Wybierz styl interfejsu dla: <span className="text-primary">{persona.name}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Styl określa kolory, dymki, ikony, szyfrowanie i zachowanie czatu dla tej postaci.
              </p>
            </div>
          </div>
          <StyleBadge style={selectedStyle} />
        </div>

        {/* Styles Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CHAT_STYLES_LIST.map(st => {
              const isSelected = selectedStyle === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-transparent text-white shadow-lg ring-2 ring-offset-2 ring-primary"
                      : "border-border hover:border-border/80 hover:bg-muted/40 text-foreground"
                  }`}
                  style={isSelected ? { backgroundColor: st.color } : {}}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: isSelected ? "#ffffff" : st.color }}
                        />
                        <span className={`font-bold text-xs ${isSelected ? "text-white" : "text-foreground"}`}>
                          {st.name}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {st.category}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] line-clamp-2 leading-relaxed ${
                        isSelected ? "text-white/90" : "text-muted-foreground"
                      }`}
                    >
                      {st.description}
                    </p>
                  </div>

                  {/* Micro bubble preview */}
                  <div
                    className="mt-3 p-2 rounded-lg text-[10px] flex items-center justify-between"
                    style={{
                      backgroundColor: isSelected ? "rgba(0,0,0,0.15)" : st.bg,
                      color: isSelected ? "#ffffff" : st.userText,
                    }}
                  >
                    <span className="truncate max-w-[170px]">{st.sampleLeadMessage}</span>
                    <span className="font-mono text-[9px] opacity-70">✓✓</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Style Detail Callout */}
          <div className="p-4 rounded-xl border bg-muted/40 flex items-start gap-3">
            <Palette className="w-5 h-5 shrink-0 mt-0.5" style={{ color: activeStyleConfig.color }} />
            <div>
              <p className="text-xs font-semibold text-foreground">
                Wybrany styl: <strong>{activeStyleConfig.name}</strong> ({activeStyleConfig.tagline})
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{activeStyleConfig.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 p-4 border-t bg-muted/20 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Anuluj
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 font-semibold shadow-md"
            style={{ backgroundColor: activeStyleConfig.color, color: "#ffffff" }}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Zapisz styl dla {persona.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Export & View CSS Stylesheet ───────────────────────────────────────

function StylesheetCSSModal({
  styleConfig,
  onClose,
}: {
  styleConfig: ChatStyleConfig;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const cssContent = generateStylesheetCSS(styleConfig);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssContent);
    setCopied(true);
    toast({ title: `CSS Stylesheet dla "${styleConfig.name}" skopiowany!` });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([cssContent], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lead-catcher-theme-${styleConfig.id}.css`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Pobrano plik lead-catcher-theme-${styleConfig.id}.css` });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95">
        <div
          className="p-5 border-b flex items-center justify-between shrink-0 bg-muted/20"
          style={{ borderLeft: `6px solid ${styleConfig.color}` }}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Eksport arkusza stylów (Stylesheet)
            </span>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mt-0.5">
              <Code className="w-4 h-4" style={{ color: styleConfig.color }} />
              lead-catcher-theme-{styleConfig.id}.css
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload} className="h-8 gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              Pobierz .css
            </Button>
            <Button
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: styleConfig.color }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Skopiowano!" : "Kopiuj CSS"}
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-xs text-muted-foreground mb-3">
            Możesz wkleić ten arkusz stylów do projektu klienta lub użyć zmiennych CSS do pełnej personalizacji:
          </p>
          <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
            <code>{cssContent}</code>
          </pre>
        </div>

        <div className="p-4 border-t bg-muted/20 flex justify-end shrink-0">
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Persona form modal ───────────────────────────────────────────────────────

interface PersonaFormData {
  personaTypeId: number;
  name: string;
  title: string;
  photoUrl: string | null;
  additionalPrompt: string;
  style: string | null;
}

function PersonaFormModal({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: PersonaFormData;
  onSave: (d: PersonaFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const res = await fetch("/api/admin/persona-photo-upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(f => ({ ...f, photoUrl: data.photoUrl }));
      toast({ title: "Zdjęcie wgrane pomyślnie" });
    } catch {
      toast({ title: "Błąd uploadu", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const selectedStyleObj = getStyleConfig(form.style);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-lg font-bold text-foreground">
              {initial.name ? `Edytuj postać: ${initial.name}` : "Nowa postać (Persona)"}
            </h3>
            {form.style && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow-xs"
                style={{ backgroundColor: selectedStyleObj?.color }}
              >
                Styl: {selectedStyleObj?.name}
              </span>
            )}
          </div>

          {/* Avatar & Photo */}
          <div className="flex flex-col items-center gap-3 bg-muted/20 p-4 rounded-xl border border-dashed">
            <Avatar className="w-20 h-20 border-2 border-border shadow-md ring-2 ring-primary/20">
              <AvatarImage src={form.photoUrl || consultantPlaceholder} className="object-cover" />
              <AvatarFallback className="text-xl font-bold">{form.name.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleUpload} />
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-1" />}
                Wgraj własne
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPresets(p => !p)}>
                {showPresets ? "Ukryj katalog" : "Wybierz z katalogu postaci"}
              </Button>
              {form.photoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive text-xs"
                  onClick={() => setForm(f => ({ ...f, photoUrl: null }))}
                >
                  Usuń
                </Button>
              )}
            </div>

            {/* Quick avatar selection */}
            {showPresets && (
              <div className="w-full bg-background p-3.5 rounded-xl border shadow-sm mt-1 animate-in fade-in-50">
                <p className="text-xs font-semibold text-foreground mb-2 text-center">
                  Wybierz gotowy awatar dla postaci:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setForm(f => ({ ...f, photoUrl: av.url }));
                        setShowPresets(false);
                      }}
                      className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                        form.photoUrl === av.url
                          ? "border-primary ring-2 ring-primary/40 bg-primary/10"
                          : "border-border/60 hover:border-border hover:bg-muted"
                      }`}
                      title={av.label}
                    >
                      <Avatar className="w-10 h-10 shadow-xs">
                        <AvatarImage src={av.url} className="object-cover" />
                        <AvatarFallback>{av.gender === "m" ? "♂" : "♀"}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] truncate max-w-[55px] mt-1 font-medium">
                        {av.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Imię postaci *</label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="np. Tomek, Ania, Rafał, Monika..."
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Opis roli (widoczny dla klienta na górze czatu)
            </label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="np. E-commerce & sklepy online, Radca prawny ds. umów..."
            />
          </div>

          {/* Individual Style Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Indywidualny styl interfejsu</label>
              <span className="text-xs text-muted-foreground">Możesz też zmienić styl osobnym przyciskiem</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, style: null }))}
                className={`p-2.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-3 ${
                  form.style === null
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">⚡ Domyślny styl typu</span>
                  <span className="text-[11px] text-muted-foreground">
                    Dziedziczy ustawienia z nadrzędnego typu
                  </span>
                </div>
              </button>

              {CHAT_STYLES_LIST.map(s => {
                const isSelected = form.style === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, style: s.id }))}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? "border-transparent text-white shadow-md ring-2 ring-offset-2 ring-primary"
                        : "border-border/80 hover:border-border hover:bg-muted/40"
                    }`}
                    style={isSelected ? { backgroundColor: s.color } : {}}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? "#ffffff" : s.color }}
                      />
                      <span className={`font-semibold text-xs truncate ${isSelected ? "text-white" : "text-foreground"}`}>
                        {s.name}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] line-clamp-2 mt-1 leading-tight ${
                        isSelected ? "text-white/90" : "text-muted-foreground"
                      }`}
                    >
                      {s.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Dodatkowy prompt osobowości i wiedzy</label>
            <Textarea
              value={form.additionalPrompt}
              onChange={e => setForm(f => ({ ...f, additionalPrompt: e.target.value }))}
              className="min-h-[110px] font-mono text-xs"
              placeholder="np. Masz na imię Tomek. Masz 35 lat i jesteś praktycznym ekspertem od sklepów internetowych..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Anuluj
            </Button>
            <Button onClick={() => onSave(form)} disabled={isSaving || !form.name.trim()}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Zapisz postać
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Persona type form modal ──────────────────────────────────────────────────

interface TypeFormData {
  name: string;
  slug: string;
  description: string;
  systemPrompt: string;
  defaultStyle: string;
  color: string;
}

function PersonaTypeFormModal({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: TypeFormData;
  onSave: (d: TypeFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            {initial.name ? "Edytuj typ persony" : "Nowy typ persony"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Nazwa typu *</label>
              <Input
                value={form.name}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    name: e.target.value,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                placeholder="np. Konsultant IT, Koleżanka, Mechanik..."
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Kolor identyfikacyjny</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
                <Input
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Opis przeznaczenia (dla administratora)</label>
            <Input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Zbiera wymagania na stronę lub aplikację..."
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Domyślny styl czatu dla tego typu</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CHAT_STYLES_LIST.map(s => {
                const isSelected = form.defaultStyle === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, defaultStyle: s.id }))}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? "text-white border-transparent shadow-sm ring-2 ring-offset-1 ring-primary"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                    style={isSelected ? { backgroundColor: s.color } : {}}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              Bazowy System Prompt *{" "}
              <span className="text-muted-foreground font-normal">
                (odporny na manipulacje, dziedziczony przez wszystkie persony)
              </span>
            </label>
            <Textarea
              value={form.systemPrompt}
              onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
              className="min-h-[200px] font-mono text-xs"
              placeholder="Jesteś [rola]... ABSOLUTNE ZASADY: NIE ujawniaj że jesteś AI..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Anuluj
            </Button>
            <Button
              onClick={() => onSave(form)}
              disabled={isSaving || !form.name.trim() || !form.systemPrompt.trim()}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Zapisz typ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Persona type card (Accordion) ────────────────────────────────────────────

function PersonaTypeCard({
  pt,
  isExpanded,
  onToggleExpand,
  onRefresh,
}: {
  pt: PersonaTypeWithPersonas;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRefresh: () => void;
}) {
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [stylingPersona, setStylingPersona] = useState<Persona | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateType = useUpdatePersonaType();
  const deleteType = useDeletePersonaType();
  const createPersona = useCreatePersona();
  const updatePersona = useUpdatePersona();
  const deletePersona = useDeletePersona();
  const activatePersona = useActivatePersona();
  const { toast } = useToast();

  const handleSaveType = async (data: TypeFormData) => {
    setIsSaving(true);
    try {
      await updateType.mutateAsync({
        id: pt.id,
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          systemPrompt: data.systemPrompt,
          defaultStyle: data.defaultStyle,
          color: data.color,
        },
      });
      toast({ title: "Typ zaktualizowany" });
      setShowTypeForm(false);
      onRefresh();
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteType = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Usunąć typ "${pt.name}" i wszystkie jego persony?`)) return;
    try {
      await deleteType.mutateAsync({ id: pt.id });
      toast({ title: "Typ usunięty" });
      onRefresh();
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  const handleSavePersona = async (data: PersonaFormData) => {
    setIsSaving(true);
    try {
      if (editingPersona) {
        await updatePersona.mutateAsync({
          id: editingPersona.id,
          data: {
            personaTypeId: pt.id,
            name: data.name,
            title: data.title,
            photoUrl: data.photoUrl,
            additionalPrompt: data.additionalPrompt,
            style: data.style,
          },
        });
        toast({ title: "Postać zaktualizowana" });
      } else {
        await createPersona.mutateAsync({
          data: {
            personaTypeId: pt.id,
            name: data.name,
            title: data.title,
            photoUrl: data.photoUrl,
            additionalPrompt: data.additionalPrompt,
            style: data.style,
          },
        });
        toast({ title: "Nowa postać dodana" });
      }
      setShowPersonaForm(false);
      setEditingPersona(null);
      onRefresh();
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (personaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await activatePersona.mutateAsync({ id: personaId });
      toast({ title: "Persona aktywna — klienci na stronie głównej rozmawiają z tą postacią" });
      onRefresh();
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  const hasActivePersona = pt.personas.some(p => p.isActive);

  return (
    <>
      <div
        className={`border rounded-2xl overflow-hidden bg-card transition-all duration-200 shadow-sm ${
          isExpanded ? "ring-2 ring-primary/20 shadow-md" : "hover:border-border/80 hover:shadow"
        }`}
      >
        {/* Type header (Accordion Bar) */}
        <div
          onClick={onToggleExpand}
          className="flex items-center gap-3.5 px-5 py-4 cursor-pointer select-none transition-colors hover:bg-muted/30"
          style={{ borderLeft: `5px solid ${pt.color}` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm"
            style={{ backgroundColor: pt.color }}
          >
            {pt.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base tracking-tight text-foreground">{pt.name}</h3>
              <StyleBadge style={pt.defaultStyle} />
              {hasActivePersona && (
                <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 text-[11px] font-medium py-0">
                  <Zap className="w-3 h-3 mr-1 fill-green-500" />
                  Aktywna na stronie
                </Badge>
              )}
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                {pt.personas.length}{" "}
                {pt.personas.length === 1
                  ? "postać"
                  : pt.personas.length >= 2 && pt.personas.length <= 4
                  ? "postacie"
                  : "postaci"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
              {pt.description || "Kliknij, aby rozwinąć listę person tego typu"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={e => {
                e.stopPropagation();
                setShowTypeForm(true);
              }}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Edytuj typ</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteType}
              className="text-destructive hover:bg-destructive/10 h-8 px-2"
              title="Usuń typ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <div className="p-1 text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 transition-transform" />
              ) : (
                <ChevronDown className="w-5 h-5 transition-transform" />
              )}
            </div>
          </div>
        </div>

        {/* Personas list */}
        {isExpanded && (
          <div className="border-t bg-muted/15 px-5 py-4 space-y-3 animate-in fade-in-50 duration-200">
            {pt.personas.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak person w tym typie. Kliknij poniżej, aby dodać pierwszą postać.
              </p>
            )}
            {pt.personas.map(persona => {
              const effectiveStyle = persona.style || pt.defaultStyle;
              const styleObj = getStyleConfig(effectiveStyle);
              return (
                <div
                  key={persona.id}
                  className={`flex items-center gap-3.5 bg-card rounded-xl px-4 py-3.5 border transition-all ${
                    persona.isActive
                      ? "border-primary/60 shadow-sm ring-1 ring-primary/20 bg-primary/[0.02]"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Avatar className="w-12 h-12 shrink-0 border-2 border-border shadow-sm">
                    <AvatarImage src={persona.photoUrl || consultantPlaceholder} className="object-cover" />
                    <AvatarFallback className="text-white text-sm font-semibold" style={{ backgroundColor: pt.color }}>
                      {persona.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-foreground">{persona.name}</p>
                      {persona.isActive && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] py-0 font-bold">
                          <Zap className="w-2.5 h-2.5 mr-0.5 fill-white" />
                          GŁÓWNA AKTYWNA
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {persona.title ||
                        (persona.additionalPrompt
                          ? persona.additionalPrompt.slice(0, 60) + "..."
                          : "Brak opisu")}
                    </p>
                  </div>

                  {/* Actions & Individual Style Button */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    {/* Separate Styl Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold gap-1.5 shadow-2xs border-dashed hover:border-solid transition-all"
                      style={{ borderColor: styleObj.color, color: styleObj.color }}
                      title={`Zmień styl dla ${persona.name} (obecnie: ${styleObj.name})`}
                      onClick={e => {
                        e.stopPropagation();
                        setStylingPersona(persona);
                      }}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Styl: {styleObj.badgeLabel}</span>
                    </Button>

                    {!persona.isActive && (
                      <Button
                        size="sm"
                        className="h-8 text-xs px-3 font-medium shadow-2xs"
                        onClick={e => handleActivate(persona.id, e)}
                        disabled={activatePersona.isPending}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Aktywuj
                      </Button>
                    )}

                    {persona.slug && (
                      <>
                        <Link href={`/chat/${persona.slug}`} target="_blank">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-2.5 gap-1 shadow-2xs"
                            title="Otwórz podgląd czatu"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs px-2.5 gap-1 shadow-2xs"
                          title={`Kopiuj link do czatu: /chat/${persona.slug}`}
                          onClick={e => {
                            e.stopPropagation();
                            const url = `${window.location.origin}/chat/${persona.slug}`;
                            navigator.clipboard.writeText(url);
                            toast({ title: `Link do ${persona.name} skopiowany!`, description: url });
                          }}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs px-2.5"
                      title="Edytuj postać i prompt"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingPersona(persona);
                        setShowPersonaForm(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:bg-destructive/10"
                      title="Usuń postać"
                      onClick={async e => {
                        e.stopPropagation();
                        if (!confirm(`Usunąć postać "${persona.name}"?`)) return;
                        await deletePersona.mutateAsync({ id: persona.id });
                        toast({ title: "Postać usunięta" });
                        onRefresh();
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed text-muted-foreground hover:text-foreground h-9 font-medium"
              onClick={() => {
                setEditingPersona(null);
                setShowPersonaForm(true);
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Dodaj postać do typu "{pt.name}"
            </Button>
          </div>
        )}
      </div>

      {showTypeForm && (
        <PersonaTypeFormModal
          initial={{
            name: pt.name,
            slug: pt.slug,
            description: pt.description,
            systemPrompt: pt.systemPrompt,
            defaultStyle: pt.defaultStyle,
            color: pt.color,
          }}
          onSave={handleSaveType}
          onCancel={() => setShowTypeForm(false)}
          isSaving={isSaving}
        />
      )}

      {showPersonaForm && (
        <PersonaFormModal
          initial={
            editingPersona
              ? {
                  personaTypeId: pt.id,
                  name: editingPersona.name,
                  title: editingPersona.title,
                  photoUrl: editingPersona.photoUrl ?? null,
                  additionalPrompt: editingPersona.additionalPrompt,
                  style: editingPersona.style ?? null,
                }
              : {
                  personaTypeId: pt.id,
                  name: "",
                  title: "",
                  photoUrl: null,
                  additionalPrompt: "",
                  style: null,
                }
          }
          onSave={handleSavePersona}
          onCancel={() => {
            setShowPersonaForm(false);
            setEditingPersona(null);
          }}
          isSaving={isSaving}
        />
      )}

      {stylingPersona && (
        <PickStyleForPersonaModal
          persona={{ ...stylingPersona, typeName: pt.name }}
          onClose={() => setStylingPersona(null)}
          onSaved={onRefresh}
        />
      )}
    </>
  );
}

// ─── Personas Tab ─────────────────────────────────────────────────────────────

function PersonasTab({ onAssignStyleClick }: { onAssignStyleClick?: () => void }) {
  const { data: personaTypes, isLoading, refetch } = useListPersonaTypes();
  const createType = useCreatePersonaType();
  const { toast } = useToast();

  const [expandedTypeId, setExpandedTypeId] = useState<number | null>(null);
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (personaTypes && personaTypes.length > 0 && expandedTypeId === null) {
      const typeWithActive = personaTypes.find(pt => pt.personas.some(p => p.isActive));
      if (typeWithActive) {
        setExpandedTypeId(typeWithActive.id);
      } else {
        setExpandedTypeId(personaTypes[0].id);
      }
    }
  }, [personaTypes]);

  const handleToggleExpand = (id: number) => {
    setExpandedTypeId(current => (current === id ? null : id));
  };

  const handleCreateType = async (data: TypeFormData) => {
    setIsSaving(true);
    try {
      await createType.mutateAsync({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          systemPrompt: data.systemPrompt,
          defaultStyle: data.defaultStyle,
          color: data.color,
        },
      });
      toast({ title: "Typ persony utworzony" });
      setShowNewTypeForm(false);
      refetch();
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTemplate = async (t: (typeof TEMPLATES)[0]) => {
    setCreatingTemplate(t.slug);
    try {
      await createType.mutateAsync({
        data: {
          name: t.name,
          slug: t.slug,
          description: t.description,
          systemPrompt: t.systemPrompt,
          defaultStyle: t.defaultStyle,
          color: t.color,
        },
      });
      toast({ title: `Typ "${t.name}" dodany!`, description: "Teraz dodaj persony w ramach tego typu." });
      refetch();
    } catch (e: any) {
      const msg = e?.message || "";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        toast({ title: "Ten typ już istnieje", variant: "destructive" });
      } else {
        toast({ title: "Błąd tworzenia szablonu", variant: "destructive" });
      }
    } finally {
      setCreatingTemplate(null);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const existingSlugs = new Set((personaTypes ?? []).map(pt => pt.slug));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Persony & Zespół Asystentów</h2>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
            Zarządzaj postaciami i przypisuj im <strong>indywidualne style czatu</strong> (WhatsApp, Messenger,
            Instagram, Telegram, iMessage, Tinder, Discord, Banking VIP, AI Cyber itp.).
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setShowTemplates(s => !s)} className="gap-2">
            <Wand2 className="w-4 h-4 text-indigo-500" />
            Szablony branżowe (10)
          </Button>
          <Button onClick={() => setShowNewTypeForm(true)} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Nowy typ persony
          </Button>
        </div>
      </div>

      {/* Templates */}
      {showTemplates && (
        <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-pink-50/50 dark:from-indigo-950/20 dark:to-background border border-indigo-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3.5">
            <Wand2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-950 dark:text-indigo-200">
              10 Gotowych szablonów person dla różnych branż
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {TEMPLATES.map(t => {
              const exists = existingSlugs.has(t.slug);
              return (
                <button
                  key={t.slug}
                  disabled={exists || creatingTemplate === t.slug}
                  onClick={() => handleCreateTemplate(t)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    exists
                      ? "opacity-50 cursor-not-allowed bg-card border-border"
                      : "bg-card border-transparent hover:border-primary/60 cursor-pointer shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-xs"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.name}</p>
                      <StyleBadge style={t.defaultStyle} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                  {exists && <p className="text-xs text-green-600 font-semibold mt-2">✓ Już w katalogu</p>}
                  {creatingTemplate === t.slug && (
                    <p className="text-xs text-indigo-600 font-medium mt-2">Dodawanie...</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing types (Accordion) */}
      {!personaTypes || personaTypes.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-medium">Brak typów person</h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm max-w-sm mx-auto">
            Stwórz pierwszy typ lub skorzystaj z gotowych szablonów branżowych.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <Wand2 className="w-4 h-4 mr-2" />
              Szablony
            </Button>
            <Button onClick={() => setShowNewTypeForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nowy typ
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {personaTypes.map(pt => (
            <PersonaTypeCard
              key={pt.id}
              pt={pt}
              isExpanded={expandedTypeId === pt.id}
              onToggleExpand={() => handleToggleExpand(pt.id)}
              onRefresh={refetch}
            />
          ))}
        </div>
      )}

      {showNewTypeForm && (
        <PersonaTypeFormModal
          initial={{
            name: "",
            slug: "",
            description: "",
            systemPrompt: "",
            defaultStyle: "messenger",
            color: "#0084ff",
          }}
          onSave={handleCreateType}
          onCancel={() => setShowNewTypeForm(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

// ─── Stylesheet & Themes Library Tab (DEDICATED STYLESHEET STUDIO) ─────────────

function StylesheetStudioTab() {
  const { data: personaTypes, refetch: refetchPersonas } = useListPersonaTypes();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [assigningStyle, setAssigningStyle] = useState<ChatStyleConfig | null>(null);
  const [exportingCssStyle, setExportingCssStyle] = useState<ChatStyleConfig | null>(null);

  const categories = [
    { id: "all", label: "Wszystkie style (12)" },
    { id: "social", label: "Social Media (6)" },
    { id: "tech", label: "AI & Tech (2)" },
    { id: "business", label: "Business & VIP (2)" },
    { id: "luxury", label: "Luxury & Classic (2)" },
  ];

  const filteredStyles = CHAT_STYLES_LIST.filter(st => {
    if (selectedCategory === "all") return true;
    return st.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-900/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold tracking-wide uppercase border border-cyan-400/30">
              Style Studio & Design Tokens
            </span>
            <span className="text-white/60 text-xs">Wersja 2.5 Pro</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Palette className="w-6 h-6 text-cyan-400" />
            Biblioteka Arkuszy Stylów (Stylesheet)
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Każdy styl posiada niezależne tokeny designu, chmurki wiadomości, nagłówek, ikonografię oraz certyfikaty
            bezpieczeństwa. Możesz przypisać dowolny styl do wybranej persony osobnym przyciskiem lub wyeksportować
            czysty kod CSS.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2 h-10"
            onClick={() => setExportingCssStyle(CHAT_STYLES.whatsapp)}
          >
            <Code className="w-4 h-4 text-cyan-400" />
            Przeglądaj CSS Tokens
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              selectedCategory === c.id
                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                : "bg-card border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Stylesheet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStyles.map(st => {
          const userBg = typeof st.userBubble === "string" ? st.userBubble : st.userBubble.gradient;

          return (
            <div
              key={st.id}
              className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              {/* Card Top Accent Bar */}
              <div
                className="h-2 w-full shrink-0"
                style={{ background: st.topStripe || st.color }}
              />

              <div className="p-5 flex-1 flex flex-col justify-between">
                {/* Header & Meta */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-xs"
                        style={{ backgroundColor: st.color }}
                      />
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {st.name}
                      </h3>
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: st.color }}
                    >
                      {st.category}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-foreground/80 mb-1">{st.tagline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{st.description}</p>
                </div>

                {/* Live Micro Mockup Preview */}
                <div
                  className="my-4 rounded-xl p-3.5 border shadow-inner transition-all space-y-2 overflow-hidden"
                  style={{
                    backgroundColor: st.bg,
                    borderColor: st.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Mockup Header */}
                  <div
                    className="flex items-center justify-between pb-2 border-b text-xs font-semibold"
                    style={{
                      borderColor: st.headerBorder.replace("1px solid ", "") || "transparent",
                      color: st.headerText,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.onlineColor }} />
                      <span className="text-[11px] truncate max-w-[130px]">{st.name}</span>
                    </div>
                    {st.showLockBadge && <Lock className="w-3 h-3 opacity-70" />}
                  </div>

                  {/* Bot message */}
                  <div className="flex justify-start">
                    <div
                      className="text-[11px] px-3 py-1.5 rounded-2xl max-w-[85%] shadow-xs leading-relaxed"
                      style={{
                        backgroundColor: st.botBubble,
                        color: st.botText,
                        border: st.botBorder,
                      }}
                    >
                      {st.sampleLeadMessage}
                    </div>
                  </div>

                  {/* User message */}
                  <div className="flex justify-end">
                    <div
                      className="text-[11px] px-3 py-1.5 rounded-2xl max-w-[85%] shadow-xs leading-relaxed"
                      style={{
                        background: userBg,
                        color: st.userText,
                      }}
                    >
                      {st.sampleUserReply}
                    </div>
                  </div>

                  {/* Bottom reaction bar */}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: st.inputBg,
                        color: st.inputTextColor,
                        border: st.inputBorder,
                      }}
                    >
                      Wpisz wiadomość...
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] shadow-xs"
                      style={{ background: userBg }}
                    >
                      {st.id === "imessage" ? "↑" : "➤"}
                    </div>
                  </div>
                </div>

                {/* Design Tokens Palette Bar */}
                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono text-[10px]">Accent: {st.color}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border shadow-2xs" style={{ backgroundColor: st.bg }} title="Tło czatu" />
                    <span className="w-3 h-3 rounded-full border shadow-2xs" style={{ backgroundColor: st.headerBg }} title="Nagłówek" />
                    <span className="w-3 h-3 rounded-full border shadow-2xs" style={{ backgroundColor: st.botBubble }} title="Dymek asystenta" />
                    <span className="w-3 h-3 rounded-full shadow-2xs" style={{ background: userBg }} title="Dymek użytkownika" />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Separate Assign & CSS Buttons */}
              <div className="p-3.5 bg-muted/20 border-t flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-xs font-bold text-white shadow-sm gap-1.5"
                  style={{ backgroundColor: st.color }}
                  onClick={() => setAssigningStyle(st)}
                >
                  <Palette className="w-3.5 h-3.5" />
                  Przypisz do persony...
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-2.5 shadow-2xs gap-1"
                  title="Pokaż i kopiuj kod CSS Stylesheet"
                  onClick={() => setExportingCssStyle(st)}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CSS</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      {assigningStyle && (
        <AssignStyleToPersonaModal
          styleConfig={assigningStyle}
          personaTypes={personaTypes ?? []}
          onClose={() => setAssigningStyle(null)}
          onAssigned={() => {
            refetchPersonas();
          }}
        />
      )}

      {/* CSS Export Modal */}
      {exportingCssStyle && (
        <StylesheetCSSModal
          styleConfig={exportingCssStyle}
          onClose={() => setExportingCssStyle(null)}
        />
      )}
    </div>
  );
}

// ─── Presentation Deck & Live Simulator Tab ───────────────────────────────────

function PresentationDeckTab() {
  const { data: personaTypes } = useListPersonaTypes();
  const allPersonas = (personaTypes ?? []).flatMap(pt =>
    pt.personas.map(p => ({ ...p, typeName: pt.name, typeColor: pt.color }))
  );

  const [selectedPersonaSlug, setSelectedPersonaSlug] = useState<string>("ania");
  const [selectedStyleOverride, setSelectedStyleOverride] = useState<string>("dating");
  const [simMessages, setSimMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    { role: "bot", text: "Hej! Miło Cię poznać 😊 O czym chciałbyś dzisiaj porozmawiać?" },
    { role: "user", text: "Cześć! Chcę sprawdzić jak działa ten system zbierania leadów." },
    { role: "bot", text: "Świetnie trafiłeś! Zbieram wymagania w naturalnej rozmowie bez nudnych formularzy. Jaka to branża?" },
  ]);
  const [simInput, setSimInput] = useState("");
  const [isSimTyping, setIsSimTyping] = useState(false);

  const activePersona = allPersonas.find(p => p.slug === selectedPersonaSlug) || allPersonas[0];
  const theme = getStyleConfig(selectedStyleOverride);

  const handleSimSend = () => {
    if (!simInput.trim()) return;
    const txt = simInput.trim();
    setSimInput("");
    setSimMessages(prev => [...prev, { role: "user", text: txt }]);
    setIsSimTyping(true);

    setTimeout(() => {
      setIsSimTyping(false);
      setSimMessages(prev => [
        ...prev,
        {
          role: "bot",
          text: `Dzięki za odpowiedź! W stylu "${theme.name}" zapisuję te informacje i natychmiast kwalifikuję leada do systemu.`,
        },
      ]);
    }, 900);
  };

  const userBg = typeof theme.userBubble === "string" ? theme.userBubble : theme.userBubble.gradient;

  return (
    <div className="space-y-8">
      {/* Presentation Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-2xl border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs py-0.5 px-3">
            <Zap className="w-3 h-3 mr-1 fill-emerald-400" />
            Tryb Prezentacyjny dla Klientów & Inwestorów
          </Badge>
          <span className="text-slate-400 text-xs">• Zero-Hallucination AI Guardrails</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          LeadCatcher AI Engine — Inteligentny Ekosystem Konwersji
        </h1>
        <p className="text-slate-300 text-base mt-2 max-w-3xl leading-relaxed">
          Połączenie <strong>zaawansowanych person behawioralnych</strong> z <strong>autentycznymi stylami komunikatorów</strong>.
          Klient rozmawia naturalnie jak na WhatsAppie, Messengerze czy Instagramie, a system w tle ekstraktuje dane
          kontaktowe, budżet i intencję zakupową.
        </p>

        {/* Executive Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <p className="text-2xl font-black text-cyan-400">98.6%</p>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Wskaźnik Kwalifikacji AI</p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <p className="text-2xl font-black text-indigo-400">12 Stylów</p>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Autentyczne UI Komunikatorów</p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <p className="text-2xl font-black text-emerald-400">&lt; 300ms</p>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Czas Odpowiedzi LLM</p>
          </div>
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <p className="text-2xl font-black text-amber-400">100% E2E</p>
            <p className="text-xs text-slate-300 font-medium mt-0.5">Automatyczny Eksport CRM</p>
          </div>
        </div>
      </div>

      {/* Live Interactive Side-by-Side Presentation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls & Persona Showcase */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl shadow-md border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                Symulator Prezentacji na Żywo
              </CardTitle>
              <CardDescription>
                Wybierz postać i dynamicznie przełączaj styl czatu, aby zaprezentować klientowi elastyczność systemu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Persona selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  1. Wybierz Postać (Persona)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {allPersonas.slice(0, 6).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPersonaSlug(p.slug || "ania");
                        if (p.style) setSelectedStyleOverride(p.style);
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                        selectedPersonaSlug === p.slug
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={p.photoUrl || consultantPlaceholder} className="object-cover" />
                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.typeName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  2. Wybierz Styl Interfejsu (Stylesheet)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CHAT_STYLES_LIST.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStyleOverride(st.id)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        selectedStyleOverride === st.id
                          ? "text-white border-transparent shadow-md ring-2 ring-offset-1 ring-primary"
                          : "border-border text-foreground hover:bg-muted"
                      }`}
                      style={selectedStyleOverride === st.id ? { backgroundColor: st.color } : {}}
                    >
                      {st.badgeLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Link */}
              {activePersona?.slug && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-foreground">Bezpośredni link do czatu:</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        /chat/{activePersona.slug}
                      </p>
                    </div>
                    <Link href={`/chat/${activePersona.slug}`} target="_blank">
                      <Button size="sm" className="h-8 text-xs gap-1 font-semibold">
                        <Play className="w-3 h-3" />
                        Otwórz Fullscreen
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Phone Mockup Container */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md bg-slate-950 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800">
            {/* Phone Screen */}
            <div
              className="w-full h-[580px] rounded-[32px] overflow-hidden flex flex-col relative"
              style={{ backgroundColor: theme.bg }}
            >
              {/* Top Accent Stripe */}
              {theme.topStripe && <div className="h-1 w-full shrink-0" style={{ background: theme.topStripe }} />}

              {/* Chat Header */}
              <div
                className="px-4 py-3 flex items-center justify-between shadow-xs shrink-0"
                style={{
                  backgroundColor: theme.headerBg,
                  borderBottom: theme.headerBorder,
                  color: theme.headerText,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Avatar className="w-9 h-9 border shadow-xs">
                      <AvatarImage
                        src={activePersona?.photoUrl || consultantPlaceholder}
                        className="object-cover"
                      />
                      <AvatarFallback>{activePersona?.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: theme.onlineColor }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: theme.headerText }}>
                      {activePersona?.name || "Asystent"}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: theme.onlineText }}>
                      {theme.name} • Aktywny(a) teraz
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" style={{ color: theme.headerText }}>
                  {theme.showLockBadge && <Lock className="w-3.5 h-3.5 opacity-80" />}
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: theme.color }}
                  >
                    {theme.badgeLabel}
                  </span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5">
                {theme.showLockBadge && (
                  <div className="flex justify-center my-1">
                    <span
                      className="text-[10px] px-3 py-1 rounded-full shadow-2xs flex items-center gap-1"
                      style={{
                        backgroundColor: theme.isDark ? "#1e293b" : "#ffeecd",
                        color: theme.isDark ? "#94a3b8" : "#54656f",
                      }}
                    >
                      <Lock className="w-2.5 h-2.5" />
                      {theme.lockBadgeText || "Wiadomości są szyfrowane metodą end-to-end"}
                    </span>
                  </div>
                )}

                {simMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-1.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "bot" && (
                      <Avatar className="w-6 h-6 shrink-0 shadow-xs">
                        <AvatarImage
                          src={activePersona?.photoUrl || consultantPlaceholder}
                          className="object-cover"
                        />
                        <AvatarFallback>{activePersona?.name?.charAt(0) || "A"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className="px-3.5 py-2 text-xs leading-relaxed shadow-xs max-w-[80%] rounded-2xl"
                      style={
                        m.role === "user"
                          ? {
                              background: userBg,
                              color: theme.userText,
                              borderRadius:
                                theme.id === "whatsapp"
                                  ? "10px 10px 0px 10px"
                                  : "16px 16px 4px 16px",
                            }
                          : {
                              backgroundColor: theme.botBubble,
                              border: theme.botBorder,
                              color: theme.botText,
                              borderRadius:
                                theme.id === "whatsapp"
                                  ? "10px 10px 10px 0px"
                                  : "16px 16px 16px 4px",
                            }
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {isSimTyping && (
                  <div className="flex items-center gap-1 p-2 rounded-xl w-14" style={{ backgroundColor: theme.botBubble }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: theme.typingDot }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: theme.typingDot }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: theme.typingDot }} />
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div
                className="p-2.5 shrink-0 flex items-center gap-2"
                style={{
                  backgroundColor: theme.headerBg,
                  borderTop: theme.headerBorder,
                }}
              >
                <input
                  value={simInput}
                  onChange={e => setSimInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSimSend();
                  }}
                  placeholder={`Napisz w stylu ${theme.name}...`}
                  className="flex-1 text-xs px-3.5 py-2 rounded-full outline-none border transition-all"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.inputTextColor,
                  }}
                />
                <button
                  type="button"
                  onClick={handleSimSend}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ background: userBg }}
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────

function LeadsTab() {
  const { data: leads, isLoading, refetch } = useListAdminLeads();
  const deleteLead = useDeleteAdminLead();
  const summarizeLead = useSummarizeLead();
  const { toast } = useToast();

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const { data: singleLead, isLoading: loadingSingle } = useGetAdminLead(selectedLeadId || 0, {
    query: { enabled: !!selectedLeadId },
  });

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Czy na pewno usunąć ten lead?")) return;
    try {
      await deleteLead.mutateAsync({ id });
      toast({ title: "Lead usunięty" });
      refetch();
    } catch {
      toast({ title: "Błąd usuwania", variant: "destructive" });
    }
  };

  const handleSummarize = async (id: number) => {
    try {
      await summarizeLead.mutateAsync({ id });
      toast({ title: "Podsumowanie AI wygenerowane" });
      refetch();
    } catch {
      toast({ title: "Błąd generowania podsumowania", variant: "destructive" });
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Zebrane Leady & Rozmowy</h2>
          <p className="text-sm text-muted-foreground">
            Wszystkie konwersacje przeprowadzone przez persony wraz z automatyczną analizą intencji.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Odśwież
        </Button>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold">Brak zarejestrowanych leadów</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Gdy odwiedzający rozpoczną rozmowę z personą, ich dane pojawią się w tym miejscu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map(l => (
            <Card
              key={l.id}
              className="cursor-pointer hover:border-primary/50 transition-all shadow-sm hover:shadow-md rounded-2xl overflow-hidden"
              onClick={() => setSelectedLeadId(l.id)}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {l.contactInfo?.name || `Sesja #${l.id}`}
                    </span>
                    {l.completed && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] py-0">
                        Zakończony
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(l.createdAt), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive h-7 px-2 hover:bg-destructive/10"
                  onClick={e => handleDelete(l.id, e)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-2.5">
                {l.summary ? (
                  <p className="text-xs text-foreground/90 bg-muted/50 p-2.5 rounded-xl line-clamp-3 leading-relaxed border">
                    {l.summary}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Brak podsumowania AI.</p>
                )}

                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {l.contactInfo?.email && (
                    <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200/50">
                      📧 {l.contactInfo.email}
                    </span>
                  )}
                  {l.contactInfo?.phone && (
                    <span className="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-200/50">
                      📱 {l.contactInfo.phone}
                    </span>
                  )}
                  {l.contactInfo?.company && (
                    <span className="bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200/50">
                      🏢 {l.contactInfo.company}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lead details modal / sheet */}
      {selectedLeadId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex items-center justify-between shrink-0 bg-muted/20">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Szczegóły rozmowy z leadem #{selectedLeadId}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {singleLead?.createdAt && format(new Date(singleLead.createdAt), "dd MMMM yyyy, HH:mm")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedLeadId(null)}>
                Zamknij
              </Button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {loadingSingle ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {singleLead?.summary && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Analiza AI Leada:
                      </p>
                      <p className="text-xs leading-relaxed text-foreground">{singleLead.summary}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Zapis dialogu:
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {singleLead?.messages?.map((m: any, i: number) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs leading-relaxed ${
                            m.role === "user"
                              ? "bg-primary text-primary-foreground ml-8"
                              : "bg-muted text-foreground mr-8 border"
                          }`}
                        >
                          <span className="font-bold block text-[10px] opacity-75 mb-0.5">
                            {m.role === "user" ? "Klient" : "Persona"}:
                          </span>
                          {m.content}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Analytics & Conversation Intelligence Tab ───────────────────────────────

function AnalyticsIntelligenceTab() {
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const { data: singleLead, isLoading: loadingSingle } = useGetAdminLead(selectedConvId || 0, {
    query: { enabled: !!selectedConvId },
  });
  const { toast } = useToast();

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics/overview");
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/admin/analytics/ai-report", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data.report);
        toast({ title: "Analiza AI wygenerowana", description: "Przygotowano raport intencji i zachowań użytkowników." });
      }
    } catch {
      toast({ title: "Błąd analizy AI", variant: "destructive" });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const intentCounts = overview?.intentCounts || { pricing: 0, timeline: 0, technical: 0, appointment: 0, general: 0 };
  const totalIntentQueries = Object.values(intentCounts).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="space-y-6">
      
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Analityka Treści & Inteligencja Rozmów
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analiza wszystkiego, co wpisują użytkownicy: intencje, zapytania o cenę, bariery oraz pozyskane kontakty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            className="text-xs font-semibold gap-1.5 border-slate-800 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Odśwież
          </Button>

          <Button
            size="sm"
            onClick={handleGenerateAiReport}
            disabled={isGeneratingAi}
            className="text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            Generuj Raport AI
          </Button>
        </div>
      </div>

      {/* KPI Cards (Flat Minimalist Design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Przeanalizowane wiadomości</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{overview?.totalUserMessages || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">od potencjalnych klientów</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Wyłowione numery & e-maile</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{overview?.capturedContactsCount || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">gotowe do kontaktu</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Pytania o cennik & koszty</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{intentCounts.pricing || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">główny czynnik decyzyjny</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Zgłoszenia na pomiar/spotkanie</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{intentCounts.appointment || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">wysoka gotowość zakupu</p>
        </div>
      </div>

      {/* AI Deep Analysis Report Box if generated */}
      {aiReport && (
        <div className="p-5 rounded-xl bg-slate-900/90 border border-blue-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">Synteza AI: Co piszą użytkownicy & Jak zoptymalizować konwersję</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Live AI Analysis
            </span>
          </div>
          <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed border-t border-slate-800 pt-3">
            {aiReport}
          </div>
        </div>
      )}

      {/* Grid: Intent Breakdown & Harvested Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Intencje i pytania klientów */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Kategorie Zapytań Klientów</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {totalIntentQueries} analiz
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: "Wycena, cena, budżet i koszty", count: intentCounts.pricing, color: "bg-amber-500" },
              { label: "Termin realizacji i dostępność", count: intentCounts.timeline, color: "bg-blue-500" },
              { label: "Wymagania techniczne i zakres", count: intentCounts.technical, color: "bg-purple-500" },
              { label: "Umówienie pomiaru / kontakt bezpośredni", count: intentCounts.appointment, color: "bg-emerald-500" },
              { label: "Pytania ogólne i doradztwo wstępne", count: intentCounts.general, color: "bg-slate-500" },
            ].map((item, idx) => {
              const pct = totalIntentQueries > 0 ? Math.round((item.count / totalIntentQueries) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="text-slate-400 font-mono">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.max(pct, 4)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Keywords */}
          {overview?.topKeywords && overview.topKeywords.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">Najczęstsze słowa i frazy:</p>
              <div className="flex flex-wrap gap-1.5">
                {overview.topKeywords.map((k: any, i: number) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
                    {k.keyword} ({k.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wyłowione dane kontaktowe (Telefony / E-maile) */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Zarejestrowane Dane Kontaktowe</h3>
            <span className="text-[11px] text-emerald-400 font-semibold">
              {overview?.capturedContacts?.length || 0} kontaktów
            </span>
          </div>

          {(!overview?.capturedContacts || overview.capturedContacts.length === 0) ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              Brak bezpośrednio podanych numerów telefonów w treści. Przeprowadź test w symulatorze.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {overview.capturedContacts.map((c: any, i: number) => (
                <div
                  key={i}
                  onClick={() => setSelectedConvId(c.conversationId)}
                  className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono border border-blue-500/20">
                      {c.type === "phone" ? "📱 TEL" : "📧 EMAIL"}
                    </span>
                    <span className="text-xs font-bold text-slate-100">{c.value}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Rozmowa #{c.conversationId}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Transcript Modal */}
      {selectedConvId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  Podgląd rozmowy #{selectedConvId}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {singleLead?.createdAt && format(new Date(singleLead.createdAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedConvId(null)} className="text-slate-400 hover:text-white">
                Zamknij
              </Button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {loadingSingle ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {singleLead?.summary && (
                    <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200">
                      <span className="font-bold block mb-1">Podsumowanie leada:</span>
                      {singleLead.summary}
                    </div>
                  )}

                  <div className="space-y-2">
                    {singleLead?.messages?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          m.role === "user"
                            ? "bg-blue-600 text-white ml-8"
                            : "bg-slate-800 text-slate-200 mr-8 border border-slate-700/60"
                        }`}
                      >
                        <span className="font-bold block text-[10px] opacity-75 mb-0.5">
                          {m.role === "user" ? "Klient" : "Doradca"}:
                        </span>
                        {m.content}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modes & Testing Config Tab ───────────────────────────────────────────────

function ModesAndTestingTab() {
  const [salesEnabled, setSalesEnabled] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<string>("disabled");
  const [timerHours, setTimerHours] = useState<number>(24);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setSalesEnabled(data.salesEnabled === true);
          setTimerMode(data.timerMode || "disabled");
          setTimerHours(data.timerHours || 24);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesEnabled,
          timerMode,
          timerHours,
        }),
      });
      if (res.ok) {
        toast({
          title: "Ustawienia trybu testowego zapisane",
          description: salesEnabled
            ? "Sprzedaż jest aktywna (widoczne cenniki)."
            : "Włączono czysty Tryb Testowo-Wdrożeniowy (sprzedaż wyłączona).",
        });
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: "Błąd zapisu ustawień", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          Tryb Testowy & Zarządzanie Sprzedażą
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Kontroluj dostępność modułów komercyjnych oraz czas trwania sesji testowej dla klientów.
        </p>
      </div>

      {/* 1. Status Sprzedaży */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Tryb Działania Aplikacji</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Wybierz, czy aplikacja działa w trybie bezpłatnego testowania/prezentacji dla klientów, czy w trybie komercyjnym z cennikami.
            </p>
          </div>

          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            !salesEnabled
              ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
              : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
          }`}>
            {!salesEnabled ? "Tryb Testowy (Aktywny)" : "Tryb Sprzedażowy"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setSalesEnabled(false)}
            className={`p-4 rounded-xl border text-left transition-all ${
              !salesEnabled
                ? "bg-blue-950/40 border-blue-500 text-slate-100"
                : "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-100">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Wyłącz sprzedaż (Wersja Testowa)
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Ukrywa wszelkie elementy płatności, cenniki i zamówienia. Użytkownicy testują doradców bez barier komercyjnych.
            </p>
          </button>

          <button
            onClick={() => setSalesEnabled(true)}
            className={`p-4 rounded-xl border text-left transition-all ${
              salesEnabled
                ? "bg-emerald-950/40 border-emerald-500 text-slate-100"
                : "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Włącz sprzedaż (SaaS / Cennik)
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Wyświetla oferty abonamentu (149 zł/mc), pakiety wdrożeniowe i proces zakupu.
            </p>
          </button>
        </div>
      </div>

      {/* 2. Limit Czasu Sesji Testowej */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Limit Czasu Sesji Testowej</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Domyślnie na czas testów możesz całkowicie wyłączyć limit 24h lub ustawić dokładny czas w godzinach.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            onClick={() => setTimerMode("disabled")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              timerMode === "disabled"
                ? "bg-blue-950/40 border-blue-500 text-slate-100"
                : "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Wyłącz 24h (Bez limitu)
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Brak odliczania czasu, testowanie bez presji.
            </p>
          </button>

          <button
            onClick={() => setTimerMode("24h")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              timerMode === "24h"
                ? "bg-blue-950/40 border-blue-500 text-slate-100"
                : "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              24 godziny (Standard)
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Sandbox wygasa po 24 godzinach.
            </p>
          </button>

          <button
            onClick={() => setTimerMode("custom")}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              timerMode === "custom"
                ? "bg-blue-950/40 border-blue-500 text-slate-100"
                : "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Własny czas
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Ustaw dokładną liczbę godzin.
            </p>
          </button>
        </div>

        {timerMode === "custom" && (
          <div className="pt-2 flex items-center gap-3">
            <label className="text-xs text-slate-300 font-medium">Czas sesji w godzinach:</label>
            <Input
              type="number"
              min={1}
              max={720}
              value={timerHours}
              onChange={e => setTimerHours(parseInt(e.target.value, 10) || 24)}
              className="w-28 h-9 text-xs font-mono bg-slate-800 border-slate-700"
            />
            <span className="text-xs text-slate-400">godzin ({Math.round(timerHours / 24 * 10) / 10} dni)</span>
          </div>
        )}
      </div>

      {/* 3. Wyjaśnienie Trwałości Danych */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Zasada działania danych w wersji testowej:
        </p>
        <p className="leading-relaxed">
          • <strong>Dla odwiedzających:</strong> Sesja działa lokalnie w przeglądarce i nie tworzy trwałego konta (nie zaśmieca profilu użytkownika).
        </p>
        <p className="leading-relaxed">
          • <strong>Dla Ciebie (Administrator):</strong> Wszystkie wpisane pytania, obiekcje i numery telefonów są natychmiast rejestrowane w bazie danych CRM i dostępne w zakładce <em>„Analiza Treści & AI”</em> do pełnej analityki.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 h-10 gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Zapisz konfigurację
        </Button>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { data: settings, isLoading, refetch } = useGetAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const { toast } = useToast();

  const [notificationEmail, setNotificationEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setNotificationEmail(settings.notificationEmail || "");
      setWebhookUrl(settings.webhookUrl || "");
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings.mutateAsync({
        data: {
          notificationEmail,
          webhookUrl,
        },
      });
      toast({ title: "Ustawienia zapisane" });
      refetch();
    } catch {
      toast({ title: "Błąd zapisu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Integracje CRM & Webhooki</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Automatyczny transfer danych do systemów zewnętrznych (Make, Zapier, HubSpot).
        </p>
      </div>

      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Adres e-mail na powiadomienia o leadach</label>
          <Input
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
            placeholder="np. kontakt@twojafirma.pl"
            className="bg-slate-800 border-slate-700 text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">Webhook URL (Make / Zapier / CRM)</label>
          <Input
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://hook.eu1.make.com/..."
            className="bg-slate-800 border-slate-700 text-xs font-mono"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs gap-2">
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Zapisz powiadomienia
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Panel Component ────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const { data: personaTypes } = useListPersonaTypes();
  const { data: leads } = useListAdminLeads();

  const totalPersonas = (personaTypes ?? []).reduce((acc, pt) => acc + pt.personas.length, 0);
  const totalLeads = leads?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ─── Top Navigation Bar (Flat Minimalist SaaS) ────────────────────── */}
      <header className="border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">AURA<span className="text-cyan-400">.SUITE</span></span>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  ADMIN INTELLIGENCE
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-1.5 border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Avatar Studio</span>
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={() => setActiveTab("presentation")}
              className={`h-8 text-xs font-semibold gap-1.5 transition-all ${
                activeTab === "presentation"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prezentacja</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Tabs & Workspace ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-6 h-11 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <TabsTrigger
              value="analytics"
              className="rounded-lg font-semibold text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analiza Treści</span>
            </TabsTrigger>

            <TabsTrigger
              value="leads"
              className="rounded-lg font-semibold text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Leady ({totalLeads})</span>
            </TabsTrigger>

            <TabsTrigger
              value="testing-mode"
              className="rounded-lg font-semibold text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tryby & Czas</span>
            </TabsTrigger>

            <TabsTrigger
              value="personas"
              className="rounded-lg font-semibold text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Persony ({totalPersonas})</span>
            </TabsTrigger>

            <TabsTrigger
              value="stylesheet"
              className="rounded-lg font-semibold text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Style (12)</span>
            </TabsTrigger>

            <TabsTrigger
              value="settings"
              className="rounded-lg font-semibold text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Integracje</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="outline-none">
            <AnalyticsIntelligenceTab />
          </TabsContent>

          <TabsContent value="leads" className="outline-none">
            <LeadsTab />
          </TabsContent>

          <TabsContent value="testing-mode" className="outline-none">
            <ModesAndTestingTab />
          </TabsContent>

          <TabsContent value="personas" className="outline-none">
            <PersonasTab onAssignStyleClick={() => setActiveTab("stylesheet")} />
          </TabsContent>

          <TabsContent value="stylesheet" className="outline-none">
            <StylesheetStudioTab />
          </TabsContent>

          <TabsContent value="presentation" className="outline-none">
            <PresentationDeckTab />
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

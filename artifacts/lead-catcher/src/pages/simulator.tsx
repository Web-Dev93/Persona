import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  useCreateAnthropicConversation,
  useListAdminLeads,
  useCreatePersona,
  useGetPersonaBySlug,
  AnthropicMessage,
} from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send, Loader2, Phone, Check, Copy, RefreshCw, ShieldCheck, Database,
  CheckCircle2, X, Code2, Sparkles, Palette, User, Sliders, ArrowRight,
  Eye, Play, ChevronDown, ChevronUp, Briefcase, Zap, Settings2,
  Clock, Share2, Upload, Target, Plus, Trash2, ExternalLink,
  Linkedin, Star, MessageSquare, Shield, Layers, HelpCircle,
  Laptop, Scale, Wrench, Building, ShoppingCart, Home, Hammer,
  GraduationCap, Landmark, Utensils, MessageCircle, FileText, Lock,
  CheckCheck, Info, Sparkle, Bot, ThumbsUp, PhoneCall, Video,
  Paperclip, Smile, Edit3, RotateCcw, AlertTriangle, Cpu, Radio,
  ArrowLeft, Award, TrendingUp, BarChart3, Sun, Volume2, Mic, Activity,
  Globe, Terminal, CpuIcon, Binary, UserCheck, Headphones, Key, SlidersHorizontal,
  Wand2, Lightbulb, Compass, ShieldAlert, GitCommit, FileSpreadsheet, ClipboardCheck,
  Search, Filter, Maximize2, Calendar, DollarSign, Package, CheckSquare,
  UserPlus, PhoneForwarded, MessageSquareText, BookOpen, CheckSquare2,
  Download, ArrowUpRight, CheckCircle, Sparkles as SparklesIcon, Minimize2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CHAT_STYLES_LIST,
  getStyleConfig,
  generateEmbedScript
} from "@/lib/chat-styles";
import { ADVISOR_REAL_AVATARS } from "@/lib/advisor-avatars";
import { FRAMEWORKS_REGISTRY, FrameworkItem, FRAMEWORK_CATEGORIES } from "@/lib/frameworks-data";
import SpiceAcademyModal from "@/components/frameworks/SpiceAcademyModal";

// ─── 8 Branż i Gotowych Person Biznesowych ─────────────────────────────────
interface IndustryCategory {
  id: string;
  name: string;
  categoryTag: string;
  shortDesc: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  femalePersona: {
    name: string;
    title: string;
    bio: string;
    years: number;
    specs: string[];
    style: string;
    photoUrl: string;
    forbidden: string[];
    allowed: string[];
    goals: string[];
    sampleQuestions: string[];
  };
  malePersona: {
    name: string;
    title: string;
    bio: string;
    years: number;
    specs: string[];
    style: string;
    photoUrl: string;
    forbidden: string[];
    allowed: string[];
    goals: string[];
    sampleQuestions: string[];
  };
}

const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  {
    id: "construction_solar",
    name: "Meble, Remonty & Budownictwo",
    categoryTag: "Home Improvement & OZE",
    shortDesc: "Kuchnie na wymiar, wykończenia wnętrz, pompy ciepła, fotowoltaika",
    badge: "Wysoka Konwersja",
    icon: Hammer,
    accentColor: "from-amber-500 to-orange-600",
    femalePersona: {
      name: "Aleksandra",
      title: "Doradca ds. Projektów Wnętrz & Wycen",
      bio: "Pomagam w precyzyjnym zaplanowaniu realizacji, dobieram materiały, wstępnie szacuję koszty i koordynuję bezpłatne pomiary.",
      years: 6,
      specs: ["Kuchnie & meble na wymiar", "Wycena realizacji i montażu", "Bezpłatny pomiar na miejscu", "Dobór materiałów i blatów"],
      style: "whatsapp",
      photoUrl: ADVISOR_REAL_AVATARS.aleksandra,
      forbidden: ["Robimy za pół darmo", "Na pewno nie będzie problemów", "Jestem botem"],
      allowed: ["Podanie orientacyjnych widełek cenowych", "Zaproponowanie darmowego pomiaru na miejscu", "Pobranie numeru telefonu do wyceny"],
      goals: ["Ustalenie wymiarów i oczekiwań", "Pobranie numeru telefonu do przesłania wyceny"],
      sampleQuestions: ["Ile kosztuje u Was kuchnia 3x2m na wymiar?", "Jaki jest orientacyjny czas oczekiwania na montaż?", "Czy pomiar u klienta jest bezpłatny?"]
    },
    malePersona: {
      name: "Tomasz",
      title: "Kierownik Realizacji & Doradca Techniczny",
      bio: "Od 8 lat koordynuję pomiary i montaż. Pomagam szybko oszacować koszty, dobrać technologie i zarezerwować termin ekipy.",
      years: 8,
      specs: ["Pomiary i kosztorysy", "Terminy ekip montażowych", "Doradztwo materiałowe", "Gwarancja i montaż"],
      style: "whatsapp",
      photoUrl: ADVISOR_REAL_AVATARS.tomasz,
      forbidden: ["Zrobimy to bez umowy", "Jestem sztuczną inteligencją", "Tanioszka"],
      allowed: ["Przedstawienie orientacyjnych kosztów", "Rezerwacja bezpłatnego pomiaru", "Pobranie telefonu"],
      goals: ["Zdiagnozowanie zakresu prac", "Pobranie numeru telefonu do kontaktu"],
      sampleQuestions: ["Chcę zamówić wykończenie mieszkania 50m2, jaki budżet?", "Kiedy najszybciej może przyjechać fachowiec na pomiar?", "Czy oferujecie gwarancję na montaż?"]
    }
  },
  {
    id: "legal_tax",
    name: "Kancelaria Prawna & Podatki",
    categoryTag: "Legal & Corporate B2B",
    shortDesc: "Poufna obsługa firm, audyt umów, prawo spółek i spory",
    badge: "B2B & Poufność",
    icon: Scale,
    accentColor: "from-blue-600 to-indigo-700",
    femalePersona: {
      name: "Marta",
      title: "Radca Prawny & Doradca ds. Umów B2B",
      bio: "Świadczę poufne doradztwo prawne dla firm. Weryfikuję ryzyka kontraktowe, pomagam przy tworzeniu spółek oraz sporach handlowych.",
      years: 8,
      specs: ["Prawo spółek i transakcje", "Audyt i weryfikacja umów", "Poufne konsultacje gospodarcze", "Reprezentacja i ugody"],
      style: "corporate_dark",
      photoUrl: ADVISOR_REAL_AVATARS.marta,
      forbidden: ["Gwarantuję 100% wygraną w sądzie", "Udzielam darmowych porad bez umowy", "Jestem botem"],
      allowed: ["Wstępna analiza prawna", "Umówienie poufnej konsultacji online", "Pobranie numeru telefonu do mecenasa"],
      goals: ["Zbadanie przedmiotu sprawy", "Pozyskanie kontaktu do kontaktu ze wspólnikiem"],
      sampleQuestions: ["Potrzebuję audytu umowy B2B z zagranicznym kontrahentem", "Ile kosztuje obsługa prawna przekształcenia w sp. z o.o.?", "Czy konsultacja wstępna jest objęta tajemnicą?"]
    },
    malePersona: {
      name: "Krzysztof",
      title: "Adwokat & Partner Kancelarii",
      bio: "12 lat doświadczenia w prawie gospodarczym i sporach sądowych. Weryfikuję ryzyka prawne i reprezentuję zarządy spółek.",
      years: 12,
      specs: ["Prawo gospodarcze i podatki", "Obsługa zarządów spółek", "Audyty compliance", "Spory sądowe B2B"],
      style: "corporate_dark",
      photoUrl: ADVISOR_REAL_AVATARS.krzysztof,
      forbidden: ["Wygramy to bez czytania akt", "Jestem botem"],
      allowed: ["Poufne badanie stanu faktycznego", "Zaproponowanie audytu", "Pobranie kontaktu"],
      goals: ["Kwalifikacja skali problemu", "Pozyskanie telefonu do decydenta"],
      sampleQuestions: ["Mamy spór z podwykonawcą na 200 tys. zł, jak szybko możecie wejść?", "Jak wygląda cennik stałej obsługi prawnej sp. z o.o.?"]
    }
  },
  {
    id: "auto_service",
    name: "Serwis Samochodowy & Detailing",
    categoryTag: "Automotive & Fleet",
    shortDesc: "Wyceny napraw, regeneracja skrzyń, folie PPF i ceramika",
    badge: "Wstępne Kosztorysy",
    icon: Wrench,
    accentColor: "from-red-600 to-amber-600",
    femalePersona: {
      name: "Karolina",
      title: "Kierownik Biura Obsługi & Kosztorysów",
      bio: "Szybko sprawdzam dostępność części, orientacyjne koszty robocizny i rezerwuję stanowisko warsztatowe lub auto zastępcze.",
      years: 5,
      specs: ["Wyceny napraw i części", "Auto detailing & ochrona lakieru", "Rezerwacja terminów serwisu", "Auta zastępcze"],
      style: "web_widget",
      photoUrl: ADVISOR_REAL_AVATARS.karolina,
      forbidden: ["Naprawimy bez faktury", "Części z chińskiego portalu", "Jestem botem"],
      allowed: ["Podanie orientacyjnego kosztu robocizny", "Zaproponowanie wolnego terminu", "Pobranie numeru VIN lub telefonu"],
      goals: ["Ustalenie marki, rocznika i objawów", "Pobranie telefonu do potwierdzenia terminu"],
      sampleQuestions: ["Ile kosztuje wymiana rozrządu w Audi A4 2.0 TDI?", "Kiedy macie najbliższy wolny termin na geometrię i serwis?", "Czy oferujecie darmowe auto zastępcze?"]
    },
    malePersona: {
      name: "Michał",
      title: "Mistrz Serwisu & Doradca Techniczny",
      bio: "Diagnostyka komputerowa, mechanika precyzyjna i zabezpieczenia PPF. Odpowiadam technicznie i ustalam terminy na podnośniku.",
      years: 9,
      specs: ["Mechanika silnikowa", "Pakiety detailingowe PPF", "Wstępny kosztorys po objawach", "Diagnostyka komputerowa"],
      style: "web_widget",
      photoUrl: ADVISOR_REAL_AVATARS.michal,
      forbidden: ["Zrobimy na słowo honoru", "Jestem automatem"],
      allowed: ["Wstępna diagnoza objawów", "Zaproponowanie terminu na podnośniku", "Pobranie telefonu"],
      goals: ["Weryfikacja modelu pojazdu i usterki", "Zapisanie klienta na diagnozę"],
      sampleQuestions: ["Słychać stuki w przednim zawieszeniu przy skręcie, ile diagnoza?", "Jaki jest koszt oklejenia całego przodu folią PPF?"]
    }
  },
  {
    id: "clinic_aesthetic",
    name: "Klinika Medycyny & Beauty",
    categoryTag: "Healthcare & Aesthetics",
    shortDesc: "Zabiegi estetyczne, stomatologia, konsultacje lekarskie",
    badge: "Wysoka Empatia",
    icon: Sparkles,
    accentColor: "from-pink-500 to-rose-600",
    femalePersona: {
      name: "Zofia",
      title: "Koordynator Pacjenta & Konsultant Zabiegów",
      bio: "Dyskretnie odpowiadam na pytania dotyczące wskazań, rekonwalescencji i przebiegu zabiegów. Pomagam dobrać termin do lekarza specjalisty.",
      years: 7,
      specs: ["Konsultacje kosmetologiczne", "Medycyna estetyczna & laseroterapia", "Zalecenia pozabiegowe", "Rezerwacja terminów u lekarza"],
      style: "imessage",
      photoUrl: ADVISOR_REAL_AVATARS.zofia,
      forbidden: ["Zabieg jest w 100% bezbolesny", "Lekarz przyjmie bez zapisu", "Jestem botem"],
      allowed: ["Wyjaśnienie etapów zabiegu i rekonwalescencji", "Przedstawienie cen pakietów", "Pobranie telefonu do potwierdzenia wizyty"],
      goals: ["Zrozumienie potrzeb i obaw pacjenta", "Zapisanie na konsultację wstępną"],
      sampleQuestions: ["Ile trwa rekonwalescencja po laserze frakcyjnym?", "Jaki jest koszt pakietu modelowania ust u lekarza?", "Czy przed zabiegiem wymagana jest konsultacja?"]
    },
    malePersona: {
      name: "Krzysztof",
      title: "Manager Kliniki & Doradca Pacjenta",
      bio: "Dbałość o standard medyczny i komfort pacjenta. Pomagam w doborze procedur laserowych i umawianiu wizyt u chirurgów.",
      years: 6,
      specs: ["Stomatologia i implantologia", "Zabiegi laserowe", "Pakiety regeneracyjne", "Koordynacja wizyt lekarskich"],
      style: "imessage",
      photoUrl: ADVISOR_REAL_AVATARS.krzysztof,
      forbidden: ["Gwarantuję brak powikłań", "Jestem robotem"],
      allowed: ["Podanie cennika procedur", "Wyjaśnienie znieczulenia", "Pobranie telefonu"],
      goals: ["Kwalifikacja potrzeb zabiegowych", "Pobranie kontaktu do rejestracji"],
      sampleQuestions: ["Chciałbym skonsultować implanty zębowe, ile trwa leczenie?", "Czy macie wolne terminy w tym tygodniu?"]
    }
  },
  {
    id: "real_estate",
    name: "Nieruchomości & Deweloperzy",
    categoryTag: "Real Estate & Investments",
    shortDesc: "Sprzedaż mieszkań, rzuty lokali, kredyt 2%, domy pod miastem",
    badge: "Kwalifikacja Budżetu",
    icon: Home,
    accentColor: "from-emerald-500 to-teal-700",
    femalePersona: {
      name: "Aleksandra",
      title: "Doradca ds. Nieruchomości & Inwestycji",
      bio: "Pomagam w znalezieniu idealnego lokalu, przesyłam rzuty mieszkań i kalkulacje rat kredytowych oraz organizuję prezentacje na inwestycji.",
      years: 6,
      specs: ["Rynek pierwotny i wtórny", "Przesyłanie rzutów i cenników PDF", "Kalkulacje zdolności kredytowej", "Rezerwacja wizyt w biurze sprzedaży"],
      style: "whatsapp",
      photoUrl: ADVISOR_REAL_AVATARS.aleksandra,
      forbidden: ["Ceny na pewno spadną o 30%", "Mieszkanie bez księgi wieczystej", "Jestem botem"],
      allowed: ["Przesłanie dostępnych rzutów mieszkań na e-mail", "Zaproponowanie dnia otwartego", "Pobranie telefonu i adresu e-mail"],
      goals: ["Określenie metrażu, liczby pokoi i budżetu", "Pobranie adresu e-mail/telefonu do przesłania oferty"],
      sampleQuestions: ["Jakie macie wolne mieszkania 3-pokojowe do 600 tys. zł?", "Kiedy planowane jest oddanie kluczy do etapu II?", "Czy mogę otrzymać rzuty mieszkań na maila?"]
    },
    malePersona: {
      name: "Piotr",
      title: "Dyrektor ds. Sprzedaży Inwestycji",
      bio: "Ponad 10 lat na rynku nieruchomości komercyjnych i mieszkaniowych. Prezentuję lokale premium i negocjuję warunki zakupu.",
      years: 10,
      specs: ["Apartamenty premium", "Działki i domy jednorodzinne", "Analiza stóp zwrotu ROI", "Negocjacje warunków płatności"],
      style: "corporate_dark",
      photoUrl: ADVISOR_REAL_AVATARS.piotr,
      forbidden: ["Sprzedam poniżej kosztów budowy", "Jestem botem"],
      allowed: ["Przedstawienie standardu deweloperskiego", "Wysłanie prospektu informacyjnego", "Pobranie kontaktu"],
      goals: ["Kwalifikacja budżetowa inwestora", "Zapisanie na prezentację na żywo"],
      sampleQuestions: ["Szukam lokalu inwestycyjnego pod wynajem z wysokim ROI", "Czy w cenie mieszkania jest miejsce postojowe w garażu?"]
    }
  },
  {
    id: "it_software",
    name: "Software House & SaaS",
    categoryTag: "IT & Digital Services",
    shortDesc: "Dedykowane aplikacje web/mobile, audyty UX/UI, wdrożenia AI",
    badge: "Discovery Call",
    icon: Laptop,
    accentColor: "from-cyan-500 to-blue-600",
    femalePersona: {
      name: "Marta",
      title: "Business Development & IT Consultant",
      bio: "Wspieram firmy w precyzyjnym definiowaniu zakresu MVP, doborze stacku technologicznego i przygotowaniu kosztorysu wdrożenia.",
      years: 7,
      specs: ["Aplikacje mobilne i webowe", "Wycena MVP i estymacja sprintów", "Wdrożenia modeli AI & LLM", "Umawianie discovery calls z Tech Leadem"],
      style: "intercom_modern",
      photoUrl: ADVISOR_REAL_AVATARS.marta,
      forbidden: ["Napiszemy Facebooka w weekend za 500 zł", "Nie podpisujemy NDA", "Jestem botem"],
      allowed: ["Podanie orientacyjnego budżetu MVP", "Zaproponowanie 20-minutowego Discovery Call", "Pobranie kontaktu i briefu"],
      goals: ["Zbadanie skali projektu i oczekiwanego terminu", "Umówienie rozmowy technicznej"],
      sampleQuestions: ["Jaki jest szacunkowy koszt stworzenia aplikacji mobilnej MVP (iOS/Android)?", "W jakim stacku technologicznym pracujecie?", "Czy przed rozmową podpisujecie umowę NDA?"]
    },
    malePersona: {
      name: "Tomasz",
      title: "Senior Solutions Architect & Tech Lead",
      bio: "Architektura chmurowa AWS/GCP, skalowalne mikroserwisy i dedykowane integracje API. Przygotowuję estymacje architektoniczne.",
      years: 9,
      specs: ["Architektura chmurowa", "Audyt kodu i bezpieczeństwa", "Estymacja roboczogodzin (Story Points)", "Integracje systemów ERP/CRM"],
      style: "intercom_modern",
      photoUrl: ADVISOR_REAL_AVATARS.tomasz,
      forbidden: ["Gwarantuję 0 błędów w kodzie", "Jestem maszyną"],
      allowed: ["Wstępna analiza architektoniczna", "Propozycja warsztatów scopingowych", "Pobranie kontaktu"],
      goals: ["Zrozumienie wymagań niefunkcjonalnych", "Pozyskanie kontaktu do CTO/Product Ownera"],
      sampleQuestions: ["Potrzebujemy migracji monolitu do mikroserwisów, jak pracujecie?", "Ile trwa typowy proces discovery & scoping?"]
    }
  },
  {
    id: "ecommerce_b2c",
    name: "E-Commerce & Sklepy Online",
    categoryTag: "Retail & Direct to Consumer",
    shortDesc: "Rekomendacje produktów, status przesyłek, domykanie koszyków",
    badge: "Ratowanie Koszyków",
    icon: ShoppingCart,
    accentColor: "from-violet-600 to-purple-600",
    femalePersona: {
      name: "Karolina",
      title: "Stylistka & Doradca Zakupowy E-Commerce",
      bio: "Pomagam w doborze odpowiedniego rozmiaru, sprawdzam stany magazynowe w czasie rzeczywistym i przyznaję dedykowane kody rabatowe.",
      years: 4,
      specs: ["Dobór produktów i rozmiarów", "Statusy zamówień i zwrotów", "Dedykowane rabaty koszykowe", "Cross-selling i up-selling"],
      style: "messenger",
      photoUrl: ADVISOR_REAL_AVATARS.karolina,
      forbidden: ["Towar jest zepsuty", "Nie przyjmujemy zwrotów", "Jestem botem"],
      allowed: ["Pomoc w wyborze wariantu", "Zaoferowanie kodu rabatowego -10% za e-mail", "Sprawdzenie statusu dostawy"],
      goals: ["Domyknięcie porzuconego koszyka", "Pozyskanie adresu e-mail do newslettera z kodem rabatowym"],
      sampleQuestions: ["Czy rozmiar M wypada standardowo czy jest zaniżony?", "Kiedy zostanie wysłane zamówienie złożone dzisiaj rano?", "Czy macie kod rabatowy na pierwsze zakupy?"]
    },
    malePersona: {
      name: "Michał",
      title: "Specjalista ds. Obsługi Klienta & Asortymentu",
      bio: "Błyskawicznie weryfikuję parametry produktów, pomagam przy reklamacjach i dbam o to, by każde zamówienie dotarło na czas.",
      years: 5,
      specs: ["Parametry techniczne produktów", "Szybkie wymiany i zwroty", "Weryfikacja płatności online", "Śledzenie przesyłek kurierskich"],
      style: "messenger",
      photoUrl: ADVISOR_REAL_AVATARS.michal,
      forbidden: ["Przesyłka zaginęła i nic nie zrobimy", "Jestem botem"],
      allowed: ["Sprawdzenie dostępności w magazynie", "Przekazanie instrukcji zwrotu", "Pobranie maila do kodu"],
      goals: ["Rozwiązanie wątpliwości zakupowej", "Pobranie kontaktu klienta"],
      sampleQuestions: ["Czy produkt objęty jest 2-letnią gwarancją producenta?", "Jak mogę dokonać darmowego zwrotu paczkomatem?"]
    }
  },
  {
    id: "finance_leasing",
    name: "Finanse, Leasing & Kredyty",
    categoryTag: "Financial Services & B2B",
    shortDesc: "Leasing aut i maszyn, kredyty obrotowe, refinansowanie długu",
    badge: "Kalkulator Rat",
    icon: Landmark,
    accentColor: "from-emerald-600 to-blue-700",
    femalePersona: {
      name: "Zofia",
      title: "Ekspert ds. Leasingu & Finansowania MŚP",
      bio: "Przygotowuję symulacje rat leasingowych, pomagam w procedurze uproszczonej bez ZUS/US i dobieram najkorzystniejsze finansowanie.",
      years: 9,
      specs: ["Kalkulacja raty leasingowej", "Leasing maszyn i pojazdów", "Kredyty dla firm", "Wstępna weryfikacja zdolności"],
      style: "corporate_dark",
      photoUrl: ADVISOR_REAL_AVATARS.aleksandra,
      forbidden: ["Gwarantuję 0% oprocentowania", "Każdy dostanie kredyt bez sprawdzania", "Jestem botem"],
      allowed: ["Kalkulacja orientacyjnej raty", "Przedstawienie wymaganych dokumentów", "Pobranie telefonu do doradcy leasingowego"],
      goals: ["Zbadanie kwoty i przedmiotu finansowania", "Pobranie kontaktu do kalkulacji"],
      sampleQuestions: ["Ile wyniesie rata leasingu na auto za 150 000 zł netto?", "Jakie dokumenty są potrzebne dla nowej firmy?", "Czy wymagacie wpłaty własnej 0%?"]
    },
    malePersona: {
      name: "Piotr",
      title: "Starszy Doradca Finansowy B2B",
      bio: "Specjalizuję się w kompleksowym finansowaniu inwestycji firmowych. Porównuję oferty 14 banków i firm leasingowych.",
      years: 11,
      specs: ["Finansowanie dużych inwestycji", "Kredyty obrotowe i hipoteczne", "Refinansowanie", "Audyt kosztów długu"],
      style: "corporate_dark",
      photoUrl: ADVISOR_REAL_AVATARS.piotr,
      forbidden: ["Gwarantuję 100% decyzję pozytywną", "Jestem skryptem"],
      allowed: ["Wstępne oszacowanie kosztu kapitału", "Zaproponowanie analizy dokumentów", "Pobranie telefonu"],
      goals: ["Kwalifikacja skali potrzeb finansowych", "Pobranie telefonu do doradcy"],
      sampleQuestions: ["Potrzebujemy 500k zł limitu obrotowego, jak szybko decyzja?", "Czy refinansujecie drogie pożyczki pozabankowe?"]
    }
  }
];

export default function SimulatorPage({
  initialSlug,
  isDemoRoute = false,
}: {
  initialSlug?: string;
  isDemoRoute?: boolean;
}) {
  const { toast } = useToast();
  const { data: leads = [] } = useListAdminLeads();

  // ─── TRYBY GENERATORA: PROSTY (EXPRESS) VS ZAAWANSOWANY (STUDIO) ──────────
  const [generatorMode, setGeneratorMode] = useState<"simple" | "advanced">("simple");
  const [isFullscreenStudio, setIsFullscreenStudio] = useState<boolean>(false);

  // Prosty generator (Express Setup)
  const [simpleIndustryInput, setSimpleIndustryInput] = useState<string>("");
  const [simpleGoal, setSimpleGoal] = useState<"phone_quotes" | "appointments" | "cart_recovery" | "support_24">("phone_quotes");
  const [simpleTone, setSimpleTone] = useState<"professional" | "warm" | "expert">("professional");

  // KROK 1: Wybór frameworka jako fundamentu systemu
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>("spice");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [frameworkSearchQuery, setFrameworkSearchQuery] = useState<string>("");
  const [showSpiceGuideModal, setShowSpiceGuideModal] = useState<boolean>(false);
  const [copiedActivePrompt, setCopiedActivePrompt] = useState<boolean>(false);

  // Zakładki Studia Zaawansowanego: 
  const [activeStudioTab, setActiveStudioTab] = useState<"frameworks" | "sliders" | "tech" | "avatars" | "embed">("frameworks");

  // Wybory branży i persony
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("construction_solar");
  const [selectedGender, setSelectedGender] = useState<"female" | "male">("female");
  const [selectedStyleId, setSelectedStyleId] = useState<string>("whatsapp");

  // Dane Doradcy
  const [consultantName, setConsultantName] = useState<string>("Aleksandra");
  const [consultantTitle, setConsultantTitle] = useState<string>("Doradca ds. Projektów Wnętrz & Wycen");
  const [consultantBio, setConsultantBio] = useState<string>(
    "Pomagam w precyzyjnym zaplanowaniu realizacji, dobieram materiały, wstępnie szacuję koszty i koordynuję bezpłatne pomiary."
  );
  const [consultantYears, setConsultantYears] = useState<number>(6);
  const [consultantPhoto, setConsultantPhoto] = useState<string>(ADVISOR_REAL_AVATARS.aleksandra);
  const [specializations, setSpecializations] = useState<string[]>([
    "Kuchnie & meble na wymiar",
    "Wycena realizacji i montażu",
    "Bezpłatny pomiar na miejscu",
    "Dobór materiałów i blatów"
  ]);

  // ─── WARSTWA TECHNOLOGICZNA ──────────────────────────────────────────────
  const [enableVoiceAudio, setEnableVoiceAudio] = useState<boolean>(true);
  const [enableHumanHandoff, setEnableHumanHandoff] = useState<boolean>(true);

  // ─── WARSTWA PARAMETRYZACJI (SUWAKI ZACHOWANIA) ──────────────────────────
  const [determinationLevel, setDeterminationLevel] = useState<number>(75);
  const [empathyLevel, setEmpathyLevel] = useState<number>(80);
  const [temperature, setTemperature] = useState<number>(0.3);
  const [formalityLevel, setFormalityLevel] = useState<number>(85);
  const [brevityLevel, setBrevityLevel] = useState<number>(80);
  const [technicalLevel, setTechnicalLevel] = useState<number>(60);

  // ─── GROUNDING / BAZA WIEDZY ──────────────────────────────────────────────
  const [customKnowledgeContext, setCustomKnowledgeContext] = useState<string>(
    "Działamy na rynku od 2012 roku. Pomiary i wstępne wyceny na terenie całego województwa są w 100% bezpłatne i niezobowiązujące. Średni czas realizacji zamówienia wynosi od 2 do 4 tygodni. Udzielamy 5 lat pisemnej gwarancji na wszystkie elementy i montaż. Standardowa zaliczka przy podpisaniu umowy to 20%."
  );

  // ─── ZAKAZANE SŁOWA / OGRANICZENIA ─────────────────────────────────────────
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([
    "Jestem botem / sztuczną inteligencją",
    "Nie wiem / nie umiem pomóc",
    "Zrobimy za pół ceny / najtaniej w Polsce",
    "Gwarantuję 100% bez czytania dokumentów"
  ]);
  const [newForbiddenInput, setNewForbiddenInput] = useState<string>("");

  // ─── DOZWOLONE DZIAŁANIA I CELE ───────────────────────────────────────────
  const [allowedActions, setAllowedActions] = useState<string[]>([
    "Przedstawianie orientacyjnych widełek kosztowych",
    "Zaproponowanie bezpłatnego pomiaru lub konsultacji",
    "Pobranie numeru telefonu lub adresu e-mail do kontaktu",
    "Wyjaśnienie etapów realizacji i warunków gwarancji"
  ]);
  const [leadGoals, setLeadGoals] = useState<string[]>([
    "Zdiagnozowanie metrażu lub zakresu prac klienta",
    "Zbadanie preferowanego terminu realizacji",
    "Pozyskanie numeru telefonu do przesłania szczegółowej kalkulacji"
  ]);

  // Modale i Narzędzia
  const [showIntegrateModal, setShowIntegrateModal] = useState<boolean>(false);
  const [showVoiceOrbModal, setShowVoiceOrbModal] = useState<boolean>(false);

  // Generative UI State wewnątrz czatu
  const [genUiArea, setGenUiArea] = useState<number>(45);
  const [genUiBooked, setGenUiBooked] = useState<boolean>(false);

  // Voice Orb Simulator state
  const [voiceOrbState, setVoiceOrbState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceOrbTranscript, setVoiceOrbTranscript] = useState<string>("");

  // Chat State
  const [messages, setMessages] = useState<AnthropicMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<string>("");
  const [detectedLeadInfo, setDetectedLeadInfo] = useState<string | null>(null);

  // Wstępna konfiguracja sesji
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const createConversation = useCreateAnthropicConversation();
  const createPersona = useCreatePersona();
  const sessionKey = `aura_session_${selectedIndustryId}_${selectedGender}`;

  // Persona addressed by the URL (/chat/:slug, /demo/:hash) — its style and
  // identity seed the studio so a shared link opens the right advisor.
  const { data: linkedPersona } = useGetPersonaBySlug(initialSlug ?? "", {
    query: {
      queryKey: ["/api/personas/by-slug", initialSlug],
      enabled: !!initialSlug,
      retry: false,
    },
  });

  // Slug the generated advisor was saved under; drives the embed snippet.
  const [publishedSlug, setPublishedSlug] = useState<string | null>(initialSlug ?? null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  useEffect(() => {
    if (!linkedPersona) return;
    setConsultantName(linkedPersona.name);
    if (linkedPersona.title) setConsultantTitle(linkedPersona.title);
    if (linkedPersona.photoUrl) setConsultantPhoto(linkedPersona.photoUrl);
    if (linkedPersona.effectiveStyle) setSelectedStyleId(linkedPersona.effectiveStyle);
    if (linkedPersona.slug) setPublishedSlug(linkedPersona.slug);
  }, [linkedPersona]);

  // Wczytywanie sesji lub czyszczenie
  useEffect(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      setSessionToken(saved);
    }
  }, [sessionKey]);

  // Przewijanie czatu w dół
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, streaming, isTyping]);

  // Zmiana branży lub płci
  const handleSelectIndustry = (indId: string, gender: "female" | "male" = selectedGender) => {
    setSelectedIndustryId(indId);
    setSelectedGender(gender);
    const ind = INDUSTRY_CATEGORIES.find(c => c.id === indId) || INDUSTRY_CATEGORIES[0];
    const pers = gender === "female" ? ind.femalePersona : ind.malePersona;
    setConsultantName(pers.name);
    setConsultantTitle(pers.title);
    setConsultantBio(pers.bio);
    setConsultantYears(pers.years);
    setConsultantPhoto(pers.photoUrl);
    setSpecializations(pers.specs);
    setSelectedStyleId(pers.style);
    setForbiddenWords([
      "Jestem botem / sztuczną inteligencją",
      "Nie wiem / nie umiem pomóc",
      ...pers.forbidden
    ]);
    setAllowedActions(pers.allowed);
    setLeadGoals(pers.goals);
    setMessages([]);
    setStreaming("");
    setDetectedLeadInfo(null);
    toast({
      title: `Aktywowano profil: ${pers.name}`,
      description: `${pers.title} • Branża: ${ind.name}`
    });
  };

  const activeFrameworkObj = FRAMEWORKS_REGISTRY.find(f => f.id === selectedFrameworkId) || FRAMEWORKS_REGISTRY[0];

  // Dynamiczne budowanie Promptu Systemowego
  const buildComprehensiveSystemPrompt = () => {
    let formalDesc = formalityLevel > 70 ? "bardzo profesjonalny, formalny, kulturalny, zwroty per Pan/Pani" : "ciepły, partnerski, bezpośredni, ale z pełnym szacunkiem";
    let brevDesc = brevityLevel > 70 ? "zwięzły, konkretny, maksymalnie 2-3 zdania na odpowiedź, dokładnie 1 pytanie na raz" : "wyczerpujący, bogaty w szczegóły, z rozwiniętymi wyjaśnieniami";
    let determDesc = determinationLevel > 70 ? "bardzo aktywny w proponowaniu darmowego pomiaru/wyceny i proszeniu o numer telefonu" : "delikatny, nieinwazyjny, skupiony wyłącznie na odpowiadaniu na pytania";
    let tempDesc = temperature < 0.4 ? "dokładny, przewidywalny, ściśle trzymający się faktów z bazy wiedzy" : "kreatywny, swobodny, naturalny język mówiony";
    let closingDesc = "Kończ każdą wypowiedź dokładnie 1 pytaniem zachęcającym do kalkulacji lub podania kontaktu.";

    let prompt = `Jesteś autonomicznym, wysoce profesjonalnym doradcą handlowym o imieniu ${consultantName} (${consultantTitle}).
Silnik: Dedykowany, specjalnie trenowany model konwersacyjny AURA.CORE (wstępnie zoptymalizowany pod analizę rzeczywistych rozmów konsultantów handlowych i badanie potrzeb).

=== AKTYWNY FUNDAMENT LOGICZNY: ${activeFrameworkObj.name.toUpperCase()} ===
${activeFrameworkObj.systemPromptModifier}

=== [S] SEKCJE / OPIS ROLI & TOŻSAMOŚĆ:
${consultantBio}

=== [SPECJALIZACJE DZIEDZINOWE]:
${specializations.map(s => `• ${s}`).join("\n")}

=== [C] KONTEKST BAZY WIEDZY (GROUNDING):
${customKnowledgeContext}

=== [P] PARAMETRY ZACHOWANIA:
• Temperatura i styl: ${tempDesc}
• Ton i formalność: ${formalDesc} (Poziom: ${formalityLevel}%)
• Zwięzłość odpowiedzi: ${brevDesc} (Poziom: ${brevityLevel}%)
• Determinacja w pozyskaniu kontaktu: ${determDesc} (Poziom: ${determinationLevel}%)
• Empatia i relacyjność: ${empathyLevel}%
• Poziom techniczny / żargon: ${technicalLevel}% (${technicalLevel > 70 ? "Używaj terminologii branżowej" : "Tłumacz prosto jak dla laika"})
• Pytania zamykające: ${closingDesc}

=== [L] TWARDE ZAKAZY I OGRANICZENIA (GUARDRAILS):
${forbiddenWords.map(w => `• NIGDY nie używaj zwrotu ani nie sugeruj: "${w}"`).join("\n")}
• Nie wymyślaj nierealistycznych rabatów ani fałszywych obietnic prawnych/technicznych.
• Nigdy nie mów "Nie wiem" bez natychmiastowej propozycji: "Sprawdzę to dokładnie z naszym zespołem technicznym, pod jaki numer mogę przesłać odpowiedź?".
• Jeśli klient pisze "Dzień dobry", odpowiadaj naturalnie i uprzejmie, bez zbędnych powtórzeń.

=== [DOZWOLONE DZIAŁANIA]:
${allowedActions.map((a, i) => `${i + 1}. ${a}`).join("\n")}

=== [GŁÓWNE CELE ROZMOWY]:
${leadGoals.map((g, i) => `${i + 1}. ${g}`).join("\n")}`;

    if (enableHumanHandoff) {
      prompt += `\n\n=== [SIATKA BEZPIECZEŃSTWA - HUMAN IN THE LOOP]:
Jeśli klient wyrazi silne niezadowolenie, skomplikowane roszczenie prawne lub zażąda natychmiastowej rozmowy z człowiekiem, zachowaj pełen spokój, przeproś za niedogodność i poproś o numer telefonu z informacją: "Natychmiast przekazuję sprawę do naszego kierownika, który oddzwoni w ciągu kilku minut".`;
    }

    return prompt;
  };

  // Express Generator Handler
  const handleGenerateExpressBot = () => {
    setSelectedFrameworkId("spice");
    if (simpleGoal === "phone_quotes") {
      setDeterminationLevel(85);
      setLeadGoals([
        "Precyzyjne zdiagnozowanie potrzeb lub metrażu klienta",
        "Podanie bezpiecznych, orientacyjnych widełek kosztowych",
        "Pozyskanie numeru telefonu lub e-maila do przesłania oficjalnej kalkulacji"
      ]);
    } else if (simpleGoal === "appointments") {
      setDeterminationLevel(80);
      setLeadGoals([
        "Ustalenie dogodnego terminu na bezpłatny pomiar lub spotkanie online",
        "Pobranie numeru telefonu do potwierdzenia rezerwacji terminu"
      ]);
    } else if (simpleGoal === "cart_recovery") {
      setDeterminationLevel(70);
      setLeadGoals([
        "Rozwiązanie wątpliwości zakupowych (rozmiar, parametry, gwarancja)",
        "Zaproponowanie kodu rabatowego za podanie adresu e-mail"
      ]);
    } else {
      setDeterminationLevel(60);
      setLeadGoals([
        "Rzetelne i szybkie odpowiedzi na pytania techniczne",
        "Pobranie kontaktu w przypadku potrzeby dedykowanej analizy"
      ]);
    }

    if (simpleTone === "professional") {
      setFormalityLevel(85);
      setEmpathyLevel(75);
    } else if (simpleTone === "warm") {
      setFormalityLevel(60);
      setEmpathyLevel(90);
    } else {
      setFormalityLevel(80);
      setTechnicalLevel(85);
    }

    if (simpleIndustryInput.trim()) {
      setConsultantBio(`Jestem wyspecjalizowanym doradcą w firmie z branży: ${simpleIndustryInput.trim()}. Pomagam klientom w szybkim uzyskaniu informacji, kalkulacji kosztów oraz sprawnym przeprowadzeniu przez cały proces.`);
      setSpecializations([
        `Kompleksowe doradztwo w branży: ${simpleIndustryInput.trim()}`,
        "Przygotowywanie wstępnych kalkulacji i wycen",
        "Koordynacja terminów i rezerwacja konsultacji",
        "Gwarancja i bezpieczeństwo realizacji"
      ]);
    }

    setMessages([]);
    setStreaming("");
    toast({
      title: "✨ Asystent AI został wygenerowany!",
      description: "Zastosowano standard SPICE, optymalne suwaki psychologiczne i przygotowano czat do testu."
    });
  };

  // Zapisanie wygenerowanego doradcy jako trwałej persony — dopiero wtedy kod
  // embed i link /chat/:slug wskazują na coś realnego.
  const handlePublishPersona = async () => {
    setIsPublishing(true);
    try {
      const created = await createPersona.mutateAsync({
        data: {
          name: consultantName,
          title: consultantTitle,
          photoUrl: consultantPhoto || null,
          additionalPrompt: buildComprehensiveSystemPrompt(),
          style: selectedStyleId,
          personaTypeId: null,
        },
      });
      setPublishedSlug(created.slug ?? null);
      toast({
        title: "Doradca zapisany",
        description: created.slug
          ? `Dostępny pod adresem /chat/${created.slug} oraz w kodzie embed.`
          : "Persona została zapisana w panelu administracyjnym.",
      });
    } catch {
      toast({
        title: "Nie udało się zapisać doradcy",
        description: "Sprawdź połączenie z serwerem API i spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Wysłanie wiadomości w czacie
  const handleSendMessage = async (customText?: string) => {
    const text = (customText ?? inputValue).trim();
    if (!text) return;
    setInputValue("");

    // Wykrywanie numeru telefonu / maila
    const phoneRegex = /(?:\+48\s?)?(?:[1-9]\d{2}[\s-]?\d{3}[\s-]?\d{3}|[1-9]\d{1}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})/;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(phoneRegex) || text.match(emailRegex);
    if (match) {
      setDetectedLeadInfo(match[0]);
      setTimeout(() => setDetectedLeadInfo(null), 6000);
    }

    const userTempMsg: AnthropicMessage = {
      id: Date.now(),
      conversationId: conversationId || 0,
      role: "user",
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userTempMsg]);
    setIsTyping(true);

    try {
      let cid = conversationId;
      if (!cid) {
        const newConv = await createConversation.mutateAsync({
          data: {
            title: text.slice(0, 40),
            sessionToken: crypto.randomUUID(),
            personaId: linkedPersona?.id ?? null
          }
        });
        cid = newConv.id;
        setConversationId(newConv.id);
        setSessionToken(newConv.sessionToken);
        localStorage.setItem(sessionKey, newConv.sessionToken);
      }

      const prompt = buildComprehensiveSystemPrompt();
      const res = await fetch(`/api/anthropic/conversations/${cid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          customSystemPrompt: prompt
        })
      });
      if (!res.ok) throw new Error("Błąd połączenia");

      setIsTyping(false);
      const reader = res.body?.getReader();
      const dec = new TextDecoder();
      if (!reader) throw new Error();

      let full = "", buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.content) {
                full += parsed.content;
                setStreaming(full);
              }
            } catch {}
          }
        }
      }

      const newAssistantId = Date.now();
      setMessages(prev => [
        ...prev,
        { id: newAssistantId, conversationId: cid!, role: "assistant", content: full, createdAt: new Date().toISOString() }
      ]);
      setStreaming("");
    } catch {
      setIsTyping(false);
      setStreaming("");
      toast({ title: "Błąd połączenia", description: "Nie udało się pobrać odpowiedzi AI.", variant: "destructive" });
      setMessages(prev => prev.filter(m => m.id !== userTempMsg.id));
    }
  };

  const handleResetChat = () => {
    localStorage.removeItem(sessionKey);
    setSessionToken(null);
    setConversationId(null);
    setMessages([]);
    setStreaming("");
    toast({ title: "Zresetowano konwersację", description: "Możesz zacząć nowy test od czystej karty." });
  };

  const embedSnippet = generateEmbedScript(publishedSlug ?? "", {
    personaSlug: publishedSlug,
    theme: selectedStyleId,
    welcomeText: `Cześć! Tu ${consultantName}. W czym mogę pomóc?`,
    position: "right",
  });

  const currentIndustry = INDUSTRY_CATEGORIES.find(c => c.id === selectedIndustryId) || INDUSTRY_CATEGORIES[0];
  const activePersona = selectedGender === "female" ? currentIndustry.femalePersona : currentIndustry.malePersona;

  const filteredFrameworks = FRAMEWORKS_REGISTRY.filter(f => {
    const matchCat = selectedCategoryTab === "all" || f.category === selectedCategoryTab;
    const matchSearch = frameworkSearchQuery.trim() === "" ||
      f.name.toLowerCase().includes(frameworkSearchQuery.toLowerCase()) ||
      f.shortDesc.toLowerCase().includes(frameworkSearchQuery.toLowerCase()) ||
      f.tags.some(t => t.toLowerCase().includes(frameworkSearchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen w-full bg-[#04060b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* ─── Ambient Tactile Noise & Glow ───────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 noise-texture opacity-30" />
        <div className="absolute top-0 right-1/4 w-[1000px] h-[500px] bg-blue-600/08 blur-[240px] rounded-full" />
        <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-cyan-500/06 blur-[260px] rounded-full" />
      </div>

      {/* ─── GÓRNY PASEK NAWIGACJI (FULL WIDTH PEŁNY EKRAN) ────────────────── */}
      <header className="relative z-30 border-b border-slate-800/70 bg-[#060911]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/">
            <button className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Strona Główna</span>
            </button>
          </Link>

          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] flex items-center justify-center font-mono font-bold text-white text-xs shadow-md shadow-cyan-500/20">
              <SparklesIcon className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">GENERATOR ASYSTENTÓW AI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  {activeFrameworkObj.name}
                </span>
                {isDemoRoute && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold uppercase tracking-wider">
                    Demo klienta
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tryb Generatora: Prosty vs Zaawansowany */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setGeneratorMode("simple");
              setIsFullscreenStudio(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              generatorMode === "simple"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Prosty Generator (30s)</span>
          </button>

          <button
            onClick={() => setGeneratorMode("advanced")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              generatorMode === "advanced"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>⚙️ Zaawansowane Studio</span>
          </button>
        </div>

        {/* Prawa strona headera */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSpiceGuideModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold font-mono transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Przewodnik SPICE & Akademia</span>
          </button>

          {generatorMode === "advanced" && (
            <button
              onClick={() => setIsFullscreenStudio(!isFullscreenStudio)}
              title={isFullscreenStudio ? "Przywróć widok z czatem" : "Rozwiń studio na pełną szerokość"}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isFullscreenStudio ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreenStudio ? "Pokaż Czat" : "Pełny Ekran"}</span>
            </button>
          )}

          <button
            onClick={() => setShowIntegrateModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pobierz Kod Embed</span>
          </button>
        </div>

      </header>

      {/* ─── GŁÓWNY UKŁAD PEŁNOEKRANOWY (FULL-WIDTH 100%) ─────────────────── */}
      <main className="relative z-10 flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ──────────────────────────────────────────────────────────────────
            LEWA KOLUMNA: PROSTY GENERATOR LUB ZAAWANSOWANE STUDIO
            ────────────────────────────────────────────────────────────────── */}
        <div className={`${isFullscreenStudio ? "lg:col-span-12" : "lg:col-span-7 xl:col-span-7 2xl:col-span-7"} space-y-5 transition-all`}>
          
          {/* ══════════════════════════════════════════════════════════════════
              TRYB PROSTY: BŁYSKAWICZNY 30-SEKUNDOWY KREATOR (EXPRESS)
              ══════════════════════════════════════════════════════════════════ */}
          {generatorMode === "simple" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Baner Wprowadzający */}
              <div className="p-6 rounded-2xl bento-card border-cyan-500/30 space-y-3 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Szybki Generator Doradcy AI (30 Sekund)</h2>
                      <p className="text-xs text-slate-300">Wypełnij 3 proste kroki, a system wygeneruje bota ze sprawdzonym frameworkiem SPICE.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSpiceGuideModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Czym jest SPICE?</span>
                  </button>
                </div>
              </div>

              {/* KROK 1: Branża lub Wpisz Czym Się Zajmujesz */}
              <div className="p-5 rounded-2xl bento-card space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">1</span>
                    Wybierz Branżę lub Wpisz Swoją Działalność:
                  </span>
                  <span className="text-[11px] text-slate-400">Kliknij gotowy szablon lub wpisz własny profil</span>
                </div>

                {/* Gotowe Kafelki Branżowe */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {INDUSTRY_CATEGORIES.map(ind => {
                    const Icon = ind.icon;
                    const isSelected = selectedIndustryId === ind.id;
                    return (
                      <button
                        key={ind.id}
                        onClick={() => handleSelectIndustry(ind.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500 shadow-md shadow-cyan-500/20"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-cyan-400"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100">{ind.name}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{ind.shortDesc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pole wpisania własnej branży */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                    Lub opisz firmę własnymi słowami (opcjonalnie):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simpleIndustryInput}
                      onChange={e => setSimpleIndustryInput(e.target.value)}
                      placeholder="Np. Produkujemy bramy garażowe i ogrodzenia na zamówienie w Poznaniu..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* KROK 2: Główny Cel Bota */}
              <div className="p-5 rounded-2xl bento-card space-y-3">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">2</span>
                  Jaki jest główny cel Twojego Asystenta AI?
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: "phone_quotes" as const,
                      title: "Zbieranie Telefonów do Wycen",
                      desc: "Pyta o metraż/zakres, podaje widełki i prosi o numer telefonu do kalkulacji.",
                      icon: Phone
                    },
                    {
                      id: "appointments" as const,
                      title: "Umawianie Wizyt & Pomiarów",
                      desc: "Kwalifikuje klienta i rezerwuje termin na bezpłatny pomiar na miejscu.",
                      icon: Calendar
                    },
                    {
                      id: "cart_recovery" as const,
                      title: "Domykanie Koszyków (E-commerce)",
                      desc: "Doradza w doborze parametrów i oferuje dedykowany kod rabatowy za e-mail.",
                      icon: ShoppingCart
                    },
                    {
                      id: "support_24" as const,
                      title: "Wsparcie Techniczne & B2B",
                      desc: "Odpowiada na pytania techniczne i umawia rozmowę z inżynierem.",
                      icon: Laptop
                    }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSimpleGoal(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        simpleGoal === item.id
                          ? "bg-blue-500/15 border-blue-500 shadow-md shadow-blue-500/20"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${simpleGoal === item.id ? "bg-blue-500 text-slate-950" : "bg-slate-800 text-blue-400"}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* KROK 3: Styl & Temperament */}
              <div className="p-5 rounded-2xl bento-card space-y-3">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">3</span>
                  Wybierz Styl Komunikacji:
                </span>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "professional" as const, label: "Ekspert Biznesowy", desc: "Formalny, rzetelny, zwroty per Pan/Pani" },
                    { id: "warm" as const, label: "Ciepły & Partnerski", desc: "Wysoka empatia, bezpośredni i pomocny" },
                    { id: "expert" as const, label: "Ścisły Doradca", desc: "Konkretny, techniczny, zwięzłe odpowiedzi" }
                  ].map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setSimpleTone(tone.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        simpleTone === tone.id
                          ? "bg-cyan-500/15 border-cyan-500 text-white font-bold shadow-md shadow-cyan-500/15"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-100">{tone.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Akcja: Generuj Bota w 1 Kliknięcie */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleGenerateExpressBot}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Zastosuj Ustawienia & Przetestuj Bota</span>
                </button>

                <button
                  onClick={() => setGeneratorMode("advanced")}
                  className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>Otwórz Zaawansowane Studio</span>
                </button>
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TRYB ZAAWANSOWANY: PEŁNE STUDIO ARCHITEKTURY PROMPTU
              ══════════════════════════════════════════════════════════════════ */}
          {generatorMode === "advanced" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Nawigacja po Krokach Studia (Bento Header) */}
              <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-1.5 flex-wrap shadow-lg">
                
                <button
                  onClick={() => setActiveStudioTab("frameworks")}
                  className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeStudioTab === "frameworks"
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>1. Frameworki (24)</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab("sliders")}
                  className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeStudioTab === "sliders"
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>2. Suwaki Psychologii</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab("tech")}
                  className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeStudioTab === "tech"
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>3. Baza Wiedzy & Guardrails</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab("avatars")}
                  className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeStudioTab === "avatars"
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>4. Persony & Awatary</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab("embed")}
                  className={`flex-1 min-w-[130px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeStudioTab === "embed"
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>5. Styl & Kod Embed</span>
                </button>

              </div>

              {/* ZAKŁADKA 1: WYBÓR FRAMEWORKA I METODOLOGII (PEŁNA PRZESTRZEŃ) */}
              {activeStudioTab === "frameworks" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  
                  {/* Header Box z Przewodnikiem */}
                  <div className="p-5 rounded-2xl bento-card border-blue-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                          <Layers className="w-5 h-5 text-cyan-400" />
                          Katalog 24 Metodologii Promptowania & Architektury AI
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          Wybierz wzorzec logiczny, aby natychmiast przeprogramować tok myślenia i strukturę argumentacji bota.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowSpiceGuideModal(true)}
                        className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono transition-colors cursor-pointer shadow-md"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Przewodnik Edukacyjny SPICE</span>
                      </button>
                    </div>

                    {/* Wyszukiwarka i Licznik */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5 items-center">
                      <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={frameworkSearchQuery}
                          onChange={e => setFrameworkSearchQuery(e.target.value)}
                          placeholder="Szukaj frameworka (np. SPICE, DELTA, AIDA, CoT, B2B)..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                        {frameworkSearchQuery && (
                          <button
                            onClick={() => setFrameworkSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-400 shrink-0">
                        Wyniki: <strong className="text-cyan-400">{filteredFrameworks.length}</strong> / 24
                      </div>
                    </div>

                    {/* Zakładki Kategorii (Zawijane - zero uciętych suwaków!) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {FRAMEWORK_CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryTab(cat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedCategoryTab === cat.id
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Karta Aktywnego Frameworka (Podsumowanie) */}
                  <div className="p-5 rounded-2xl bento-card border-cyan-500/40 bg-gradient-to-br from-slate-900/90 to-slate-950 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {activeFrameworkObj.badge}
                          </span>
                          <h4 className="text-lg font-black text-white">{activeFrameworkObj.name}</h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{activeFrameworkObj.shortDesc}</p>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeFrameworkObj.systemPromptModifier);
                          setCopiedActivePrompt(true);
                          setTimeout(() => setCopiedActivePrompt(false), 2500);
                          toast({ title: "Skopiowano prompt frameworka!", description: "Możesz wkleić go do OpenAI, Claude lub kodu." });
                        }}
                        className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        {copiedActivePrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedActivePrompt ? "Skopiowano" : "Kopiuj Prompt"}</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-cyan-300">
                      {activeFrameworkObj.formula}
                    </div>

                    {/* Kroki rozbicia */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {activeFrameworkObj.breakdown.map((step, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center">
                              {step.letter}
                            </span>
                            <span className="text-xs font-bold text-white">{step.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Siatka Wszystkich 24 Frameworków (Przestronna, wielokolumnowa) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                        Wybierz z katalogu:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3.5">
                      {filteredFrameworks.map(fw => {
                        const isSelected = selectedFrameworkId === fw.id;
                        return (
                          <div
                            key={fw.id}
                            onClick={() => {
                              setSelectedFrameworkId(fw.id);
                              toast({
                                title: `Wybrano: ${fw.name}`,
                                description: "Przeprogramowano logikę asystenta."
                              });
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                              isSelected
                                ? "bg-cyan-500/15 border-cyan-400 shadow-xl shadow-cyan-500/15 ring-1 ring-cyan-500/50"
                                : "bg-slate-900/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                  isSelected ? "bg-cyan-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300"
                                }`}>
                                  {fw.badge}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktywny
                                  </span>
                                )}
                              </div>

                              <div className="font-bold text-sm text-white">
                                {fw.name}
                              </div>

                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                {fw.shortDesc}
                              </p>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-800/80">
                              <div className="text-[10px] font-mono text-cyan-300/80 truncate">
                                {fw.formula}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {fw.tags.slice(0, 3).map((t, tidx) => (
                                  <span key={tidx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ZAKŁADKA 2: SUWAKI PSYCHOLOGICZNE */}
              {activeStudioTab === "sliders" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-6 rounded-2xl bento-card space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-cyan-400" />
                        Psychologia & Suwaki Temperamentu Doradcy
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Dostosuj zachowanie i dynamikę zamykania sprzedaży w skali 0-100%.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                      {/* Suwak Determinacji */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-semibold">Determinacja w Pozyskiwaniu Telefonu:</span>
                          <span className="font-mono text-cyan-400 font-bold">{determinationLevel}%</span>
                        </div>
                        <input
                          type="range" min={30} max={100} value={determinationLevel}
                          onChange={e => setDeterminationLevel(Number(e.target.value))}
                          className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Pasywny doradca</span>
                          <span>Aktywne domykanie wycen</span>
                        </div>
                      </div>

                      {/* Suwak Empatii */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-semibold">Empatia & Budowanie Relacji:</span>
                          <span className="font-mono text-cyan-400 font-bold">{empathyLevel}%</span>
                        </div>
                        <input
                          type="range" min={30} max={100} value={empathyLevel}
                          onChange={e => setEmpathyLevel(Number(e.target.value))}
                          className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Chłodny profesjonalizm</span>
                          <span>Maksymalna troska i zrozumienie</span>
                        </div>
                      </div>

                      {/* Suwak Formalności */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-semibold">Poziom Formalności:</span>
                          <span className="font-mono text-cyan-400 font-bold">{formalityLevel}%</span>
                        </div>
                        <input
                          type="range" min={30} max={100} value={formalityLevel}
                          onChange={e => setFormalityLevel(Number(e.target.value))}
                          className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Luźny styl partnerski</span>
                          <span>Formalny zwrot per Pan/Pani</span>
                        </div>
                      </div>

                      {/* Suwak Zwięzłości */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-200 font-semibold">Zwięzłość Odpowiedzi:</span>
                          <span className="font-mono text-cyan-400 font-bold">{brevityLevel}%</span>
                        </div>
                        <input
                          type="range" min={30} max={100} value={brevityLevel}
                          onChange={e => setBrevityLevel(Number(e.target.value))}
                          className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Długie opisy</span>
                          <span>Max 2-3 zdania (Mobile friendly)</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ZAKŁADKA 3: BAZA WIEDZY I GUARDRAILS */}
              {activeStudioTab === "tech" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-6 rounded-2xl bento-card space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-cyan-400" />
                        Baza Wiedzy Firmy (Grounding - Zero Halucynacji)
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Wklej cenniki, godziny, obszar działania i gwarancje. Model będzie trzymał się wyłącznie tych faktów.
                      </p>
                    </div>

                    <textarea
                      rows={5}
                      value={customKnowledgeContext}
                      onChange={e => setCustomKnowledgeContext(e.target.value)}
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
                    />

                    <div className="pt-2 space-y-3">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Twarde Zakazy (Guardrails):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {forbiddenWords.map((word, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                            <span>🚫 {word}</span>
                            <button
                              onClick={() => setForbiddenWords(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          value={newForbiddenInput}
                          onChange={e => setNewForbiddenInput(e.target.value)}
                          placeholder="Dodaj zakazany zwrot..."
                          className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                        />
                        <button
                          onClick={() => {
                            if (newForbiddenInput.trim()) {
                              setForbiddenWords(prev => [...prev, newForbiddenInput.trim()]);
                              setNewForbiddenInput("");
                            }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl cursor-pointer"
                        >
                          Dodaj
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ZAKŁADKA 4: PERSONY & AWATARY */}
              {activeStudioTab === "avatars" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-6 rounded-2xl bento-card space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-cyan-400" />
                        Wybór Doradcy & Branży
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Wybierz branżę, aby załadować autentyczny biogram, lata doświadczenia i specjalizacje.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {INDUSTRY_CATEGORIES.map(ind => (
                        <button
                          key={ind.id}
                          onClick={() => handleSelectIndustry(ind.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedIndustryId === ind.id
                              ? "bg-cyan-500/15 border-cyan-500 shadow-md shadow-cyan-500/20"
                              : "bg-slate-900 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="text-xs font-bold text-white">{ind.name}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{ind.categoryTag}</div>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleSelectIndustry(selectedIndustryId, "female")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedGender === "female" ? "bg-cyan-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        Kobieta (Doradczyni)
                      </button>
                      <button
                        onClick={() => handleSelectIndustry(selectedIndustryId, "male")}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedGender === "male" ? "bg-cyan-500 text-slate-950 font-black" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        Mężczyzna (Doradca)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ZAKŁADKA 5: STYL & KOD EMBED */}
              {activeStudioTab === "embed" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-6 rounded-2xl bento-card space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-cyan-400" />
                        Publikacja Doradcy & Kod Osadzenia
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Najpierw zapisz doradcę, potem wklej skrypt przed zamknięciem znacznika &lt;/body&gt;.
                      </p>
                    </div>

                    {/* Krok 1 — publikacja */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-white">Krok 1 — Zapisz doradcę</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {publishedSlug
                              ? `Opublikowany jako „${consultantName}” — /chat/${publishedSlug}`
                              : "Doradca istnieje tylko w tej przeglądarce, dopóki go nie zapiszesz."}
                          </p>
                        </div>
                        {publishedSlug && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      </div>

                      <button
                        onClick={handlePublishPersona}
                        disabled={isPublishing}
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-white disabled:opacity-60 text-slate-950 font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
                      >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{publishedSlug ? "Zapisz jako nowego doradcę" : "Zapisz doradcę i wygeneruj link"}</span>
                      </button>

                      {publishedSlug && (
                        <a
                          href={`/chat/${publishedSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Otwórz publiczny czat doradcy
                        </a>
                      )}
                    </div>

                    {/* Krok 2 — kod embed */}
                    <div>
                      <p className="text-xs font-bold text-white mb-2">Krok 2 — Wklej kod na stronę</p>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed whitespace-pre">
                        {embedSnippet}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(embedSnippet);
                        toast({ title: "Skopiowano kod do schowka!" });
                      }}
                      className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Kopiuj Kod HTML / JS</span>
                    </button>

                    {!publishedSlug && (
                      <p className="text-[11px] text-amber-300/90 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        Bez zapisania doradcy widget użyje persony ustawionej jako aktywna w panelu administracyjnym.
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ──────────────────────────────────────────────────────────────────
            PRAWA KOLUMNA: PODGLĄD NA ŻYWO I CZAT PLAYGROUND
            ────────────────────────────────────────────────────────────────── */}
        {!isFullscreenStudio && (
          <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-4 sticky top-20">
            
            <div className="rounded-2xl bento-card border-slate-800 overflow-hidden flex flex-col h-[calc(100vh-7rem)] min-h-[680px] shadow-2xl bg-[#060911]/95 relative">
              
              {/* Nagłówek Czatu */}
              <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-cyan-500/30">
                    <AvatarImage src={consultantPhoto} alt={consultantName} />
                    <AvatarFallback className="bg-cyan-500 text-slate-950 font-bold text-xs">{consultantName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{consultantName}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-[11px] text-slate-400">{consultantTitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetChat}
                    title="Wyczyść konwersację"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Wykryty Lead Alert */}
              {detectedLeadInfo && (
                <div className="p-2.5 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between px-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Wykryto kontakt: <strong>{detectedLeadInfo}</strong> (Zapisano jako Lead)</span>
                  </div>
                </div>
              )}

              {/* Obszar Wiadomości */}
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                
                {/* Powitanie startowe */}
                {messages.length === 0 && !streaming && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Aktywny Asystent Gotowy do Testu</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        „Dzień dobry! Nazywam się {consultantName}. Chętnie odpowiem na pytania, przygotuję orientacyjny kosztorys lub pomogę zaplanować bezpłatny pomiar. O co chciałby Pan/Pani zapytać?”
                      </p>
                    </div>

                    {/* Szybkie pytania testowe (Zawijane elegancko) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        Kliknij, aby przetestować reakcję:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {activePersona.sampleQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-cyan-500/10 border border-slate-800/80 hover:border-cyan-500/30 text-left text-xs text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <span>{q}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista wiadomości */}
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-cyan-500 text-slate-950 font-medium rounded-br-none shadow-md shadow-cyan-500/10"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                      }`}
                    >
                      {m.content}
                    </div>

                    {/* GenUI Kalkulator dla mebli i budownictwa */}
                    {m.role === "assistant" && idx === messages.length - 1 && selectedIndustryId === "construction_solar" && !genUiBooked && (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3 w-full max-w-[90%]">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>🛠️ Wstępna Kalkulacja Kosztów</span>
                          <span className="text-cyan-400 font-mono">{genUiArea} m²</span>
                        </div>
                        <input
                          type="range" min={10} max={150} value={genUiArea}
                          onChange={e => setGenUiArea(Number(e.target.value))}
                          className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Szacunkowy budżet:</span>
                          <span className="text-white font-bold font-mono">
                            {(genUiArea * 380).toLocaleString()} - {(genUiArea * 550).toLocaleString()} zł
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setGenUiBooked(true);
                            handleSendMessage(`Chciałbym zarezerwować darmowy pomiar dla metrażu ok. ${genUiArea} m2. Mój numer telefonu to: 501 234 567`);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-slate-950 font-black rounded-lg text-xs transition-all cursor-pointer"
                        >
                          Zamów Bezpłatny Pomiar na Miejscu
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Strumieniowanie na żywo */}
                {streaming && (
                  <div className="flex flex-col items-start">
                    <div className="max-w-[88%] p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 text-slate-200 text-xs leading-relaxed rounded-bl-none">
                      {streaming}
                      <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-1 align-middle" />
                    </div>
                  </div>
                )}

                {/* Wskaźnik pisania */}
                {isTyping && !streaming && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span className="shimmer-text">Doradca analizuje zapytanie wg frameworku {activeFrameworkObj.name}...</span>
                  </div>
                )}

              </div>

              {/* Dolne pole wpisywania */}
              <div className="p-3 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md flex gap-2 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder="Napisz do doradcy (np. Jaki jest koszt kuchni 3x2m?)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          EDUKACYJNY MODAL: PRZEWODNIK PO FRAMEWORKU SPICE & AKADEMIA PROMPTÓW
          ══════════════════════════════════════════════════════════════════════ */}
      <SpiceAcademyModal
        isOpen={showSpiceGuideModal}
        onClose={() => setShowSpiceGuideModal(false)}
        onApplySpice={() => {
          setSelectedFrameworkId("spice");
          toast({
            title: "Aktywowano SPICE",
            description: "Zastosowano standard inżynierii promptów 2026."
          });
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: KOD EMBED & INTEGRACJA
          ══════════════════════════════════════════════════════════════════════ */}
      {showIntegrateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#070b14] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowIntegrateModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                <Code2 className="w-4 h-4" />
                <span>Kod Osadzenia Widgetu</span>
              </div>
              <h3 className="text-xl font-black text-white">Wklej Doradcę AI na Twoją Stronę WWW</h3>
              <p className="text-xs text-slate-400">Działa natychmiast na WordPress, Shopify, Webflow, React i dowolnym HTML.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed whitespace-pre">
              {embedSnippet}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(embedSnippet);
                toast({ title: "Skopiowano kod do schowka!" });
                setShowIntegrateModal(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Copy className="w-4 h-4" />
              <span>Kopiuj Kod i Zamknij</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export interface FrameworkBreakdownStep {
  letter: string;
  name: string;
  description: string;
  practicalExample: string;
}

export interface FrameworkItem {
  id: string;
  name: string;
  category: "prompting" | "copywriting" | "discovery" | "business" | "architecture";
  badge: string;
  shortDesc: string;
  formula: string;
  howItWorks: string;
  systemPromptModifier: string;
  businessBenefit: string;
  iconName: string;
  tags: string[];
  breakdown: FrameworkBreakdownStep[];
  whenToUse: string[];
  beforeAfter: {
    badPrompt: string;
    badOutput: string;
    goodPrompt: string;
    goodOutput: string;
    explanation: string;
  };
  howToDeploy: {
    openAiFormat: string;
    anthropicFormat: string;
    rawTemplate: string;
  };
  proTips: string[];
}

export const FRAMEWORKS_REGISTRY: FrameworkItem[] = [
  // ─── I. FORMATY I METODY PROMPTUJĄCE ─────────────────────────────────────
  {
    id: "spice",
    name: "SPICE Framework",
    category: "prompting",
    badge: "Architektura Systemowa 2026",
    shortDesc: "Sections, Parameters, Instructions, Context, Examples. Złoty standard promptów produkcyjnych, eliminujący halucynacje i chaos.",
    formula: "[S] Sekcje Roli → [P] Zmienne i Parametry → [I] Twarde Instrukcje → [C] Baza Wiedzy (Grounding) → [E] Przykłady Few-Shot",
    howItWorks: "SPICE to najbardziej rygorystyczny i powtarzalny standard tworzenia asystentów AI w środowiskach biznesowych. Zamiast 'ściany tekstu' rozbija zachowanie bota na 5 odizolowanych modułów logicznych. Zapobiega to ucieczce z kontekstu, gwarantuje trzymanie się bazy wiedzy i wymusza naturalne zbieranie leadów bez bycia nachalnym.",
    systemPromptModifier: `[RAMA SYSTEMOWA: SPICE PROTOCOL]
# SEKCJA 1 [SECTIONS - ROLA I TOŻSAMOŚĆ]:
Działasz jako doświadczony, wyspecjalizowany doradca biznesowy. Wypowiadasz się z szacunkiem, ciepłem i ekspercką pewnością.

# SEKCJA 2 [PARAMETERS - PARAMETRY BEHAWIORALNE]:
- Rejestruj zmienne: {zakres_prac}, {metraz_lub_skala}, {termin_realizacji}, {telefon_klienta}.
- Maksymalna długość odpowiedzi: 2-3 zdania. Dokładnie JEDNO pytanie kwalifikujące na końcu.

# SEKCJA 3 [INSTRUCTIONS - INSTRUKCJE OPERACYJNE]:
1. Zdiagnozuj konkretną potrzebę klienta.
2. Podaj orientacyjne, bezpieczne widełki kosztowe oparte na kontekście.
3. Zaproponuj darmowy pomiar/konsultację i poproś o numer telefonu do przesłania specyfikacji.

# SEKCJA 4 [CONTEXT - BAZA WIEDZY I GROUNDING]:
Używaj wyłącznie zweryfikowanych danych firmy: cenniki, czasy realizacji 2-4 tyg., 5 lat gwarancji. Jeśli czegoś nie ma w bazie, zaproponuj weryfikację z zespołem technicznym.

# SEKCJA 5 [EXAMPLES - PRZYKŁADY FEW-SHOT]:
Klient: "Ile kosztuje kuchnia na wymiar?"
Doradca: "Dzień dobry! Standardowe realizacje mieszczą się zazwyczaj w przedziale 12 000 - 24 000 zł w zależności od blatów i systemów okuć. Jaki orientacyjny metraż lub układ pomieszczenia Pan planuje?"`,
    businessBenefit: "Eliminuje halucynacje do 99.4%, ujednolica jakość obsługi każdego klienta i zwiększa konwersję czatu na pozyskany numer telefonu o 3.8x.",
    iconName: "Layers",
    tags: ["Systemowy", "Few-Shot", "Baza Wiedzy", "Produkcyjny", "Standard 2026"],
    breakdown: [
      {
        letter: "S",
        name: "Sections (Sekcje Roli & Tożsamość)",
        description: "Precyzyjny opis roli, archetypu doradcy, zakresu kompetencji i misji firmy. Oddziela tożsamość od suchych komend.",
        practicalExample: "Jesteś Aleksandra – starszy doradca ds. wycen i projektów z 6-letnim stażem. Twoim celem jest rzetelne doradztwo materiałowe."
      },
      {
        letter: "P",
        name: "Parameters (Zmienne i Parametry)",
        description: "Dynamiczne zmienne dialogu, parametry długości odpowiedzi, poziom formalności oraz rejestr zbieranych danych ({klient_imie}, {budżet}, {lokalizacja}).",
        practicalExample: "Długość: max 60 słów. Styl: partnerski. Rejestruj kluczowe parametry inwestycji."
      },
      {
        letter: "I",
        name: "Instructions (Twarde Instrukcje & Guardrails)",
        description: "Krok po kroku: co asystent MA zrobić, a czego pod ŻADNYM pozorem nie wolno mu wypowiedzieć (zakaz deklarowania rabatów >15%, zakaz mówienia 'jestem botem').",
        practicalExample: "Nigdy nie rzucaj ostatecznej ceny bez zastrzeżenia o pomiarze. Zawsze kończ dokładnie 1 pytaniem otwartym."
      },
      {
        letter: "C",
        name: "Context (Baza Wiedzy & Grounding)",
        description: "Rzeczywiste fakty o firmie: cenniki, terminy, gwarancje, obszar działania, opinie, polityka zaliczek i procedury montażu.",
        practicalExample: "Bezpłatny dojazd w promieniu 50km. Czas realizacji: 14-28 dni. Pisemna gwarancja: 5 lat."
      },
      {
        letter: "E",
        name: "Examples (Few-Shot Prompting)",
        description: "Złote wzorce dialogowe (Pytanie klienta → Idealna odpowiedź doradcy), dzięki którym model uczy się rytmu i tonu marki przez naśladownictwo.",
        practicalExample: "Q: 'Czy robicie w soboty?' → A: 'Tak, ekipa pomiarowa pracuje również w wybrane soboty. W jakich godzinach najwygodniej byłoby się spotkać?'"
      }
    ],
    whenToUse: [
      "Asystenci handlowi na stronach firm usługowych i produkcyjnych",
      "Kwalifikacja leadów o wysokiej wartości (High-Ticket B2B & B2C)",
      "Automatyzacja wstępnych wycen (meble, remonty, OZE, prawo, medycyna)",
      "Gdy potrzebujesz 100% gwarancji braku zmyślonych obietnic handlowych"
    ],
    beforeAfter: {
      badPrompt: "Jesteś botem na stronie. Odpowiadaj miło i pomagaj klientom w zakupach.",
      badOutput: "Witaj! Jestem sztuczną inteligencją. Chętnie odpowiem na wszelkie Twoje pytania dotyczące mebli, cenników, historii naszej firmy i wszystkiego innego. W czym mogę Ci dzisiaj asystować?",
      goodPrompt: "SPICE System Prompt (Moduły S-P-I-C-E zdefiniowane jak powyżej).",
      goodOutput: "Dzień dobry! Z przyjemnością pomogę w zaplanowaniu realizacji. Standardowe zabudowy kuchenne realizujemy w granicach 14 000 - 28 000 zł z montażem i 5-letnią gwarancją. Jaki orientacyjny wymiar pomieszczenia Pan planuje?",
      explanation: "SPICE eliminuje sztuczne powitania 'jestem sztuczną inteligencją', od razu podaje użyteczną informację rynkową i przejmuje kontrolę nad rozmową jednym naturalnym pytaniem."
    },
    howToDeploy: {
      openAiFormat: `const response = await openai.chat.completions.create({
  model: "gpt-4o",
  temperature: 0.3,
  messages: [
    { role: "system", content: SPICE_SYSTEM_PROMPT },
    { role: "user", content: userMessage }
  ]
});`,
      anthropicFormat: `const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-latest",
  system: SPICE_SYSTEM_PROMPT,
  messages: [{ role: "user", content: userMessage }]
});`,
      rawTemplate: `[S - SECTIONS]: Role: {role_name} | Target: {business_goal}
[P - PARAMETERS]: MaxTokens: 120 | Tone: {tone} | ClosingQuestion: true
[I - INSTRUCTIONS]: 1. Diagnose need -> 2. Provide range -> 3. Request phone
[C - CONTEXT]: Knowledge: {knowledge_base_text}
[E - EXAMPLES]: {few_shot_examples}`
    },
    proTips: [
      "Utrzymuj temperaturę modelu w przedziale 0.2 - 0.4, aby asystent trzymał się faktów z Bazy Wiedzy [C].",
      "Dodaj co najmniej 2-3 przykłady Few-Shot [E] odzwierciedlające najczęstsze obiekcje cenowe Twoich klientów.",
      "W sekcji [P] zdefiniuj regułę: 'Zadawaj tylko JEDNO pytanie na raz', aby nie przytłaczać klienta ankietą."
    ]
  },
  {
    id: "delta",
    name: "DELTA Framework",
    category: "prompting",
    badge: "Metaprompting & Guardrails",
    shortDesc: "Describe, Example, Limitations, Tone, Audience. Perfekcyjne modelowanie stylu, archetypu i twardych ograniczeń.",
    formula: "[D] Opis Celu → [E] Wzorce Stylu → [L] Twarde Ograniczenia → [T] Ton i Archetyp → [A] Profil Klienta",
    howItWorks: "DELTA to framework skupiający się na psychologii interakcji i twardych guardrails (zakazach). Precyzyjnie określa, kim jest odbiorca i czego botowi pod żadnym pozorem nie wolno powiedzieć. Idealny do ochrony wizerunku marki w branżach regulowanych (prawo, finanse, medycyna).",
    systemPromptModifier: `[RAMA SYSTEMOWA: DELTA METAPROMPT]
- DESCRIBE: Twój cel to dynamiczna, uprzejma kwalifikacja potrzeb i pozyskanie kontaktu biznesowego do wyceny.
- EXAMPLE: Styl: profesjonalny, konkretny, empatyczny, bez zbędnych wypełniaczy.
- LIMITATIONS: Zakaz deklarowania nierealistycznych rabatów, zakaz wspominania o modelach bazowych, zakaz zostawiania klienta bez pytania domykającego.
- TONE: Partnerski, ekspercki, wzbudzający pełne zaufanie.
- AUDIENCE: Decydenci, właściciele firm, klienci poszukujący rzetelnych partnerów.`,
    businessBenefit: "100% ochrona wizerunku marki dzięki twardym restrykcjom wypowiedzi.",
    iconName: "Wand2",
    tags: ["Guardrails", "Tożsamość", "Styl", "Bezpieczeństwo"],
    breakdown: [
      { letter: "D", name: "Describe (Cel Biznesowy)", description: "Jasno sformułowany cel każdej sesji rozmowy.", practicalExample: "Zbuduj zaufanie i pobierz telefon do audytu." },
      { letter: "E", name: "Example (Wzorzec Zachowania)", description: "Wzorzec elegancji i profesjonalizmu wypowiedzi.", practicalExample: "Używaj krótkich akapitów i konkretnych liczb." },
      { letter: "L", name: "Limitations (Twarde Zakazy)", description: "Czego bot nie może pod rygorem błędu zrobić.", practicalExample: "Nigdy nie obiecuj 100% wygranej w sądzie bez analizy akt." },
      { letter: "T", name: "Tone (Ton i Archetyp)", description: "Relacja partnerska, poziom empatii i energii.", practicalExample: "Spokojny, opanowany doradca premium." },
      { letter: "A", name: "Audience (Grupa Docelowa)", description: "Charakterystyka osoby po drugiej stronie ekranu.", practicalExample: "Właściciele firm MŚP szukający spokoju prawnego." }
    ],
    whenToUse: ["Kancelarie prawne, doradztwo podatkowe, kliniki medyczne", "Gdy wymagana jest absolutna dyscyplina słowna"],
    beforeAfter: {
      badPrompt: "Bądź prawnikiem i odpowiadaj na pytania.",
      badOutput: "Wygramy tę sprawę bez problemu, pozwijmy ich natychmiast!",
      goodPrompt: "DELTA Prompt z twardą restrykcją [L: zakaz gwarantowania wyroku].",
      goodOutput: "Każda sprawa gospodarcza wymaga weryfikacji dokumentacji źródłowej. Wstępną analizę ryzyka możemy przeprowadzić podczas poufnej konsultacji. Pod jaki numer mecenas może oddzwonić?",
      explanation: "DELTA zabezpiecza firmę przed nieuprawnionymi deklaracjami prawnymi i chroni licencję zawodową."
    },
    howToDeploy: {
      openAiFormat: `// OpenAI DELTA Implementation\nconst prompt = DELTA_PROMPT;`,
      anthropicFormat: `// Anthropic DELTA Implementation\nconst prompt = DELTA_PROMPT;`,
      rawTemplate: `[D]: {desc} | [E]: {example} | [L]: {limits} | [T]: {tone} | [A]: {audience}`
    },
    proTips: ["Zawsze wpisuj w [L] listę zakazanych słów konkurencji."]
  },
  {
    id: "tabula_rasa",
    name: "Tabula Rasa (Czysta Tablica)",
    category: "prompting",
    badge: "Ustrukturyzowany Wywiad",
    shortDesc: "Nie zgaduje w ciemno – bada potrzeby i ładuje domenowy kontekst przed podaniem ceny.",
    formula: "[Zapytanie o cenę] → [Zbadanie 2 kluczowych parametrów] → [Ugruntowanie w realiach] → [Propozycja kalkulacji]",
    howItWorks: "Gdy klient pyta ogólnie o cenę, asystent nie rzuca przypadkowych liczb, lecz zadaje jedno uściślające pytanie o metraż, skalę lub termin, natychmiast budując autorytet fachowca.",
    systemPromptModifier: `[RAMA SYSTEMOWA: TABULA RASA PROTOCOL]
Nigdy nie podawaj pochopnych, jednoznacznych wycen bez zbadania kontekstu. 
Gdy klient zapyta o koszt, podaj bezpieczne widełki orientacyjne i natychmiast zadaj JEDNO pytanie uszczegóławiające (np. o oczekiwany zakres, parametry techniczne lub lokalizację).`,
    businessBenefit: "Klient czuje, że rozmawia z ekspertem, który podchodzi do jego sprawy indywidualnie, a nie z automatem rzucającym losowe stawki.",
    iconName: "FileSpreadsheet",
    tags: ["Kwalifikacja", "Widełki Cenowe", "Discovery", "Autorytet"],
    breakdown: [
      { letter: "1", name: "Pauza Poznawcza", description: "Zamiast zgadywać, zatrzymaj się i zbadaj parametry.", practicalExample: "Zbadaj stan faktyczny." },
      { letter: "2", name: "Widełki Bezpieczne", description: "Podaj szeroki przedział rynkowy.", practicalExample: "Realizacje mieszczą się w przedziale 8k - 20k zł." },
      { letter: "3", name: "Pytanie Diagnostyczne", description: "Zadaj jedno kluczowe pytanie o specyfikację.", practicalExample: "Czy dysponuje Pan projektem technicznym?" }
    ],
    whenToUse: ["Wyceny usług skomplikowanych, budownictwo, software house"],
    beforeAfter: {
      badPrompt: "Odpowiadaj na pytania o cennik.",
      badOutput: "Aplikacja kosztuje 50 000 zł.",
      goodPrompt: "Tabula Rasa Protocol.",
      goodOutput: "Koszt wdrożenia zależy od liczby integracji – zazwyczaj to od 25 do 60 tys. zł dla wersji MVP. Jaki jest główny cel aplikacji?",
      explanation: "Chroni marżę i rozpoczyna profesjonalną dyskusję o zakresie prac."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Zawsze podawaj widełki od-do zamiast jednej kwoty."]
  },
  {
    id: "chain_of_thought",
    name: "Chain of Thought (CoT)",
    category: "prompting",
    badge: "Głębokie Wnioskowanie",
    shortDesc: "Łańcuch myśli krok po kroku – analiza intencji klienta przed sformułowaniem odpowiedzi.",
    formula: "[Analiza intencji] → [Weryfikacja obiekcji] → [Dobór argumentu USP] → [Zwięzła odpowiedź z CTA]",
    howItWorks: "Wymusza na silniku AI przeprowadzenie cichej analizy psychologicznej intencji klienta zanim wygeneruje tekst widoczny w czacie.",
    systemPromptModifier: `[RAMA SYSTEMOWA: CHAIN OF THOUGHT]
Przed sformułowaniem odpowiedzi, w myślach przeprowadź analizę:
1. Jaka jest prawdziwa intencja i ewentualna obawa klienta?
2. Jaki konkretny atut naszej oferty najlepiej rozwiązuje ten dylemat?
3. W jaki sposób najuprzejmiej poprosić o kontakt telefoniczny do przesłania kalkulacji?
Odpowiedź docelowa musi być krótka, czysta i precyzyjna.`,
    businessBenefit: "Zwiększa skuteczność argumentacji o 43% przy trudnych, technicznych lub sceptycznych pytaniach klientów.",
    iconName: "Cpu",
    tags: ["Logika", "Psychologia Sprzedaży", "Wnioskowanie"],
    breakdown: [
      { letter: "C", name: "Cognition (Analiza Intencji)", description: "Rozpoznanie ukrytej obawy lub motywacji.", practicalExample: "Klient boi się opóźnień." },
      { letter: "O", name: "Optimization (Dobór USP)", description: "Wybór najsilniejszego argumentu firmy.", practicalExample: "Gwarancja kary umownej za każdy dzień zwłoki." },
      { letter: "T", name: "Target Action (Domykające CTA)", description: "Zamiana wniosku w naturalną propozycję.", practicalExample: "Zaproponuj bezpłatny harmonogram." }
    ],
    whenToUse: ["Obsługa trudnych obiekcji cenowych i technicznych"],
    beforeAfter: {
      badPrompt: "Odpowiedz dlaczego jesteśmy tacy drodzy.",
      badOutput: "Nie jesteśmy drodzy, mamy wysoką jakość.",
      goodPrompt: "CoT System Framework.",
      goodOutput: "Rozumiem, że budżet jest kluczowy. Wyższa cena wynika z 5-letniej gwarancji i braku podwykonawców z łapanki, co eliminuje poprawki. Czy chciałby Pan zobaczyć porównanie materiałów?",
      explanation: "Przekształca obiekcję w wartość i poczucie bezpieczeństwa."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Stosuj dla zapytań o porównanie z tańszą konkurencją."]
  },
  {
    id: "prompt_chaining",
    name: "Prompt Chaining (Kaskada Zadań)",
    category: "prompting",
    badge: "Wielozadaniowość",
    shortDesc: "Dzielenie skomplikowanych procesów na sekwencyjne mikro-kroki.",
    formula: "Krok 1: Weryfikacja → Krok 2: Kalkulacja wstępna → Krok 3: Rezerwacja terminu / Zapis leada",
    howItWorks: "Zamiast przeciążać jeden prompt wszystkimi regułami świata, asystent realizuje zadania etapami: najpierw identyfikuje problem, potem dopasowuje rozwiązanie, a na końcu pobiera kontakt.",
    systemPromptModifier: `[RAMA SYSTEMOWA: PROMPT CHAINING]
Prowadź klienta przez ścieżkę lejka krok po kroku:
Etap 1: Wysłuchanie i potaknięcie zrozumienia.
Etap 2: Przedstawienie koncepcji rozwiązania.
Etap 3: Bezpośrednie domknięcie i pobranie kontaktu do doradcy technicznego.`,
    businessBenefit: "Zero chaosu w rozmowie – czat zawsze zmierza prostą ścieżką do celu biznesowego.",
    iconName: "GitCommit",
    tags: ["Lejek", "Kaskada", "Struktura"],
    breakdown: [
      { letter: "1", name: "Etap 1: Słuchanie", description: "Potwierdzenie zrozumienia problemu.", practicalExample: "Zrozumiałem zakres zlecenia." },
      { letter: "2", name: "Etap 2: Koncepcja", description: "Przedstawienie zarysu rozwiązania.", practicalExample: "Rekomenduję wariant hybrydowy." },
      { letter: "3", name: "Etap 3: Konwersja", description: "Pozyskanie kontaktu do realizacji.", practicalExample: "Pod jaki numer przesłać kosztorys?" }
    ],
    whenToUse: ["Lejki sprzedażowe o ściśle zdefiniowanych krokach"],
    beforeAfter: {
      badPrompt: "Sprzedaj i zapisz leada natychmiast.",
      badOutput: "Kup teraz i podaj numer telefonu!",
      goodPrompt: "Prompt Chaining Framework.",
      goodOutput: "Świetny wybór. Aby dobrać idealny falownik, musimy sprawdzić nachylenie dachu. Czy to dach skośny czy płaski?",
      explanation: "Prowadzi klienta krok po kroku bez efektu agresywnego telemarketera."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Nie przechodź do kroku 3 przed uzyskaniem odpowiedzi na krok 1."]
  },

  // ─── II. FORMATY COPYWRITERSKIE I STORYTELLING ───────────────────────────
  {
    id: "aida",
    name: "AIDA (Klasyka Perswazji)",
    category: "copywriting",
    badge: "Klasyk Sprzedaży",
    shortDesc: "Attention, Interest, Desire, Action. Lejek sprzedażowy w każdej odpowiedzi.",
    formula: "[A] Haczyk uwagi → [I] Ciekawy fakt/korzyść → [D] Wywołanie pożądania → [A] Wyraźne wezwanie do działania",
    howItWorks: "Każda dłuższa odpowiedź doradcy ma strukturę miniaturowej oferty handlowej: zaczyna się od zrozumienia problemu, podsyca ciekawość i kończy jasnym CTA.",
    systemPromptModifier: `[RAMA SYSTEMOWA: AIDA SALES FRAMEWORK]
Formułuj komunikaty zgodnie z AIDA:
- Attention: Potwierdź zrozumienie wyzwania klienta.
- Interest: Wskaż unikalne podejście technologiczne lub gwarancję.
- Desire: Pokaż spokój i oszczędność czasu/pieniędzy po realizacji.
- Action: Zawsze zaproponuj konkretny kolejny krok (np. przesłanie bezpłatnego kosztorysu).`,
    businessBenefit: "Zwiększa współczynnik konwersji czatu w pozyskany lead nawet o 3.2x.",
    iconName: "TrendingUp",
    tags: ["Sprzedaż", "CTA", "Perswazja", "Lejek"],
    breakdown: [
      { letter: "A", name: "Attention (Uwaga)", description: "Przyciągnięcie uwagi potaknięciem lub trafnym spostrzeżeniem.", practicalExample: "Świetny wybór lokalizacji." },
      { letter: "I", name: "Interest (Zainteresowanie)", description: "Wskazanie unikalnej technologii lub korzyści.", practicalExample: "Nasze pompy redukują rachunki o 60%." },
      { letter: "D", name: "Desire (Pożądanie)", description: "Wizja bezobsługowego ciepła i spokoju na 10 lat.", practicalExample: "Pełny spokój i sterowanie ze smartfona." },
      { letter: "A", name: "Action (Działanie / CTA)", description: "Propozycja bezpłatnego audytu na miejscu.", practicalExample: "Zarezerwuj bezpłatny audyt termiczny." }
    ],
    whenToUse: ["Dedykowany landing page, kampanie Google Ads / Meta Ads"],
    beforeAfter: {
      badPrompt: "Napisz ofertę na pompę ciepła.",
      badOutput: "Pompa ciepła to urządzenie grzewcze. Kosztuje 30 tysięcy. Kup u nas.",
      goodPrompt: "AIDA Persuasion Framework.",
      goodOutput: "Rachunki za ogrzewanie potrafią zaskoczyć. Nowoczesne pompy gruntowe pozwalają obniżyć koszty nawet o 65%, dając pełną niezależność. Chętnie przygotujemy darmowy bilans cieplny dla Państwa domu – pod jaki numer mogę go przesłać?",
      explanation: "AIDA zamienia suchy opis produktu w pociągającą wizję oszczędności."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Zawsze sprawdzaj, czy CTA [Action] jest proste i bezpłatne dla klienta."]
  },
  {
    id: "pas",
    name: "PAS (Problem - Agitate - Solution)",
    category: "copywriting",
    badge: "Emocje & Ból Klienta",
    shortDesc: "Problem, Agitate, Solution. Trafia w sedno bolączki i oferuje natychmiastową ulgę.",
    formula: "[P] Zdiagnozuj ból → [A] Pokaż koszty zaniechania → [S] Przedstaw naszą usługę jako gotowe lekarstwo",
    howItWorks: "Niezwykle silny model psychologiczny. Zamiast mówić o sobie, asystent skupia się na problemie klienta (np. opóźnienia ekip, błędy w umowach) i proponuje bezpieczną alternatywę.",
    systemPromptModifier: `[RAMA SYSTEMOWA: PAS FRAMEWORK]
Stosuj architekturę empatii problemowej:
1. Zidentyfikuj główną obawę klienta (złe wykonanie, ukryte koszty, brak terminowości).
2. Krótko zasygnalizuj, jak wiele stresu to rodzi przy niesprawdzonych wykonawcach.
3. Przedstaw nasze standardy jako gwarancję 100% spokoju i terminowości.`,
    businessBenefit: "Błyskawicznie buduje głębokie zaufanie u klientów zrażonych poprzednimi złymi doświadczeniami.",
    iconName: "ShieldAlert",
    tags: ["Empatia", "Ból Klienta", "Ulga", "Konwersja"],
    breakdown: [
      { letter: "P", name: "Problem", description: "Nazwanie po imieniu trudności klienta.", practicalExample: "Ekipy budowlane znikające z budowy." },
      { letter: "A", name: "Agitate", description: "Podkreślenie kosztów i nerwów.", practicalExample: "Miesiące opóźnień i podwójne koszty poprawek." },
      { letter: "S", name: "Solution", description: "Nasza umowa z gwarancją terminu i karami.", practicalExample: "Pisemna gwarancja terminu z karami na naszą niekorzyść." }
    ],
    whenToUse: ["Branże o niskim zaufaniu do wykonawców: budownictwo, mechanika, prawo"],
    beforeAfter: {
      badPrompt: "Napisz dlaczego jesteśmy lepsi od innych ekip.",
      badOutput: "Inne ekipy to oszuści, my jesteśmy super i solidni.",
      goodPrompt: "PAS Empathy Framework.",
      goodOutput: "Wielu naszych klientów trafia do nas po przykrych doświadczeniach z opóźnieniami innych ekip. Wiemy, ile to kosztuje nerwów. Dlatego u nas każda umowa zawiera twardy termin i karę 500 zł/dzień na naszą niekorzyść, jeśli spóźnimy się choć o 1 dzień. Kiedy planuje Pan start prac?",
      explanation: "Buduje żelazne zaufanie przez twarde deklaracje odpowiedzialności finansowej."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Nigdy nie obrażaj konkurencji – skup się na obronie spokoju klienta."]
  },
  {
    id: "fab",
    name: "FAB (Features - Advantages - Benefits)",
    category: "copywriting",
    badge: "Język Korzyści",
    shortDesc: "Przekłada suchy parametr techniczny na namacalną korzyść w życiu lub portfelu klienta.",
    formula: "[Cecha techniczna] → [Co to daje w praktyce] → [Dlaczego klient na tym realnie zyskuje]",
    howItWorks: "Eliminuje nudny żargon. Gdy mowa o 'profilu 82mm' lub 'audycie 48h', asystent od razu tłumaczy to na 'niższe rachunki o 35%' lub 'bezpieczeństwo podpisania kontraktu bez kar'.",
    systemPromptModifier: `[RAMA SYSTEMOWA: FAB PROTOCOL]
Zawsze tłumacz parametry na język korzyści:
Nigdy nie podawaj samej cechy technicznej bez wyjaśnienia korzyści dla portfela, komfortu lub bezpieczeństwa klienta.`,
    businessBenefit: "Ułatwia podejmowanie decyzji klientom nietechnicznym.",
    iconName: "Sparkles",
    tags: ["Język Korzyści", "B2B", "B2C", "Wyceny"],
    breakdown: [
      { letter: "F", name: "Feature (Cecha)", description: "Suchy fakt techniczny.", practicalExample: "Okucie z 3 uszczelkami i profilem 82mm." },
      { letter: "A", name: "Advantage (Zaleta)", description: "Co ta cecha fizycznie robi.", practicalExample: "Zatrzymuje 98% podmuchów wiatru." },
      { letter: "B", name: "Benefit (Korzyść)", description: "Co to oznacza dla klienta.", practicalExample: "Oszczędzasz 1400 zł rocznie na ogrzewaniu i masz ciszę w sypialni." }
    ],
    whenToUse: ["Sprzedaż produktów technicznych, stolarka, OZE, sprzęt specjalistyczny"],
    beforeAfter: {
      badPrompt: "Opisz nasze okna.",
      badOutput: "Mamy profile 82mm, szklenie trzyszybowe Ug=0.5 i okucia Roto NX.",
      goodPrompt: "FAB Benefit Framework.",
      goodOutput: "Stosujemy pakiety 3-szybowe o współczynniku Ug=0.5. W praktyce oznacza to, że ciepło nie ucieka przez szyby, co pozwala zaoszczędzić nawet 1200 zł na ogrzewaniu każdej zimy. Jakie wymiary okien Państwa interesują?",
      explanation: "Klient natychmiast rozumie, dlaczego warto zapłacić za lepszy wariant."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Zawsze kończ zdanie zwrotem 'co w praktyce oznacza dla Pana...'."]
  },
  {
    id: "bab",
    name: "BAB (Before - After - Bridge)",
    category: "copywriting",
    badge: "Transformacja & Wizja",
    shortDesc: "Przed (chaos i brak czasu) → Po (spokój i gotowy efekt) → Most (nasze wdrożenie).",
    formula: "[Stan Przed] → [Stan Po] → [Most Transformacji]",
    howItWorks: "Rysuje przed klientem wizję udanej realizacji i pokazuje, jak nasza firma stanowi najwygodniejszy most łączący problem z upragnionym rezultatem.",
    systemPromptModifier: `[RAMA SYSTEMOWA: BEFORE-AFTER-BRIDGE]
W rozmowach doradczych akcentuj kontrast między chaosem samodzielnych prób a komfortem kompleksowej obsługi pod klucz.`,
    businessBenefit: "Idealny dla usług premium, gdzie liczy się wygoda i spokój klienta.",
    iconName: "Repeat",
    tags: ["Premium", "Transformacja", "Storytelling"],
    breakdown: [
      { letter: "B", name: "Before", description: "Opis frustrującej rzeczywistości.", practicalExample: "Brak czasu i wieczny bałagan w dokumentach." },
      { letter: "A", name: "After", description: "Wymarzony stan docelowy.", practicalExample: "Wszystko uporządkowane w chmurze w 1 kliknięcie." },
      { letter: "B", name: "Bridge", description: "Nasza usługa jako most.", practicalExample: "Wdrażamy system w 48h bez angażowania Twoich pracowników." }
    ],
    whenToUse: ["Usługi VIP, kompleksowe realizacje 'pod klucz', pakiety all-inclusive"],
    beforeAfter: {
      badPrompt: "Napisz o wykończeniach pod klucz.",
      badOutput: "Malujemy, kładziemy kafelki i panele.",
      goodPrompt: "BAB Transformation Framework.",
      goodOutput: "Zamiast spędzać weekendy w marketach budowlanych i użerać się z 5 różnymi ekipami, wchodzisz do w pełni wykończonego mieszkania pachnącego nowością. Nasz pakiet All-Inclusive to jeden koordynator i gwarancja ceny. Kiedy odbierasz klucze?",
      explanation: "Sprzedaje święty spokój zamiast roboczogodzin."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Używaj zmysłowych opisów stanu 'Po' (np. zapach drewna, cisza, gotowa kawa)."]
  },
  {
    id: "od_do_w",
    name: "OD - DO - W (Haczyk Transformacji)",
    category: "copywriting",
    badge: "Mierzalna Obietnica",
    shortDesc: "Od [zły stan] do [sukces] w [konkretny czas]. Np. 'Od pustego lokalu do gotowej kuchni w 21 dni'.",
    formula: "Od [Stan Początkowy] do [Wymarzony Efekt] w [Mierzalny Czas]",
    howItWorks: "Używa mierzalnych wskaźników czasu i efektu w nagłówkach i wiadomościach powitalnych, drastycznie podnosząc klikalność pierwszego komunikatu.",
    systemPromptModifier: `[RAMA SYSTEMOWA: OD-DO-W FORMULA]
W podsumowaniach i propozycjach operuj mierzalnym czasem realizacji i konkretnymi etapami (np. wstępny kosztorys w 15 minut, pomiar w 48h).`,
    businessBenefit: "Daje klientowi natychmiastowe poczucie kontroli i pewności terminu.",
    iconName: "Clock",
    tags: ["Terminowość", "Haczyk", "Konkret"],
    breakdown: [
      { letter: "OD", name: "Od Czego", description: "Punkt wyjścia klienta.", practicalExample: "Od surowego stanu deweloperskiego." },
      { letter: "DO", name: "Do Czego", description: "Docelowy rezultat.", practicalExample: "Do gotowego wnętrza z meblami." },
      { letter: "W", name: "W Jakim Czasie", description: "Gwarantowany termin.", practicalExample: "W dokładnie 30 dni roboczych." }
    ],
    whenToUse: ["Wiadomości powitalne, widgety czatu, nagłówki landing page"],
    beforeAfter: {
      badPrompt: "Napisz powitanie na czacie.",
      badOutput: "Dzień dobry, w czym mogę pomóc?",
      goodPrompt: "OD-DO-W Welcome Hook.",
      goodOutput: "Dzień dobry! Przeprowadzamy od wstępnego szkicu do gotowej wyceny w 15 minut. O jakiej realizacji myślisz?",
      explanation: "Zwiększa odsetek osób rozpoczynających rozmowę o 64%."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Zawsze podawaj realistyczny czas (np. 15 minut, 48 godzin, 21 dni)."]
  },
  {
    id: "hero_journey",
    name: "Podróż Bohatera (Hero's Journey)",
    category: "copywriting",
    badge: "Głęboki Storytelling",
    shortDesc: "Klient jest bohaterem, my jesteśmy mądrym przewodnikiem (Mentorem) dającym narzędzie do zwycięstwa.",
    formula: "Bohater w opałach → Spotkanie z Przewodnikiem → Otrzymanie Planu → Uniknięcie Porażki → Sukces",
    howItWorks: "Zgodnie z koncepcją StoryBrand i Campbella: firma nigdy nie stawia siebie na piedestale jako bohatera. Bohaterem jest klient, a nasz asystent występuje w roli zaufanego mentora.",
    systemPromptModifier: `[RAMA SYSTEMOWA: HERO'S JOURNEY / STORYBRAND]
Traktuj klienta jako głównego bohatera opowieści. Twoja rola to doświadczony Przewodnik (Mentor), który daje sprawdzony plan działania i zdejmuje z barków bohatera ryzyko błędu.`,
    businessBenefit: "Buduje lojalność i sprawia, że klient czuje się w 100% zrozumiany i zaopiekowany.",
    iconName: "Compass",
    tags: ["StoryBrand", "Mentor", "Autorytet"],
    breakdown: [
      { letter: "1", name: "Bohater", description: "Klient z marzeniem lub problemem.", practicalExample: "Chce zbudować dom bez stresu." },
      { letter: "2", name: "Przewodnik", description: "Nasza firma z doświadczeniem.", practicalExample: "Zbudowaliśmy 240 domów." },
      { letter: "3", name: "Plan", description: "3 proste kroki do sukcesu.", practicalExample: "Projekt -> Kosztorys -> Budowa." }
    ],
    whenToUse: ["Firmy rodzinne, marki osobiste, duże inwestycje życiowe"],
    beforeAfter: {
      badPrompt: "Pochwal się naszą firmą.",
      badOutput: "Jesteśmy liderem rynku od 15 lat, mamy 100 nagród i super maszyny.",
      goodPrompt: "Hero's Journey StoryBrand.",
      goodOutput: "Budowa domu to jedna z najważniejszych decyzji w życiu. Jako Twój doradca zadbam o to, byś przeszedł przez ten proces bezpiecznie, unikając błędów wykonawczych. Przejdźmy przez 3 proste kroki planu.",
      explanation: "Przenosi światło reflektorów z 'naszej firmy' na 'bezpieczeństwo klienta'."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Nigdy nie pisz 'My jesteśmy najlepsi' – pisz 'Zadbam o Twój spokój'."]
  },

  // ─── III. BADANIE POTRZEB I ANALIZA ODBIORCÓW ───────────────────────────
  {
    id: "five_whys",
    name: "5 Whys (Toyota Deep Discovery)",
    category: "discovery",
    badge: "Głębokie Badanie Przyczyn",
    shortDesc: "Pięć poziomów dociekania, by odkryć prawdziwą motywację i ukryte lęki zakupowe.",
    formula: "Objaw → Przyczyna 1 → Przyczyna 2 → Przyczyna 3 → Prawdziwa Motywacja Zakupowa",
    howItWorks: "Gdy klient podaje powierzchowne wymaganie, asystent zadaje dociekliwe pytania pomagające zdiagnozować źródło problemu, rekomendując idealne rozwiązanie.",
    systemPromptModifier: `[RAMA SYSTEMOWA: 5 WHYS DISCOVERY]
Dąż do zrozumienia głębszego celu klienta. Jeśli prosi o nietypowe rozwiązanie, dopytaj uprzejmie, jaki efekt końcowy chce osiągnąć, aby dobrać najbardziej opłacalną technologię.`,
    businessBenefit: "Pozwala na dosprzedaż wyższych pakietów (Upselling) opartych o rzeczywistą wartość.",
    iconName: "HelpCircle",
    tags: ["Analiza", "Discovery", "Upselling"],
    breakdown: [
      { letter: "W1", name: "Why 1 (Objaw)", description: "Co klient zgłasza.", practicalExample: "Szukam taniej klimatyzacji." },
      { letter: "W2", name: "Why 2 (Przyczyna)", description: "Dlaczego akurat teraz.", practicalExample: "W sypialni jest za gorąco." },
      { letter: "W3", name: "Why 3 (Sedno)", description: "Prawdziwa potrzeba.", practicalExample: "Dziecko nie może spać w nocy." }
    ],
    whenToUse: ["Doradztwo techniczne, sprzęt AGD/HVAC, oprogramowanie dedykowane"],
    beforeAfter: {
      badPrompt: "Klient pyta o najtańszą klimatyzację.",
      badOutput: "Oto najtańsza klima za 1200 zł.",
      goodPrompt: "5 Whys Discovery Framework.",
      goodOutput: "Chętnie dobiorę ekonomiczny model. Aby urządzenie nie hałasowało w nocy i nie generowało wysokich rachunków za prąd – w jakim pomieszczeniu ma pracować?",
      explanation: "Odkrywa potrzebę cichej pracy, chroniąc przed zakupem złego urządzenia."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Zadawaj pytania z empatią, by klient nie poczuł się przesłuchiwany."]
  },
  {
    id: "five_w_h",
    name: "5W + H (Kompleksowa Kwalifikacja)",
    category: "discovery",
    badge: "Pełny Audyt Klienta",
    shortDesc: "Who, What, When, Where, Why, How. Kompletna mapa projektu w 3 minuty rozmowy.",
    formula: "Kto decyduje? + Co jest do zrobienia? + Kiedy termin? + Gdzie lokalizacja? + Dlaczego teraz? + Jaki budżet?",
    howItWorks: "Automatycznie zbiera kompletny brief projektowy gotowy do przekazania handlowcom w CRM.",
    systemPromptModifier: `[RAMA SYSTEMOWA: 5W+H QUALIFICATION]
W trakcie konwersacji skompletuj profil leada:
- Zakres zadania (What)
- Pożądany termin (When)
- Miejsce realizacji (Where)
- Kluczowy priorytet (Why)
Po zebraniu tych danych poproś o numer telefonu do przekazania gotowego briefu.`,
    businessBenefit: "Handlowiec dzwoni do klienta z gotową wiedzą – czas zamknięcia sprzedaży skraca się o 60%.",
    iconName: "ClipboardCheck",
    tags: ["Kwalifikacja", "CRM", "Brief", "B2B"],
    breakdown: [
      { letter: "Who", name: "Kto", description: "Osoba decyzyjna.", practicalExample: "Właściciel mieszkania." },
      { letter: "What", name: "Co", description: "Dokładny zakres prac.", practicalExample: "Remont łazienki 6m2." },
      { letter: "When", name: "Kiedy", description: "Termin rozpoczęcia.", practicalExample: "Za miesiąc." },
      { letter: "Where", name: "Gdzie", description: "Miasto i dzielnica.", practicalExample: "Warszawa Mokotów." },
      { letter: "Why", name: "Dlaczego", description: "Priorytet klienta.", practicalExample: "Chce zdążyć przed narodzinami dziecka." }
    ],
    whenToUse: ["Formularze wycen, integracje z CRM, zlecenia remontowe i B2B"],
    beforeAfter: {
      badPrompt: "Zbieraj dane do wyceny.",
      badOutput: "Podaj: Imię, Nazwisko, Adres, Metraż, Budżet, Termin.",
      goodPrompt: "5W+H Conversational Flow.",
      goodOutput: "Dzień dobry! Z przyjemnością przygotuję wycenę. W jakiej lokalizacji planowana jest inwestycja i na kiedy chcieliby Państwo zakończyć prace?",
      explanation: "Pobiera dane w formie naturalnego dialogu, nie nużącej ankiety."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Grupuj pytania po 2, aby dialog był płynny."]
  },
  {
    id: "bluf",
    name: "BLUF (Bottom Line Up Front)",
    category: "discovery",
    badge: "Wojskowa Zwięzłość",
    shortDesc: "Kluczowa konkluzja na samym początku zdania. Zero lania wody, maksimum wartości.",
    formula: "[Kluczowa informacja w pierwszym zdaniu] → [Krótkie uzasadnienie] → [Pytanie]",
    howItWorks: "Standard zaczerpnięty z procedur operacyjnych. Klient od pierwszej sekundy otrzymuje konkretną odpowiedź, co redukuje szum informacyjny i buduje szacunek do jego czasu.",
    systemPromptModifier: `[RAMA SYSTEMOWA: BLUF STANDARD]
Zastosuj zasadę Bottom Line Up Front:
W pierwszym zdaniu podaj bezpośrednią odpowiedź lub kluczowy wniosek. Nie buduj wielopiętrowych wstępów. Dopiero potem rozwiń kontekst w maksymalnie 2 zdaniach.`,
    businessBenefit: "Idealne dla zapracowanych menedżerów i osób przeglądających oferty na smartfonach w biegu.",
    iconName: "Target",
    tags: ["Zwięzłość", "VIP", "Mobile-First"],
    breakdown: [
      { letter: "B", name: "Bottom Line", description: "Konkretna odpowiedź w zdaniu 1.", practicalExample: "Tak, realizujemy montaże w 48h." },
      { letter: "L", name: "Logic", description: "Krótkie uzasadnienie.", practicalExample: "Mamy wolną ekipę w Państwa rejonie." },
      { letter: "U", name: "Action", description: "Pytanie o kolejny krok.", practicalExample: "Czy czwartek 10:00 Panu odpowiada?" }
    ],
    whenToUse: ["Mobilne widgety czatu, klienci B2B, prezesi firm"],
    beforeAfter: {
      badPrompt: "Odpowiedz czy mamy wolne terminy.",
      badOutput: "Dziękujemy za zapytanie. Nasza firma posiada rozbudowany grafik i staramy się wychodzić naprzeciw oczekiwaniom, sprawdzając w systemie...",
      goodPrompt: "BLUF Executive Framework.",
      goodOutput: "Tak, najbliższy wolny termin na pomiar mamy w ten czwartek. Czy godzina 11:00 będzie dla Pana dogodna?",
      explanation: "Oszczędza czas klienta i natychmiast rezerwuje termin spotkania."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Nigdy nie zaczynaj od 'Dziękuję za zadanie tego wspaniałego pytania'."]
  },

  // ─── IV. KWALIFIKACJA BIZNESOWA I ZARZĄDZANIE ───────────────────────────
  {
    id: "ricks",
    name: "RICKS (RiGCz / RCTs Framework)",
    category: "business",
    badge: "Kwalifikacja ROI",
    shortDesc: "Relevant, Impactful, Grounded in data, Compatible. Twarda ocena sensu biznesowego.",
    formula: "Istotność strategiczna + Wymierność korzyści + Oparcie w twardych danych + Zgodność z IT",
    howItWorks: "Ocenia zapytania pod kątem ich realnego zwrotu z inwestycji (ROI). Odrzuca bezwartościowy spam i skupia energię na najbardziej dochodowych projektach.",
    systemPromptModifier: `[RAMA SYSTEMOWA: RICKS EVALUATION]
Kwalifikuj zapytania pod kątem skali i wykonalności. Weryfikuj, czy klient dysponuje realnym budżetem i harmonogramem, proponując dedykowane konsultacje dla poważnych przedsięwzięć.`,
    businessBenefit: "Filtruje zapytania 'zbieraczy ofert' i kieruje do zespołu handlowego wyłącznie gotowych do zakupu decydentów.",
    iconName: "Scale",
    tags: ["Kwalifikacja B2B", "ROI", "Filtrowanie"],
    breakdown: [
      { letter: "R", name: "Relevant", description: "Czy projekt pasuje do profilu firmy.", practicalExample: "Budżet min. 20k zł." },
      { letter: "I", name: "Impact", description: "Czy da wymierny zwrot.", practicalExample: "Oszczędność min. 30% kosztów." },
      { letter: "G", name: "Grounded", description: "Czy mamy twarde case studies.", practicalExample: "Podobne wdrożenie dla branży X." }
    ],
    whenToUse: ["Wdrożenia Enterprise, duże kontrakty B2B, Software House"],
    beforeAfter: {
      badPrompt: "Bierz każdego klienta jak leci.",
      badOutput: "Zrobimy wszystko dla każdego za dowolną kwotę.",
      goodPrompt: "RICKS Qualification Protocol.",
      goodOutput: "Specjalizujemy się w projektach od 30 000 zł, gdzie możemy zagwarantować pełny zwrot w 6 miesięcy. Jaka jest skala Państwa obecnych procesów?",
      explanation: "Chroni zespół przed nieopłacalnymi zleceniami."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Ustaw progi budżetowe w system promptcie."]
  },
  {
    id: "adkar",
    name: "ADKAR (Zarządzanie Zaufaniem)",
    category: "business",
    badge: "Wdrażanie Zmiany",
    shortDesc: "Awareness, Desire, Knowledge, Ability, Reinforcement. Prowadzi sceptycznego klienta za rękę.",
    formula: "Świadomość potrzeby → Chęć zmiany → Wiedza jak to zrobić → Sprawność realizacji → Trwały spokój",
    howItWorks: "Rozbraja opór przed nowymi technologiami lub skomplikowaną procedurą, krok po kroku budując gotowość klienta do podjęcia współpracy.",
    systemPromptModifier: `[RAMA SYSTEMOWA: ADKAR MODEL]
Jeśli klient wyraża obawy przed skomplikowaniem procedury, przeprowadź go przez proces: wyjaśnij prostotę kroków, wskaż, że całą trudną pracę wykonujemy my, i zapewnij o pełnym wsparciu.`,
    businessBenefit: "Zmniejsza wskaźnik rezygnacji klienta (Drop-off) w trakcie rozmowy o 55%.",
    iconName: "ShieldCheck",
    tags: ["Zaufanie", "Onboarding", "Bezpieczeństwo"],
    breakdown: [
      { letter: "A", name: "Awareness", description: "Zrozumienie dlaczego zmiana jest konieczna.", practicalExample: "Stary piec generuje koszty." },
      { letter: "D", name: "Desire", description: "Chęć posiadania nowoczesnego rozwiązania.", practicalExample: "Dotacja 80% do końca miesiąca." },
      { letter: "K", name: "Knowledge", description: "Proste wyjaśnienie kroków.", practicalExample: "Wypełniamy wszystkie wnioski za Ciebie." }
    ],
    whenToUse: ["Programy dotacji (Czyste Powietrze, Mój Prąd), skomplikowane finanse"],
    beforeAfter: {
      badPrompt: "Napisz jak dostać dotację.",
      badOutput: "Musisz wypełnić 40 stron formularza w WFOŚiGW i czekać 6 miesięcy.",
      goodPrompt: "ADKAR Trust Building Framework.",
      goodOutput: "Formalności przy dotacjach bywają skomplikowane, dlatego bierzemy je w 100% na siebie. Nasz doradca bezpłatnie zweryfikuje przysługującą kwotę (nawet do 136 000 zł) i złoży wniosek za Państwa. Pod jaki numer możemy przekazać wyliczenie?",
      explanation: "Zdejmuje cały ciężar biurokracji z barków klienta."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Zawsze podkreślaj: 'My zajmujemy się całą procedurą'."]
  },
  {
    id: "rfm",
    name: "RFM (Recency - Frequency - Monetary)",
    category: "business",
    badge: "Segmentacja VIP",
    shortDesc: "Klasyfikacja wartości klienta: kiedy kupił, jak często, jaki generuje budżet.",
    formula: "Świeżość kontaktu (R) + Częstotliwość (F) + Wartość koszyka (M)",
    howItWorks: "Rozpoznaje stałych klientów oraz zapytania o wysokim wolumenie finansowym, automatycznie nadając im priorytet VIP.",
    systemPromptModifier: `[RAMA SYSTEMOWA: RFM SEGMENTATION]
Identyfikuj zapytania o wysokiej skali budżetowej (High Ticket). W takich przypadkach oferuj dedykowanego opiekuna i bezpośredni kontakt do dyrektora realizacji.`,
    businessBenefit: "Maksymalizuje marżę na kluczowych kontraktach B2B.",
    iconName: "Landmark",
    tags: ["Segmentacja", "High-Ticket", "VIP"],
    breakdown: [
      { letter: "R", name: "Recency", description: "Jak szybko klient reaguje.", practicalExample: "Kontakt w 5 minut po zapytaniu." },
      { letter: "F", name: "Frequency", description: "Czy to stały partner.", practicalExample: "Trzecia inwestycja w tym roku." },
      { letter: "M", name: "Monetary", description: "Skala budżetu.", practicalExample: "Projekt powyżej 100 000 zł." }
    ],
    whenToUse: ["Baza stałych klientów, deweloperzy, hurtownie"],
    beforeAfter: {
      badPrompt: "Obsługuj klientów tak samo.",
      badOutput: "Czekaj w kolejce jak każdy.",
      goodPrompt: "RFM VIP Priority Framework.",
      goodOutput: "Jako inwestor realizujący kolejny projekt, otrzymuje Pan u nas dedykowanego opiekuna technicznego i gwarancję dostępności ekipy w 7 dni. Przełączam kontakt do dyrektora operacyjnego.",
      explanation: "Daje decydentom poczucie statusu VIP i przyspiesza transakcje."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Stosuj dedykowane tagi CRM dla leadów powyżej określonego progu."]
  },

  // ─── V. ARCHITEKTURA AGENTOWA I UI/UX ─────────────────────────────────────
  {
    id: "react_agent",
    name: "ReAct Agent (Reason & Act)",
    category: "architecture",
    badge: "Autonomia Decyzyjna",
    shortDesc: "Ciągła pętla: Rozumowanie → Działanie → Obserwacja skutków → Korekta strategii.",
    formula: "Thought (Myśl) → Action (Działanie) → Observation (Weryfikacja) → Refinement (Korekta)",
    howItWorks: "Silnik zachowuje się jak autonomiczny agent: sprawdza czy klient podał kompletny numer, weryfikuje poprawność kodu pocztowego i na bieżąco koryguje pytania.",
    systemPromptModifier: `[RAMA SYSTEMOWA: ReAct AUTONOMOUS LOOP]
Działaj w pętli ReAct:
1. Oceń czy wypowiedź klienta zawiera dane kontaktowe lub specyfikację techniczną.
2. Jeśli numer jest niepełny, uprzejmie poproś o poprawienie.
3. Jeśli dane są kompletne, natychmiast potwierdź ich bezpieczne przyjęcie.`,
    businessBenefit: "Zero błędów w zapisywanych numerach telefonów i adresach w bazie CRM.",
    iconName: "Activity",
    tags: ["Agent AI", "Walidacja", "Autonomia"],
    breakdown: [
      { letter: "T", name: "Thought", description: "Ocena stanu obecnego danych.", practicalExample: "Numer ma 8 cyfr - brakuje 1 cyfry." },
      { letter: "A", name: "Action", description: "Wykonanie akcji weryfikującej.", practicalExample: "Zadaj pytanie uściślające." },
      { letter: "O", name: "Observation", description: "Otrzymanie uzupełnionych danych.", practicalExample: "Numer zweryfikowany poprawnie." }
    ],
    whenToUse: ["Zaawansowane chatboty zbierające dane do CRM, kalkulatory online"],
    beforeAfter: {
      badPrompt: "Zapisz numer.",
      badOutput: "Dzięki za numer 500123. (brakujący ciąg cyfr)",
      goodPrompt: "ReAct Validation Agent.",
      goodOutput: "Dziękuję! Wygląda na to, że w numerze brakuje jednej cyfry (podano 8 cyfr). Czy mógłby Pan sprawdzić i podać pełny 9-cyfrowy numer?",
      explanation: "Zapobiega utracie cennego leada przez literówkę klienta."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Używaj regexu do weryfikacji numerów w locie."]
  },
  {
    id: "frame_mvp",
    name: "FRAME Framework (Fast MVP)",
    category: "architecture",
    badge: "Wdrożenie w 24h",
    shortDesc: "Formulate, Render, Attach, Mock, Enable. Od koncepcji do działającego bota pod własną domeną.",
    formula: "[F] Specyfikacja → [R] Wyrenderowanie UI → [A] Podpięcie Logiki → [M] Testy Live → [E] Wdrożenie",
    howItWorks: "Standard błyskawicznego prototypowania i uruchamiania asystenta na dowolnej stronie www w postaci 1 linijki kodu embed.",
    systemPromptModifier: `[RAMA SYSTEMOWA: FRAME ARCHITECTURE]
Prezentuj rozwiązania w sposób gotowy do wdrożenia bez zbędnego czekania. Akcentuj natychmiastową dostępność i łatwość uruchomienia.`,
    businessBenefit: "Uruchomienie asystenta na stronie klienta w mniej niż 15 minut.",
    iconName: "Zap",
    tags: ["Wdrożenie", "Embed", "SaaS"],
    breakdown: [
      { letter: "F", name: "Formulate", description: "Wybór branży i persony.", practicalExample: "Doradca kuchni na wymiar." },
      { letter: "R", name: "Render", description: "Dopasowanie kolorów i stylu widgetu.", practicalExample: "Styl WhatsApp z avatarem." },
      { letter: "E", name: "Enable", description: "Wklejenie 1 linijki kodu na www.", practicalExample: "<script src='aura.js'></script>" }
    ],
    whenToUse: ["Błyskawiczne wdrożenia dla klientów agencji marketingowych"],
    beforeAfter: {
      badPrompt: "Buduj bota 3 miesiące.",
      badOutput: "Czekaj na specyfikację i serwery.",
      goodPrompt: "FRAME Rapid Deployment.",
      goodOutput: "Gotowy widget generuje się w 5 sekund i działa na każdej stronie www od razu.",
      explanation: "Oszczędza tysiące złotych na programistach i serwerach."
    },
    howToDeploy: { openAiFormat: "", anthropicFormat: "", rawTemplate: "" },
    proTips: ["Zawsze przetestuj działanie na telefonie przed uruchomieniem kampanii."]
  }
];

export const FRAMEWORK_CATEGORIES = [
  { id: "all", label: "Wszystkie Metodologie (16)" },
  { id: "prompting", label: "I. Inżynieria Promptów & Rola" },
  { id: "copywriting", label: "II. Perswazja & Storytelling" },
  { id: "discovery", label: "III. Badanie Potrzeb (Discovery)" },
  { id: "business", label: "IV. Kwalifikacja & Biznes" },
  { id: "architecture", label: "V. Architektura Agentowa" }
];

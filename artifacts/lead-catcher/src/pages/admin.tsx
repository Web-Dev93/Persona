import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  useListAdminLeads,
  useGetAdminLead,
  useDeleteAdminLead,
  useSummarizeLead,
  useGetAdminSettings,
  useUpdateAdminSettings,
  useListPersonas,
  useCreatePersona,
  useUpdatePersona,
  useDeletePersona,
  useActivatePersona,
  Persona
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
  Loader2, Trash2, MessageSquare, ArrowLeft, ImagePlus,
  CheckCircle2, Sparkles, Clock, Plus, UserCircle2, Zap, Edit2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import consultantPlaceholder from "../assets/consultant-default.jpg";
import { useQueryClient } from "@tanstack/react-query";

// ─── Lead detail ─────────────────────────────────────────────────────────────

function LeadDetailPanel({ leadId, onClose }: { leadId: number; onClose: () => void }) {
  const { data: lead, isLoading } = useGetAdminLead(leadId);
  const deleteLead = useDeleteAdminLead();
  const summarizeLead = useSummarizeLead();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć ten lead?")) return;
    try {
      await deleteLead.mutateAsync({ id: leadId });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "Lead usunięty" });
      onClose();
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  const handleSummarize = async () => {
    try {
      await summarizeLead.mutateAsync({ id: leadId });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/leads/${leadId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "Podsumowanie wygenerowane" });
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  if (isLoading || !lead) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{lead.title || "Nowy Lead"}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {format(new Date(lead.createdAt), "dd MMM yyyy, HH:mm")}
            <span className="text-border">•</span>
            {lead.messageCount} wiadomości
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lead.completed && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Zakończony
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-12">
        <section className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-primary">Podsumowanie AI</h3>
          </div>
          {lead.summary ? (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {lead.summary.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Brak podsumowania.</p>
              <Button onClick={handleSummarize} disabled={summarizeLead.isPending}>
                {summarizeLead.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generuj podsumowanie
              </Button>
            </div>
          )}
        </section>

        <section>
          <h3 className="font-medium text-primary mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Transkrypcja ({lead.messages?.length || 0})
          </h3>
          <div className="space-y-4">
            {lead.messages?.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm shadow-sm
                  ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"}`}
                >
                  <p className="text-xs opacity-50 mb-1 font-mono uppercase tracking-wider">
                    {msg.role === "user" ? "Klient" : "Persona"}
                  </p>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Persona form ─────────────────────────────────────────────────────────────

interface PersonaFormData {
  name: string;
  title: string;
  photoUrl: string | null;
  systemPrompt: string;
}

function PersonaFormModal({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: PersonaFormData;
  onSave: (data: PersonaFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<PersonaFormData>(initial);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const res = await fetch("/api/admin/persona-photo-upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(f => ({ ...f, photoUrl: data.photoUrl }));
      toast({ title: "Zdjęcie wgrane" });
    } catch {
      toast({ title: "Błąd uploadu", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          <h3 className="text-lg font-semibold">{initial.name ? `Edytuj personę` : "Nowa persona"}</h3>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={form.photoUrl || consultantPlaceholder} className="object-cover" />
              <AvatarFallback className="text-xl">{form.name.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handlePhotoUpload} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-1" />}
                Zdjęcie
              </Button>
              {form.photoUrl && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setForm(f => ({ ...f, photoUrl: null }))}>
                  Usuń
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Imię persony *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="np. Ania, Tomek..." />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Rola / Opis (widoczny dla klienta)</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="np. online, Konsultantka ds. stron..." />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">System prompt (instrukcja dla AI) *</label>
              <Textarea
                value={form.systemPrompt}
                onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
                className="min-h-[180px] font-mono text-xs"
                placeholder="Jesteś Anią — miłą konsultantką, która rozmawia z klientami o ich potrzebach dotyczących strony internetowej..."
              />
              <p className="text-xs text-muted-foreground mt-1">Napisz jak AI ma się zachowywać, jaką rolę odgrywa i o czym ma rozmawiać z klientem.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>Anuluj</Button>
            <Button onClick={() => onSave(form)} disabled={isSaving || !form.name.trim() || !form.systemPrompt.trim()}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Zapisz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Personas tab ─────────────────────────────────────────────────────────────

function PersonasTab() {
  const { data: personas, isLoading } = useListPersonas();
  const createPersona = useCreatePersona();
  const updatePersona = useUpdatePersona();
  const deletePersona = useDeletePersona();
  const activatePersona = useActivatePersona();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const emptyForm: PersonaFormData = {
    name: "",
    title: "",
    photoUrl: null,
    systemPrompt: ""
  };

  const handleSave = async (data: PersonaFormData) => {
    setIsSaving(true);
    try {
      if (editingPersona) {
        await updatePersona.mutateAsync({ id: editingPersona.id, data: { name: data.name, title: data.title, photoUrl: data.photoUrl, systemPrompt: data.systemPrompt } });
        toast({ title: "Persona zaktualizowana" });
      } else {
        await createPersona.mutateAsync({ data: { name: data.name, title: data.title, photoUrl: data.photoUrl, systemPrompt: data.systemPrompt } });
        toast({ title: "Persona dodana" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personas/active"] });
      setShowForm(false);
      setEditingPersona(null);
    } catch {
      toast({ title: "Błąd zapisu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Usunąć tę personę?")) return;
    try {
      await deletePersona.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personas/active"] });
      toast({ title: "Persona usunięta" });
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activatePersona.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personas/active"] });
      toast({ title: "Persona aktywowana — klienci zobaczą nową personę" });
    } catch {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Persony</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stwórz różne persony — konsultanta, mechanika, prawnika — i przełączaj je jednym kliknięciem.
            Aktywna persona przejmuje rozmowę z klientem.
          </p>
        </div>
        <Button onClick={() => { setEditingPersona(null); setShowForm(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nowa persona
        </Button>
      </div>

      {(!personas || personas.length === 0) ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
          <UserCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-medium">Brak person</h3>
          <p className="text-muted-foreground mt-1 mb-4 text-sm max-w-sm mx-auto">
            Dodaj pierwszą personę, żeby zacząć zbierać leady w stylu prywatnej rozmowy.
          </p>
          <Button variant="outline" onClick={() => { setEditingPersona(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Dodaj pierwszą personę
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {personas.map(persona => (
            <Card key={persona.id} className={`relative transition-all ${persona.isActive ? "border-primary shadow-md ring-1 ring-primary/20" : "hover:border-primary/30 hover:shadow"}`}>
              {persona.isActive && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                    <Zap className="w-2.5 h-2.5 mr-1" /> AKTYWNA
                  </Badge>
                </div>
              )}
              <CardContent className="pt-5 pb-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14 border-2 border-border shrink-0">
                    <AvatarImage src={persona.photoUrl || consultantPlaceholder} className="object-cover" />
                    <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                      {persona.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-base truncate">{persona.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{persona.title || "—"}</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-3">
                    {persona.systemPrompt || <span className="opacity-40 italic">Brak prompta</span>}
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  {!persona.isActive && (
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleActivate(persona.id)}
                      disabled={activatePersona.isPending}
                    >
                      {activatePersona.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
                      Aktywuj
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`text-xs ${persona.isActive ? "flex-1" : ""}`}
                    onClick={() => { setEditingPersona(persona); setShowForm(true); }}
                  >
                    <Edit2 className="w-3 h-3 mr-1" /> Edytuj
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 text-xs px-2"
                    onClick={() => handleDelete(persona.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <PersonaFormModal
          initial={editingPersona ? {
            name: editingPersona.name,
            title: editingPersona.title,
            photoUrl: editingPersona.photoUrl ?? null,
            systemPrompt: editingPersona.systemPrompt
          } : emptyForm}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPersona(null); }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { data: settings, isLoading } = useGetAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [systemPrompt, setSystemPrompt] = useState("");
  const [consultantName, setConsultantName] = useState("");
  const [consultantTitle, setConsultantTitle] = useState("");
  const [consultantPhotoUrl, setConsultantPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setSystemPrompt(settings.systemPrompt);
      setConsultantName(settings.consultantName);
      setConsultantTitle(settings.consultantTitle);
      setConsultantPhotoUrl(settings.consultantPhotoUrl || null);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({ data: { systemPrompt, consultantName, consultantTitle, consultantPhotoUrl } });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Ustawienia zapisane" });
    } catch {
      toast({ title: "Błąd zapisu", variant: "destructive" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const res = await fetch("/api/admin/photo-upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConsultantPhotoUrl(data.photoUrl);
      toast({ title: "Zdjęcie wgrane" });
    } catch {
      toast({ title: "Błąd uploadu", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Domyślny System Prompt (fallback)</CardTitle>
            <CardDescription>
              Używany gdy żadna persona nie jest aktywna. Jeśli masz aktywną personę, jej prompt ma pierwszeństwo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Jesteś ekspertem IT..."
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Domyślny Profil</CardTitle>
            <CardDescription>
              Fallback gdy żadna persona nie jest aktywna.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="w-24 h-24 border-2 border-border shadow-sm">
                <AvatarImage src={consultantPhotoUrl || consultantPlaceholder} className="object-cover" />
                <AvatarFallback>DK</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                  Zmień zdjęcie
                </Button>
                {consultantPhotoUrl && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConsultantPhotoUrl(null)}>
                    Usuń
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Imię i nazwisko</label>
              <Input value={consultantName} onChange={e => setConsultantName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stanowisko</label>
              <Input value={consultantTitle} onChange={e => setConsultantTitle(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="w-full" disabled={updateSettings.isPending}>
              {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Zapisz ustawienia
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: leads, isLoading } = useListAdminLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  return (
    <div className="min-h-[100dvh] bg-muted/30">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Wróć do czatu
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="font-semibold text-lg text-primary tracking-tight">Panel Administracyjny</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="personas" className="w-full">
          <TabsList className="mb-8 p-1 bg-card border rounded-lg">
            <TabsTrigger value="personas" className="rounded-md px-6">Persony</TabsTrigger>
            <TabsTrigger value="leads" className="rounded-md px-6">Leady</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md px-6">Ustawienia</TabsTrigger>
          </TabsList>

          <TabsContent value="personas" className="m-0">
            <PersonasTab />
          </TabsContent>

          <TabsContent value="leads" className="m-0">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : leads?.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Brak leadów</h3>
                <p className="text-muted-foreground mt-1">Gdy ktoś napisze na czacie, pojawi się tutaj.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {leads?.map(lead => (
                  <Sheet key={lead.id} open={selectedLeadId === lead.id} onOpenChange={(open) => !open && setSelectedLeadId(null)}>
                    <SheetTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]" onClick={() => setSelectedLeadId(lead.id)}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant={lead.completed ? "default" : "outline"} className={lead.completed ? "bg-primary text-primary-foreground" : "text-muted-foreground"}>
                              {lead.completed ? "Zakończony" : "W toku"}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {format(new Date(lead.createdAt), "dd.MM.yyyy")}
                            </span>
                          </div>
                          <CardTitle className="text-lg line-clamp-1">{lead.title || "Nowy Lead"}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {lead.messageCount} wiadomości
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {lead.summary ?? "Brak podsumowania. Kliknij aby wygenerować."}
                          </p>
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    {selectedLeadId === lead.id && (
                      <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l-0 shadow-2xl p-6 sm:p-8 flex flex-col">
                        <LeadDetailPanel leadId={lead.id} onClose={() => setSelectedLeadId(null)} />
                      </SheetContent>
                    )}
                  </Sheet>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

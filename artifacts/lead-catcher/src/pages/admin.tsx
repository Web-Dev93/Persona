import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import {
  useListAdminLeads,
  useGetAdminLead,
  useDeleteAdminLead,
  useSummarizeLead,
  useGetAdminSettings,
  useUpdateAdminSettings
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, ChevronRight, MessageSquare, ArrowLeft, ImagePlus, CheckCircle2, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import consultantPlaceholder from "../assets/consultant-default.jpg";
import { useQueryClient } from "@tanstack/react-query";

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
    } catch (e) {
      toast({ title: "Błąd", variant: "destructive" });
    }
  };

  const handleSummarize = async () => {
    try {
      await summarizeLead.mutateAsync({ id: leadId });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/leads/${leadId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "Podsumowanie wygenerowane" });
    } catch (e) {
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
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Zakończony
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-12">
        {/* Summary Section */}
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
              <p className="text-sm text-muted-foreground mb-4">Brak podsumowania dla tej rozmowy.</p>
              <Button onClick={handleSummarize} disabled={summarizeLead.isPending}>
                {summarizeLead.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generuj podsumowanie
              </Button>
            </div>
          )}
        </section>

        {/* Transcript Section */}
        <section>
          <h3 className="font-medium text-primary mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Transkrypcja ({lead.messages?.length || 0})
          </h3>
          <div className="space-y-4">
            {lead.messages?.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm shadow-sm
                    ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }
                  `}
                >
                  <p className="text-xs opacity-50 mb-1 font-mono uppercase tracking-wider">
                    {msg.role === "user" ? "Klient" : "Doradca"}
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
      await updateSettings.mutateAsync({
        data: {
          systemPrompt,
          consultantName,
          consultantTitle,
          consultantPhotoUrl
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Ustawienia zapisane", description: "Zmiany zostały pomyślnie zaktualizowane." });
    } catch (e) {
      toast({ title: "Błąd", description: "Nie udało się zapisać ustawień.", variant: "destructive" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/admin/photo-upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setConsultantPhotoUrl(data.photoUrl);
      toast({ title: "Zdjęcie wgrane" });
    } catch (err) {
      toast({ title: "Błąd", description: "Nie udało się wgrać zdjęcia.", variant: "destructive" });
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
            <CardTitle>System Prompt (Instrukcja dla AI)</CardTitle>
            <CardDescription>
              Skonfiguruj w jaki sposób doradca AI ma się komunikować z potencjalnymi klientami.
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
            <CardTitle>Profil Doradcy</CardTitle>
            <CardDescription>
              Informacje widoczne dla klienta podczas czatu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="w-24 h-24 border-2 border-border shadow-sm">
                <AvatarImage src={consultantPhotoUrl || consultantPlaceholder} className="object-cover" />
                <AvatarFallback>DK</AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                  Zmień zdjęcie
                </Button>
                {consultantPhotoUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setConsultantPhotoUrl(null)}
                  >
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
          <CardFooter className="pt-2">
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
        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="mb-8 p-1 bg-card border rounded-lg">
            <TabsTrigger value="leads" className="rounded-md px-6">Leady</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md px-6">Ustawienia bota</TabsTrigger>
          </TabsList>

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
                            {lead.summary ? lead.summary : "Brak podsumowania. Kliknij aby wygenerować."}
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

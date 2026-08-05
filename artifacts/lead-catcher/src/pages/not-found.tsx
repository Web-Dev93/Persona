import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground px-4 text-center">
      <h1 className="font-serif text-6xl font-bold mb-4 text-primary">404</h1>
      <p className="text-muted-foreground mb-10 text-lg">Strona, której szukasz, nie została znaleziona.</p>
      <Link href="/" className="px-8 py-3.5 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-all shadow-sm">
        Wróć do rozmowy
      </Link>
    </div>
  );
}

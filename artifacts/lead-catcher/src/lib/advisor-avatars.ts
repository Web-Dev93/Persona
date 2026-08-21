import React from "react";

// Real Unsplash photo URLs for authentic, corporate, high-resolution AI avatars
export const ADVISOR_REAL_AVATARS: Record<string, string> = {
  // Ania - IT & SaaS Consultant / Senior Solution Architect
  ania: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85",
  // Tomasz - Cloud & AI Solutions Architect
  tomasz: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=85",
  // Marta - Legal Counsel / B2B Lawyer
  marta: "https://images.unsplash.com/photo-1580894732488-b4b123614ba6?auto=format&fit=crop&w=600&q=85",
  // Piotr - Finance & Wealth Advisor
  piotr: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=85",
  // Michal - Auto & Tech Advisor
  michal: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=85",
  // Klaudia - Aesthetics & Medical Clinic Coordinator
  klaudia: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&q=85",
  // Aleksandra - Interior Design & Construction Director
  aleksandra: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=85",
  // David - Enterprise Growth Advisor
  david: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85",
  // Elena - Customer Experience & Conversion Specialist
  elena: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85",
  // Default business advisor
  default: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=85",
};

export function getRealAvatarUrl(key?: string): string {
  if (!key) return ADVISOR_REAL_AVATARS.default;
  const lower = key.toLowerCase();
  for (const [k, url] of Object.entries(ADVISOR_REAL_AVATARS)) {
    if (lower.includes(k)) return url;
  }
  return ADVISOR_REAL_AVATARS.default;
}


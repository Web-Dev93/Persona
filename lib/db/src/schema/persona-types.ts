import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const personaTypes = pgTable("persona_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  systemPrompt: text("system_prompt").notNull().default(""),
  defaultStyle: text("default_style").notNull().default("professional"),
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const personas = pgTable("personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  photoUrl: text("photo_url"),
  systemPrompt: text("system_prompt").notNull().default(""),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

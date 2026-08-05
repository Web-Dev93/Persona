import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const personas = pgTable("personas", {
  id: serial("id").primaryKey(),
  personaTypeId: integer("persona_type_id"),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  photoUrl: text("photo_url"),
  additionalPrompt: text("additional_prompt").notNull().default(""),
  style: text("style"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

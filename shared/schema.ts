import { pgTable, text, serial, integer, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Cross-stitch pattern schema
export const patterns = pgTable("patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  originalImagePath: text("original_image_path").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  fabricType: text("fabric_type").notNull(),
  threadType: text("thread_type").notNull(),
  colorCount: integer("color_count"),
  patternData: json("pattern_data").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertPatternSchema = createInsertSchema(patterns).omit({ 
  id: true, 
  createdAt: true 
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pattern = typeof patterns.$inferSelect;
export type InsertPattern = z.infer<typeof insertPatternSchema>;

// Fabric types
export const fabricTypes = [
  { id: "aida14", name: "Aida 14", countPerInch: 14 },
  { id: "aida16", name: "Aida 16", countPerInch: 16 },
  { id: "aida18", name: "Aida 18", countPerInch: 18 },
  { id: "evenweave28", name: "Evenweave 28", countPerInch: 28 },
];

// Thread types
export const threadTypes = [
  { id: "dmc", name: "DMC" },
  { id: "anchor", name: "Anchor" },
  { id: "jpcoats", name: "J&P Coats" },
];

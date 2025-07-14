import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { desc, sql } from "drizzle-orm";

export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  email: text("email").notNull().unique(),

  subscribed: integer("subscribed", { mode: "boolean" })
    .notNull()
    .default(true),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const contactUs = sqliteTable("contactus", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),

  email: text("email").notNull(),

  subject: text("subject").notNull(), // or remove `.notNull()` if optional

  description: text("description").notNull(),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const userProfiles = sqliteTable("userProfiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  uuid: text("uuid").notNull().unique(), // Composite primary key component // comes in 

  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  full_name: text("full_name").notNull(), // comes in
  avatar_url: text("avatar_url"), // comes in
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),

  updated_at: text("updated_at"),

  email_notifications: text("email_notifications"),

  bio: text("bio"),

  user_login_info: text("user_login_info"), // SQLite doesn't support JSON natively, store as TEXT

  email: text("email").notNull(), // comes in

  reviews: text("reviews"), // Store as JSON string
});


export const products = sqliteTable("products", {
  productSeq: integer("productSeq").primaryKey({ autoIncrement: true }),

  product_id: text("product_id").unique().notNull(),

  slug: text("slug").notNull(),

  title: text("title").notNull(),

  description: text("description").notNull(),

  category: text("category").notNull(),

  about_in_bullets: text("about_in_bullets", { mode: "json" }).notNull(),

  image_gallery: text("image_gallery", { mode: "json" }).notNull(),

  price: real("price").notNull(),

  brand: text("brand").notNull(),

  vendorID: text("vendor_id").notNull(),

  raiting: real("raiting").notNull(),

  reviewNumbers: integer("review_numbers").notNull(),

  reviews: text("reviews", { mode: "json" }), // optional

  quantity: integer("quantity").notNull(),

  discountPercent: real("discount_percent"), // optional

  discountPrice: real("discount_price"), // optional

  variants: text("variants", { mode: "json" }), // optional

  variantState: integer("variant_state", { mode: "boolean" }).notNull(),

  featured: integer("featured", { mode: "boolean" }).notNull(),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

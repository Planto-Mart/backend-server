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

export const vendorProfiles = sqliteTable("vendorProfiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Foreign key to userProfiles.uuid
  user_uuid: text("user_uuid")
    .notNull()
    .references(() => userProfiles.uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .unique(),

  vendor_id: text("vendor_id")
    .notNull()
    .unique(),

  slug: text("slug").notNull().unique(), // For SEO-friendly vendor URLs
  name: text("name").notNull(),          // Shop/Vendor name
  description: text("description"),

  banner_image: text("banner_image"),
  logo: text("logo"),
  image_gallery: text("image_gallery", { mode: "json" }), // JSON array of image URLs

  rating: real("rating").default(0), // Store average rating as a float

  about_us: text("about_us"),
  features: text("features", { mode: "json" }), // JSON array of features

  // Legal Information
  business_name: text("business_name"),
  business_address: text("business_address"),
  business_registration_number: text("business_registration_number"),
  gstin_number: text("gstin_number"),
  legal_structure: text("legal_structure"),
  pan_number: text("pan_number"), // ✅ New: PAN Number

  // Contact Info
  contact_person_name: text("contact_person_name"),
  contact_email: text("contact_email"),
  contact_phone: text("contact_phone"),

  // Bank Info (consider encrypting these in production)
  bank_account_number: text("bank_account_number"),
  bank_name: text("bank_name"),
  ifsc_code: text("ifsc_code"),

  // Fees & Tax Preferences
  shipping_fee_mode: text("shipping_fee_mode").default("vendor"), 
  /**
   * Enum-like: 
   * "vendor" — vendor bears the shipping cost
   * "customer" — customer pays delivery charges
   */

  gst_rate: real("gst_rate").default(0), 
  /**
   * % tax as float (e.g., 5.0, 12.0, 18.0) — used when no tax code is selected.
   * Since PlantoMart sells plant-based goods, 5% or 12% are typically used for fertilizers/plants, 
   * but this keeps things flexible.
   */

  // Policies
  return_policy: text("return_policy"),
  shipping_policy: text("shipping_policy"),
  privacy_policy: text("privacy_policy"),
  seller_terms: text("seller_terms"),

  // Compliance
  business_license: text("business_license"),
  identity_verification: text("identity_verification"),

  // Status
  is_verified: integer("is_verified").default(0),
  status: text("status").default("pending"), // pending, approved, rejected, suspended

  // Timestamps
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  updated_at: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const vendorProducts = sqliteTable("vendorProducts", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  product_id: text("product_id")
    .notNull()
    .references(() => products.product_id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  vendor_id: text("vendor_id")
    .notNull()
    .references(() => vendorProfiles.user_uuid, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  updated_at: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
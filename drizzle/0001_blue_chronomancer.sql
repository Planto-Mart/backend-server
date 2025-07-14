CREATE TABLE `products` (
	`productSeq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`about_in_bullets` text NOT NULL,
	`image_gallery` text NOT NULL,
	`price` real NOT NULL,
	`brand` text NOT NULL,
	`vendor_id` text NOT NULL,
	`raiting` real NOT NULL,
	`review_numbers` integer NOT NULL,
	`reviews` text,
	`quantity` integer NOT NULL,
	`discount_percent` real,
	`discount_price` real,
	`variants` text,
	`variant_state` integer NOT NULL,
	`featured` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_product_id_unique` ON `products` (`product_id`);
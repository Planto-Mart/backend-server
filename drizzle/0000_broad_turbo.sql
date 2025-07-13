CREATE TABLE `contactus` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`subscribed` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`full_name` text NOT NULL,
	`avatar_url` text,
	`phone` text,
	`address` text,
	`city` text,
	`state` text,
	`pincode` text,
	`updated_at` text,
	`email_notifications` text,
	`bio` text,
	`user_login_info` text,
	`email` text NOT NULL,
	`reviews` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `userProfiles_uuid_unique` ON `userProfiles` (`uuid`);
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `affiliate_clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`product_title` text NOT NULL,
	`sub_id` text,
	`clicked_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `affiliate_clicks_product_idx` ON `affiliate_clicks` (`product_id`);--> statement-breakpoint
CREATE INDEX `affiliate_clicks_sub_id_idx` ON `affiliate_clicks` (`sub_id`);--> statement-breakpoint
CREATE INDEX `affiliate_clicks_clicked_at_idx` ON `affiliate_clicks` (`clicked_at`);--> statement-breakpoint
CREATE TABLE `booking_hours` (
	`id` text PRIMARY KEY NOT NULL,
	`weekday` integer NOT NULL,
	`start_minute` integer NOT NULL,
	`end_minute` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `booking_hours_weekday_idx` ON `booking_hours` (`weekday`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`course_slug` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`enrollment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`course_slug`, `start_at`),
	FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `bookings_enrollment_idx` ON `bookings` (`enrollment_id`);--> statement-breakpoint
CREATE TABLE `community_post_likes` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `community_post_likes_post_idx` ON `community_post_likes` (`post_id`);--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text NOT NULL,
	`parent_id` text,
	`body` text NOT NULL,
	`tip_slug` text,
	`pinned` integer DEFAULT false NOT NULL,
	`accepted_reply_id` text,
	`like_count` integer DEFAULT 0 NOT NULL,
	`reply_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`accepted_reply_id`) REFERENCES `community_posts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `community_posts_parent_created_idx` ON `community_posts` (`parent_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `community_posts_tip_idx` ON `community_posts` (`tip_slug`,`created_at`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_slug` text NOT NULL,
	`course_title` text NOT NULL,
	`booked_start_at` integer,
	`booked_end_at` integer,
	`status` text NOT NULL,
	`amount` integer NOT NULL,
	`slip_path` text,
	`slip_uploaded_at` integer,
	`reviewed_at` integer,
	`reject_reason` text,
	`slip_trans_ref` text,
	`slip_verify_status` text,
	`verify_note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `enrollments_user_course_idx` ON `enrollments` (`user_id`,`course_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `enrollments_slip_trans_ref_unique` ON `enrollments` (`slip_trans_ref`);--> statement-breakpoint
CREATE TABLE `rate_limit` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text,
	`count` integer,
	`last_request` integer
);
--> statement-breakpoint
CREATE INDEX `rate_limit_key_idx` ON `rate_limit` (`key`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`role` text DEFAULT 'customer' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);

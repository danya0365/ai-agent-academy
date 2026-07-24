CREATE TABLE `affiliate_clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`product_title` text NOT NULL,
	`sub_id` text,
	`clicked_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `affiliate_clicks_product_idx` ON `affiliate_clicks` (`product_id`);
--> statement-breakpoint
CREATE INDEX `affiliate_clicks_sub_id_idx` ON `affiliate_clicks` (`sub_id`);
--> statement-breakpoint
CREATE INDEX `affiliate_clicks_clicked_at_idx` ON `affiliate_clicks` (`clicked_at`);

CREATE TABLE `booking_hours` (
	`id` text PRIMARY KEY NOT NULL,
	`weekday` integer NOT NULL,
	`start_minute` integer NOT NULL,
	`end_minute` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `booking_hours_weekday_idx` ON `booking_hours` (`weekday`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`course_id` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`enrollment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`course_id`, `start_at`),
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `bookings_enrollment_idx` ON `bookings` (`enrollment_id`);--> statement-breakpoint
ALTER TABLE `courses` ADD `session_duration_min` integer;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `booked_start_at` integer;--> statement-breakpoint
ALTER TABLE `enrollments` ADD `booked_end_at` integer;
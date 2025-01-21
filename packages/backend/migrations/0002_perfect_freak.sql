PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_otpRequest` (
	`id` text PRIMARY KEY NOT NULL,
	`otp` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_otpRequest`("id", "otp") SELECT "id", "otp" FROM `otpRequest`;--> statement-breakpoint
DROP TABLE `otpRequest`;--> statement-breakpoint
ALTER TABLE `__new_otpRequest` RENAME TO `otpRequest`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
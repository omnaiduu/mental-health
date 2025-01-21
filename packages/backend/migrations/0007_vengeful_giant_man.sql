PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_userChats` (
	`userID` integer,
	`chatID` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`time` integer NOT NULL,
	FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_userChats`("userID", "chatID", "title", "time") SELECT "userID", "chatID", "title", "time" FROM `userChats`;--> statement-breakpoint
DROP TABLE `userChats`;--> statement-breakpoint
ALTER TABLE `__new_userChats` RENAME TO `userChats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `chat` ON `userChats` (`userID`,`chatID`);--> statement-breakpoint
CREATE TABLE `__new_userNotes` (
	`userID` integer,
	`noteID` integer PRIMARY KEY NOT NULL,
	`title` text,
	`content` blob,
	`time` integer NOT NULL,
	FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_userNotes`("userID", "noteID", "title", "content", "time") SELECT "userID", "noteID", "title", "content", "time" FROM `userNotes`;--> statement-breakpoint
DROP TABLE `userNotes`;--> statement-breakpoint
ALTER TABLE `__new_userNotes` RENAME TO `userNotes`;--> statement-breakpoint
CREATE INDEX `index_noteid` ON `userNotes` (`userID`,`noteID`);
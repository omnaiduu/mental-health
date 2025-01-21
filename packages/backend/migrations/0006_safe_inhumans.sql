PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_userNotes` (
	`userID` integer,
	`noteID` integer NOT NULL,
	`title` text,
	`content` blob,
	`time` integer NOT NULL,
	PRIMARY KEY(`userID`, `noteID`),
	FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_userNotes`("userID", "noteID", "title", "content", "time") SELECT "userID", "noteID", "title", "content", "time" FROM `userNotes`;--> statement-breakpoint
DROP TABLE `userNotes`;--> statement-breakpoint
ALTER TABLE `__new_userNotes` RENAME TO `userNotes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
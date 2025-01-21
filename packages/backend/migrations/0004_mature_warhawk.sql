PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chats` (
	`chatID` integer,
	`message` blob NOT NULL,
	FOREIGN KEY (`chatID`) REFERENCES `userChats`(`chatID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_chats`("chatID", "message") SELECT "chatID", "message" FROM `chats`;--> statement-breakpoint
DROP TABLE `chats`;--> statement-breakpoint
ALTER TABLE `__new_chats` RENAME TO `chats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `chatID_index` ON `chats` (`chatID`);--> statement-breakpoint
CREATE TABLE `__new_userChats` (
	`userID` integer,
	`chatID` integer,
	`title` text NOT NULL,
	`time` integer NOT NULL,
	PRIMARY KEY(`userID`, `chatID`),
	FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_userChats`("userID", "chatID", "title", "time") SELECT "userID", "chatID", "title", "time" FROM `userChats`;--> statement-breakpoint
DROP TABLE `userChats`;--> statement-breakpoint
ALTER TABLE `__new_userChats` RENAME TO `userChats`;--> statement-breakpoint
CREATE TABLE `__new_userNotes` (
	`userID` integer,
	`noteID` integer,
	`title` text NOT NULL,
	`content` blob NOT NULL,
	`time` integer NOT NULL,
	PRIMARY KEY(`userID`, `noteID`),
	FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_userNotes`("userID", "noteID", "title", "content", "time") SELECT "userID", "noteID", "title", "content", "time" FROM `userNotes`;--> statement-breakpoint
DROP TABLE `userNotes`;--> statement-breakpoint
ALTER TABLE `__new_userNotes` RENAME TO `userNotes`;
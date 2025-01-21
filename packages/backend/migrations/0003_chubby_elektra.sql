CREATE TABLE `chats` (
	`chatID` integer,
	`message` blob NOT NULL,
	FOREIGN KEY (`chatID`) REFERENCES `userChats`(`chatID`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `chatID_index` ON `chats` (`chatID`);--> statement-breakpoint
CREATE TABLE `userChats` (
	`userID` integer,
	`chatID` integer,
	`title` text NOT NULL,
	`time` integer NOT NULL,
	PRIMARY KEY(`userID`, `chatID`),
	FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userNotes` (
	`userID` integer,
	`noteID` integer,
	`title` text NOT NULL,
	`content` blob NOT NULL,
	`time` integer NOT NULL,
	PRIMARY KEY(`userID`, `noteID`),
	FOREIGN KEY (`userID`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `otpRequest`;--> statement-breakpoint
ALTER TABLE `user` ADD `about` blob;
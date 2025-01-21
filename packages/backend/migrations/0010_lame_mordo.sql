CREATE TABLE `chatsNotes` (
	`chatID` integer,
	`note` text NOT NULL,
	FOREIGN KEY (`chatID`) REFERENCES `userChats`(`chatID`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chatID_indexNote` ON `chatsNotes` (`chatID`);
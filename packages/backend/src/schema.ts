import {
	text,
	sqliteTable,
	integer,
	blob,
	index,
} from "drizzle-orm/sqlite-core";
import type { MessagesStored } from "./ai";

export const user = sqliteTable("user", {
	id: integer().primaryKey(),
	email: text().notNull().unique(),
	about: blob({ mode: "json" }),
});

export const userChats = sqliteTable(
	"userChats",
	{
		userID: integer()
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		chatID: integer().primaryKey(),
		title: text(),
		time: integer().notNull(),
	},
	(table) => {
		return {
			index: index("chat").on(table.userID, table.chatID),
		};
	},
);

export const chats = sqliteTable(
	"chats",
	{
		chatID: integer().references(() => userChats.chatID, {
			onDelete: "cascade",
		}),
		message: blob({ mode: "json" }).notNull().$type<MessagesStored>(),
	},
	(table) => {
		return {
			index: index("chatID_index").on(table.chatID),
		};
	},
);

export const chatsNotes = sqliteTable(
	"chatsNotes",
	{
		chatID: integer().references(() => userChats.chatID, {
			onDelete: "cascade",
		}),
		note: text().notNull(),
	},
	(table) => {
		return {
			index: index("chatID_indexNote").on(table.chatID),
		};
	},
);

export const userNotes = sqliteTable(
	"userNotes",
	{
		userID: integer().references(() => user.id, { onDelete: "cascade" }),
		noteID: integer().primaryKey(),
		title: text(),
		content: blob({ mode: "json" }),
		time: integer().notNull(),
	},
	(table) => {
		return {
			index: index("index_noteid").on(table.userID, table.noteID),
		};
	},
);

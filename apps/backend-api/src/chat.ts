import { zValidator } from "@hono/zod-validator";
import { db, desc, asc, lt, gt } from "backend/db";
import { Hono } from "hono";
import { z } from "zod";

import { and, eq } from "backend/db";
import { chats, chatsNotes, userChats } from "backend/schema";
import { type Variables } from ".";
import {
	createGoogleGenerativeAI,
	generateObject,
	generateText,
	type CoreAssistantMessage,
	type MessagesStored,
} from "backend/ai";
import { getSystemPrompt } from "./getSystemPromt";
import { saveNote } from "./notes";

export const chat = new Hono<{ Variables: Variables }>()
	.post(
		"/list",
		zValidator(
			"json",
			z.object({
				action: z.enum(["next", "prev", "get"]),
				id: z.number().optional(),
			}),
			(result, c) => {
				if (!result.success) {
					return c.json(
						{
							error: "Invalid request",
						},
						401,
					);
				}
			},
		),
		async (c) => {
			const userID = c.get("userID");
			const { action, id } = c.req.valid("json");

			if (action === "get") {
				const [chatResult, firstItemFromData, lastItemFromData] =
					await Promise.allSettled([
						db
							.select()
							.from(userChats)
							.where(and(eq(userChats.userID, userID)))
							.limit(10)
							.orderBy(desc(userChats.chatID)),
						db
							.select()
							.from(userChats)
							.where(and(eq(userChats.userID, userID)))
							.limit(1)
							.orderBy(desc(userChats.chatID)),
						db
							.select()
							.from(userChats)
							.where(and(eq(userChats.userID, userID)))
							.orderBy(asc(userChats.chatID))
							.limit(1),
					]);
				console.log(chatResult, firstItemFromData, lastItemFromData);
				if (
					chatResult.status === "rejected" ||
					firstItemFromData.status === "rejected" ||
					lastItemFromData.status === "rejected"
				) {
					return c.json(
						{
							error: "Failed to fetch data",
						},
						401,
					);
				}

				if (chatResult.value.length === 0) {
					return c.json({
						chats: [],
						firstItemFromData: 0,
						lastItemFromData: 0,
					});
				}

				return c.json(
					{
						chats: chatResult.value,
						firstItemFromData: firstItemFromData.value[0].chatID,
						lastItemFromData: lastItemFromData.value[0].chatID,
					},
					200,
				);
			}

			if (!id) {
				return c.json(
					{
						error: "Invalid request",
					},
					401,
				);
			}

			if (action === "next") {
				const [chatResult, firstItemFromData, lastItemFromData] =
					await Promise.allSettled([
						db
							.select()
							.from(userChats)
							.where(
								and(eq(userChats.userID, userID), lt(userChats.userID, id)),
							)
							.limit(10)
							.orderBy(desc(userChats.chatID)),
						db
							.select()
							.from(userChats)
							.where(and(eq(userChats.userID, userID)))
							.limit(1)
							.orderBy(desc(userChats.chatID)),
						db
							.select()
							.from(userChats)
							.where(and(eq(userChats.userID, userID)))
							.orderBy(asc(userChats.chatID))
							.limit(1),
					]);

				if (
					chatResult.status === "rejected" ||
					firstItemFromData.status === "rejected" ||
					lastItemFromData.status === "rejected"
				) {
					return c.json(
						{
							error: "Failed to fetch data",
						},
						401,
					);
				}

				if (chatResult.value.length === 0) {
					return c.json({
						chats: [],
						firstItemFromData: 0,
						lastItemFromData: 0,
					});
				}

				return c.json(
					{
						chats: chatResult.value,
						firstItemFromData: firstItemFromData.value[0].chatID,
						lastItemFromData: lastItemFromData.value[0].chatID,
					},
					200,
				);
			}
			if (action === "prev") {
				console.log("prev");
				const Subquery = db
					.select()
					.from(userChats)
					.where(and(eq(userChats.userID, userID), gt(userChats.userID, id)))
					.orderBy(asc(userChats.chatID))
					.limit(10)
					.as("subquery");
				const [chatResult, firstItemFromData, lastItemFromData] =
					await Promise.allSettled([
						db.select().from(Subquery).orderBy(desc(Subquery.chatID)),
						db
							.select()
							.from(userChats)
							.where(and(eq(userChats.userID, userID)))
							.limit(1)
							.orderBy(desc(userChats.chatID)),
						db
							.select()
							.from(userChats)
							.where(and(eq(userChats.userID, userID)))
							.orderBy(asc(userChats.chatID))
							.limit(1),
					]);

				if (
					chatResult.status === "rejected" ||
					firstItemFromData.status === "rejected" ||
					lastItemFromData.status === "rejected"
				) {
					return c.json(
						{
							error: "Failed to fetch data",
						},
						401,
					);
				}

				if (chatResult.value.length === 0) {
					return c.json({
						chats: [],
						firstItemFromData: 0,
						lastItemFromData: 0,
					});
				}

				return c.json(
					{
						chats: chatResult.value,
						firstItemFromData: firstItemFromData.value[0].chatID,
						lastItemFromData: lastItemFromData.value[0].chatID,
					},
					200,
				);
			}
			return c.json(
				{
					error: "Invalid request",
				},
				401,
			);
		},
	)
	.post(
		"/create",
		zValidator(
			"json",
			z.object({
				contentToRemember: z.string().optional(),
				action: z.enum(["create", "delete", "remember"]),
				chatID: z.number().optional(),
				noteID: z.number().optional(),
				messages: z
					.array(
						z.object({
							role: z.enum(["user", "assistant"]),
							content: z.string(),
						}),
					)
					.optional(),
			}),
			(result, c) => {
				if (!result.success) {
					return c.json(
						{
							error: "Invalid request",
						},
						401,
					);
				}
			},
		),
		async (c) => {
			const { contentToRemember, action, chatID, messages, noteID } =
				c.req.valid("json");
			const userID = c.get("userID");
			if (action === "create" || action === "remember") {
				const chatID = await db
					.insert(userChats)
					.values({
						userID,
						time: Date.now(),
					})
					.returning({
						chatID: userChats.chatID,
					});

				if (action === "remember") {
					console.log("contentToRemember", contentToRemember);
					console.log("noteID", noteID);
					if (!contentToRemember || !noteID) {
						return c.json(
							{
								error: "Invalid request",
							},
							401,
						);
					}

					await saveNote(contentToRemember, noteID, userID);

					await db.insert(chatsNotes).values({
						chatID: chatID[0].chatID,
						note: contentToRemember,
					});
				}

				if (messages && messages.length > 0) {
					const messagetostore = messages.map((message) => ({
						chatID: chatID[0].chatID,
						message: message,
					}));

					await db.insert(chats).values(messagetostore);
					return c.json({
						redirect: true,
						location: "/app/chat/" + chatID[0].chatID,
					});
				}

				const google = createGoogleGenerativeAI({
					apiKey: Bun.env.AI_TOKEN,
				});

				const systemPrompt = getSystemPrompt(
					action === "remember" ? contentToRemember : "",
				);

				console.log(systemPrompt);
				const message: MessagesStored[] = [
					{
						role: "system",
						content: systemPrompt,
					},
					{
						role: "user",
						content: "Hello",
					},
				];

				const { text } = await generateText({
					model: google("gemini-2.0-flash-exp"),
					messages: message,
				});

				

				const assistantMessage: CoreAssistantMessage = {
					role: "assistant",
					content: text,
				};

				await db.insert(chats).values([
					{
						chatID: chatID[0].chatID,
						message: assistantMessage,
					},
				]);

				return c.json({
					redirect: true,
					location: "/app/chat/" + chatID[0].chatID,
				});
			}
			if (action === "delete") {
				if (!chatID) {
					return c.json(
						{
							error: "Invalid request",
						},
						401,
					);
				}
				await db
					.delete(userChats)
					.where(
						and(eq(userChats.chatID, chatID), eq(userChats.userID, userID)),
					);

				await db.delete(chats).where(eq(chats.chatID, chatID));
				await db.delete(chatsNotes).where(eq(chatsNotes.chatID, chatID));

				return c.json(
					{
						message: "Chat deleted",
					},
					200,
				);
			}
			return c.json(
				{
					error: "Invalid request",
				},
				401,
			);
		},
	)
	.get("/get/:id", async (c) => {
		const userID = c.get("userID");
		const chatID = parseInt(c.req.param("id"));
		const chatExist = await db
			.select()
			.from(userChats)
			.where(and(eq(userChats.chatID, chatID), eq(userChats.userID, userID)));
		if (chatExist.length === 0) {
			return c.json(
				{
					error:
						"Your chat history is empty, but you can always start a new conversation!",
				},
				401,
			);
		}
		const chatMessages = await db
			.select()
			.from(chats)
			.where(eq(chats.chatID, chatID));

		const transformedMessages = chatMessages
			.filter((items) => items.message.role !== "system")
			.map((items) => items.message);
		return c.json(
			{
				data: transformedMessages,
				redirect: false,
				error: null,
			},
			200,
		);
	})
	.get("/home", async (c) => {
		const google = createGoogleGenerativeAI({
			apiKey: Bun.env.AI_TOKEN,
		});
		const { object } = await generateObject({
			model: google("gemini-2.0-flash-exp"),
			schema: z.object({
				affimation: z.string().describe("your affimation"),
				createChat: z.string().describe("button text for create chat"),
				createJournal: z
					.string()
					.describe("button text for create journal entry"),
			}),
			temperature: 1,
			messages: [
				{
					role: "system",
					content: `
				Your supportive friend and you have to give affifmtion or funny affirmastion. use emoji when if you can
				 also genrate conservation type of text for button to chat with you, and also for a buttton to createa journal entry.

				 use emoji for button text if possible
				`,
				},{
					role: "user",
					content: "Generate me affimation, button text. use the instruction above",
				}
			],
		});

		return c.json(object, 200);
	});

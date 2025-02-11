import { zValidator } from "@hono/zod-validator";
import { db, desc, asc, lt, gt } from "backend/db";
import { Hono } from "hono";
import { z } from "zod";

import { and, eq } from "backend/db";
import { userNotes } from "backend/schema";
import type { Variables } from ".";

export const note = new Hono<{ Variables: Variables }>()
	.post(
		"/insert",
		zValidator(
			"json",
			z.object({
				action: z.enum(["insert", "delete"]),
				noteID: z.number().optional(),
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
			const reqData = c.req.valid("json");

			const userID = c.get("userID");

			if (reqData.action === "insert") {
				const currentUTC = Math.floor(Date.now() / 1000);
				const NoteIDObJ = await db
					.insert(userNotes)
					.values({
						time: currentUTC,
						userID,
					})
					.returning({
						id: userNotes.noteID,
					});

				return c.json(
					{
						redirect: true,

						location: `/app/note/${NoteIDObJ[0].id}`,
					},
					200,
				);
			}
			if (reqData.action === "delete") {
				const { noteID } = reqData;
				if (noteID === undefined) {
					return c.json(
						{
							error: "Invalid request",
						},
						401,
					);
				}
				await db
					.delete(userNotes)
					.where(
						and(eq(userNotes.noteID, noteID), eq(userNotes.userID, userID)),
					);
				return c.json(
					{
						message: "Note deleted",
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
		"/get",
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
				const [notesResult, firstItemFromData, lastItemFromData] =
					await Promise.allSettled([
						db
							.select()
							.from(userNotes)
							.where(and(eq(userNotes.userID, userID)))
							.limit(10)
							.orderBy(desc(userNotes.noteID)),
						db
							.select()
							.from(userNotes)
							.where(and(eq(userNotes.userID, userID)))
							.limit(1)
							.orderBy(desc(userNotes.noteID)),
						db
							.select()
							.from(userNotes)
							.where(and(eq(userNotes.userID, userID)))
							.orderBy(asc(userNotes.noteID))
							.limit(1),
					]);

				if (
					notesResult.status === "rejected" ||
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

				if (notesResult.value.length === 0) {
					return c.json({
						action,
						notes: [],
						firstItemFromData: 0,
						lastItemFromData: 0,
					});
				}

				return c.json(
					{
						action,
						notes: notesResult.value,
						firstItemFromData: firstItemFromData.value[0].noteID,
						lastItemFromData: lastItemFromData.value[0].noteID,
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
				
				const [notesResult, firstItemFromData, lastItemFromData] =
					await Promise.allSettled([
						db
							.select()
							.from(userNotes)
							.where(
								and(eq(userNotes.userID, userID), lt(userNotes.noteID, id)),
							)
							.limit(10)
							.orderBy(desc(userNotes.noteID)),
						db
							.select()
							.from(userNotes)
							.where(and(eq(userNotes.userID, userID)))
							.limit(1)
							.orderBy(desc(userNotes.noteID)),
						db
							.select()
							.from(userNotes)
							.where(and(eq(userNotes.userID, userID)))
							.orderBy(asc(userNotes.noteID))
							.limit(1),
					]);

				if (
					notesResult.status === "rejected" ||
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

				if (notesResult.value.length === 0) {
					return c.json({
						action,
						notes: [],
						firstItemFromData: 0,
						lastItemFromData: 0,
					});
				}

				return c.json(
					{
						action,
						notes: notesResult.value,
						firstItemFromData: firstItemFromData.value[0].noteID,
						lastItemFromData: lastItemFromData.value[0].noteID,
					},
					200,
				);
			}
			if (action === "prev") {
			
				const Subquery = db
					.select()
					.from(userNotes)
					.where(and(eq(userNotes.userID, userID), gt(userNotes.noteID, id)))
					.orderBy(asc(userNotes.noteID))
					.limit(10)
					.as("subquery");
				const [notesResult, firstItemFromData, lastItemFromData] =
					await Promise.allSettled([
						db.select().from(Subquery).orderBy(desc(Subquery.noteID)),
						db
							.select()
							.from(userNotes)
							.where(and(eq(userNotes.userID, userID)))
							.limit(1)
							.orderBy(desc(userNotes.noteID)),
						db
							.select()
							.from(userNotes)
							.where(and(eq(userNotes.userID, userID)))
							.orderBy(asc(userNotes.noteID))
							.limit(1),
					]);

				if (
					notesResult.status === "rejected" ||
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
				if (notesResult.value.length === 0) {
					return c.json({
						action,
						notes: [],
						firstItemFromData: 0,
						lastItemFromData: 0,
					});
				}
				return c.json(
					{
						action,
						notes: notesResult.value,
						firstItemFromData: firstItemFromData.value[0].noteID,
						lastItemFromData: lastItemFromData.value[0].noteID,
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
		"/note",
		zValidator(
			"json",
			z.object({
				action: z.enum(["get", "save"]),
				noteID: z.number(),
				content: z.string().optional(),
				title: z.string().optional(),
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
			const { noteID, action, content, title } = c.req.valid("json");
			const userID = c.get("userID");
			if (action === "get") {
				const note = await db
					.select()
					.from(userNotes)
					.where(
						and(eq(userNotes.userID, userID), eq(userNotes.noteID, noteID)),
					);
				return c.json({
					data: note,
				});
			}
			if (action === "save") {
				if (content === undefined || title === undefined) {
					return c.json(
						{
							error: "Invalid request",
						},
						401,
					);
				}
				const note = await saveNote(content, noteID, userID, title);
				return c.json({
					data: note,
				});
			}
			return c.json(
				{
					error: "Invalid request",
				},
				401,
			);
		},
	);

export async function saveNote(
	content: string,
	noteID: number,
	userID: number,
	title?: string,
) {
	const obj: { content: string; title?: string } = {
		content,
	};
	if (title) {
		obj.title = title;
	}
	return await db
		.update(userNotes)
		.set(obj)
		.where(and(eq(userNotes.userID, userID), eq(userNotes.noteID, noteID)));
}

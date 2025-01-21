import type { Variables } from ".";
export declare const note: import("hono/hono-base").HonoBase<{
    Variables: Variables;
}, {
    "/insert": {
        $post: {
            input: {
                json: {
                    action: "insert" | "delete";
                    noteID?: number | undefined;
                };
            };
            output: {
                redirect: boolean;
                location: string;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "insert" | "delete";
                    noteID?: number | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    action: "insert" | "delete";
                    noteID?: number | undefined;
                };
            };
            output: {
                message: string;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/get": {
        $post: {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        } | {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                action: "get";
                notes: {
                    userID: number | null;
                    noteID: number;
                    title: string | null;
                    content: never;
                    time: number;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                action: "next";
                notes: {
                    userID: number | null;
                    noteID: number;
                    title: string | null;
                    content: never;
                    time: number;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        } | {
            input: {
                json: {
                    action: "get" | "next" | "prev";
                    id?: number | undefined;
                };
            };
            output: {
                action: "prev";
                notes: {
                    userID: number | null;
                    noteID: number;
                    title: string | null;
                    content: never;
                    time: number;
                }[];
                firstItemFromData: number;
                lastItemFromData: number;
            };
            outputFormat: "json";
            status: 200;
        };
    };
} & {
    "/note": {
        $post: {
            input: {
                json: {
                    action: "get" | "save";
                    noteID: number;
                    title?: string | undefined;
                    content?: string | undefined;
                };
            };
            output: {
                data: {
                    userID: number | null;
                    noteID: number;
                    title: string | null;
                    content: never;
                    time: number;
                }[];
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").StatusCode;
        } | {
            input: {
                json: {
                    action: "get" | "save";
                    noteID: number;
                    title?: string | undefined;
                    content?: string | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 401;
        };
    };
}, "/">;

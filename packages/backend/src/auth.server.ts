import { createCookieSessionStorage, type Session } from "react-router";
import { drizzle } from "drizzle-orm/bun-sqlite";
import sqlite from "./db"
import { user } from "./schema";
import { eq } from "drizzle-orm";
import { TaskScheduler } from "./schedular";
export type SessionData = {
    otpID: string;
    email: string;
    userID: number;
};


export interface AuthResponse {
    otpRequested: boolean;
    error?: string;
    otp?: string;
}

export function generateRandom4DigitCode(): number {
    const min = 1000;
    const max = 9999;
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomCode
}

export const { getSession, commitSession, destroySession } =
    createCookieSessionStorage<SessionData>(
        {
            cookie: {
                name: "__session",
                httpOnly: true,
                path: "/",
                sameSite: "lax",
secrets: ["omtech23"],
                secure: true,
                domain: `.${Bun.env["COOKIE"]}`
            },
        }
    );


export class Auth {
    public session: Session<SessionData, SessionData> | null = null;
    private static otpMap: Map<string, string> = new Map();


    async init(cookie: string | null | undefined) {
        try {
            this.session = await getSession(cookie);
            return this.session ? this.session : false
        } catch (e) {
            console.error("error", e);
            return false
        }
    }

    // Ensures that the session is initialized before proceeding with any operations that require it.
    private sessionCheck(): asserts this is { session: Session<SessionData, SessionData> } {
        if (this.session === null) {
            throw new Error("Session not initialized");
        }
    }

    async getUserID() {
        this.sessionCheck();
        const userID = this.session.get("userID");
        if (userID) {
            return userID;
        }
        return false;

    }

    isOTPRequested(): AuthResponse {
        this.sessionCheck();
        const otpRequested = this.session.get("otpID");
        return otpRequested ? {
            otpRequested: true
        } : {
            otpRequested: false,
        };
    }

    setOtpRequest(email: string): AuthResponse {
        this.sessionCheck();
        const otpID = crypto.randomUUID();
        this.session.set("otpID", otpID);

        const otp = generateRandom4DigitCode().toString()
        console.log("email received", email);
        Auth.otpMap.set(otpID, otp);
        this.session.set("email", email);

        const task = new TaskScheduler();
        // Remove the OTP from the map after 5 minutes
        task.scheduleOnce(() => {
            Auth.otpMap.delete(otpID);
        }, 300000)
        return {

            otpRequested: true,

            otp,
        };
    }

    async verifyOTP(otp: string): Promise<AuthResponse | true> {
        this.sessionCheck();
        const otpID = this.session.get("otpID");
        if (!otpID) {
            throw new Error("OTP ID Invaild");
        }
        const otpValue = Auth.otpMap.get(otpID);
        if (!otpValue) {
            //probably the OTP has expired
            console.log("OTP not Found for given ID");

            return this.abortOTP();
        }
        if (otpValue === otp) {
            await this.handleSuccessfulOTPVerification(otpID);
            return true;
        }
        return {
            otpRequested: false,
            error: "OTP mismatch",
        }
    }

    private async handleSuccessfulOTPVerification(otpID: string): Promise<void> {
        this.sessionCheck();
        const email = this.session.get("email");
        this.session.unset("otpID");
        Auth.otpMap.delete(otpID);
        this.session.unset("email");

        const db = drizzle({ client: sqlite });
        if (!email) {
            throw new Error("Email is undefined");
        }
        const userProfile = await db
            .select()
            .from(user)
            .where(eq(user.email, email));
        let userID: number;

        if (userProfile.length === 0) {
            const result = await db
                .insert(user)
                .values({
                    email: email,
                })
                .returning({ id: user.id });
            userID = result[0].id;
        } else {
            userID = userProfile[0].id;
        }
        this.session.set("userID", userID);
    }


    abortOTP(): AuthResponse {
        /**
         * Aborts the current OTP request by unsetting the otpID and email from the session.
         * @returns {AuthStatus} - The status indicating that the OTP request has been aborted.
            */
        this.sessionCheck();
        this.session.unset("otpID");
        this.session.unset("email");
        return {
            otpRequested: false,
            error: "OTP request aborted"

        }
    }

    // Logs out the user by unsetting the userID from the session.
    logout() {
        this.sessionCheck();
        this.session.unset("userID");
    }


}


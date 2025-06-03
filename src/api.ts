import axios, {AxiosInstance} from "axios";
import {CookieJar, MemoryCookieStore} from "tough-cookie";
import {wrapper} from "axios-cookiejar-support";
import {existsSync, readFileSync, writeFileSync} from "fs";
import crypto from "crypto";
import qs from "qs";

const BASE_URL = "https://challenge.sunvoy.com";
const API_BASE_URL = "https://api.challenge.sunvoy.com";

const CREDENTIALS = {
    username: "demo@example.org",
    password: "test",
};
const COOKIE_FILE = "cookies.json";

async function fetchNonce(client: AxiosInstance): Promise<string> {
    const res = await client.get("/login");
    const match = res.data.match(/name="nonce"\s+value="([^"]+)"/);
    if (!match) throw new Error("Nonce not found in login page");
    console.log("Nonce fetched:", match[1]);
    return match[1];
}

export async function loginIfNeeded(): Promise<AxiosInstance> {
    let jar = new CookieJar(new MemoryCookieStore(), {looseMode: true});

    if (existsSync(COOKIE_FILE)) {
        const raw = readFileSync(COOKIE_FILE, "utf8");
        jar = await new Promise<CookieJar>((resolve, reject) => {
            CookieJar.deserialize(JSON.parse(raw), (err, deserializedJar) => {
                if (err || !deserializedJar) return reject(err);
                resolve(deserializedJar);
            });
        });
    }

    const client = wrapper(
        axios.create({baseURL: BASE_URL, jar, withCredentials: true})
    );

    try {
        const testRes = await client.get("/settings/tokens");
        if (testRes.status === 200) {
            console.log("Reusing existing session");
            return client;
        }
    } catch (e) {
        console.log("Session expired or invalid, logging in again...");
    }

    console.log("No valid session, fetching nonce and logging in...");
    const nonce = await fetchNonce(client);
    const loginPayload = {
        ...CREDENTIALS,
        nonce,
    };

    try {
        await client.post("/login", qs.stringify(loginPayload), {
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
        });
        jar.serialize((err, serialized) => {
            if (!err) {
                writeFileSync(COOKIE_FILE, JSON.stringify(serialized));
                console.log("Logged in and session saved");
            }
        });
    } catch (err: any) {
        console.error("Login failed:", err.response?.data || err.message);
        throw err;
    }

    return client;
}

export async function getTokens(client: AxiosInstance): Promise<{
    access_token: string;
    openId: string;
    userId: string;
    apiuser: string;
    operateId: string;
    language: string;
    timestamp: number;
}> {
    const url = "/settings/tokens";
    console.log("Requesting tokens from:", `${client.defaults.baseURL}${url}`);
    const res = await client.get(url);
    const html = res.data;

    function extract(id: string): string {
        const match = html.match(new RegExp(`id="${id}"\\s+value="([^"]+)"`));
        if (!match) throw new Error(`${id} not found in tokens page`);
        return match[1];
    }

    const timestamp = Math.floor(Date.now() / 1000);

    return {
        access_token: extract("access_token"),
        openId: extract("openId"),
        userId: extract("userId"),
        apiuser: extract("apiuser"),
        operateId: extract("operateId"),
        language: extract("language"),
        timestamp: timestamp,
    };
}

export function createSignedRequest(data: any, secretKey = "mys3cr3t") {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadData = {
        ...data,
        timestamp,
    };
    const payload = Object.keys(payloadData)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(payloadData[key])}`)
        .join("&");
    const hmac = crypto.createHmac("sha1", secretKey);
    hmac.update(payload);
    return hmac.digest("hex").toUpperCase();
}

export async function getUsers(client: AxiosInstance): Promise<any[]> {
    const url = `${client.defaults.baseURL}/api/users`;
    console.log("Requesting URL (getUsers):", url);
    const res = await client.post("/api/users");
    console.log("Response data (getUsers):", res.data);
    return res.data;
}


export async function getCurrentUserWithToken(body: any = {}): Promise<any> {
    const apiClient = axios.create({
        baseURL: API_BASE_URL,
    });
    const url = "/api/settings";
    console.log("Requesting current user from:", `${API_BASE_URL}${url}`);
    const res = await apiClient.post(url, body);
    console.log("Response data (getCurrentUserWithToken):", res.data);
    return res.data;
}

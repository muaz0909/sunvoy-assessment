import {createSignedRequest, getCurrentUserWithToken, getTokens, getUsers, loginIfNeeded,} from "./api";
import {writeFileSync} from "fs";

async function main() {
    try {
        const client = await loginIfNeeded();

        const users = await getUsers(client);
        const tokens = await getTokens(client);
        const checkcodeMatch = createSignedRequest(tokens);
        const currentUser = await getCurrentUserWithToken({
            ...tokens,
            checkcode: checkcodeMatch,
        });

        const result = {
            users: [...users, currentUser],
        };

        writeFileSync("users.json", JSON.stringify(result, null, 2));
        console.log("users.json created successfully");
    } catch (error) {
        console.error("Error:", error);
    }
}

main();

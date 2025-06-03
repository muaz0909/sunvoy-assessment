# Node Assignment – Sunvoy Challenge API Automation

This project automates authentication and data retrieval from the Sunvoy Challenge API using Node.js and TypeScript.

## Features

- **Session Management**: Handles login and session cookies, reuses valid sessions.
- **Token Extraction**: Extracts API tokens from HTML after login.
- **Signed Requests**: Generates HMAC-SHA1 signatures for secure API calls.
- **User Data Fetching**: Retrieves user lists and current user info, merges them, and saves to `users.json`.
- **Robust Error Handling**: Handles session expiry, login failures, and missing tokens.

## Prerequisites

- Node.js (v22 recommended)
- npm

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Project Structure:**
   ```
   .
   ├── src/
   │   ├── api.ts
   │   └── index.ts
   ├── users.json (generated)
   ├── cookies.json (generated)
   └── package.json
   ```

## Usage

Run the main script:

```sh
npx ts-node src/index.ts
```

Or, if you have compiled to JavaScript:

```sh
node dist/index.js
```

## How It Works

1. **Login & Session Reuse:**  
   - Checks for a valid session in `cookies.json`.
   - If not valid, logs in and saves new cookies.

2. **Token Retrieval:**  
   - Fetches `/settings/tokens` and parses the HTML to extract all required tokens.

3. **Signed Request:**  
   - Generates a `checkcode` using HMAC-SHA1 and the provided secret.

4. **API Calls:**  
   - Fetches users and current user info using the extracted tokens and checkcode.

5. **Output:**  
   - Merges all users (including the current user) into `users.json`.

## Customization

- **Credentials:**  
  Update the `CREDENTIALS` object in `src/api.ts` with your own username and password.

- **CheckCode extraction:**  
  The HMAC secret can be changed in `createSignedRequest`.


## License

MIT

---
**Author:** Muaz

**Video Link**:  https://www.loom.com/share/6e047937f7ff418788bb7f62ac1ac916?sid=486c5aa1-9125-49a1-a862-3c76305457f9;

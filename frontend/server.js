const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const CLIENT_ID = process.env.REACT_APP_SPOTIFYCLIENTID;
const CLIENT_SECRET = process.env.REACT_APP_SPOTIFYSECRET;
;
const REDIRECT_URI = "http://localhost:4000/callback"; 

// Route to get token using Client Credentials Flow
app.get("/get-token", async (req, res) => {
    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authString}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ grant_type: "client_credentials" }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to handle Spotify Redirect (for Authorization Code Flow)
app.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing authorization code");

    try {
        const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authString}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const data = await response.json();
        res.json(data); // Send token to frontend
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start backend on PORT 4000
const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

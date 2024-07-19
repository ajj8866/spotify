function jsonParser(obj) {
    for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'object') {
            if (val == null) {
                continue
            }
            jsonParser(val)
        } else {
            console.log(key + ": " + val)
        }
    }
}

class Spotify {

    constructor (clientSecret, clientId, redirectUri) {
        this.clientSecret = clientSecret;
        this.clientId = clientId;
        this.redirectUri = redirectUri;
        this.accessUri = 'https://accounts.spotify.com/api/token';
        this.getToken();
        this.getTokenInterval();
        
    }

    async getToken() {
        const response = await fetch( this.accessUri, {
        method: 'POST',
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' +  btoa(this.clientId + ':' + this.clientSecret),
        },
        });
        const json = await response.json();
        this.accessToken = json.access_token;
        return json.accessToken;
    }

    getTokenInterval() {
        return new Promise((resolve, reject) => {
            setInterval(() => this.getToken(), 1000*3600)
            resolve("Obtained new access token")
        })

    }

    async basicEndpoint(uri) {
        while (!this.accessToken) {
            await this.getToken()
        }
        const response = await fetch("https://api.spotify.com/v1/" + uri, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + this.accessToken },
          });
        const json = await response.json();
        jsonParser(json);
        return json
    }

    async  getTrackInfo(name) {
        const trackId = await this.getInfo(name, 'track')
        const json = await this.basicEndpoint(`tracks/${trackId}`)
        return json
    }

    async getNewReleases() {
        return this.basicEndpoint("browse/new-releases")
    }

    async getInfo(name, type) {
        const json = await this.basicEndpoint(`search?q=${encodeURIComponent(name)}&type=${type}`);
        return json.artists.items.id
    }

    async getArtist(name) {
        const artistId = await this.getInfo(name, 'artist')
        const json = await this.basicEndpoint(`artists/${artistId}`);
        jsonParser(json)
        return json
    }
};

export default Spotify;

const spot = new Spotify(process.env["SPOTIFYSECRET"], process.env["SPOTIFYCLIENTID"], "http://localhost:4000/callback");
spot.getArtist('adele');
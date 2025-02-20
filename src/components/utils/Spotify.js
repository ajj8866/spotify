const REACT_PORT = 3001;

class Spotify {

    constructor (clientSecret, clientId, redirectUri) {
        this.clientSecret = clientSecret;
        this.clientId = clientId;
        this.redirectUri = redirectUri;
        this.accessUri = 'https://accounts.spotify.com/api/token';
        this.authEndpoint = `https://accounts.spotify.com/authorize`;
        this.tokenEndpoint = 'https://accounts.spotify.com/api/token';
        this.loginEndpoint = `http://localhost:${REACT_PORT}/login`
        this.token = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.initializeToken();
        this.code_verifier = this.generateCodeVerifier();
        // this.code_challenge = await this.generateCodeChallenge(this.code_verifier)
        
    }

    /////////////////////////////////////////////////////////////////////////
    // BASIC AUTHORIZATIO USING CLIENT CREDENTAILS

    // Method to yield basic functionality of app without user having to login
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
        this.token = json.access_token;
        return json.accessToken;
    }

    getTokenInterval() {
        setTimeout(async () => {
            await this.getToken();
            this.getTokenInterval()
        }, 1000*3600)
    }

    async initializeToken() {
        await this.getToken();
        this.getTokenInterval();
    }

    async basicEndpoint(uri) {
        while (!this.accessToken) {
            await this.getToken();
        }
        const response = await fetch("https://api.spotify.com/v1/" + uri, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + this.accessToken },
          });
        const json = await response.json();
        return json
    }

    //////////////////////////////////////////////////////////////////

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
        // jsonParser(json);§
        return json.artists.items[0].id
    }

    async getArtist(name) {
        const artistId = await this.getInfo(name, 'artist');
        const json = await this.basicEndpoint(`artists/${artistId}`);
        return json
    }

    async getRelatedArtists(name) {
        const artistId = await this.getInfo(name, 'artist');
        
        const artistsRelated = await this.basicEndpoint(`artists/${artistId}/related-artists`);
        
        class relatedArtist {
            constructor(name_key, pop_key, name, popularity) {
                this.name_key = name_key;
                this.pop_key = pop_key;
                this.name = name;
                this.popularity = popularity;
            }
        };

        const relArtistArray = [];
        artistsRelated.artists.forEach((element, idx) => {
            relArtistArray.push(new relatedArtist(`rel-artist${idx+1}`, `pop-key${idx+1}`, element.name, element.popularity));
            // console.log(`rel-artist${idx+1}`);
        });

        return relArtistArray;
    }

    async getArtistTracks(name) {
        const artistId = await this.getInfo(name, 'artist');
        const artistTracks = await this.basicEndpoint(`artists/${artistId}/top-tracks`);
        const trackInfo = [];
        
        class TrackClass {
            constructor (album_id, album_image, album_name) {
                this.album_id = album_id;
                this.album_image = album_image;
                this.album_name = album_name;
            }
        }
        artistTracks.tracks.forEach((val, idx) => {
            trackInfo.push(
                new TrackClass(idx+1, val.album.images[0].url, val.album.name)
            )
        })
        console.log(trackInfo);
        return trackInfo
    }

    //////////////////////////////////////////////////////
    // AUTHO CODE FLOW PROCESS

    generateCodeVerifier() {
        /*
        Generates random string which is base64 URL-encoded using the btoa method 
         */                
        const array = new Uint8Array(32); // Initiates array of 32 elements each of which represents a single byte instantiated with 0's
        window.crypto.getRandomValues(array); // Method used to form cryptographically strong random values based off a 
        return btoa(String.fromCharCode.apply(null, array)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');    // Appplies base64 URL encoding 
    }

    async generateCodeChallenge(codeVerifier) {
        /*
        Creates a hash based of randomly generated string 
        */
        const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
        return btoa(String.fromCharCode(...new Uint8Array(hashed)))
            .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    async refreshAccessToken() {

    }

    async login() {

        const code_challenge = await this.generateCodeChallenge(this.code_verifier);

        const authUrl = `${this.authEndpoint}?${new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            scope: 'user-read-private user-read-email',
            redirect_uri: this.redirectUri,
            code_challenge_method: 'S256',
            code_challenge: code_challenge,
        
        })}`;
        
        window.location.href = authUrl;


    }

    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) return;

        const response = await fetch(this.tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: this.clientId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectUri,
                code_verifier: this.code_verifier
            })
        });

        const data = await response.json();
        this.accessToken = data.accessToken;
        this.refreshToken = data.refresh_token;
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    }
};

export default Spotify;
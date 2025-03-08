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
        // this.code_verifier = this.generateCodeVerifier();
        // this.code_challenge = await this.generateCodeChallenge(this.code_verifier)
        
    }

    /////////////////////////////////////////////////////////////////////////
    // BASIC AUTHORIZATIO USING CLIENT CREDENTAILS

    // Method to yield basic functionality of app without user having to login
    async getToken() {
        // const response = await fetch( this.accessUri, {
        // method: 'POST',
        // body: new URLSearchParams({
        //     'grant_type': 'client_credentials',
        // }),
        // headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //     'Authorization': 'Basic ' +  btoa(this.clientId + ':' + this.clientSecret),
        // },
        // });
        
        // const json = await response.json();
        // console.log(json);
        // this.token = json.access_token;
        // return json.accessToken;
        try {
            const response = await fetch("http://localhost:4000/get-token");
            if (!response.ok) throw new Error("Failed to fetch token");
            const data = await response.json();
            this.token = data.accessToken            
            return data.access_token;            
        } catch (error) {
            console.error("Error fetching token:", error);
            return null;
        }
    
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
        /*
        * Used to get Spotify ID or URL pertaining to a given entitty where entity type is one of 
        * (i) artist (ii) track (iii) album (iv) playlist (v) show (for podcasts) (vi) episode (vii) user
        * and the value for the type query parameter and q value of the query parameter corresponds to the 
        * name of the entity 
        */
        const json = await this.basicEndpoint(`search?q=${encodeURIComponent(name)}&type=${type}`);
        return json.artists.items[0].id
    }

    async getArtist(name) {
        /*
        * Yields information pertainin to the associated artist where information returned in the form of JSON with the 
        * following properties
        * (i) genres: List
        * (ii) images: List of objects where each object has url, height and width properties
        * (iii) name: Name of artist 
        * (iv) popularity: Popularity score 
        */
        const artistId = await this.getInfo(name, 'artist');
        const json = await this.basicEndpoint(`artists/${artistId}`);
        return json
    }

    async getRelatedArtists(name) {
        /*
        * Yields an array of objects each of which contains information relating to an artist with properties including:
        * (i) genres: List of string
        * (ii) images: List of objects which have url, heigh and width
        * (iii) name: Name of artist
        * (iv) popularity 
         */
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
        console.log(relArtistArray);
        return relArtistArray;
    }

    async getArtistTracks(name) {
        /**
         * Yields the top tracks released by artist specified in the name parameter returning an 
         * array of objects pertaining to the relevant album where each object has the following 
         * properties
         * i) album_id
         * ii) album_image
         * iii) album_name
         */
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
        * Generates random string which is base64 URL-encoded using the btoa method 
        */                
        const array = new Uint8Array(32); // Initiates array of 32 elements each of which represents a single byte instantiated with 0's
        window.crypto.getRandomValues(array); // Method used to form cryptographically strong random values based off a 
        return btoa(String.fromCharCode.apply(null, array)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');    // Appplies base64 URL encoding 
    }

    async generateCodeChallenge(codeVerifier) {
        /*
        * Creates a hash based of randomly generated string 
        */
        const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
        return btoa(String.fromCharCode(...new Uint8Array(hashed)))
            .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    }

    async refreshAccessToken() {
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) return;

        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token,
            client_id: this.clientId
        });

        const response = await fetch(this.token_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            this.accessToken = data.accessToken;
        }

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
        if (!code) {
            return false
        };

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
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        return true``
    }

    // Endpoint using PKCE as login mechanism // 
    async getUserEndpoint(end_params) {
        /**
         * Stub function used in subsequent methods to simplify process of extracting API 
         * endpoints pertaining to user profile
         * 
         */
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        const basicUrl = 'https://api.spotify.com/v1/me';
        const response = await fetch(end_params ? basicUrl + end_params :  basicUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 401) {
            await this.refreshAccessToken(); 
            return this.getUserEndpoint(); 
        }
        return await response.json();
    }

    async getRecommendedArtists(genre, popularity = 0) {
        /**
         * Yields recommded list of artists based of artists currently in users playlist
         */

        // Array of objects pertaining to individual artists in users playlist including name and ID properties
        const response = await this.getUserEndpoint("/following?type=artist");
        const data = response.json().items; 
        
        // Creating an array of objects where each object contains the name and ID pertaining to artist
        const artistIds = [];
        data.forEach(async (i) => {
            const mainArtistId = await this.getInfo(i.name, 'artist');
            console.log(this);
            artistIds.push({'name': i.name, 'artist_id': mainArtistId});
        });

        // Instantiates empty object which shall store information relating to artist in users playlist 
        // where each object is indexed by the artist currently in users playlist and associated values 
        // contains an array of objects containing related artists filtered by user provided genre and popularity 
        const recommendedArtistsObj = {};

        artistIds.forEach(async (art_obj, idx) => {
            const curArtist = art_obj.name;
            const artistInfo = await this.basicEndpoint(`artists/${art_obj.artist_id}/related-artists`);
            console.log("Parsing for " + curArtist);
            const relArtistArray = artistInfo.artists;
            recommendedArtistsObj[curArtist] = [];

            relArtistArray.forEach( (el, idx) => {
                if (genre || popularity) {                    
                    const pop = el.popularity;
                    const genre_ls = el.genres;
                    if ( (pop > popularity) && (genre_ls.includes(genre))  ) {
                        recommendedArtistsObj[curArtist].push({
                            "name_key": `rel-artist${idx+1}`,
                            "pop_key": `pop-key${idx+1}`,
                            "name": el.name,
                            "popularity": el.popularity
                        })
                    }
                };
            } )

        })

    }
    
};

export default Spotify;
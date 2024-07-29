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
        this.initializeToken();
        
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
        jsonParser(json);
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
            console.log(`rel-artist${idx+1}`);
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

        return artistTracks
    }
};

export default Spotify;
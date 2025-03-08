import React from "react";

export function sortByKey(array, key, reverse) {
    if (!reverse) {
        return array.sort((a, b) => {
        if (a[key] < b[key]) {
            return -1;
        }
        if (a[key] > b[key]) {
            return 1;
        }
        return 0; 
        });
    } else {
        return array.sort((a, b) => {
            if (a[key] > b[key]) {
                return -1;
            }
            if (a[key] < b[key]) {
                return 1;
            }
            return 0; 
            });
    }
};

export function renderArtistTrackList(artist_track_list) {
    return artist_track_list.map((el) => 
        <li key={el.album_id}>
            <h2>{el.album_name}</h2>
            <img className="album-image" alt={`Album cover for ${el.album_name}`}  src={el.album_image}></img>
        </li>            
    )
};
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

export function renderArtist(artist_list) {
    return artist_list.map((el) => 
            <tr id={el.album_id}>
                <td>{el.album_name}</td>
                <td><img alt={`Album cover for ${el.album_name}`}  src={el.album_image}></img></td>
            </tr>
    )
};
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

// export function renderArtist(artist_key) {
//     const el = document.getElementById(artist_key);
    
// }
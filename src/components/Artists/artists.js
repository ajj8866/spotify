import React from "react";
import './artist.css';

const SearchArtist = (props) => {
    return (
        <div>
            <label htmlFor='artist_entry'>Enter Artist Name</label>
            <input id='artist_entry' type='text' onChange={props.handleInputChange}></input>
            <input type="button" value="Submit" onClick={props.handleButtonClick}></input>
        </div>
    )

};

export default SearchArtist;
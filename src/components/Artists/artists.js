import React from "react";
import './artist.css';
import { renderArtist } from "../utils/utilityFunctions";

const SearchArtist = (props) => {
    /**
     * Props: 
     * i) handleButtonClick: Sets artista and artist associated tracks via the spotify API by using
     *    Spotify class's getRelatedArtists and getArtistTracks methods
     * ii) handleInputChange: Sets the target artist
     * iii) handleSeelctChange: Sorts artists listed either alphabetically or in order of popularity 
     * iv) relatedArtists: Array containing artists related to current artist 
     * v) handlArtistTrackChange: Changes the specific related artist for which reltaed tracks are displayed 
     */

    const { handleInputChange, handleButtonClick, populateRelatedArtists, artistTrackList, handleSelectChange } = props;

    return (
        <div>
            <label htmlFor='artist_entry'>Enter Artist Name</label>
            <input id='artist_entry' type='text' onChange={handleInputChange}></input>
            <input type="button" value="Submit" onClick={handleButtonClick}></input>
            <div>
            <label id='sorting' for='sort-options'>Sort By</label>
            <select id='sort-options' onChange={handleSelectChange}>
              <option key='name-sort' value='name'>Name</option>
              <option key='populatiry-sort' value='popularity'>Popularity</option>
            </select>

            <div id='output-container'>
              <div id='table-container'>
                <table className='related-artists-container'>
                  <thead className="table-th">
                    <tr>
                      <th>Name</th>
                      <th>Popularity</th>           
                    </tr>
                  </thead>
                  <tbody>{populateRelatedArtists}</tbody>
                </table>                                
                {artistTrackList.length>0 &&                  
                    <ul id='tracks-list'>                    
                      {renderArtist(artistTrackList)}                    
                    </ul>                  
                }
              </div>
            </div>          
          </div>
        </div>
    )

};

export default SearchArtist;
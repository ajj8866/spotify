import React from "react";
import './artist.css';
import { renderArtistTrackList } from "../utils/utilityFunctions";

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

    const { handleInputChange, handleArtistSubmit, artistTrackList, handleSelectChange, relatedArtist } = props;

    return (
        <div>
            <form onSubmit={handleArtistSubmit}>
              <label htmlFor='artist_entry'>Enter Artist Name</label>
              <input id='artist_entry' type='text' onChange={handleInputChange}></input>              
              <button type="submit">Submit</button>
            </form>

            <div>
            <label id='sorting' htmlFor='sort-options'>Sort By</label>
            <select id='sort-options' onChange={handleSelectChange}>
              <option key='name-sort' value='name'>Name</option>
              <option key='popularity-sort' value='popularity'>Popularity</option>
            </select>

             <div id='output-container'>
              <div id='table-container'>
                {relatedArtist>0 && <table className='related-artists-container'>
                  <thead className="table-th">
                    <tr>
                      <th>Name</th>
                      <th>Popularity</th>           
                    </tr>
                  </thead>
                  <tbody id="related-artists-body"></tbody>
                </table> }
              

                {artistTrackList.length>0 &&                  
                    <ul id='tracks-list'>                    
                      {renderArtistTrackList(artistTrackList)}                    
                    </ul>                  
                }
              </div>
            </div>          
          </div>
        </div>
    )

};

export default SearchArtist;
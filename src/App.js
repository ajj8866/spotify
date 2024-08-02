import Spotify from './utils/Spotify';
import React, { useState } from "react";
import SearchArtist from './components/Artists/artists';
import './App.css';
import { sortByKey, renderArtist } from './utils/utilityFunctions';

function App() {

  const spot = new Spotify(process.env.REACT_APP_SPOTIFYSECRET, process.env.REACT_APP_SPOTIFYCLIENTID, "http://localhost:4000/callback");


  const [artist, setArtist] = useState('');
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [trackList, setTrack] = useState([]) 

  const handleArtistInputChange = (event) => {
      setArtist(event.target.value);
  };

  const handleArtistButtonClick = async (event) => {
      event.preventDefault()
      if (artist.trim() === '') {
          alert("Enter some value")
      };
      try {
          const artistQuery = await spot.getRelatedArtists(artist);
          setRelatedArtists(artistQuery)
          const initTracks = await spot.getArtistTracks(artist);
          setTrack(initTracks)

      } catch(err) {
          console.log(err)
      }
  };

  const handleSelectChange = (event) =>  {
    let temp = [...relatedArtists];
    if (event.target.value === 'name') {
      sortByKey(temp, 'name', false);
    } else {
      sortByKey(temp, 'popularity', true)
    }
    setRelatedArtists(temp)
  };

  
  return (
      <div className="App">
        <h1 id="main-title">Jam Stats</h1>
        <SearchArtist handleButtonClick={handleArtistButtonClick} handleInputChange={handleArtistInputChange}/>

        {relatedArtists.length>0 && 
        (
          <div>
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
                  <tbody>
                    {
                      relatedArtists.map((el) => (                        
                        <tr>
                          <td onClick={async () => {
                            let newArtist = await spot.getArtistTracks(el.name)                  
                            setTrack(newArtist)
                          }} key={el.name_key} className='rel-artist-name'>{el.name}</td>
                          <td key={el.pop_key}>{el.popularity}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>                                
                {trackList.length>0 &&
                  <table id='tracks-table'>
                    <tbody>
                      {renderArtist(trackList)}
                    </tbody>
                  </table>
                }
              </div>
            </div>          
          </div>
      )}
      </div>
  );
}

export default App;
import Spotify from './components/utils/Spotify';
import React, { useState, useEffect } from "react";
import SearchArtist from './components/Artists/artists';
import './App.css';
import { RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { sortByKey, renderArtist } from './components/utils/utilityFunctions';

function App() {

  const spot = new Spotify(process.env.REACT_APP_SPOTIFYSECRET, process.env.REACT_APP_SPOTIFYCLIENTID, "http://localhost:4000/callback");

  const [playlistId, setPlaylistId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null)
  const [artist, setArtist] = useState('');
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [trackList, setTrack] = useState([]) 


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // If a code is found, exchange it for an access token
      spot.accessToken(code);
    }
  }, []);

  const handleArtistInputChange = (event) => {
      setArtist(event.target.value);
  };

  const handleLogin = async () => {
    window.location.href = `${spot.authEndpoint}?client_id=${spot.clientId}&response_type=code&redirect_uri=${encodeURIComponent(spot.redirectUri)}&scope=playlist-modify-public`;

  }

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
        <h1 id="main-title">
          <span>Jam Stats</span> 
          <button id='login-button' onClick={handleLogin}>Login</button>
          </h1>        
        <button id='spotify-login' onClick={() => spot.login()}>Login</button>
        <SearchArtist handleButtonClick={handleArtistButtonClick} handleInputChange={handleArtistInputChange}/>
        {relatedArtists.length>0 && 
        (
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
                  <ul id='tracks-list'>                    
                      {renderArtist(trackList)}                    
                    </ul>                  
                }
              </div>
            </div>          
          </div>
      )}
      </div>
  );
}

export default App;
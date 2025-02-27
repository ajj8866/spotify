import Spotify from './components/utils/Spotify';
import React, { useState, useEffect, useRef } from "react";
import SearchArtist from './components/Artists/artists';
import './App.css';
// import { RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { sortByKey } from './components/utils/utilityFunctions';
import GetUserRecommendations from './components/User/userRec';


function App() {

  const spot = useRef(new Spotify(process.env.REACT_APP_SPOTIFYSECRET, process.env.REACT_APP_SPOTIFYCLIENTID, "http://localhost:4000/callback"));

  const [artist, setArtist] = useState('');
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [trackList, setTrack] = useState([]);
  const [loggedIn, setLoggedIn ] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);    

    // Attempeted whenever user navigates to page. In event code not provided as part of 
    // param nothing happens. Should code be provided it implies user has been redirected 
    // from login having called the handleCallback function and user information available 
    if (urlParams.get('code')) {
      spot.handleCallback();
    }
  }, [loggedIn]);

  const handleArtistInputChange = (event) => {
      const isLoggedIn = setArtist(event.target.value);
      setLoggedIn(isLoggedIn);
  };

  const handleArtistButtonClick = async (event) => {
      event.preventDefault()
      if (artist.trim() === '') {
          alert("Enter some value")
      };
      try {

          // Uses target artist to yield a list of related artists using setting the
          // array yielded to equal to the state for relatedArtists
          const artistQuery = await spot.getRelatedArtists(artist);
          setRelatedArtists(artistQuery)

          //  Tracks for target artist initially populate accompanying table 
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

  const populateWithRelatedArtists = () => {
    (relatedArtists.map((el) => (                        
      <tr>
        <td onClick={async () => {
          let newArtist = await spot.getArtistTracks(el.name)                  
          setTrack(newArtist)
        }} key={el.name_key} className='rel-artist-name'>{el.name}</td>
        <td key={el.pop_key}>{el.popularity}</td>
      </tr>
    ))
  )}
  
  return (
      <div className="App">
        <h1 id="main-title">
          <span>Jam Stats</span> 
          <button id='login-button' onClick={() => spot.login()}>Login</button>
        </h1>                
        <SearchArtist handleButtonClick={handleArtistButtonClick} handleInputChange={handleArtistInputChange} populateRelatedArtists={populateWithRelatedArtists} artistTrackList={trackList} handleSelectChange ={handleSelectChange} />
        <GetUserRecommendations />
      </div>
  );
}

export default App;
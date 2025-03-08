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
  const [trackList, setTrack] = useState([]); // Initially set to main artist and updates to populate with related artists on click
  const [loggedIn, setLoggedIn ] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);    

    // Attempeted whenever user navigates to page. In event code not provided as part of 
    // param nothing happens. Should code be provided it implies user has been redirected 
    // from login having called the handleCallback function and user information available 
    if (urlParams.get('code')) {
      const isLoggedIn = spot.current.handleCallback();
      setLoggedIn(isLoggedIn);
    }

  }, [loggedIn, relatedArtists, trackList, artist]);

  const handleArtistInputChange = (event) => {
    console.log("Artist: ");
    console.log(artist);
    setArtist(event.target.value);
    console.log(artist);
    console.log(event.target.value);
      // setLoggedIn(isLoggedIn);
  };

  const handleArtistButtonSubmit = async (event) => {
    /** */
      console.log("Current Artits: " + artist);
      event.preventDefault()
      if (artist.trim() === '') {
          alert("Enter some value")
      };
      try {

          // Uses target artist to yield a list of related artists using setting the
          // array yielded to equal to the state for relatedArtists
          const artistQuery = await spot.current.getRelatedArtists(artist);
          setRelatedArtists(artistQuery);
          const artistsTableId = document.getElementById("related-artists-body");
          relatedArtists.forEach((el) => {
            const newArtistRow = (
              <tr>
                <td key={el.name_key}>{el.name}</td>
                <td key={el.pop_key} >{el.popularity}</td>
              </tr>
            );
            artistsTableId.append(newArtistRow);
          })

          //  Tracks for target artist initially populate accompanying table 
          const initTracks = await spot.current.getArtistTracks(artist);
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
          <button id='login-button' onClick={() => spot.current.login()}>Login</button>
        </h1>                
        <SearchArtist handleArtistSubmit={handleArtistButtonSubmit} handleInputChange={handleArtistInputChange} artistTrackList={trackList} handleSelectChange ={handleSelectChange} relatedArtists={relatedArtists} />
        <GetUserRecommendations />
      </div>
  );
}

export default App;


// const trackList = document.getElementById("tracks-list");
    // (relatedArtists.forEach((el) => {                        
    //   const curRow = (<tr>
    //     <td onClick={async () => {
    //       let newArtist = await spot.current.getArtistTracks(el.name)                  
    //       setTrack(newArtist)
    //     }} key={el.name_key} className='rel-artist-name'>{el.name}</td>
    //     <td key={el.pop_key}>{el.popularity}</td>
    //   </tr>);

    //   trackList.append(curRow);
    // })
    // )



    // const populateWithRelatedArtistTracks = async (event) => {
    //   /**
    //    * Populates table with track pertaining to related artist clicked on        
    //    */
    //   event.preventDefault();
    //   const newTrackList = await spot.current.getArtistTracks(event.target.value);
    //   setTrack(newTrackList); // Automatically populates ul with ID tracks-list with tracks due to change in state      

    // };
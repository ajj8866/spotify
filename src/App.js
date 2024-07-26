import Spotify from './utils/Spotify';
import React, { useState } from "react";
import SearchArtist from './components/Artists/artists';
import './App.css';

function App() {

  const [artist, setArtist] = useState('');
  const [relatedArtists, setRelatedArtists] = useState([])
  const spot = new Spotify(process.env.REACT_APP_SPOTIFYSECRET, process.env.REACT_APP_SPOTIFYCLIENTID, "http://localhost:4000/callback");

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
          // for (const [k, v] in Object.entries(artistQuery)) {
          //     console.log(`${k}: ${v}`)
          // }
          // const relatedList = artistQuery.map(el => el.name);
          setRelatedArtists(artistQuery)
      } catch(err) {
          console.log(err)
      }
  }

  let nullRef = 0;
  
  const nullHandler = (el) => {
    if (el.key) {
      return el.key
    } else {
      nullRef++;
      return `nullRef-${nullRef}`
    }
  }
  return (
    <body>
      <div className="App">
        <div>
          <h1 id="main-title">Jam Stats</h1>
        </div>
        <SearchArtist handleButtonClick={handleArtistButtonClick} handleInputChange={handleArtistInputChange}/>
        <ul className='related-artists-container'>
          {relatedArtists.map(el => <li key={nullHandler(el)}>{el.name}</li>)}
        </ul>
      </div>
    </body>
  );
}

export default App;
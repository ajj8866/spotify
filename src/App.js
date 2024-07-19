import Spotify from './utils/Spotify';
import React, { useState } from "react";
import SearchArtist from './components/Artists/artists';

function App() {

  const [artist, setArtist] = useState('');
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
          const artistQuery = await spot.getArtist(artist);
          for (const [k, v] in Object.entries(artistQuery)) {
              console.log(`${k}: ${v}`)
          }
          return artistQuery
      } catch(err) {
          console.log(err)
      }
  }

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <body>
        <div>
          <h1>Jam Stats</h1>
        </div>
        <SearchArtist handleButtonClick={handleArtistButtonClick} handleInputChange={handleArtistInputChange}/>
      </body>
    </div>
  );
}

export default App;
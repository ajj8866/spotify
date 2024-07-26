import Spotify from './utils/Spotify';
import React, { useState } from "react";
import SearchArtist from './components/Artists/artists';
import './App.css';
import { sortByKey } from './utils/utilityFunctions';

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
          setRelatedArtists(artistQuery)
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
  }
  
  return (
    <body>
      <div className="App">
        <div>
          <h1 id="main-title">Jam Stats</h1>
        </div>
        <SearchArtist handleButtonClick={handleArtistButtonClick} handleInputChange={handleArtistInputChange}/>

        {relatedArtists.length>0 && 
        (
          <div>
            <select value='popularity' onChange={handleSelectChange}>
              <option key='name-sort' value='name'>Name</option>
              <option key='populatiry-sort' value='popularity'>Popularity</option>
            </select>
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
                      <td key={el.name_key}>{el.name}</td>
                      <td key={el.pop_key}>{el.popularity}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
      )}

      </div>
    </body>
  );
}

export default App;
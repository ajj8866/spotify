import Spotify from "../utils/Spotify";
import React, {useState, useRef} from "react";
import { Outlet } from "react-router-dom";

function Root() {
    const spot = useRef(new Spotify(process.env.REACT_APP_SPOTIFYSECRET, process.env.REACT_APP_SPOTIFYCLIENTID, "http://localhost:4000/callback"));

    const [apiAccessToken, setApiAccessToken] = useState(spot.current.accessToken);

    return (
        <div className="App">
            <h1 id="main-title">
            <span>Jam Stats</span> 
            <button id='login-button' onClick={() => spot.login()}>Login</button>
            </h1> 
            <Outlet />
        </div>
    )
}

export default Root;
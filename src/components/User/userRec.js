import React from "react";
// import './userRec.css' from 

const GetUserRecommendations = ( props ) => {
    
    const { handleOpts  } = props;

    return (
        <div>
            <form onClick={handleOpts}>
                <div className="form-group">
                    <label for="genre-select">Select Genre: </label>
                    <select id="genre-select" className="form-control">
                        <option value="all"></option>                    
                        <option value="rock"></option>
                        <option value="alternative"></option>
                        <option value="hardcore punk"></option>
                        <option value="rap"></option>
                        <option value="hip hop"></option>
                        <option value="punk"></option>
                        <option value="skate punk"></option>                    
                    </select>
                </div>

                <div>
                    <label for="min-popularity">Popularity Threshold: </label>
                    <input id="min-popularity" type="number" className="form-control"></input>
                    <small>Select the minimal poprularity rating for related artists</small>
                </div>
            </form>
        </div>
    )
}

export default GetUserRecommendations;
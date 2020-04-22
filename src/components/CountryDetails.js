import React from "react";
import { countryDetailsStyle } from "../styles/CountryDetailsStyle";

function CountryDetails(props) {
  return (
    <div style={countryDetailsStyle}>
      <h4>{props.data.name}</h4>
      <ul>
        <li>Confirmed Cases: {props.data.totalConfirmed}</li>
        <li>Deaths: {props.data.totalDeaths}</li>
        <li>Recoveries: {props.data.totalRecoveries}</li>
      </ul>
    </div>
  );
}

export default CountryDetails;

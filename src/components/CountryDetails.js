import React from "react";
import {
  countryDetailsStyle,
  listStyle,
  detailsContainer,
} from "../styles/CountryDetailsStyle";

/* CountryDetails is a component that displays the number
   of confirmed cases, number of deaths, and number of
   recoveries (all passed through props) for a specific country */
function CountryDetails(props) {
  return (
    <div style={countryDetailsStyle}>
      <div style={detailsContainer}>
        <h4>{props.data.name}</h4>
        <div style={listStyle}>
          <ul>
            <li>Confirmed Cases: {props.data.totalConfirmed}</li>
            <li>Deaths: {props.data.totalDeaths}</li>
            <li>Recoveries: {props.data.totalRecovered}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CountryDetails;

import React from "react";
import { mapSettingsStyle } from "../styles/MapSettingsStyle.js";
import centroidJson from "../content/centroids.json";

class MapSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      countries: [{ name: "Select A Country", code: "", centroid: null }],
      currentCountry: "",
    };
    this.handleCountryChange = this.handleCountryChange.bind(this);
  }

  componentDidMount() {
    const centroidReducer = (obj, centroid) => {
      obj[centroid["country"]] = {
        lat: centroid["latitude"],
        lng: centroid["longitude"],
      };
      return obj;
    };
    const centroids = centroidJson.reduce(centroidReducer, {});

    fetch("https://api.covid19api.com/countries").then((data) => {
      let availableCountries;
      data.json().then((json) => {
        availableCountries = json.map((country) => {
          return { name: country.Country, code: country.ISO2 };
        });
        availableCountries.forEach((country, index) => {
          if (!(typeof centroids[country["code"]] === "undefined")) {
            availableCountries[index]["centroid"] = centroids[country["code"]];
          }
        });
        this.setState((state, props) => ({
          countries: state.countries.concat(availableCountries),
        }));
      });
    });
  }

  handleCountryChange(event) {
    this.setState({ currentCountry: event.target.value });
  }

  render() {
    let countries = this.state.countries;

    return (
      <div>
        <select
          value={this.state.currentCountry}
          onChange={this.handleCountryChange}
          style={mapSettingsStyle}
        >
          {countries.map((country) => {
            return (
              <option value={country.code} key={country.code}>
                {country.name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

export default MapSettings;

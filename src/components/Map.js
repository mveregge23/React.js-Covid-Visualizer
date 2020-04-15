import React from "react";
import GoogleMapReact from "google-map-react";
import MapMarker from "./MapMarker.js";
import MapSettings from "./MapSettings.js";
import { bootstrapURLkey } from "../bootstrapURLkey.js";
import centroidJson from "../content/centroids.json";

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      covidData: {},
      currentCountry: "",
      center: { lat: 0, lng: 0 },
      zoom: 0,
    };
    this.handleCountryChange = this.handleCountryChange.bind(this);
  }

  handleCountryChange(event) {
    this.setState({ currentCountry: event.target.value });
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

    const dataReducer = (obj, data) => {
      obj[data["CountryCode"]] = {
        name: data["Country"],
        totalConfirmed: data["TotalConfirmed"],
        totalDeaths: data["TotalDeaths"],
        totalRecovered: data["TotalRecovered"],
      };
      return obj;
    };
    fetch("https://api.covid19api.com/summary").then((data) => {
      let formattedData;
      data.json().then((json) => {
        formattedData = json["Countries"].reduce(dataReducer, {});
        for (var countryCode in formattedData) {
          if (!(typeof centroids[countryCode] === "undefined")) {
            formattedData[countryCode]["centroid"] = centroids[countryCode];
          }
        }
        this.setState((state, props) => ({
          covidData: formattedData,
        }));
      });
    });
  }
  render() {
    return (
      <>
        <MapSettings
          countries={this.state.covidData}
          currentCountry={this.state.currentCountry}
          handleCountryChange={this.handleCountryChange}
        />
        <GoogleMapReact
          style={{ height: "100vh", width: "100vh" }}
          bootstrapURLKeys={{
            key: bootstrapURLkey,
            language: "en",
          }}
          defaultCenter={this.state.center}
          defaultZoom={this.state.zoom}
        >
          <MapMarker {...this.props.center} text="100" />
        </GoogleMapReact>
      </>
    );
  }
}

export default Map;

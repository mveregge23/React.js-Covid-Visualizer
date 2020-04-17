import React from "react";
import GoogleMapReact from "google-map-react";
import MapSettings from "./MapSettings.js";
import moment from "moment";
import { bootstrapURLkey } from "../bootstrapURLkey.js";
import centroidJson from "../content/centroids.json";
import * as reducers from "../utilities/reducers";

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      covidCountryData: null,
      heatmapData: null,
      heatmapOptions: {
        options: { dissipating: true, radius: 50, opacity: 0.7 },
      },
      currentCountry: "",
      center: { lat: 0, lng: 0 },
      zoom: 0,
    };
    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.initializeMap = this.initializeMap.bind(this);
    this.setHeatmapData = this.setHeatmapData.bind(this);
  }

  handleCountryChange(event) {
    this.setState({ currentCountry: event.target.value }, this.setHeatmapData);
  }

  initializeMap() {
    const centroids = centroidJson.reduce(reducers.centroidReducer, {});

    fetch("https://api.covid19api.com/summary").then((data) => {
      let formattedData;
      data.json().then((json) => {
        formattedData = json["Countries"].reduce(reducers.dataReducer, {});
        for (var countryCode in formattedData) {
          if (!(typeof centroids[countryCode] === "undefined")) {
            formattedData[countryCode]["centroid"] = centroids[countryCode];
          } else {
            delete formattedData[countryCode];
          }
        }
        this.setState({ covidCountryData: formattedData }, this.setHeatmapData);
      });
    });
  }

  setHeatmapData() {
    let heatmapData = {
      positions: [],
    };
    if (this.state.currentCountry === "") {
      for (var countryCode in this.state.covidCountryData) {
        heatmapData["positions"].push({
          code: countryCode,
          lat: this.state.covidCountryData[countryCode]["centroid"]["lat"],
          lng: this.state.covidCountryData[countryCode]["centroid"]["lng"],
          weight: this.state.covidCountryData[countryCode]["totalConfirmed"],
        });
      }
      this.setState({ heatmapData: heatmapData });
    } else {
      const country = this.state.covidCountryData[this.state.currentCountry][
        "slug"
      ];
      fetch(
        "https://api.covid19api.com/country/" +
          country +
          "/status/confirmed?from=" +
          moment().subtract(1, "days").format() +
          "&to=" +
          moment().format()
      ).then((data) => {
        data.json().then((json) => {
          json.forEach((dataPoint) => {
            if (dataPoint["Cases"] > 0) {
              heatmapData["positions"].push({
                lat: dataPoint["Lat"],
                lng: dataPoint["Lon"],
                weight: dataPoint["Cases"],
              });
            }
          });
          this.setState({ heatmapData: heatmapData });
        });
      });
    }
  }

  componentWillMount() {
    this.initializeMap();
  }

  render() {
    return (
      <>
        <MapSettings
          countries={
            this.state.covidCountryData === null
              ? {}
              : this.state.covidCountryData
          }
          currentCountry={this.state.currentCountry}
          handleCountryChange={this.handleCountryChange}
        />
        <GoogleMapReact
          style={{ height: "100vh", width: "100vh" }}
          bootstrapURLKeys={{
            key: bootstrapURLkey,
            language: "en",
          }}
          heatmapLibrary={true}
          heatmap={{ ...this.state.heatmapData, ...this.state.heatmapOptions }}
          defaultCenter={this.state.center}
          defaultZoom={this.state.zoom}
        ></GoogleMapReact>
      </>
    );
  }
}

export default Map;

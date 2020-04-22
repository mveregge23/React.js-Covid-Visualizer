import React from "react";
import GoogleMap from "google-map-react";
import MapSettings from "./MapSettings.js";
import CountryDetails from "./CountryDetails.js";
import moment from "moment";
import * as df from "../utilities/dataFormatters";

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      covidCountryData: null,
      heatmapData: null,
      currentCountry: "",
      countryDetails: "",
      center: { lat: 0, lng: 0 },
      zoom: 0,
    };

    this.heatmapOptions = {
      options: { dissipating: true, radius: 50, opacity: 0.7 },
    };
    fetch("https://api.covid19api.com/summary").then((data) => {
      data.json().then((json) => {
        const countryData = df.getFormattedSummary(json);
        this.state.covidCountryData = countryData;
        this.setHeatmapData();
      });
    });

    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.setHeatmapData = this.setHeatmapData.bind(this);
  }

  handleCountryChange(event) {
    this.setState({ currentCountry: event.target.value }, this.setHeatmapData);
  }

  setHeatmapData() {
    if (this.state.currentCountry === "") {
      let heatmapData = df.getWorldHeatmap(this.state.covidCountryData);
      this.setState(
        { heatmapData: heatmapData, countryDetails: "" },
        this.forceUpdate
      );
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
          let heatmapData = df.getCountryHeatmap(json);
          let countryDetails =
            this.state.currentCountry === "" ? (
              ""
            ) : (
              <CountryDetails
                lat={
                  this.state.covidCountryData[this.state.currentCountry][
                    "centroid"
                  ]["lat"]
                }
                lng={
                  this.state.covidCountryData[this.state.currentCountry][
                    "centroid"
                  ]["lng"]
                }
                data={this.state.covidCountryData[this.state.currentCountry]}
              />
            );
          this.setState(
            { heatmapData: heatmapData, countryDetails: countryDetails },
            this.forceUpdate
          );
        });
      });
    }
  }

  render() {
    if (
      this.state.covidCountryData === null ||
      this.state.heatmapData === null
    ) {
      return <div>Loading</div>;
    } else {
      return (
        <>
          <MapSettings
            countries={this.state.covidCountryData}
            currentCountry={this.state.currentCountry}
            handleCountryChange={this.handleCountryChange}
          />
          <GoogleMap
            style={{ height: "100vh", width: "100vh" }}
            heatmapLibrary={true}
            heatmap={{
              ...this.state.heatmapData,
              ...this.heatmapOptions,
            }}
            defaultCenter={this.state.center}
            defaultZoom={this.state.zoom}
          >
            {this.state.countryDetails}
          </GoogleMap>
        </>
      );
    }
  }
}

export default Map;

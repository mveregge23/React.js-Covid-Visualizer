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
      map: null,
      maps: null,
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
    this.onApiLoad = this.onApiLoad.bind(this);
  }

  onApiLoad(map, maps) {
    this.setState({ map: map, maps: maps });
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
                data={this.state.covidCountryData[this.state.currentCountry]}
              />
            );
          this.setState(
            { heatmapData: heatmapData, countryDetails: countryDetails },
            this.forceUpdate
          );
          let bounds = new this.state.maps.LatLngBounds();
          for (let i = 0; i < heatmapData["positions"].length; i++) {
            bounds.extend(
              new this.state.maps.LatLng(
                heatmapData["positions"][i]["lat"],
                heatmapData["positions"][i]["lng"]
              )
            );
          }
          this.state.map.fitBounds(bounds);
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
      const handleApiLoaded = (map, maps) => {
        /*let bounds = new maps.LatLngBounds();
        for (let i = 0; i < this.state.heatmapData["positions"].length; i++) {
          bounds.extend(
            new maps.LatLng(
              this.state.heatmapData["positions"][i]["lat"],
              this.state.heatmapData["positions"][i]["lng"]
            )
          );
        }
        map.fitBounds(bounds);*/
        map.setOptions({ maxZoom: 4 });
        this.setState({ map: map, maps: maps });
      };
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
            yesIWantToUseGoogleMapApiInternals={true}
            onGoogleApiLoaded={({ map, maps }) => {
              handleApiLoaded(map, maps);
            }}
            defaultCenter={this.state.center}
            defaultZoom={this.state.zoom}
          ></GoogleMap>
          {this.state.countryDetails}
        </>
      );
    }
  }
}

export default Map;

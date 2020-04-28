import React from "react";
import GoogleMap from "google-map-react";
import MapSettings from "./MapSettings.js";
import CountryDetails from "./CountryDetails.js";
import LoadingOverlay from "react-loading-overlay";
import moment from "moment";
import * as df from "../utilities/dataFormatters";

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiIsLoading: true,
      covidCountryData: null,
      heatmapData: null,
      currentCountry: "",
      countryDetails: "",
    };

    this.heatmapOptions = {
      options: { dissipating: true, radius: 50, opacity: 0.7 },
    };

    fetch("https://api.covid19api.com/summary").then((data) => {
      data.json().then((json) => {
        const countryData = df.getFormattedSummary(json);
        this.state.covidCountryData = countryData;
        this.setHeatmapData();
        this.state.apiIsLoading = false;
        this.forceUpdate();
      });
    });

    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.setHeatmapData = this.setHeatmapData.bind(this);
    this.handleApiLoaded = this.handleApiLoaded.bind(this);
  }

  handleApiLoaded(map, maps) {
    map.setOptions({ maxZoom: 4 });
    this.map = map;
    this.maps = maps;
  }

  handleCountryChange(event) {
    this.setState({ currentCountry: event.target.value }, this.setHeatmapData);
  }

  setHeatmapData() {
    if (this.state.currentCountry === "") {
      let heatmapData = df.getWorldHeatmap(this.state.covidCountryData);
      this.setState((state) => {
        return {
          heatmapData: heatmapData,
          countryDetails: "",
        };
      });
    } else {
      const country = this.state.covidCountryData[this.state.currentCountry][
        "slug"
      ];
      this.setState((state) => {
        return {
          apiIsLoading: !state.apiIsLoading,
        };
      });
      fetch(
        "https://api.covid19api.com/country/" +
          country +
          "/status/confirmed?from=" +
          moment().subtract(1, "days").format() +
          "&to=" +
          moment().format()
      )
        .then((data) => {
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
            this.setState({
              heatmapData: heatmapData,
              countryDetails: countryDetails,
            });
            let bounds = new this.maps.LatLngBounds();
            for (let i = 0; i < heatmapData["positions"].length; i++) {
              bounds.extend(
                new this.maps.LatLng(
                  heatmapData["positions"][i]["lat"],
                  heatmapData["positions"][i]["lng"]
                )
              );
            }
            this.map.fitBounds(bounds);
            this.setState((state) => {
              return {
                apiIsLoading: !state.apiIsLoading,
              };
            });
          });
        })
        .catch(() => {
          alert("Error loading data, try picking another country...");
          this.setState((state) => {
            return { apiIsLoading: !state.apiIsLoading };
          });
        });
    }
  }

  render() {
    if (!this.state.covidCountryData) {
      return <div>Loading</div>;
    } else {
      return (
        <LoadingOverlay
          active={this.state.apiIsLoading}
          text="Loading data..."
          spinner={true}
          styles={{
            wrapper: {
              height: "100vh",
              width: "100vw",
            },
          }}
        >
          <MapSettings
            countries={this.state.covidCountryData}
            currentCountry={this.state.currentCountry}
            handleCountryChange={this.handleCountryChange}
          />
          <GoogleMap
            style={{
              margin: "0",
              padding: "0",
            }}
            heatmapLibrary={true}
            heatmap={{
              ...this.state.heatmapData,
              ...this.heatmapOptions,
            }}
            yesIWantToUseGoogleMapApiInternals={true}
            onGoogleApiLoaded={({ map, maps }) => {
              this.handleApiLoaded(map, maps);
            }}
            defaultCenter={{ lat: 0, lng: 0 }}
            defaultZoom={0}
          ></GoogleMap>
          {this.state.countryDetails}
        </LoadingOverlay>
      );
    }
  }
}

export default Map;

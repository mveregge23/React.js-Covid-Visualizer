import React from "react";
import GoogleMap from "google-map-react";
import MapSettings from "./MapSettings.js";
import CountryDetails from "./CountryDetails.js";
import LoadingOverlay from "react-loading-overlay";
import moment from "moment";
import * as df from "../utilities/dataFormatters";
import getBounds from "../utilities/getBounds";
import staticSummaryData from "../content/summaryData.json";
import countryData from "../content/countryData.json";

/* Map is the parent component of the app that contains most of
   the state used to manage it. There are functions to handle
   changes to the country drop-down and manage the heat map */
class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiIsLoading: true, // used to manage rendering while waiting for response from API
      couldNotConnectToApi: false, // used to determine if app should use static data or not
      covidSummaryData: null, // generic summary data for every country
      heatmapData: null, // heatmap data for the map
      currentCountry: "", // country selected in the drop-down
      countryDetails: null, // details of the country selected in the drop-down
    };

    // options used to render the heatmap in the google maps interface
    this.heatmapOptions = {
      options: { dissipating: true, radius: 50, opacity: 0.7 },
    };

    /* fetching the generic summary data for all countries used to render 
       worldwide heatmap */
    fetch("https://api.covid19api.com/summary")
      .then((data) => {
        data.json().then((json) => {
          const summaryData = df.getFormattedSummary(json);
          this.state.covidSummaryData = summaryData;
          this.setHeatmapData();
          this.state.apiIsLoading = false;
          this.forceUpdate();
        });
      })
      .catch(() => {
        /* if issues connecting to API, use static data from April 27, 2020 instead */
        this.state.couldNotConnectToApi = true;
        const summaryData = df.getFormattedSummary(staticSummaryData);
        this.state.covidSummaryData = summaryData;
        this.setHeatmapData();
        this.state.apiIsLoading = false;
        this.forceUpdate();
      });

    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.setHeatmapData = this.setHeatmapData.bind(this);
    this.handleApiLoaded = this.handleApiLoaded.bind(this);
  }

  /* handleApiLoaded is called when the google maps interface is loaded
     so we can bring the map and maps interfaces into the component */
  handleApiLoaded(map, maps) {
    map.setOptions({ maxZoom: 4 });
    this.map = map;
    this.maps = maps;
  }

  /* handleCountryChange is passed down into the MapSettings component
     as an event handler for the onChange event, and dispatches an update
     to the heatmap data after the currentCountry is updated in state */
  handleCountryChange(event) {
    this.setState({ currentCountry: event.target.value }, this.setHeatmapData);
  }

  /* setHeatmapData is called in the component constructor, and everytime
     the currentCountry changes */
  setHeatmapData() {
    // if currentCountry is blank, display worldwide heatmap
    if (this.state.currentCountry === "") {
      let heatmapData = df.getWorldHeatmap(this.state.covidSummaryData);
      this.setState((state) => {
        return {
          heatmapData: heatmapData,
          countryDetails: "",
        };
      });
    }

    // otherwise, get the country specific heatmap data and display it
    else {
      const country = this.state.covidSummaryData[this.state.currentCountry][
        "slug"
      ];
      this.setState((state) => {
        return {
          apiIsLoading: !state.apiIsLoading,
        };
      });

      // fetch data from the last 24 hours if able to connect to api
      if (!this.state.couldNotConnectToApi) {
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
              // format data and update state
              let heatmapData = df.getCountryHeatmap(json);
              let countryDetails =
                this.state.currentCountry === "" ? (
                  ""
                ) : (
                  <CountryDetails
                    data={
                      this.state.covidSummaryData[this.state.currentCountry]
                    }
                  />
                );
              this.setState({
                heatmapData: heatmapData,
                countryDetails: countryDetails,
              });

              // fit map to zoom into currentCountry based on heatmap data lat lng bounds
              let bounds = getBounds(this.maps, heatmapData);
              this.map.fitBounds(bounds);
              this.setState((state) => {
                return {
                  apiIsLoading: !state.apiIsLoading,
                };
              });
            });
          })
          .catch(() => {
            // catch any issues with API loading
            alert("Error loading data, try picking another country...");
            this.setState((state) => {
              return { apiIsLoading: !state.apiIsLoading };
            });
          });
      }

      // otherwise, use the static country data
      else {
        let heatmapData = df.getCountryHeatmap(countryData[country]);
        let countryDetails =
          this.state.currentCountry === "" ? (
            ""
          ) : (
            <CountryDetails
              data={this.state.covidSummaryData[this.state.currentCountry]}
            />
          );
        this.setState({
          heatmapData: heatmapData,
          countryDetails: countryDetails,
        });

        // fit map to zoom into currentCountry based on heatmap data lat lng bounds
        let bounds = getBounds(this.maps, heatmapData);
        this.map.fitBounds(bounds);
        this.setState((state) => {
          return {
            apiIsLoading: !state.apiIsLoading,
          };
        });
      }
    }
  }

  render() {
    // wait for api call in constructor to finish fetching generic summary data
    if (!this.state.covidSummaryData) {
      return <div>Loading</div>;
    }

    // initial call is done, load the app
    else {
      let disclaimer = this.state.couldNotConnectToApi ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            color: "white",
            margin: "5px",
          }}
        >
          Could not connect to covid19api. You are viewing the app with data
          from select countries on 27 April 2020.
        </div>
      ) : (
        ""
      );
      return (
        /* LoadingOverlay is a package used to display a spinner while
           waiting for the api to respond with country-specific data */
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
            countries={this.state.covidSummaryData}
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
          {disclaimer}
        </LoadingOverlay>
      );
    }
  }
}

export default Map;

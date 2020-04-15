import React from "react";
import GoogleMapReact from "google-map-react";
import MapMarker from "./MapMarker.js";
import MapSettings from "./MapSettings.js";
import { bootstrapURLkey } from "../bootstrapURLkey.js";

class Map extends React.Component {
  static defaultProps = {
    center: { lat: 40.73, lng: -73.93 },
    zoom: 12,
  };
  render() {
    return (
      <>
        <MapSettings />
        <GoogleMapReact
          style={{ height: "100vh", width: "100vh" }}
          bootstrapURLKeys={{
            key: bootstrapURLkey,
            language: "en",
          }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          <MapMarker {...this.props.center} text="100" />
        </GoogleMapReact>
      </>
    );
  }
}

export default Map;

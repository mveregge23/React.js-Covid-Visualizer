import React from "react";
import { mapMarkerStyle } from "../styles/MapMarkerStyle.js";

class MapMarker extends React.Component {
  render() {
    return <div style={mapMarkerStyle}>{this.props.text}</div>;
  }
}
export default MapMarker;

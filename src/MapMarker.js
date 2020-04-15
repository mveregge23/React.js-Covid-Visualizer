import React from "react";
import { mapMarkerStyle } from "./MapMarkerStyle.js";

class MapMarker extends React.Component {
  render() {
    return <div style={mapMarkerStyle}>{this.props.text}</div>;
  }
}
<<<<<<< HEAD

=======
>>>>>>> 5dea9b7... add map marker and country select
export default MapMarker;

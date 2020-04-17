import React from "react";
import { mapSettingsStyle } from "../styles/MapSettingsStyle.js";

class MapSettings extends React.Component {
  render() {
    return (
      <div>
        <select
          value={this.props.currentCountry}
          onChange={this.props.handleCountryChange}
          style={mapSettingsStyle}
        >
          <option value="">- Select a Country -</option>
          {Object.keys(this.props.countries).map((countryCode) => {
            return (
              <option value={countryCode} key={countryCode}>
                {this.props.countries[countryCode]["name"]}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
}

export default MapSettings;

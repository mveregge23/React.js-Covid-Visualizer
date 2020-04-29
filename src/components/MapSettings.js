import React from "react";
import { mapSettingsStyle } from "../styles/MapSettingsStyle.js";

/* MapSettings is a component used to manage the list of available
   countries for which country-specific data can be loaded. Map
   passes the current country, an onChange handler, and the list
   of available countries through props. */
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

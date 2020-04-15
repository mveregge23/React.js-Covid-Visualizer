import React from "react";
<<<<<<< HEAD
import moment from "moment";
=======
>>>>>>> 5dea9b7... add map marker and country select

class MapSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      countries: [{ name: "Select A Country", slug: "" }],
<<<<<<< HEAD
      currentCountry: "",
=======
      cities: [],
      currentCountry: "",
      currentCity: "",
>>>>>>> 5dea9b7... add map marker and country select
    };
    this.handleCountryChange = this.handleCountryChange.bind(this);
  }

  componentDidMount() {
    fetch("https://api.covid19api.com/countries").then((data) => {
      let availableCountries;
      data.json().then((json) => {
        availableCountries = json.map((country) => {
          return { name: country.Country, slug: country.Slug };
        });
        this.setState((state, props) => ({
          countries: state.countries.concat(availableCountries),
        }));
        console.log(this.state.countries);
      });
    });
  }

  handleCountryChange(event) {
    this.setState({ currentCountry: event.target.value });
  }

  render() {
<<<<<<< HEAD
    let countries = this.state.countries,
      cities = this.state.cities;

    return (
      <div>
        <select
          value={this.state.currentCountry}
          onChange={this.handleCountryChange}
        >
          {countries.map((country) => {
            return (
              <option value={country.slug} key={country.slug}>
                {country.name}
              </option>
            );
          })}
        </select>
      </div>
=======
    let countries = this.state.countries;

    return (
      <select
        style={{ position: "absolute", top: "50px", zIndex: "1" }}
        value={this.state.currentCountry}
        onChange={this.handleCountryChange}
      >
        {countries.map((country) => {
          return (
            <option value={country.slug} key={country.slug}>
              {country.name}
            </option>
          );
        })}
      </select>
>>>>>>> 5dea9b7... add map marker and country select
    );
  }
}

export default MapSettings;

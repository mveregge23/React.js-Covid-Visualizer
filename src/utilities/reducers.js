const dataReducer = (obj, data) => {
  obj[data["CountryCode"]] = {
    slug: data["Slug"],
    name: data["Country"],
    totalConfirmed: data["TotalConfirmed"],
    totalDeaths: data["TotalDeaths"],
    totalRecovered: data["TotalRecovered"],
  };

  return obj;
};

const centroidReducer = (obj, centroid) => {
  obj[centroid["country"]] = {
    lat: centroid["latitude"],
    lng: centroid["longitude"],
  };
  return obj;
};

export { dataReducer, centroidReducer };

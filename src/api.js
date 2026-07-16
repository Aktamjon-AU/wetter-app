const API_Main_Url = "https://api.weatherapi.com/v1";
const API_Key = "ecb0f8538d554536829103821260606";
const Choosen_City_KEY = "choosenCityKey";

export async function getForecastWeather(location, days = 3) {
  const response = await fetch(
    `${API_Main_Url}/forecast.json?key=${API_Key}&q=id:${location}&lang=de&days=${days}`,
  );

  const dataWeather = await response.json();
  console.log(dataWeather);
  return dataWeather;
}

export async function searchCities(q) {

  const response = await fetch(`${API_Main_Url}/search.json?key=${API_Key}&q=${q}&lang=de`);

  const searchResults = await response.json();
  
  return searchResults;
  
}

export function getsavedChoosenCities() {

return JSON.parse(localStorage.getItem(Choosen_City_KEY)) || [];
}

export function saveChoosenCity (city) {

  const favorites = getsavedChoosenCities();

  if (favorites.find((favorite) => favorite === city)) {
    alert(city + "wurde bereits in den Favoriten hinzugefügt");
    return;
  }

  favorites.push(city);

  localStorage.setItem(Choosen_City_KEY, JSON.stringify(favorites));
}

export function removeChoosenCity (city) {

  const favorites = getsavedChoosenCities();

  const filteredFavorites = favorites.filter((favorite) => favorite !==city);

  localStorage.setItem(Choosen_City_KEY, JSON.stringify(filteredFavorites));
}

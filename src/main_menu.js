import {
  getForecastWeather,
  getsavedChoosenCities,
  removeChoosenCity,
  searchCities,
} from "./api";
import { loadDetailView } from "./daily_weather";
import { renderLoadingScreen } from "./loading";
import { rootElement } from "./main";
import { getConditionImagePath } from "./conditions";
import { formatTemperature } from "./utils";
import debounce from "debounce";

export async function loadMainMenu() {
  rootElement.classList.remove("background-image");
  renderLoadingScreen("Lade Übersicht...");
  await renderMainMenu();
}

async function renderMainMenu() {
  rootElement.innerHTML = `
    <div class="main_menu">
    ${getMainMenuHeaderHtml()}
    ${await getCitiesListHtml()}
    </div>
    `;
  eventListenerCities();
}

function getMainMenuHeaderHtml() {
  return `
    <div class="main-menu__header">Wetter <button class="main-menu__edit">Bearbeiten</button>
    </div>
    <div class="main-menu__search-bar">
          <input type="text" class="main-menu__search-input" placeholder="Nach Stadt suchen...">
          <div class= "main-menu__search-result"></div>
    </div>
    `;
}

const deleteIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>`;

function renderSearchResults(searchResults) {
  const searchResultEl = searchResults.map(
    (result) =>
      `
                <div class="search-result" data-city-name="${result.name}"  data-city-id="${result.id}">
                <h3 class= "search-result__name">${result.name}</h3>
                <p class="search-result__country">${result.country}</p>
                </div>`,
  );

  const searchResultHtml = searchResultEl.join("");

  const searchResultDiv = document.querySelector(".main-menu__search-result");
  searchResultDiv.innerHTML = searchResultHtml;
}

function renderLoadingResults() {
  const searchResultDiv = document.querySelector(".main-menu__search-result");
  searchResultDiv.innerHTML = `<div class="search-result">Lade Vorschläge...<div>`;
}

function registerSearchResultsEventListener() {
  const searchResults = document.querySelectorAll(".search-result");

  searchResults.forEach((searchResult) => {
    searchResult.addEventListener("click", () => {
      const cityName = searchResult.getAttribute("data-city-name");
      const cityId = searchResult.getAttribute("data-city-id");
      loadDetailView(cityName, cityId);
    });
  });
}

async function getCitiesListHtml() {
  const myChoosenCities = getsavedChoosenCities();

  if (!myChoosenCities || myChoosenCities.length < 1) {
    return "Noch keine Favoriten gespeichert.";
  }

  const myChoosenCitiesEl = [];

  for (let city of myChoosenCities) {
    const dataWeather = await getForecastWeather(city, 1);

    const { location, current, forecast } = dataWeather;
    const currentDay = forecast.forecastday[0];

    const conditionImage = getConditionImagePath(
      current.condition.code,
      current.is_day !== 1,
    );

    const cityHtml = `
         
        <div class="main-menu-card">
        <div class = "main-menu-card__delete" data-city-id= "${city}">${deleteIcon}</div>
            <div class="city" data-city-name= "${location.name}"  data-city-id="${city}"  ${conditionImage ? `style="--condition-image: url(${conditionImage})"` : ""}>
              <div class="city__left-site"> 
                <h2 class="city__name">${location.name}</h2>
                <div class="city__country">${location.country}</div>
                <div class="city__condition">${current.condition.text}</div>
              </div>
              <div class="city__right-site">
                <div class="city__temp">${formatTemperature(current.temp_c)}°</div>
                <div class="city__max-min">H:${formatTemperature(currentDay.day.maxtemp_c)}° T:${formatTemperature(currentDay.day.mintemp_c)}°</div>
              </div>
            </div>
          </div>
        `;

    myChoosenCitiesEl.push(cityHtml);
  }

  const myChoosenCitiesHtml = myChoosenCitiesEl.join("");

  return `
    <div class="main-menu__city-list">
    ${myChoosenCitiesHtml}
    </div>
    `;
}

function eventListenerCities() {
  const editButton = document.querySelector(".main-menu__edit");
  const deleteButton = document.querySelectorAll(".main-menu-card__delete");

  deleteButton.forEach((btn) => {
    btn.addEventListener("click", () => {
      removeChoosenCity(btn.getAttribute("data-city-id"));
      btn.parentElement.remove();
    });
  });

  editButton.addEventListener("click", () => {
    const EDIT__ATTRIBUTE = "data-edit-mode";

    if (!editButton.getAttribute(EDIT__ATTRIBUTE)) {
      editButton.setAttribute(EDIT__ATTRIBUTE, "true");
      editButton.textContent = "Fertig";

      deleteButton.forEach((btn) => {
        btn.classList.add("main-menu-card__delete--show");
      });
    } else {
      editButton.removeAttribute(EDIT__ATTRIBUTE);
      editButton.textContent = "Bearbeiten";

      deleteButton.forEach((btn) => {
        btn.classList.remove("main-menu-card__delete--show");
      });
    }
  });

  const searchBar = document.querySelector(".main-menu__search-input");

  searchBar.addEventListener(
    "input",
    debounce(async (e) => {
      const q = e.target.value;

      let searchResults = [];

      if (q.length > 1) {
        renderLoadingResults();
        searchResults = await searchCities(q);
        console.log(searchResults);
      }

      renderSearchResults(searchResults);
      registerSearchResultsEventListener();
    }, 500),
  );

  const cities = document.querySelectorAll(".city");

  cities.forEach((city) => {
    city.addEventListener("click", () => {
      const cityName = city.getAttribute("data-city-name");
      const cityId = city.getAttribute("data-city-id");
      loadDetailView(cityName, cityId);
    });
  });
}

import { rootElement } from "./main";
import { getForecastWeather, getsavedChoosenCities, saveChoosenCity } from "./api";
import {
  formatHourlyTime,
  formatTemperature,
  getDayOFWeek,
  nexUpdatedtHours,
  formatTo24Hour,
} from "./utils";
import { renderLoadingScreen } from "./loading";
import { getConditionImagePath } from "./conditions";
import { loadMainMenu } from "./main_menu";

export async function loadDetailView(cityName, cityId) {
  renderLoadingScreen("Lade Wetter für " + cityName + "...");
  //datenfetschen
  const dataWeather = await getForecastWeather(cityId);
  renderDetailView(dataWeather, cityId);

  eventlistenerBackButton(cityId);
}

function renderDetailView(dataWeather, cityId ) {
  const { location, current, forecast } = dataWeather;
  const currentDay = forecast.forecastday[0];

  const conditionImage = getConditionImagePath(
    current.condition.code,
    current.is_day !== 1,
  );

  if (conditionImage) {
    rootElement.style = `--setConditionImage: url(${conditionImage})`;
    rootElement.classList.add("background-image");
  }

  const isChoosen = getsavedChoosenCities().find((city) => city ===cityId)

  rootElement.innerHTML =
    getActionsHtml(!isChoosen) +
    getHeaderHtml(
      location.name,
      formatTemperature(current.temp_c),
      current.condition.text,
      formatTemperature(currentDay.day.maxtemp_c),
      formatTemperature(currentDay.day.mintemp_c),
    ) +
    getTodayForecastHtml(
      currentDay.day.condition.text,
      currentDay.day.maxwind_kph,
      forecast.forecastday,
      current.last_updated_epoch,
    ) +
    getNext3DaysWeather(forecast.forecastday) +
    otherStats(
      current.humidity,
      formatTo24Hour(currentDay.astro.sunrise),
      current.precip_mm,
      current.feelslike_c,
      formatTo24Hour(currentDay.astro.sunset),
      current.uv,
    );
}

function getActionsHtml(showChoosenButton = true) {
  const backIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="back_button">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>`;

  const choosenCityIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
  `;

  return `
  <div class= "action-bar">
  <div class= "action-bar__back">${backIcon}
  </div>
  ${showChoosenButton ? `<div class= "action-bar__choosen">${choosenCityIcon}</div>` : " "}
  </div>
  `;

  
}



function getHeaderHtml(location, currentTemp, condition, maxTemp, minTemp) {
  return `
        <div class="current-weather">
        <h2 class="current-weather__location">${location}</h2>
        <h1 class="current-weather__current-temperature">${currentTemp}°</h1>
        <p class="current-weather__condition">${condition}</p>
        <div class="current-weather__day-temperatures">
            <span class="current-weather__max-temperature">H:${maxTemp}°</span>
            <span class="current-weather__min-temperature">T:${minTemp}°</span>
        </div>
      </div>`;
}

function getTodayForecastHtml(
  condition,
  maxWind,
  forecastdays,
  lastUpdatedEpoch,
) {
  const hourlyForecastElements = nexUpdatedtHours(
    forecastdays,
    lastUpdatedEpoch,
  )
    .filter((el) => el !== undefined)
    .map(
      (hour, i) => `
    <div class="hourly-forecast">
            <div class="hourly-forecast__hours">${i === 0 ? "Jetzt" : formatHourlyTime(hour.time) + " Uhr"}</div>
            <img src="https:${hour.condition.icon}" alt="" class="hourly-forecast__icons">
            <div class="hourly-forecast__temperature">${formatTemperature(hour.temp_c)}°</div>
          </div>
    `,
    );

  const hourlyForecastHtml = hourlyForecastElements.join("");

  return `
          <div class="today-forecast">
        <div class="today-forecast__conditions">
          Heute ${condition}. Wind bis zu ${maxWind} km/h
        </div>
        <div class="today-forecast__hours">
          ${hourlyForecastHtml}
        </div>
      </div>
    `;
}

function getNext3DaysWeather(forecast) {
  const forecastElements = forecast.map(
    (forecastDay, i) => `
    <div class="next3Days-day">
      <div class="next3Days-day__day">${i === 0 ? "Heute" : getDayOFWeek(forecastDay.date)}</div>
      <img src="https:${forecastDay.day.condition.icon}" alt="" class="next3Days-day__icon">
      <div class="next3Days-day__max-temp">H:${formatTemperature(forecastDay.day.maxtemp_c)}°</div>
      <div class="next3Days-day__min-temp">T:${formatTemperature(forecastDay.day.mintemp_c)}°</div>
      <div class="next3Days-day__wind">Wind: ${forecastDay.day.maxwind_kph} km/h</div>
    </div>
    
    `,
  );
  const forecastHtml = forecastElements.join("");

  return `
  <div class="next3Days">
  <div class="next3Days__title">Vorhersage für die nächsten 3 Tage:</div>
  <div class="next3Days__days">
    ${forecastHtml}
  </div>
</div>`;
}

function otherStats(humidity, sunrise, precip, avgtemp, sunset, uv) {
  return `
  <div class="cardOtherStats">
        <div class="cardOtherStats__right">
          <div class="cardOtherStats__right__Humidity">
            <h3 class="cardOtherStats__right__Humidity__Header">Feuchtigkeit</h3>
            <h1 class="cardOtherStats__right__Humidity__Stat">${humidity}%</h1>
          </div>
          <div class="cardOtherStats__right__Sunup">
            <h3 class="cardOtherStats__right__Sunup__Header">Sonnenaufgang</h3>
            <h1 class="cardOtherStats__right__Sunup__Stat">${sunrise} Uhr</h1>
          </div>
          <div class="cardOtherStats__right__Rain">
            <h3 class="cardOtherStats__right__Rain__Header">Niederschlag</h3>
            <h1 class="cardOtherStats__right__Rain__Stat">${precip} mm</h1>
          </div>
        </div>

        <div class="cardOtherStats__left">
          <div class="cardOtherStats__left__Feel">
            <h3 class="cardOtherStats__left__Feel__Header">Gefühlt</h3>
            <h1 class="cardOtherStats__left__Feel__Stat">${avgtemp}°</h1>
          </div>

          <div class="cardOtherStats__left__Sundown">
            <h3 class="cardOtherStats__left__Sundown__Header">Sonnenuntergang</h3>
            <h1 class="cardOtherStats__left__Sundown__Stat">${sunset} Uhr</h1>
          </div>

          <div class="cardOtherStats__left__UV">
            <h3 class="cardOtherStats__left__UV__Header">UV-Index</h3>
            <h1 class="cardOtherStats__left__UV__Stat">${uv}</h1>
          </div>
        </div>
      </div>
  `;
}

function eventlistenerBackButton(cityId) {
  const backButton = document.querySelector(".action-bar__back");

  backButton.addEventListener("click", () => {
    loadMainMenu();
  });

  const choosenButton = document.querySelector(".action-bar__choosen");

  choosenButton?.addEventListener("click", () => {
    saveChoosenCity(cityId);
    choosenButton.remove();
  });
}

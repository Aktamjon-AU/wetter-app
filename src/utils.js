import { getForecastWeather } from "./api";

export function formatTemperature(temperature) {
  return Math.floor(temperature);
}

export function formatHourlyTime(time) {
  return time.split(" ")[1].split(":")[0];
}

export function nexUpdatedtHours(forecast, lastUpdatedEpoch) {
  const todaysForecast = forecast[0].hour;
  const tomorrowsForecast = forecast[1].hour;
  const newForecast = [];

  const firstFutureIndex = todaysForecast.findIndex(
    (hour) => hour.time_epoch > lastUpdatedEpoch,
  );
  console.log(firstFutureIndex);

  for (let i = firstFutureIndex - 1; i < todaysForecast.length; i++) {
    newForecast.push(todaysForecast[i]);
  }

  let tomorrowsIndex = 0;

  while (newForecast.length < 24) {
    newForecast.push(tomorrowsForecast[tomorrowsIndex]);
    tomorrowsIndex++;
  }

  return newForecast;
}

export function getDayOFWeek(date) {
  const dateObj = new Date(date);

  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  return days[dateObj.getDay()];
}

export function formatTo24Hour(time) {
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":");

  hours = Number(hours);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  return String(hours).padStart(2, "0") + ":" + minutes;
}

  export function debounce (callback, wait) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

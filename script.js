
const API_KEY = "PASTE_YOUR_API_KEY_HERE";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const status = document.getElementById("status");
const weatherSection = document.getElementById("weather");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    getWeather();
  }
});

async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    status.textContent = "Please enter a city name.";
    return;
  }

  if (API_KEY === "PASTE_YOUR_API_KEY_HERE") {
    status.textContent = "Please add your API key in script.js.";
    return;
  }

  status.textContent = "Loading weather...";
  weatherSection.hidden = true;
  searchBtn.disabled = true;

  try {
    const baseURL = "https://api.openweathermap.org/data/2.5";
    const query = `q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`${baseURL}/weather?${query}`),
      fetch(`${baseURL}/forecast?${query}`)
    ]);

    const current = await currentResponse.json();
    const forecast = await forecastResponse.json();

    if (!currentResponse.ok) {
      throw new Error(current.message || "Unable to find this city.");
    }

    if (!forecastResponse.ok) {
      throw new Error(forecast.message || "Unable to load the forecast.");
    }

    console.log("Current weather:", current);
    console.log("Forecast:", forecast);

    document.getElementById("cityName").textContent =
      `${current.name}, ${current.sys.country}`;

    document.getElementById("temperature").textContent =
      Math.round(current.main.temp);

    document.getElementById("description").textContent =
      current.weather[0].description;

    document.getElementById("weatherIcon").textContent =
      getEmoji(current.weather[0].main);

    document.getElementById("feels").textContent =
      Math.round(current.main.feels_like);

    document.getElementById("humidity").textContent =
      current.main.humidity;

    document.getElementById("wind").textContent =
      current.wind.speed;

    displayForecast(forecast);

    weatherSection.hidden = false;
    status.textContent = `Weather loaded for ${current.name}!`;

  } catch (error) {
    console.error(error);

    if (error.message === "Failed to fetch") {
      status.textContent =
        "Network error. Check your internet connection.";
    } else if (error.message === "city not found") {
      status.textContent =
        "City not found. Please check the spelling.";
    } else {
      status.textContent = `Error: ${error.message}`;
    }

  } finally {
    searchBtn.disabled = false;
  }
}

function displayForecast(data) {
  const container = document.getElementById("forecast");
  container.replaceChildren();

  const days = new Map();

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toLocaleDateString("en-CA");

    if (!days.has(key)) {
      days.set(key, {
        date,
        items: [],
        representative: item,
        distance: Infinity
      });
    }

    const day = days.get(key);
    day.items.push(item);

    const distance = Math.abs(
      date.getHours() * 60 + date.getMinutes() - 720
    );

    if (distance < day.distance) {
      day.distance = distance;
      day.representative = item;
    }
  });

  [...days.values()].slice(0, 5).forEach((day) => {
    const temperatures = day.items.map(
      (item) => item.main.temp
    );

    const weather = day.representative.weather[0];

    const card = document.createElement("div");
    card.className = "forecast-card";

    const date = document.createElement("p");
    date.textContent = day.date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric"
    });

    const icon = document.createElement("p");
    icon.textContent = getEmoji(weather.main);

    const condition = document.createElement("p");
    condition.textContent = weather.description;

    const temperature = document.createElement("p");
    temperature.textContent =
      `${Math.round(Math.max(...temperatures))}° / ` +
      `${Math.round(Math.min(...temperatures))}°C`;

    card.append(date, icon, condition, temperature);
    container.appendChild(card);
  });
}

function getEmoji(condition) {
  const icons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️"
  };

  return icons[condition] || "🌤️";
}

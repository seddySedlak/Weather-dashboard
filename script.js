/**
 * CONFIGURATION AND CONSTANTS
 */
import { API_KEY } from './config.js';

/** 
 * Mapping object for OpenWeatherMap icons to Boxicons and CSS colors 
 */
const weatherIcons = {
    "01d": { icon: "bx-sun", color: "icon-sunny" },
    "01n": { icon: "bx-moon", color: "icon-night" },
    "02d": { icon: "bx-cloud-sun", color: "icon-sunny" },
    "02n": { icon: "bx-cloud-moon", color: "icon-night" },
    "03d": { icon: "bx-cloud", color: "icon-cloudy" },
    "03n": { icon: "bx-cloud", color: "icon-cloudy" },
    "04d": { icon: "bx-cloud", color: "icon-cloudy" },
    "04n": { icon: "bx-cloud", color: "icon-cloudy" },
    "09d": { icon: "bx-cloud-drops", color: "icon-rainy" },
    "09n": { icon: "bx-cloud-drops", color: "icon-rainy" },
    "10d": { icon: "bx-cloud-rain", color: "icon-rainy" },
    "10n": { icon: "bx-cloud-rain", color: "icon-rainy" },
    "11d": { icon: "bx-cloud-lightning", color: "icon-storm" },
    "11n": { icon: "bx-cloud-lightning", color: "icon-storm" },
    "13d": { icon: "bx-cloud-snow", color: "icon-rainy" },
    "13n": { icon: "bx-cloud-snow", color: "icon-rainy" },
    "50d": { icon: "bx-cloud-light-rain", color: "icon-cloudy" },
    "50n": { icon: "bx-cloud-light-rain", color: "icon-cloudy" }
};

/**
 * INITIALIZATION AND EVENT LISTENERS
 */
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('cityInput');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const cityName = cityInput.value.trim();
    if (cityName) {
        getWeather(cityName);
        cityInput.value = "";
    }
});

/**
 * FETCH FUNCTIONS - Retrieving data from APIs
 */

/**
 * Fetches geographical coordinates and weather forecast for a given city.
 * @param {string} city - The name of the city to search for.
 */
async function getWeather(city) {
    try {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.length) throw new Error("City not found.");

        const { lat, lon } = geoData[0];
        const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        updateDashboard(city, weatherData);
    } catch (error) {
        console.error(`Application Error: ${error.message}`);
    }
}

/**
 * RENDERING FUNCTIONS - Updating the UI
 */

/**
 * Main coordinator for updating the entire dashboard.
 * @param {string} cityName - Name of the city.
 * @param {object} data - Weather data object from API.
 */
function updateDashboard(cityName, data) {
    const current = data.list[0];

    renderPrimaryCard(cityName, data);
    renderWeatherDetails(current);
    renderSunTimes(data.city);
    updateForecast(data.list);
}

/**
 * Updates the main card with city name, date, and current temperature.
 */
function renderPrimaryCard(city, data) {
    const current = data.list[0];
    
    // Calculate local city time
    const cityTime = new Date(new Date().getTime() + (new Date().getTimezoneOffset() * 60000) + (data.city.timezone * 1000));
    
    document.getElementById('cityName').innerText = city;
    document.getElementById('currentDate').innerText = cityTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
    document.getElementById('mainTemp').innerText = `${current.main.temp.toFixed(1)}°`;
    document.getElementById('tempMax').innerText = current.main.temp_max.toFixed(1);
    document.getElementById('tempMin').innerText = current.main.temp_min.toFixed(1);
    document.getElementById('weatherDesc').innerText = current.weather[0].main;

    // Icon update
    const iconInfo = weatherIcons[current.weather[0].icon] || { icon: "bx-question-mark", color: "" };
    const iconEl = document.getElementById('currentWeatherIcon');
    if (iconEl) iconEl.className = `bx ${iconInfo.icon} ${iconInfo.color}`;
}

/**
 * Updates the grid containing details like wind, humidity, and visibility.
 * @param {object} current - The current weather data object from the list.
 */
function renderWeatherDetails(current) {
    // Wind Section
    document.getElementById("windSpeed").innerText = current.wind.speed;
    const windIcon = document.querySelector('.bxs-caret-up');
    if (windIcon) windIcon.style.transform = `rotate(${current.wind.deg}deg)`;
    document.getElementById('windDir').innerText = getWindDirection(current.wind.deg);

    // Humidity Section
    document.getElementById('humidity').innerText = current.main.humidity;
    const bar = document.getElementById('humidityBar');
    if (bar) bar.style.width = `${current.main.humidity}%`;

    // Feels Like Section
    document.getElementById('feelsLike').innerText = current.main.feels_like.toFixed(1);
    document.getElementById('feelsLikeDesc').innerText = getFeelsLikeDesc(current.main.temp, current.main.feels_like);

    // Visibility Section
    const visKm = current.visibility / 1000;
    document.getElementById('visibility').innerText = visKm.toFixed(1);
    
    // Updated visibility logic based on your previous version
    let visDesc = "";
    if (visKm > 10) {
        visDesc = "It's perfectly clear.";
    } else if (visKm > 5) {
        visDesc = "Good visibility.";
    } else {
        visDesc = "Expect some haze or fog.";
    }
    
    const visDescEl = document.getElementById('visibilityDesc');
    if (visDescEl) visDescEl.innerText = visDesc;
}

/**
 * Updates Sunrise and Sunset times.
 */
function renderSunTimes(cityInfo) {
    const format = { hour: '2-digit', minute: '2-digit' };
    document.getElementById('sunsetTime').innerText = new Date(cityInfo.sunset * 1000).toLocaleTimeString('en-US', format);
    document.getElementById('sunriseTime').innerText = new Date(cityInfo.sunrise * 1000).toLocaleTimeString('en-US', format);
}

/**
 * Filters data and renders the 5-day forecast.
 */
function updateForecast(weatherList) {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';
    
    const dailyData = {};
    weatherList.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) dailyData[date] = [];
        dailyData[date].push(item);
    });

    // Skip current day and take the next 5 days
    Object.keys(dailyData).slice(1, 6).forEach(day => {
        const records = dailyData[day];
        const temps = records.map(r => r.main.temp);
        const iconCode = (records.find(r => r.dt_txt.includes('12:00:00')) || records[0]).weather[0].icon.replace('n', 'd');
        const iconInfo = weatherIcons[iconCode] || { icon: "bx-question-mark", color: "" };

        const li = document.createElement('li');
        li.className = 'forecast-item';
        li.innerHTML = `
            <span class="day">${new Date(day).toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span class="icon"><i class="bx ${iconInfo.icon} ${iconInfo.color}"></i></span>
            <span class="temps">
                <strong class="max">${Math.max(...temps).toFixed(1)}°</strong>
                <strong class="min">${Math.min(...temps).toFixed(1)}°</strong>
            </span>
        `;
        forecastList.appendChild(li);
    });
}

/**
 * HELPER FUNCTIONS - Calculations and logic
 */

/**
 * Converts wind degrees to cardinal direction names.
 */
function getWindDirection(deg) {
    const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
    return directions[Math.round(deg / 45) % 8];
}

/**
 * Generates a descriptive text based on temperature difference.
 */
function getFeelsLikeDesc(temp, feels) {
    const diff = feels - temp;
    if (Math.abs(diff) < 1) return "Similar to actual temp.";
    return diff > 0 ? "Warmer than actual." : "Colder than actual.";
}
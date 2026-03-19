import { API_KEY } from './config.js'

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('cityInput');

searchForm.addEventListener('submit', (event) =>{
    event.preventDefault();
    const cityName = cityInput.value;
    if (cityName != "") {
        console.log("City", cityName)
        getWeather(cityName)
        cityInput.value = "";
    }
})

async function getWeather(city){
    try{
        const geocoding = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geocoding);
    
        if (!geoResponse.ok) {
            throw new Error("Problem connecting to the Geocoding API.");
        }
    
        const geoData = await geoResponse.json();
    
        if (geoData.length == 0) {
            throw new Error("We couldn't find the city. Try a different name.");
        }
    
        const lat = geoData[0].lat
        const lon = geoData[0].lon
        console.log(`lat: ${lat}, lot: ${lon}`)
    

        const openweathermap = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`;
        const owmResponse = await fetch(openweathermap);

        if (!owmResponse.ok) {
            throw new Error(`Problem downloading data (Error: ${owmResponse.status})`);
        }

        const weatherData = await owmResponse.json();
        console.log("DATA:", weatherData);
        updateDashboard(city, weatherData)
    }catch (error) {
        console.error(`Aplication error: ${error.message}`)
    }
}

function getWindDirection(degree) {
    const directions = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
}

function updateDashboard(cityName, weatherData){
    const current = weatherData.list[0];

    document.getElementById('cityName').innerText = cityName;
    document.getElementById('mainTemp').innerText = current.main.temp.toFixed(1);
    document.getElementById('tempMax').innerText = current.main.temp_max.toFixed(1);
    document.getElementById('tempMin').innerText = current.main.temp_min.toFixed(1);
    document.getElementById('weatherDesc').innerText = current.weather[0].main;
    document.getElementById("windSpeed").innerText = current.wind.speed
    // TODO: weather image
    // https://openweathermap.org/img/wn/%7Bicon_code%7D@2x.png
    // const iconCode = current.weather[0].icon;
    // const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    // const iconElement = document.getElementById('weatherIcon');
    // if (iconElement) {
    //     iconElement.src = iconUrl;
    // }
    document.getElementById('windDir').innerText = getWindDirection(current.wind.deg);
    // TODO: direction of wind icon
    document.getElementById('feelsLike').innerText = current.main.feels_like.toFixed(1)
    document.getElementById('humidity').innerText = current.main.humidity
    // TODO: humidity bar
    document.getElementById('visibility').innerText = (current.visibility / 1000)
    const sunset = new Date((weatherData.city.sunset*1000))
    document.getElementById('sunsetTime').innerText = sunset.toLocaleTimeString(location, {
        hour: '2-digit',
        minute: '2-digit'
    })
    

}
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
    

        const openweathermap = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=cz`;
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

function updateDashboard(cityName, weatherData){
    const current = weatherData.current;
    const today = weatherData.daily[0]

    document.getElementById('cityName').innerText = cityName;
    document.getElementById('mainTemp').innerText = Math.round(current.temp)
}
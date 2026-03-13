import { API_KEY } from 'config.js'

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('cityInput');

searchForm.addEventListener('submit', (event) =>{
    event.preventDefault();
    const cityName = cityInput.value;
    console.log("City", cityName)
})

async function getWeather(city){
    const openweathermap = `https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid=${API_KEY}`;
    const geocoding = '';

}
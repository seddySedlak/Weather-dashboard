const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('cityInput');

searchForm.addEventListener('submit', (event) =>{
    event.preventDefault();
    const cityName = cityInput.value;
    console.log("City", cityName)
})
import { showToast } from './components/toast.js';
import { weatherIcons } from './components/weatherIcons.js';

document.addEventListener('DOMContentLoaded', () => {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
    const DEFAULT_COUNTRY = 'Ensenada';

  // Obtener ultima ciudad buscada
  const country = localStorage.getItem('country') || DEFAULT_COUNTRY;
  getWeather(country);

  // DOM Elements
  const elements = {
    countryInput: document.getElementById('countryInput'),
    searchBtn: document.getElementById('searchBtn'),
    countryDisplay: document.getElementById('country'),
    tempDisplay: document.getElementById('temp'),
    weatherDisplay: document.getElementById('weather'),
    iconDisplay: document.getElementById('icon'),
    humidityDisplay: document.getElementById('humedad'),
    pressureDisplay: document.getElementById('presion'),
    windDisplay: document.getElementById('viento'),
  };

  elements.searchBtn.addEventListener('click', () => {
    const country = elements.countryInput.value.trim();
    if (country) {
      getWeather(country);
    } else {
      showToast('Por favor ingrese una ciudad', 'warning');
    }
  });

  // Obtiene el clima de una ciudad
  async function getWeather(country) {
    try {
      const response = await fetch(
        `${WEATHER_API_URL}?q=${country}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!response.ok) {
        throw new Error(`No se encontró la ciudad : ${country}`);
      }

      localStorage.setItem('country', country);
      const data = await response.json();
      showResults(data);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  // Muestra los resultados en el DOM
  function showResults(data) {
    const { name, main, weather, wind } = data;
    elements.countryDisplay.innerHTML = name;
    elements.tempDisplay.innerHTML = `${main.temp}°C`;
    elements.weatherDisplay.innerHTML = weather[0].description;
    elements.iconDisplay.className = `wi ${weatherIcons[weather[0].icon]}`;
    elements.humidityDisplay.innerHTML = `Humedad: ${main.humidity}%`;
    elements.pressureDisplay.innerHTML = `Presión: ${main.pressure} hPa`;
    elements.windDisplay.innerHTML = `Viento: ${wind.speed} m/s`;
  }
});

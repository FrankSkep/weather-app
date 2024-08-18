import { showToast } from './components/toast.js';
import { weatherIcons } from './components/weatherIcons.js';

document.addEventListener('DOMContentLoaded', () => {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const API_KEY = '908c46b1dc97d4a73ad4500cde35d4c1';
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
    imageIcon : document.querySelector('.current-weather img'),
    humidityDisplay: document.getElementById('humedad'),
    pressureDisplay: document.getElementById('presion'),
    windDisplay: document.getElementById('viento'),
    dayDisplay: document.getElementById('day'),
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
      console.log(data)
      showResults(data);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  // Muestra los resultados en el DOM
  function showResults(data) {
    const { name, main, weather, wind, dt } = data;
    const date = new Date(dt * 1000); // Convertir marca de tiempo Unix a Date
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayOfWeek = daysOfWeek[date.getDay()]; // Obtener el día de la semana

    elements.countryDisplay.innerHTML += name;
    elements.dayDisplay.innerHTML = dayOfWeek;
    elements.tempDisplay.innerHTML = `${main.temp}°C`;
    elements.weatherDisplay.innerHTML = weather[0].description;

    switch(weather[0].main) {
      case 'Clear':
          elements.imageIcon.src = 'src/static/images/clear.png';
          break;

      case 'Rain':
          elements.imageIcon.src = 'src/static/images/rain.png';
          break;

      case 'Snow':
          elements.imageIcon.src = 'src/static/images/snow.png';
          break;

      case 'Clouds':
          elements.imageIcon.src = 'src/static/images/cloud.png';
          break;

      case 'Haze':
          elements.imageIcon.src = 'src/static/images/mist.png';
          break;

      default:
          elements.imageIcon.src = '';
    }
    elements.humidityDisplay.innerHTML = `Humedad: ${main.humidity}%`;
    elements.pressureDisplay.innerHTML = `Presión: ${main.pressure} hPa`;
    elements.windDisplay.innerHTML = `Viento: ${wind.speed} m/s`;
  }
});

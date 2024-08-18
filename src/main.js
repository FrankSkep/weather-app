import { showToast } from './utils/toast.js';
import { getWeatherIcon } from './utils/weatherIcon.js';
import { constants } from './utils/constants.js';

document.addEventListener('DOMContentLoaded', () => {
    // Obtener ultima ciudad buscada
    const country = localStorage.getItem('country') || constants.DEFAULT_COUNTRY;
    getWeather(country);

    // DOM Elements
    const elements = {
        countryInput: document.getElementById('countryInput'),
        searchBtn: document.getElementById('searchBtn'),
        countryDisplay: document.getElementById('country'),
        tempDisplay: document.getElementById('temp'),
        weatherDisplay: document.getElementById('weather'),
        imageIcon: document.querySelector('.current-weather img'),
        humidityDisplay: document.getElementById('humedad'),
        pressureDisplay: document.getElementById('presion'),
        windDisplay: document.getElementById('viento'),
        dayDisplay: document.getElementById('day'),
        forecastContainer: document.querySelector('.forecast-container'),
    };

    // Obtiene el clima de una ciudad
    async function getWeather(country) {
        try {
            const response = await fetch(
                `${constants.WEATHER_API_URL}?q=${country}&appid=${constants.API_KEY}&units=metric&lang=es`
            );
            if (!response.ok) {
                throw new Error(`No se encontró la ciudad: ${country}`);
            }

            localStorage.setItem('country', country);
            const data = await response.json();
            console.log(data);
            showResults(data);
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // Función para mostrar los resultados actuales y el pronóstico
    function showResults(data) {
        const { city, list } = data;

        // Mostrar resultados 'actuales' (ya que esta en intervalos de 3 horas)
        const currentWeather = list[0];
        const { main, weather, wind, dt } = currentWeather;

        const date = new Date(dt * 1000);

        const dayOfWeek = constants.DAYS_OF_WEEK[date.getDay()];

        elements.countryDisplay.innerHTML = city.name;
        elements.dayDisplay.innerHTML = dayOfWeek;
        elements.tempDisplay.innerHTML = `${main.temp}°C`;
        elements.weatherDisplay.innerHTML = weather[0].description;
        elements.imageIcon.src = getWeatherIcon(weather[0].main);
        elements.humidityDisplay.innerHTML = `Humedad: ${main.humidity}%`;
        elements.pressureDisplay.innerHTML = `Presión: ${main.pressure} hPa`;
        elements.windDisplay.innerHTML = `Viento: ${wind.speed} m/s`;

        // Mostrar pronóstico de 5 días
        updateForecast(list);
    }

    function updateForecast(forecastData) {
        elements.forecastContainer.innerHTML = ''; // Limpiar el contenido actual

        // Agrupar los datos del pronóstico diario usando reduce
        const dailyForecast = forecastData.reduce((acc, item) => {
            const date = new Date(item.dt * 1000);
            const dayString = date.toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
            const temp = item.main.temp;
            const weather = item.weather[0].main;
            const description = item.weather[0].description;
            const dayName = date.getDay();

            if (!acc[dayString]) {
                acc[dayString] = {
                    temp: temp,
                    weather: weather,
                    description: description,
                    dayName: dayName,
                    count: 1,
                };
            } else {
                acc[dayString].temp = (
                    (acc[dayString].temp * acc[dayString].count + temp) /
                    (acc[dayString].count + 1)
                ).toFixed(1);
                acc[dayString].count += 1;
            }

            return acc;
        }, {});

        // Crear tarjetas para los próximos 5 días
        const sortedDays = Object.keys(dailyForecast)
            .sort((a, b) => new Date(a) - new Date(b))
            .slice(1, 5);

        const fragment = document.createDocumentFragment();

        sortedDays.forEach((day) => {
            const dayData = dailyForecast[day];

            const card = document.createElement('div');
            card.className = 'forecast-card';

            const dayElement = document.createElement('div');
            dayElement.className = 'forecast-day';
            dayElement.textContent = constants.DAYS_OF_WEEK[dayData.dayName];
            card.appendChild(dayElement);

            const icon = document.createElement('img');
            icon.src = getWeatherIcon(dayData.weather);
            icon.alt = 'Ícono del clima';
            card.appendChild(icon);

            const tempElement = document.createElement('div');
            tempElement.className = 'forecast-temp';
            tempElement.textContent = `${dayData.temp}°C`;
            card.appendChild(tempElement);

            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'forecast-description';
            descriptionElement.textContent = dayData.description;
            card.appendChild(descriptionElement);

            fragment.appendChild(card);
        });

        elements.forecastContainer.appendChild(fragment);
    }

    // Evento para buscar el clima de una ciudad
    elements.searchBtn.addEventListener('click', () => {
        const country = elements.countryInput.value.trim();
        if (country) {
            getWeather(country);
        } else {
            showToast('Por favor ingrese una ciudad', 'warning');
        }
    });

    // Evento para buscar el clima de una ciudad al presionar Enter
    elements.countryInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita el comportamiento predeterminado del Enter
            searchBtn.click(); // Simula un clic en el botón de búsqueda
        }
    });
});

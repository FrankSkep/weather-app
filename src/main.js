import { showToast } from './utils/toast.js';
import { getWeatherIcon } from './utils/weatherIcon.js';

document.addEventListener('DOMContentLoaded', () => {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
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
        imageIcon: document.querySelector('.current-weather img'),
        humidityDisplay: document.getElementById('humedad'),
        pressureDisplay: document.getElementById('presion'),
        windDisplay: document.getElementById('viento'),
        dayDisplay: document.getElementById('day'),
        forecastContainer: document.querySelector('.forecast-container'),
    };

    elements.searchBtn.addEventListener('click', () => {
        const country = elements.countryInput.value.trim();
        if (country) {
            getWeather(country);
        } else {
            showToast('Por favor ingrese una ciudad', 'warning');
        }
    });

    elements.countryInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita el comportamiento predeterminado del Enter
            searchBtn.click(); // Simula un clic en el botón de búsqueda
        }
    });

    // Obtiene el clima de una ciudad
    async function getWeather(country) {
        try {
            const response = await fetch(
                `${WEATHER_API_URL}?q=${country}&appid=${API_KEY}&units=metric&lang=es`
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
        const daysOfWeek = [
            'Domingo',
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
        ];
        const dayOfWeek = daysOfWeek[date.getDay()];

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

    // Funcion para mostrar el pronostico de 5 dias
    function updateForecast(forecastData) {
        elements.forecastContainer.innerHTML = ''; // Limpiar el contenido actual

        // Crear un objeto para almacenar el pronóstico diario
        const dailyForecast = {};

        // Definir los días de la semana
        const daysOfWeek = [
            'Domingo',
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
        ];

        // Obtener la fecha actual
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
        const todayString = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD

        // Iterar sobre los datos del pronóstico
        forecastData.forEach((item) => {
            const date = new Date(item.dt * 1000);
            const dayString = date.toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD

            // Agrupar los datos por día
            if (!dailyForecast[dayString]) {
                dailyForecast[dayString] = {
                    temp: item.main.temp, // Tomar la temperatura del primer registro del día
                    weather: item.weather[0].main,
                    description: item.weather[0].description,
                    dayName: date.getDay(), // Obtener el nombre del día de la semana
                    count: 1, // Contador para promediar
                };
            } else {
                dailyForecast[dayString].temp += item.main.temp; // Acumular la temperatura
                dailyForecast[dayString].count += 1; // Incrementar el contador
            }
        });

        // Promediar las temperaturas
        Object.keys(dailyForecast).forEach((day) => {
            dailyForecast[day].temp = (
                dailyForecast[day].temp / dailyForecast[day].count
            ).toFixed(1);
        });

        // Crear tarjetas para los próximos 5 días
        const sortedDays = Object.keys(dailyForecast)
            .sort((a, b) => new Date(a) - new Date(b)) // Ordenar por fecha
            .slice(1, 6); // Obtener los primeros 5 días

        sortedDays.forEach((day) => {
            const dayData = dailyForecast[day];

            const card = document.createElement('div');
            card.className = 'forecast-card';

            // Crear y agregar el día
            const dayElement = document.createElement('div');
            dayElement.className = 'forecast-day';
            dayElement.textContent = daysOfWeek[dayData.dayName];
            card.appendChild(dayElement);

            // Crear y agregar el ícono del clima
            const icon = document.createElement('img');
            icon.src = getWeatherIcon(dayData.weather);
            icon.alt = 'Ícono del clima';
            card.appendChild(icon);

            // Crear y agregar la temperatura
            const tempElement = document.createElement('div');
            tempElement.className = 'forecast-temp';
            tempElement.textContent = `${dayData.temp}°C`;
            card.appendChild(tempElement);

            // Crear y agregar descripcion
            const descriptionElement = document.createElement('div');
            descriptionElement.className = 'forecast-description';
            descriptionElement.textContent = dayData.description;
            card.appendChild(descriptionElement);

            // Agregar la tarjeta al contenedor
            elements.forecastContainer.appendChild(card);
        });
    }
});

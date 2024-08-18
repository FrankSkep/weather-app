// Función para obtener el ícono del clima basado en la descripción
export function getWeatherIcon(description) {
    switch (description) {
        case 'Clear':
            return 'src/static/images/clear.png';
        case 'Rain':
            return 'src/static/images/rain.png';
        case 'Snow':
            return 'src/static/images/snow.png';
        case 'Clouds':
            return 'src/static/images/cloud.png';
        case 'Haze':
            return 'src/static/images/mist.png';
        default:
            return '';
    }
}

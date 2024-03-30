// Função para converter Unix timestamp em objeto Date
function convertUnixTimestampToDateString(timestamp) {
    return new Date(timestamp);
}

function convertKToC(temp) {
    return temp - 273.15;
}

function calculaVelocidade(windUArray, windVArray) {
    const windSpeed = Math.sqrt(Math.pow(windUArray, 2) + Math.pow(windVArray, 2));

    return windSpeed.toFixed(0);
}

function convertePressure(pressure) {
    return pressure / 100;
}

function formatDateToLocalTime(date) {
    return date.toLocaleString();
}

function calculateWindDirectionDegrees(u, v) {

    const wind_abs = Math.sqrt(u*u + v*v);
    const wind_dir_trig_to = Math.atan2(u/wind_abs, v/wind_abs);
    const wind_dir_trig_to_degrees = ((wind_dir_trig_to) * 180/Math.PI);
    const wind_dir_trig_from_degrees = wind_dir_trig_to_degrees + 180;
    if(wind_dir_trig_from_degrees > 360){
        return (wind_dir_trig_from_degrees = wind_dir_trig_from_degrees - 360).toFixed(0);
    }else {
        return (wind_dir_trig_to_degrees + 180).toFixed(0);
    }
}

const coordenadas = { lat: 51.3051, lon: -0.7544 };

// Função para inicializar o mapa
function initMap() {
    // Coordenadas para o centro do mapa
    const coordenadasMapa = { lat: coordenadas.lat, lng: coordenadas.lon };

    // Opções do mapa
    const mapOptions = {
        center: coordenadasMapa,
        zoom: 10 // Zoom padrão
    };

    // Criar o objeto do mapa
    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Adicionar um marcador (PIN) ao mapa
    const marker = new google.maps.Marker({
        position: coordenadasMapa,
        map: map,
        title: 'Localização atual' // Título do marcador (opcional)
    });

    return map;
}

const dataToSend = {
    "lat": coordenadas.lat,
    "lon": coordenadas.lon,
    "model": "gfs",
    "parameters": ["temp", "wind", "pressure", "ptype", "windGust"],
    "levels": ["surface"],
    "key": "wKe6PWiC4Gmq3Llii6pIXBbWmslhioC7"
};

const apiUrl = 'https://api.windy.com/api/point-forecast/v2';

const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
};

const weatherInfoContainer = document.getElementById('weather-info');

fetch(apiUrl, requestOptions)
    .then(response => {
        if (response.ok == false) {
            throw new Error('Erro ao fazer solicitação: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        const tsArray = data.ts;
        const tempSurfaceArray = data['temp-surface'];
        const windVArray = data['wind_u-surface'];
        const windUArray = data['wind_u-surface'];
        const pressureArray = data['pressure-surface'];
        const pTypeArray = data['ptype-surface'];
        const gustArray = data['gust-surface'];

        // Inicializar o mapa
        const map = initMap();

        for (let index = 0; index <= 20; index++) {
            const date = convertUnixTimestampToDateString(tsArray[index]);
            const tempCelsius = convertKToC(tempSurfaceArray[index]).toFixed(0);
            const windSpeed = calculaVelocidade(windUArray[index], windVArray[index].toFixed(0));
            const windDirection = calculateWindDirectionDegrees(windUArray[index], windVArray[index].toFixed(0));
            const pressurehPa = convertePressure(pressureArray[index]).toFixed(0);
            if(gustArray[index]<(calculaVelocidade(windUArray[index], windVArray[index])+10)){
                gustArray[index] = 0;
            }
            const gust = gustArray[index].toFixed(0);

            let pType = '';

            switch (pTypeArray[index]) {
                case 0:
                    pType = 'Sem precipitação';
                    break;
                case 1:
                    pType = 'Chuva';
                    break;
                case 3:
                    pType = 'Chuva congelante';
                    break;
                case 5:
                    pType = 'Neve';
                    break;
                default:
                    pType = 'Tipo desconhecido';
            }

            const weatherInfoElement = document.createElement('div');
            weatherInfoElement.innerHTML = `
                <p>Data: ${formatDateToLocalTime(date)}</p>
                <p>Temperatura: ${tempCelsius}°C</p>
                <p>Direção do Vento: ${windDirection}°</p>
                <p>Velocidade do Vento: ${windSpeed} km/h</p>
                <p>Rajada de Vento: ${gust} km/h</p>
                <p>Pressão: ${pressurehPa} hPa</p>
                <p>Precipitação: ${pType}</p>
                <hr>
            `;
            weatherInfoContainer.appendChild(weatherInfoElement);
        }
    })
    .catch(error => {
        console.error('Erro na solicitação:', error);
    });

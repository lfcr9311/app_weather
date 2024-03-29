// Função para converter Unix timestamp em objeto Date
function convertUnixTimestampToDateString(timestamp) {
    return new Date(timestamp);
}

function convertKToC(temp) {
    return temp - 273.15;
}

function converteMsToKmh(speed) {
    return speed * 3.6;
}

function convertePressure(pressure) {
    return pressure / 100;
}

// Função para formatar a data para o fuso horário local
function formatDateToLocalTime(date) {
    return date.toLocaleString();
}

// Essa conta tem que ser refeita, pois não condiz com a previsão local
function calculateWindDirectionDegrees(u, v) {
    // Calcular o ângulo em radianos usando a função arco-tangente (Math.atan2)
    const angleRadians = Math.atan2(u,v);

    // Converter o ângulo de radianos para graus
    const angleDegreesCalculated = (angleRadians * 180 / Math.PI + 360) % 360;

    return angleDegreesCalculated;
}

const coordenadas = { lat: -30.0, lon: -51.2300 };

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

        for (let index = 2; index <= 20; index++) {
            const date = convertUnixTimestampToDateString(tsArray[index]);
            const tempCelsius = convertKToC(tempSurfaceArray[index]).toFixed(0);
            const windSpeedKmh = converteMsToKmh(Math.sqrt(windVArray[index] ** 2 + windUArray[index] ** 2)).toFixed(0);
            const pressurehPa = convertePressure(pressureArray[index]).toFixed(0);
            const windDirectionDegrees = calculateWindDirectionDegrees(windUArray[index], windVArray[index]);
            let gust = converteMsToKmh(gustArray[index]).toFixed(0);

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
                <p>Velocidade do Vento: ${windSpeedKmh} km/h</p>
                <p>Direção do Vento: ${windDirectionDegrees}°</p>
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

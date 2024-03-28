// Função para converter Unix timestamp em objeto Date
function convertUnixTimestampToDateString(timestamp) {
    return new Date(timestamp);
}

// Função para converter temperatura de Kelvin para Celsius
function convertKToC(temp){
    return temp - 273.15;
}

// Função para converter velocidade de m/s para km/h
function converteMsToKmh(speed) {
    return speed * 3.6;
}

function convertePressure(pressure){
    return pressure / 100;
}

// Função para formatar a data para o fuso horário local
function formatDateToLocalTime(date) {
    return date.toLocaleString();
}

// Dados a serem enviados para a API
const dataToSend = {
    "lat": -30.0346,
    "lon": -51.2300,
    "model": "gfs",
    "parameters": ["temp", "wind", "pressure"],
    "levels": ["surface"],
    "key": ""
};

// URL da API
const apiUrl = 'https://api.windy.com/api/point-forecast/v2';

// Configuração da solicitação
const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataToSend)
};

// Fazendo a solicitação para a API
fetch(apiUrl, requestOptions)
    .then(response => {
        // Verifica se a solicitação foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao fazer solicitação: ' + response.status);
        }
        // Se estiver tudo bem, converte a resposta para JSON
        return response.json();
    })
    .then(data => {

        const tsArray = data.ts;
        const tempSurfaceArray = data['temp-surface'];
        const windVArray = data['wind_u-surface'];
        const windUArray = data['wind_u-surface'];
        const pressureArray = data['pressure-surface'];

        const dates = tsArray.map(timestamp => new Date(timestamp));

        const tempSurface = tempSurfaceArray.map(temp => convertKToC(temp).toFixed(2));

        if (windVArray && windUArray && windVArray.length === windUArray.length) {
            const windSpeedArray = windVArray.map((v, index) => {
                const speed = Math.sqrt(v ** 2 + windUArray[index] ** 2);
                return converteMsToKmh(speed).toFixed(1); // Convertendo para km/h e arredondando para uma casa decimal
            });
            console.log('Array de velocidades do vento (km/h):', windSpeedArray);
        } else {
            console.log('Dados de vento não encontrados ou incompletos na resposta da API');
        }

        const pressureSurface = pressureArray.map(pressure => convertePressure(pressure).toFixed(0));
            console.log(pressureSurface);
        // Exibir o array de datas formatadas para o fuso horário local
        const datesFormatted = dates.map(date => formatDateToLocalTime(date));
        console.log("Array de datas formatadas para o fuso horário local:", datesFormatted);
    })
    .catch(error => {
        // Manipula erros de solicitação
        console.error('Erro na solicitação:', error);
    });

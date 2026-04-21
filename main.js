const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=35.1631&longitude=129.1636&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=Asia%2FSeoul';

async function fetchWeather() {
      try {
                const response = await fetch(API_URL);
                const data = await response.json();
                updateUI(data);
      } catch (error) {
                console.error('Error fetching weather:', error);
      }
}

function updateUI(data) {
      const current = data.current;
      document.getElementById('current-temp').textContent = Math.round(current.temperature_2m);
      document.getElementById('humidity').textContent = current.relative_humidity_2m + '%';
      document.getElementById('wind-speed').textContent = current.wind_speed_10m + ' km/h';
      document.getElementById('weather-desc').textContent = getWeatherDesc(current.weather_code);
      updateHourly(data.hourly);
}

function getWeatherDesc(code) {
      const codes = { 0: 'Clear', 1: 'Mainly Clear', 2: 'Cloudy', 3: 'Overcast', 61: 'Rain' };
      return codes[code] || 'Cloudy';
}

function updateHourly(hourly) {
      const list = document.getElementById('hourly-list');
      list.innerHTML = '';
      for (let i = 0; i < 12; i++) {
                const item = document.createElement('div');
                item.className = 'hourly-item';
                item.innerHTML = `<div class="time">${i}:00</div><div class="temp">${Math.round(hourly.temperature_2m[i])}C</div>`;
                list.appendChild(item);
      }
}

function updateTime() {
      document.getElementById('current-time').textContent = new Date().toLocaleTimeString();
}

// Initialization
fetchWeather();
updateTime();
setInterval(fetchWeather, 600000);
setInterval(updateTime, 1000);

// Footer update
const footerInterval = setInterval(() => {
          const footerP = document.querySelector('.footer p') || document.querySelector('footer p');
          if (footerP) {
                        footerP.innerHTML = 'Data provided by Open-Meteo  | Created by tjdud';
                        clearInterval(footerInterval);
          }
}, 500);

setInterval(updateTime, 1000);
fetchWeather();

lucide.createIcons();

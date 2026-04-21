const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=35.163&longitude=129.163&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=auto';
async function fetchWeather() {
      try {
            const response = await fetch(API_URL);
            const data = await response.json();
            updateUI(data);
      } catch (error) { console.error('Error:', error); }
}
function updateUI(data) {
      const current = data.current;
      const tempEl = document.getElementById('current-temp');
      if (tempEl) tempEl.textContent = Math.round(current.temperature_2m);
      const humEl = document.getElementById('humidity');
      if (humEl) humEl.textContent = current.relative_humidity_2m + '%';
      const windEl = document.getElementById('wind-speed');
      if (windEl) windEl.textContent = current.wind_speed_10m + ' km/h';
      const descEl = document.getElementById('weather-desc');
      if (descEl) descEl.textContent = 'Weather Data Active';
      updateHourly(data.hourly);
}
function updateHourly(hourly) {
      const list = document.getElementById('hourly-list');
      if (!list) return;
      list.innerHTML = '';
      for (let i = 0; i < 12; i++) {
            const item = document.createElement('div');
            item.className = 'hourly-item';
            item.style.padding = '10px';
            item.textContent = i + ':00 | ' + Math.round(hourly.temperature_2m[i]) + 'C';
            list.appendChild(item);
      }
}
function updateTime() {
      const el = document.getElementById('current-time');
      if (el) el.textContent = new Date().toLocaleTimeString();
}
fetchWeather();
updateTime();
setInterval(fetchWeather, 600000);
setInterval(updateTime, 1000);
const f = document.createElement('div');
f.style.cssText = 'text-align:center;padding:20px;color:rgba(255,255,255,0.6);';
f.innerHTML = 'Data by Open-Meteo | Created by tjdud';
document.body.appendChild(f);

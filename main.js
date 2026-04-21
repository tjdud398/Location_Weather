/**
 * Haeundae Weather Tracker - Main Logic
 */

const CONFIG = {
    LAT: 35.163,
    LON: 129.163,
    API_URL: 'https://api.open-meteo.com/v1/forecast',
    REFRESH_INTERVAL: 10 * 60 * 1000 // 10 minutes
};

const UI = {
    currentTime: document.getElementById('current-time'),
    currentTemp: document.getElementById('current-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    tempMax: document.getElementById('temp-max'),
    tempMin: document.getElementById('temp-min'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    visibility: document.getElementById('visibility'),
    pressure: document.getElementById('pressure'),
    mainIcon: document.getElementById('main-icon'),
    hourlyList: document.getElementById('hourly-list')
};

/**
 * WMO Weather interpretation codes
 */
const WEATHER_CODE_MAP = {
    0: { desc: '맑음', icon: 'sun', theme: 'sunny' },
    1: { desc: '대체로 맑음', icon: 'cloud-sun', theme: 'sunny' },
    2: { desc: '구름 조금', icon: 'cloud', theme: 'cloudy' },
    3: { desc: '흐림', icon: 'clouds', theme: 'cloudy' },
    45: { desc: '안개', icon: 'cloud-fog', theme: 'cloudy' },
    48: { desc: '침적 안개', icon: 'cloud-fog', theme: 'cloudy' },
    51: { desc: '가벼운 이슬비', icon: 'cloud-drizzle', theme: 'rainy' },
    53: { desc: '이슬비', icon: 'cloud-drizzle', theme: 'rainy' },
    55: { desc: '강한 이슬비', icon: 'cloud-drizzle', theme: 'rainy' },
    61: { desc: '약한 비', icon: 'cloud-rain', theme: 'rainy' },
    63: { desc: '보통 비', icon: 'cloud-rain', theme: 'rainy' },
    65: { desc: '강한 비', icon: 'cloud-rain', theme: 'rainy' },
    71: { desc: '약한 눈', icon: 'cloud-snow', theme: 'snowy' },
    73: { desc: '보통 눈', icon: 'cloud-snow', theme: 'snowy' },
    75: { desc: '강한 눈', icon: 'cloud-snow', theme: 'snowy' },
    77: { desc: '싸라기눈', icon: 'cloud-snow', theme: 'snowy' },
    80: { desc: '약한 소나기', icon: 'cloud-rain', theme: 'rainy' },
    81: { desc: '보통 소나기', icon: 'cloud-rain', theme: 'rainy' },
    82: { desc: '강한 소나기', icon: 'cloud-rain', theme: 'rainy' },
    85: { desc: '약한 눈 소나기', icon: 'cloud-snow', theme: 'snowy' },
    86: { desc: '강한 눈 소나기', icon: 'cloud-snow', theme: 'snowy' },
    95: { desc: '뇌우', icon: 'cloud-lightning', theme: 'rainy' },
    96: { desc: '뇌우 및 우박', icon: 'cloud-lightning', theme: 'rainy' },
    99: { desc: '심한 뇌우 및 우박', icon: 'cloud-lightning', theme: 'rainy' },
};

/**
 * Initialize the app
 */
function init() {
    updateTime();
    fetchWeather();
    initScroll();
    setInterval(updateTime, 1000);
    setInterval(fetchWeather, CONFIG.REFRESH_INTERVAL);
    
    // Initial icons render
    lucide.createIcons();
}

/**
 * Initialize drag-to-scroll for hourly list
 */
function initScroll() {
    const slider = UI.hourlyList;
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // scroll-fast
        slider.scrollLeft = scrollLeft - walk;
    });
}

/**
 * Update the clock
 */
function updateTime() {
    const now = new Date();
    UI.currentTime.textContent = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Fetch weather data from API
 */
async function fetchWeather() {
    try {
        const url = `${CONFIG.API_URL}?latitude=${CONFIG.LAT}&longitude=${CONFIG.LON}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        UI.weatherDesc.textContent = '데이터를 불러오는데 실패했습니다.';
    }
}

/**
 * Update UI with fetched data
 */
function updateUI(data) {
    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;
    const weather = WEATHER_CODE_MAP[current.weather_code] || { desc: '알 수 없음', icon: 'help-circle', theme: 'cloudy' };

    // Update Temperature
    UI.currentTemp.textContent = Math.round(current.temperature_2m);
    UI.weatherDesc.textContent = weather.desc;
    UI.tempMax.textContent = Math.round(daily.temperature_2m_max[0]) + '°';
    UI.tempMin.textContent = Math.round(daily.temperature_2m_min[0]) + '°';

    // Update Details
    UI.humidity.textContent = current.relative_humidity_2m + '%';
    UI.windSpeed.textContent = current.wind_speed_10m + ' km/h';
    UI.pressure.textContent = Math.round(current.pressure_msl) + ' hPa';
    UI.visibility.textContent = '10 km';

    // Update Hourly Forecast (Next 24 hours)
    UI.hourlyList.innerHTML = '';
    
    // Find the current hour's index
    const now = new Date();
    const nowTS = now.getTime();
    
    // Open-Meteo hourly.time is in ISO-like strings e.g. "2026-04-21T13:00"
    // Since we used &timezone=auto, these match local time.
    // We can find the index where the time is >= current time.
    let startIndex = hourly.time.findIndex(t => new Date(t).getTime() >= nowTS);
    if (startIndex === -1) startIndex = 0;

    // Process next 24 hours from current hour
    for (let i = startIndex; i < startIndex + 24; i++) {
        if (!hourly.time[i]) break;
        
        const time = new Date(hourly.time[i]);
        const hour = time.getHours();
        const temp = Math.round(hourly.temperature_2m[i]);
        const code = hourly.weather_code[i];
        const hWeather = WEATHER_CODE_MAP[code] || { icon: 'help-circle' };
        
        const hourLabel = i === startIndex ? '지금' : `${hour}시`;
        
        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <div class="time">${hourLabel}</div>
            <i data-lucide="${hWeather.icon}" size="24"></i>
            <div class="temp">${temp}°</div>
        `;
        UI.hourlyList.appendChild(item);
    }

    // Update Theme & Icon
    document.body.className = weather.theme;
    
    UI.mainIcon.innerHTML = `<i data-lucide="${weather.icon}" size="80"></i>`;
    
    // Re-render icons
    lucide.createIcons();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

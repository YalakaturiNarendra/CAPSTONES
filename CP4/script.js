document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cityInput = document.getElementById('city-name');
    const searchBtn = document.getElementById('search-btn');
    const weatherInfo = document.getElementById('weather-info');
    const loading = document.querySelector('.loading');
    const errorMsg = document.querySelector('.error-message');
    const weatherIcon = document.querySelector('.weather-icon');

    // For testing - remove in production (use backend instead)
    const API_KEY = '31c4665aec7487ef61120e3bb6667545'; 
    const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

    // Event Listeners
    searchBtn.addEventListener('click', fetchWeather);
    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fetchWeather();
    });

    // Main Weather Fetch Function
    async function fetchWeather() {
        console.log("Fetching weather..."); // Debug log
        
        const city = cityInput.value.trim();
        
        if (!city) {
            showError('Please enter a city name');
            return;
        }

        setLoadingState(true);
        clearWeatherDisplay();

        try {
            console.log("Making API request for:", city); // Debug log
            const response = await fetch(`${API_URL}?q=${city}&units=metric&appid=${API_KEY}`);
            
            console.log("API response status:", response.status); // Debug log
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API error:", errorData); // Debug log
                throw new Error(errorData.message || 'Weather data not available');
            }

            const weatherData = await response.json();
            console.log("Received weather data:", weatherData); // Debug log
            
            updateWeatherDisplay(weatherData);
            
        } catch (error) {
            console.error("Fetch error:", error); // Debug log
            handleWeatherError(error);
        } finally {
            setLoadingState(false);
        }
    }

    // Update UI with Weather Data
    function updateWeatherDisplay(data) {
        console.log("Updating display with:", data); // Debug log
        
        const { name, main, weather, wind } = data;
        
        // Update text content
        document.querySelector('.city-name').textContent = name || "Unknown Location";
        document.querySelector('.temp').textContent = `${Math.round(main.temp)}°C`;
        document.querySelector('.feels-like').textContent = `${Math.round(main.feels_like)}°C`;
        document.querySelector('.humidity').textContent = `${main.humidity}%`;
        document.querySelector('.wind-speed').textContent = `${(wind.speed * 3.6).toFixed(1)} km/h`;
        document.querySelector('.pressure').textContent = `${main.pressure} hPa`;
        document.querySelector('.weather-desc').textContent = weather[0].description || "Unknown weather";
        
        // Update weather icon
        if (weather[0].icon) {
            weatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
            weatherIcon.style.display = 'block';
        } else {
            weatherIcon.style.display = 'none';
        }
        weatherIcon.alt = weather[0].description || "Weather icon";

        // Show weather info section
        weatherInfo.style.display = 'block';
        console.log("Display updated successfully"); // Debug log
    }

    // Helper Functions
    function setLoadingState(isLoading) {
        loading.style.display = isLoading ? 'block' : 'none';
        if (isLoading) {
            weatherInfo.style.display = 'none';
            errorMsg.style.display = 'none';
        }
    }

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        weatherInfo.style.display = 'none';
        console.error("Displaying error:", message); // Debug log
    }

    function clearWeatherDisplay() {
        errorMsg.style.display = 'none';
        weatherInfo.style.display = 'none';
    }

    function handleWeatherError(error) {
        const userMessage = error.message.includes('404') 
            ? 'City not found. Please try another location.' 
            : 'Failed to load weather data. Please try again later.';
        showError(userMessage);
    }
});
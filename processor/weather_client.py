import logging
import httpx

logger = logging.getLogger("processor.weather")

async def fetch_weather_telemetry() -> dict:
    """
    Fetches real-time weather telemetry from Open-Meteo.
    Includes an intentional offline fallback for hackathon stability.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": 12.7948,
        "longitude": 80.0074,
        "current": "temperature_2m,cloud_cover,direct_radiation,diffuse_radiation"
    }

    try:
        # Wrap the request in a strict 2.0-second timeout
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current", {})
            temperature = current.get("temperature_2m", 0.0)
            cloud_cover = current.get("cloud_cover", 0.0)
            direct = current.get("direct_radiation", 0.0)
            diffuse = current.get("diffuse_radiation", 0.0)
            total_irradiance = direct + diffuse

            return {
                "status": "online",
                "temperature_2m": temperature,
                "cloud_cover": cloud_cover,
                "direct_radiation": direct,
                "diffuse_radiation": diffuse,
                "total_irradiance": total_irradiance
            }
            
    except (httpx.RequestError, httpx.TimeoutException, httpx.HTTPStatusError) as e:
        # The "No-WiFi" Failover (CRITICAL)
        # Catch the error safely without crashing. Return a baseline payload for demo purposes.
        logger.warning(f"Weather API failed or timed out: {e}. Using offline fallback.")
        
        # Hardcoded synthetic offline baseline numbers
        return {
            "status": "offline_baseline",
            "temperature_2m": 31.5,
            "cloud_cover": 20.0,
            "direct_radiation": 750.0,
            "diffuse_radiation": 120.0,
            "total_irradiance": 870.0
        }

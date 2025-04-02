import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const API_KEY = import.meta.env.VITE_WEATHER_KEY;

const Welcome = () => {
    const { currentUser } = useContext(AuthContext);
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);

    const username = currentUser.email.split("@")[0];
    const currentHour = new Date().getHours();
    let greeting;

    if (currentHour < 12) {
        greeting = "Good morning";
    } else if (currentHour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                (err) => {
                    setError(`Unable to retrieve location. Error: ${err.message}`);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&hours=12&aqi=yes`
            );
            const data = await response.json();
            setWeather(data);
        } catch (err) {
            setError("Failed to fetch weather data.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.avatar}>{username[0].toUpperCase()}</div>
                    <div style={styles.greeting}>
                        <h1 style={styles.title}>{greeting}, {username}!</h1>
                        <p style={styles.subtitle}>Welcome back to your dashboard</p>
                    </div>
                </div>
                <div style={styles.content}>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <p style={styles.text}>We're glad to see you again. Here's a quick overview of your account:</p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>• Last login: {new Date().toLocaleString()}</li>
                        <li style={styles.listItem}>• Email: {currentUser.email}</li>
                        <li style={styles.listItem}>• Role: {currentUser.role || "Admin"}</li>
                    </ul>
                </div>
            </div>
            {weather && weather.forecast && weather.forecast.forecastday ? (
                <div style={styles.weatherSection}>
                    <h2 style={styles.weatherTitle}>Weather Forecast</h2>
                    <div style={styles.weatherContainer}>
                        {weather.forecast.forecastday[0]?.hour
                            ?.filter(hour => hour.time_epoch > Date.now() / 1000) // Lọc dữ liệu từ hiện tại
                            .slice(0, 6) // Lấy 6 giờ tiếp theo
                            .map((hour, index) => (
                                <div key={index} style={styles.weatherCard}>
                                    <p>{new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <img src={hour.condition.icon} alt={hour.condition.text} style={styles.weatherIcon} />
                                    <p>{hour.temp_c}°C</p>
                                    <p>{hour.condition.text}</p>
                                </div>
                            ))}
                    </div>
                </div>
            ) : (
                <p style={styles.weatherTitle}>Loading weather data...</p>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        minHeight: "100vh",
        backgroundColor: "#f0f4f8",
    },
    card: {
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        width: "100%",
        maxWidth: "500px",
    },
    header: {
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
    },
    avatar: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#4a90e2",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        marginRight: "20px",
    },
    greeting: {
        flex: 1,
    },
    title: {
        fontSize: "24px",
        margin: "0 0 5px 0",
        color: "#333",
    },
    subtitle: {
        fontSize: "14px",
        margin: 0,
        color: "#666",
    },
    content: {
        borderTop: "1px solid #eee",
        paddingTop: "20px",
    },
    text: {
        fontSize: "16px",
        color: "#333",
        marginBottom: "15px",
    },
    list: {
        listStyleType: "none",
        padding: 0,
        margin: 0,
    },
    listItem: {
        fontSize: "14px",
        color: "#666",
        marginBottom: "10px",
    },
    gifContainer: {
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
    },
    weatherSection: {
        marginTop: "20px",
        textAlign: "center",
    },
    weatherTitle: {
        fontSize: "20px",
        fontWeight: "bold",
        marginBottom: "10px",
        color: '#000'
    },
    weatherContainer: {
        display: "flex",
        justifyContent: "space-around",
        flexWrap: "wrap",
    },
    weatherCard: {
        backgroundColor: "#e3f2fd",
        padding: "10px",
        borderRadius: "8px",
        textAlign: "center",
        width: "80px",
        margin: "5px",
        color: '#000'
    },
    weatherIcon: {
        width: "40px",
        height: "40px",
    }
};

export default Welcome;
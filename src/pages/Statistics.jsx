import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Statistics = () => {
    const { currentUser } = useContext(AuthContext);
    
    // Extract the username from the email
    const username = currentUser.email.split("@")[0];
    
    // Get the current time
    const currentHour = new Date().getHours();
    let greeting;
    
    if (currentHour < 12) {
        greeting = "Good morning";
    } else if (currentHour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }
    
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
                    <p style={styles.text}>We're glad to see you again. Here's a quick overview of your account:</p>
                    <ul style={styles.list}>
                        <li style={styles.listItem}>• Last login: {new Date().toLocaleString()}</li>
                        <li style={styles.listItem}>• Email: {currentUser.email}</li>
                        <li style={styles.listItem}>• Role: {currentUser.role || "Admin"}</li>
                    </ul>
                    <div style={styles.gifContainer}>
                        <img 
                            src="https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif" 
                            alt="Welcome Gif" 
                            style={styles.gif}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
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
    gif: {
        width: "100%",
        maxWidth: "300px",
        borderRadius: "8px",
    },
};

export default Statistics;

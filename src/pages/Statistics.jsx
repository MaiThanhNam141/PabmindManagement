import React, { useEffect, useState } from "react";
import { getAnalytics, logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { motion } from "framer-motion";

const Statistics = () => {
    const [visitorData, setVisitorData] = useState(null);
    const [visitCount, setVisitCount] = useState(0);
    const [pageViews, setPageViews] = useState(0);
    const [loadTime, setLoadTime] = useState(0);
    const [deviceInfo, setDeviceInfo] = useState("");

    useEffect(() => {
        fetchVisitorData();
        trackPerformance();
        trackDeviceInfo();
    }, []);

    const fetchVisitorData = async () => {
        try {
            const analytics = getAnalytics();
            const userId = `user_${Math.floor(Math.random() * 100000)}`;
            setUserId(analytics, userId);
            setUserProperties(analytics, { role: "guest" });
            logEvent(analytics, "page_view");
            setVisitorData({ userId, role: "guest" });

            const storedVisitCount = localStorage.getItem("visitCount") || 0;
            const updatedVisitCount = parseInt(storedVisitCount) + 1;
            localStorage.setItem("visitCount", updatedVisitCount);
            setVisitCount(updatedVisitCount);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu khách truy cập:", error);
        }
    };

    const trackPerformance = () => {
        const startTime = performance.timing.navigationStart;
        const endTime = performance.timing.loadEventEnd;
        const loadDuration = (endTime - startTime) / 1000; // Convert to seconds
        setLoadTime(loadDuration);
    };

    const trackDeviceInfo = () => {
        const userAgent = navigator.userAgent;
        const isMobile = /Mobi|Android/i.test(userAgent);
        const browser = userAgent.includes("Chrome") ? "Chrome" : userAgent.includes("Firefox") ? "Firefox" : "Other";
        setDeviceInfo(`${isMobile ? "📱 Mobile" : "💻 Desktop"} - 🌍 ${browser}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.container}
        >
            <h2 style={styles.title}>📊 Thống Kê Người Dùng</h2>
            <div style={styles.dataBox}>
                <h3>🔍 Người đang truy cập</h3>
                <p>{visitorData ? `ID: ${visitorData.userId}, Role: ${visitorData.role}` : "Đang tải..."}</p>
            </div>
            <div style={styles.dataBox}>
                <h3>📈 Thống Kê Lượt Truy Cập</h3>
                <p>🔢 Số lần truy cập: {visitCount}</p>
                <p>📄 Số trang đã xem: {pageViews}</p>
            </div>
            <div style={styles.dataBox}>
                <h3>⚡ Hiệu Suất Trang Web</h3>
                <p>⏳ Thời gian tải trung bình: {loadTime} giây</p>
            </div>
            <div style={styles.dataBox}>
                <h3>🖥️ Thiết Bị & Trình Duyệt</h3>
                <p>{deviceInfo}</p>
            </div>
        </motion.div>
    );
};

const styles = {
    container: {
        width: "60%",
        margin: "50px auto",
        padding: "50px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
        textAlign: "center",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "30px",
    },
    dataBox: {
        padding: "20px",
        margin: "15px 0",
        border: "1px solid #007bff",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    },
};

export default Statistics;
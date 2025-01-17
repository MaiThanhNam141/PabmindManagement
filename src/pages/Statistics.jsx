import React, { useState, useEffect, useContext } from 'react';
import { db } from "../firebase/config";
import { collection, getDocs } from 'firebase/firestore';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Tooltip } from 'react-tooltip';
import { Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { engagementDataJS, userTrendingJS } from '../assets/csv/chartData';

const Statistics = () => {
    const { currentUser } = useContext(AuthContext);

    const isAuthorized = currentUser?.email === 'maithanhnam@gmail.com';

    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [userTrending, setUserTrending] = useState([]);
    const [engagementData, setEngagementData] = useState([]);

    useEffect(() => {
        if (!isAuthorized) return;

        const fetchOrders = async () => {
            try {
                const ordersCollectionRef = collection(db, 'orders');
                const orderDocs = await getDocs(ordersCollectionRef);

                const revenueByMonth = {};

                orderDocs.forEach(doc => {
                    const orderData = doc.data();
                    const amount = orderData.amount;
                    const serverTime = orderData.server_time;

                    const date = new Date(serverTime);
                    const month = date.getMonth() + 1;
                    const year = date.getFullYear();
                    const monthYear = `${month}/${year}`;

                    if (!revenueByMonth[monthYear]) {
                        revenueByMonth[monthYear] = 0;
                    }
                    revenueByMonth[monthYear] += amount;
                });

                const sortedMonths = Object.keys(revenueByMonth).sort((a, b) => new Date(a) - new Date(b));
                const data = sortedMonths.map(monthYear => ({
                    monthYear,
                    revenue: revenueByMonth[monthYear]
                }));

                setMonthlyRevenue(data);
            } catch (error) {
                console.error("Error fetching orders: ", error);
            }
        };

        fetchOrders();

        setEngagementData(engagementDataJS)
        setUserTrending(userTrendingJS)
    }, [isAuthorized]);

    if (!isAuthorized) {
        return (
            <div style={styles.lockContainer}>
                <Lock size={48} color='#000' />
                <p style={styles.lockText}>Bạn không có quyền xem thông tin này</p>
            </div>
        );
    }

    // Chart data for monthly revenue
    const revenueChartData = {
        labels: monthlyRevenue.map(item => item.monthYear),
        datasets: [
            {
                label: 'Số tiền (VNĐ)',
                data: monthlyRevenue.map(item => item.revenue),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Chart data for user trending
    const UserActivityOverTime = {
        labels: userTrending.map(item => item.nthDay),
        datasets: [
            {
                label: '30 Ngày',
                data: userTrending.map(item => item.days30),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                fill: false,
                borderWidth: 2,
            },
            {
                label: '7 Ngày',
                data: userTrending.map(item => item.days7),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                fill: false,
                borderWidth: 2,
            },
            {
                label: '1 Ngày',
                data: userTrending.map(item => item.days1),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                fill: false,
                borderWidth: 2,
            },
        ],
    };

    const optionsUserActivityOverTime = {
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        // Chỉ hiển thị 0 và 1
                        return value % 1 === 0 ? value : null;
                    },
                },
                beginAtZero: true,
            },
        },
    };

    // Chart data for average engagement time
    const engagementChartData = {
        labels: engagementData.map(item => item.nthDay),
        datasets: [
            {
                label: 'Thời gian trung bình của mỗi user',
                data: engagementData.map(item => item.avgEngagementTime / 3600),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                fill: false,
                borderWidth: 2,
            },
        ],
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.text}>Doanh thu theo tháng</h1>
            <div style={{ height: '400px', width: '50%', flex: 1, marginBottom: '100px' }}>
                <Bar data={revenueChartData} />
            </div>
            <h1
                style={styles.text}
                id="userActivityTooltip"
            >
                Hoạt động của người dùng theo thời gian
            </h1>
            <Tooltip anchorSelect="#userActivityTooltip" place="top" effect="solid">
                <div>
                    <strong>Hoạt động của người dùng theo thời gian</strong>
                    <p>Hoạt động của người dùng cho thấy số lượng người dùng đã sử dụng ứng dụng của bạn trong:</p>
                    <ul>
                        <li><strong>30 ngày:</strong> Số lượng người dùng trong 30 ngày qua.</li>
                        <li><strong>7 ngày:</strong> Số lượng người dùng trong 7 ngày qua.</li>
                        <li><strong>1 ngày:</strong> Số lượng người dùng trong 1 ngày qua.</li>
                    </ul>
                    <p>Bạn có thể sử dụng thông tin này để theo dõi sự thay đổi trong hoạt động của người dùng.</p>
                </div>
            </Tooltip>
            <div style={{ height: '400px', width: '50%', flex: 1, marginBottom: '100px' }}>
                <Line data={UserActivityOverTime} options={optionsUserActivityOverTime} />
            </div>

            <h1 style={styles.text} id="engagementTooltip">Thời gian tương tác trung bình trên mỗi người dùng</h1>
            <Tooltip anchorSelect="#engagementTooltip" place="top" effect="solid">
                <div>
                    <span>Thời gian tương tác trung bình trên mỗi người dùng hoạt động trong khoảng thời gian đã chọn.</span>
                </div>
            </Tooltip>
            <div style={{ height: '400px', width: '50%', flex: 1, marginBottom: '100px' }}>
                <Line data={engagementChartData} />
            </div>
        </div>
    );
};

export default Statistics;

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '100vh',
    },
    lockContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
    },
    lockText: {
        color: '#000',
        fontSize: '20px',
        marginTop: '10px',
    },
    text: {
        color: '#000',
        marginBottom: '20px',
    },
};

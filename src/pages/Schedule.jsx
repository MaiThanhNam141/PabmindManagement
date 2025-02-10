import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Trash, Edit, Info, ChevronRight, ChevronLeft } from 'lucide-react';

const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const usersPerPage = 100;

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const appointmentsCollection = collection(db, 'AdviseSchedule');
                const snapshot = await getDocs(appointmentsCollection);
                const data = snapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    index: index + 1,
                    ...doc.data(),
                })).sort((a, b) => a.time - b.time);
                setAppointments(data);
            } catch (error) {
                console.error("Error fetching appointments: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const filteredUsers = appointments.filter(item =>
        item.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLast = currentPage * usersPerPage;
    const indexOfFirst = indexOfLast - usersPerPage;
    const paginated = filteredUsers.slice(indexOfFirst, indexOfLast);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleInfo = (appointment) => {
        Swal.fire({
            title: 'Thông tin chi tiết',
            html: `
                <p><strong>Tên:</strong> ${appointment.displayName}</p>
                <p><strong>Số điện thoại:</strong> ${appointment.phone}</p>
                <p><strong>Địa chỉ:</strong> ${appointment.address}</p>
                <p><strong>Gói dịch vụ:</strong> ${appointment.servicePackage}</p>
                <p><strong>Chủ đề:</strong> ${appointment.topic}</p>
                <p><strong>Hình thức tư vấn:</strong> ${appointment.adviseDirect}</p>
                <p><strong>Tuổi:</strong> ${appointment.age}</p>
                <p><strong>Ngày hẹn:</strong> ${new Date(appointment.consultationDate.seconds * 1000).toLocaleString()}</p>
                <p><strong>Ngày đặt lịch:</strong> ${new Date(appointment.time.seconds * 1000).toLocaleString()}</p>
            `,
            confirmButtonText: 'Đóng'
        });
    };

    const handleEditAppointment = async (appointment) => {
        const { value: formValues } = await Swal.fire({
            title: 'Chỉnh sửa lịch hẹn',
            html: `
                <input id="swal-input1" class="swal2-input" value="${appointment.displayName}" placeholder="Tên khách hàng">
                <input id="swal-input2" class="swal2-input" value="${appointment.phone}" placeholder="Số điện thoại">
                <input id="swal-input3" class="swal2-input" value="${appointment.address}" placeholder="Địa chỉ">
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            preConfirm: () => {
                return {
                    displayName: document.getElementById('swal-input1').value,
                    phone: document.getElementById('swal-input2').value,
                    address: document.getElementById('swal-input3').value,
                };
            }
        });

        if (formValues) {
            try {
                await updateDoc(doc(db, "appointments", appointment.id), formValues);
                Swal.fire('Thành công!', 'Cập nhật lịch hẹn thành công', 'success');
                setAppointments(appointments.map(a => a.id === appointment.id ? { ...a, ...formValues } : a));
            } catch (error) {
                Swal.fire('Lỗi!', 'Không thể cập nhật lịch hẹn', 'error');
            }
        }
    };

    const handleDeleteAppointment = async (appointment) => {
        Swal.fire({
            title: `Xác nhận xóa?`,
            text: `Bạn có chắc chắn muốn xóa lịch hẹn của ${appointment.displayName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "appointments", appointment.id));
                    setAppointments(appointments.filter(a => a.id !== appointment.id));
                    Swal.fire('Đã xóa!', 'Lịch hẹn đã được xóa', 'success');
                } catch (error) {
                    Swal.fire('Lỗi!', 'Không thể xóa lịch hẹn', 'error');
                }
            }
        });
    };

    const getIndexStyle = (appointment) => {
        const appointmentDate = new Date(appointment.consultationDate.seconds * 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) return { backgroundColor: 'gray' };
        if (appointmentDate.toDateString() === today.toDateString()) return { backgroundColor: 'red', fontWeight: 'bold' };
        return { backgroundColor: 'lightgreen' };
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div style={styles.container}>
            {/* Thêm CSS hover cho row và nút */}
            <style>
                {`
          .userRow {
            transition: background-color 0.3s, transform 0.3s;
          }
          .userRow:hover {
            background-color: #f0f8ff;
            transform: translateY(-3px);
          }
          .actionButton:hover {
            transform: scale(1.1);
          }
        `}
            </style>
            <h2 style={styles.header}>Danh sách lịch hẹn</h2>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm lịch hẹn..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={styles.searchInput}
                />
            </div>
            <h4 style={styles.subHeader}>Có {filteredUsers.length} lịch hẹn trong trang này</h4>

            {paginated.length === 0 ? (
                <div style={styles.noData}>Không tìm thấy lịch hẹn nào</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableRow}>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Tên khách hàng</th>
                                <th style={styles.th}>Số điện thoại</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Địa chỉ</th>
                                <th style={styles.th}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(item => (
                                <tr key={item.id} className="userRow" style={styles.tableRow}>
                                    <td style={Object.assign({}, styles.td, getIndexStyle(item))}>{item.index}</td>
                                    <td style={styles.td}>{item.displayName}</td>
                                    <td style={styles.td}>{item.phone}</td>
                                    <td style={styles.td}>{item.email}</td>
                                    <td style={styles.td}>{item.address}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actionContainer}>
                                            <button style={styles.actionButton} className="actionButton" onClick={() => handleInfo(item)}>
                                                <Info size={20} color="blue" />
                                            </button>
                                            <button style={styles.actionButton} className="actionButton" onClick={() => handleEditAppointment(item)}>
                                                <Edit size={20} color="#4CAF50" />
                                            </button>
                                            <button style={styles.actionButton} className="actionButton" onClick={() => handleDeleteAppointment(item)}>
                                                <Trash size={20} color="#F44336" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={styles.pagination}>
                <button style={styles.paginationButton} onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft size={25} />
                </button>
                <div style={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <span
                            key={index}
                            style={{
                                ...styles.pageNumber,
                                backgroundColor: currentPage === index + 1 ? '#4CAF50' : '#f1f1f1',
                                color: currentPage === index + 1 ? '#fff' : '#000',
                            }}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </span>
                    ))}
                </div>
                <button style={styles.paginationButton} onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <ChevronRight size={25} />
                </button>
            </div>
        </div>
    );
};

export default Schedule;

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '30px',
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333',
        fontSize: '28px',
        fontWeight: '600',
    },
    subHeader: {
        textAlign: 'left',
        marginBottom: '20px',
        color: '#555',
        fontSize: '18px',
    },
    searchContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '25px',
    },
    searchInput: {
        width: '100%',
        maxWidth: '400px',
        padding: '12px 20px',
        borderRadius: '30px',
        border: '1px solid #ddd',
        outline: 'none',
        fontSize: '16px',
        transition: 'border 0.3s',
    },
    tableContainer: {
        overflowX: 'auto',
        marginBottom: '30px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableRow: {
        textAlign: 'center',
        padding: '15px 0',
    },
    th: {
        padding: '15px 10px',
        backgroundColor: '#f9f9f9',
        fontWeight: '600',
        color: '#333',
        borderBottom: '2px solid #eee',
    },
    td: {
        padding: '15px 10px',
        color: '#555',
        borderBottom: '1px solid #eee',
    },
    avatar: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    actionContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
    },
    actionButton: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginTop: '20px',
    },
    paginationButton: {
        backgroundColor: '#4CAF50',
        border: 'none',
        padding: '12px',
        borderRadius: '50%',
        cursor: 'pointer',
        color: '#fff',
        transition: 'background-color 0.3s',
        minWidth: '50px',
        minHeight: '50px',
    },
    pageNumbers: {
        display: 'flex',
        gap: '10px',
    },
    pageNumber: {
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.3s',
    },
    noData: {
        textAlign: 'center',
        padding: '25px',
        color: '#999',
        fontSize: '18px',
    },
    loading: {
        textAlign: 'center',
        padding: '60px',
        fontSize: '20px',
        color: '#777',
    },
};
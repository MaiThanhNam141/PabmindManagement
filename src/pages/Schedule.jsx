import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, Timestamp, updateDoc, addDoc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { Trash, Edit, Info, ChevronRight, ChevronLeft, PackagePlus } from 'lucide-react';

const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastVisible, setLastVisible] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const itemPerPage = 50;

    useEffect(() => {
        fetchData()
    }, []);

    const fetchData = async () => {
        try {
            const appointmentsCollection = collection(db, 'AdviseSchedule');
            const dataQuery = query(
                appointmentsCollection,
                orderBy('consultationDate', 'desc'),
                limit(itemPerPage)
            );

            const dataSnapshot = await getDocs(dataQuery);
            const itemList = dataSnapshot.docs.map((doc, index) => ({
                id: doc.id,
                ...doc.data(),
                index: index + 1,
            }));

            setAppointments(itemList);

            const lastVisible = dataSnapshot.docs[dataSnapshot.docs.length - 1];
            setLastVisible(lastVisible);

            // Fetch total number of users to calculate totalPages
            const totalDataSnapshot = await getDocs(appointmentsCollection);
            const totalData = totalDataSnapshot.size;
            const totalPages = Math.ceil(totalData / itemPerPage);
            setTotalPages(totalPages);

        } catch (error) {
            console.error("Error fetching users: ", error);
        } finally {
            setLoading(false);
        }
    };

    const refetchMoreData = async (multiple = 1) => {
        if (lastVisible) {
            try {
                setLoading(true);
                const appointmentsCollection = collection(db, 'AdviseSchedule');
                const dataQuery = query(
                    appointmentsCollection,
                    orderBy('consultationDate', 'desc'),
                    startAfter(lastVisible),
                    limit(itemPerPage * multiple)
                );

                const dataSnapshot = await getDocs(dataQuery);
                const itemList = dataSnapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    ...doc.data(),
                    index: index + 1,
                }));

                setAppointments(prev => [...prev, ...itemList]);
                setLastVisible(dataSnapshot.docs[dataSnapshot.docs.length - 1]);
            } catch (error) {
                console.error("Error fetching next page: ", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredItems = appointments.filter(item =>
        item.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLast = currentPage * itemPerPage;
    const indexOfFirst = indexOfLast - itemPerPage;
    const paginated = filteredItems.slice(indexOfFirst, indexOfLast);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            refetchMoreData();
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageClick = (pageIndex) => {
        setCurrentPage(pageIndex);
        if (pageIndex > currentPage) {
            refetchMoreData(pageIndex - currentPage);
        }
    };

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Thêm lịch hẹn mới',
            html: `
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Tên khách hàng</label>
                    <input id="swal-input1" class="swal2-input" placeholder="Tên khách hàng" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Số điện thoại</label>
                    <input id="swal-input2" class="swal2-input" placeholder="Số điện thoại" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Địa chỉ</label>
                    <input id="swal-input3" class="swal2-input" placeholder="Địa chỉ" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Gói dịch vụ</label>
                    <input id="swal-input4" class="swal2-input" placeholder="Gói dịch vụ" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Chủ đề</label>
                    <input id="swal-input5" class="swal2-input" placeholder="Chủ đề" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Hình thức tư vấn</label>
                    <input id="swal-input6" class="swal2-input" placeholder="Hình thức tư vấn" style="width: 85%;">
                </div>    
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Tuổi</label>
                    <input id="swal-input9" class="swal2-input" placeholder="Tuổi" style="width: 85%;">
                </div>    
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Ngày tư vấn</label>
                    <input id="swal-input7-date" type="date" class="swal2-input" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Giờ tư vấn</label>
                    <input id="swal-input7-time" type="time" class="swal2-input" style="width: 85%;">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const dateConsultationValue = document.getElementById('swal-input7-date').value;
                const timeConsultationValue = document.getElementById('swal-input7-time').value;
                const consultationDate = new Date(`${dateConsultationValue}T${timeConsultationValue}:00`);

                return {
                    displayName: document.getElementById('swal-input1').value,
                    phone: document.getElementById('swal-input2').value,
                    address: document.getElementById('swal-input3').value,
                    servicePackage: document.getElementById('swal-input4').value,
                    topic: document.getElementById('swal-input5').value,
                    adviseDirect: document.getElementById('swal-input6').value,
                    age: document.getElementById('swal-input9').value,
                    consultationDate: Timestamp.fromDate(consultationDate),
                    time: Timestamp.fromDate(new Date()) // Thời gian hiện tại
                };
            }
        });

        if (formValues) {
            try {
                await addDoc(collection(db, "AdviseSchedule"), formValues);
                Swal.fire('Thành công!', 'Thêm lịch hẹn thành công', 'success');
                setAppointments(prev => [...prev, formValues]);
            } catch (error) {
                console.error("Error add appointment: ", error);
                Swal.fire('Lỗi!', 'Không thể thêm lịch hẹn', 'error');
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return "Không có";

        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const formatDateForInput = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return '';
        const date = timestamp.toDate();
        const pad = (num) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };

    const formatTimeForInput = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return '';
        const date = timestamp.toDate();
        const pad = (num) => num.toString().padStart(2, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
                <p><strong>Ngày hẹn:</strong> ${formatTimestamp(appointment.consultationDate)}</p>
                <p><strong>Ngày đặt lịch:</strong> ${formatTimestamp(appointment.time)}</p>
            `,
            confirmButtonText: 'Đóng'
        });
    };

    const handleEditAppointment = async (appointment) => {
        const { value: formValues } = await Swal.fire({
            title: 'Chỉnh sửa lịch hẹn',
            html: `
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Tên khách hàng</label>
                    <input id="swal-input1" class="swal2-input" value="${appointment.displayName}" placeholder="Tên khách hàng" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Số điện thoại</label>
                    <input id="swal-input2" class="swal2-input" value="${appointment.phone}" placeholder="Số điện thoại" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Địa chỉ</label>
                    <input id="swal-input3" class="swal2-input" value="${appointment.address}" placeholder="Địa chỉ" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Gói dịch vụ</label>
                    <input id="swal-input4" class="swal2-input" value="${appointment.servicePackage}" placeholder="Gói dịch vụ" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Chủ đề</label>
                    <input id="swal-input5" class="swal2-input" value="${appointment.topic}" placeholder="Chủ đề" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Hình thức tư vấn</label>
                    <input id="swal-input6" class="swal2-input" value="${appointment.adviseDirect}" placeholder="Hình thức tư vấn" style="width: 85%;">
                </div>          
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Tuổi</label>
                    <input id="swal-input9" class="swal2-input" value="${appointment.age}" placeholder="Tuổi" style="width: 85%;">
                </div>          
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Ngày tư vấn</label>
                    <input id="swal-input7-date" type="date" class="swal2-input" value="${formatDateForInput(appointment.consultationDate)}" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Giờ tư vấn</label>
                    <input id="swal-input7-time" type="time" class="swal2-input" value="${formatTimeForInput(appointment.consultationDate)}" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Ngày đặt hẹn</label>
                    <input id="swal-input8" class="swal2-input" value="${formatTimestamp(appointment.time)}" style="width: 85%;" disabled>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu',
            preConfirm: () => {
                const dateValue = document.getElementById('swal-input7-date').value;
                const timeValue = document.getElementById('swal-input7-time').value;

                const consultationDate = new Date(`${dateValue}T${timeValue}:00`);

                return {
                    displayName: document.getElementById('swal-input1').value,
                    phone: document.getElementById('swal-input2').value,
                    address: document.getElementById('swal-input3').value,
                    servicePackage: document.getElementById('swal-input4').value,
                    topic: document.getElementById('swal-input5').value,
                    adviseDirect: document.getElementById('swal-input6').value,
                    consultationDate: Timestamp.fromDate(consultationDate),
                    age: document.getElementById('swal-input9').value,
                };
            }
        });

        if (formValues) {
            try {
                await updateDoc(doc(db, "AdviseSchedule", appointment.id), formValues);
                Swal.fire('Thành công!', 'Cập nhật lịch hẹn thành công', 'success');
                setAppointments(appointments.map(a => a.id === appointment.id ? { ...a, ...formValues } : a));
            } catch (error) {
                console.error("Error updating appointment: ", error);
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
                    await deleteDoc(doc(db, "AdviseSchedule", appointment.id));
                    setAppointments(appointments.filter(a => a.id !== appointment.id));
                    Swal.fire('Đã xóa!', 'Lịch hẹn đã được xóa', 'success');
                } catch (error) {
                    Swal.fire('Lỗi!', 'Không thể xóa lịch hẹn', 'error');
                }
            }
        });
    };

    const makeColorIndex = (appointment) => {
        const appointmentDate = new Date(appointment.consultationDate.seconds * 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) return { backgroundColor: 'gray' };
        if (appointmentDate.toDateString() === today.toDateString()) return { backgroundColor: 'red', fontWeight: 'bold' };
        return { backgroundColor: 'lightgreen' };
    };

    const makeAdviseDirectColorIndex = (appointment) => {
        if (appointment.adviseDirect === "Tư vấn online") return { color: 'red' };
        return { color: 'blue' };
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div style={styles.container}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', alignItems: 'center' }}>
                <button style={styles.addButton} onClick={() => handleAdd()}><PackagePlus size={16} />Thêm lịch hẹn mới</button>
            </div>
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
            <h4 style={styles.subHeader}>Có {paginated.length} lịch hẹn trong trang này</h4>

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
                                <th style={styles.th}>Hình thức tư vấn</th>
                                <th style={styles.th}>Địa chỉ</th>
                                <th style={styles.th}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((item, index) => (
                                <tr key={item.id} className="userRow" style={styles.tableRow}>
                                    <td style={Object.assign({ cursor: 'pointer' }, styles.td, makeColorIndex(item))} onClick={() => handleInfo(item)}>{index + indexOfFirst + 1}</td>
                                    <td style={styles.td}>{item.displayName}</td>
                                    <td style={styles.td}>{item.phone}</td>
                                    <td style={Object.assign({}, styles.td, makeAdviseDirectColorIndex(item))}>{item.adviseDirect === "Tư vấn online" ? "Online" : "Trực tiếp"}</td>
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
                            onClick={() => handlePageClick(index + 1)}
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
    addButton: {
        marginTop: '10px',
        marginBottom: '20px',
        padding: '8px 16px',
        borderColor: '#4CAF50',
        color: 'black',
        backgroundColor: '#f7f7f7',
        border: '10',
        borderRadius: '4px',
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center'
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
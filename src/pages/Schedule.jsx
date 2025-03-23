import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, Timestamp, updateDoc, addDoc, query, orderBy, limit, startAfter } from '@firebase/firestore';
import { Trash, Edit, Info, ChevronRight, ChevronLeft, PackagePlus } from 'lucide-react';
import { ClimbingBoxLoader } from 'react-spinners'
import { useLocation, useNavigate } from 'react-router-dom';
import { styles } from '../style/pagination';

const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastVisible, setLastVisible] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const itemPerPage = 100;

    const location = useLocation();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get("search") || '');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (searchTerm) {
            params.set("search", searchTerm);
        } else {
            params.delete("search");
        }
        navigate(`?${params.toString()}`, { replace: true });
    }, [searchTerm, navigate]);

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
                    <label style="display: block; font-weight: bold;">Email</label>
                    <input id="swal-inputemail" class="swal2-input" placeholder="Chủ đề" style="width: 85%;">
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
                    email: document.getElementById('swal-inputemail').value,
                    servicePackage: document.getElementById('swal-input4').value,
                    topic: document.getElementById('swal-input5').value,
                    adviseDirect: document.getElementById('swal-input6').value,
                    age: document.getElementById('swal-input9').value,
                    consultationDate: Timestamp.fromDate(consultationDate),
                    time: Timestamp.fromDate(new Date())
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
                <p><strong>Tên:</strong> ${appointment?.displayName || "Không có dữ liệu"}</p>
                <p><strong>Số điện thoại:</strong> ${appointment?.phone || "Không có dữ liệu"}</p>
                <p><strong>Địa chỉ:</strong> ${appointment?.address || "Không có dữ liệu"}</p>
                <p><strong>Email:</strong> ${appointment?.email || "Không có dữ liệu"}</p>
                <p><strong>Gói dịch vụ:</strong> ${appointment?.servicePackage || "Không có dữ liệu"}</p>
                <p><strong>Chủ đề:</strong> ${appointment?.topic || "Không có dữ liệu"}</p>
                <p><strong>Hình thức tư vấn:</strong> ${appointment?.adviseDirect || "Không có dữ liệu"}</p>
                <p><strong>Tuổi:</strong> ${appointment?.age || "Không có dữ liệu"}</p>
                <p><strong>Ngày hẹn:</strong> ${formatTimestamp(appointment?.consultationDate) || "Không có dữ liệu"}</p>
                <p><strong>Ngày đặt lịch:</strong> ${formatTimestamp(appointment?.time) || "Không có dữ liệu"}</p>
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
                    <input id="swal-input1" class="swal2-input" value="${appointment?.displayName || "Không có dữ liệu"}" placeholder="Tên khách hàng" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Số điện thoại</label>
                    <input id="swal-input2" class="swal2-input" value="${appointment?.phone || "Không có dữ liệu"}" placeholder="Số điện thoại" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Địa chỉ</label>
                    <input id="swal-input3" class="swal2-input" value="${appointment?.address || "Không có dữ liệu"}" placeholder="Địa chỉ" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Email</label>
                    <input id="swal-email" class="swal2-input" value="${appointment?.email || "Không có dữ liệu"}" placeholder="Địa chỉ" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Gói dịch vụ</label>
                    <input id="swal-input4" class="swal2-input" value="${appointment?.servicePackage || "Không có dữ liệu"}" placeholder="Gói dịch vụ" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Chủ đề</label>
                    <input id="swal-input5" class="swal2-input" value="${appointment?.topic || "Không có dữ liệu"}" placeholder="Chủ đề" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Hình thức tư vấn</label>
                    <input id="swal-input6" class="swal2-input" value="${appointment?.adviseDirect || "Không có dữ liệu"}" placeholder="Hình thức tư vấn" style="width: 85%;">
                </div>          
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Tuổi</label>
                    <input id="swal-input9" class="swal2-input" value="${appointment?.age || "Không có dữ liệu"}" placeholder="Tuổi" style="width: 85%;">
                </div>          
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Ngày tư vấn</label>
                    <input id="swal-input7-date" type="date" class="swal2-input" value="${formatDateForInput(appointment?.consultationDate) || "Không có dữ liệu"}" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Giờ tư vấn</label>
                    <input id="swal-input7-time" type="time" class="swal2-input" value="${formatTimeForInput(appointment?.consultationDate) || "Không có dữ liệu"}" style="width: 85%;">
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
                    email: document.getElementById('swal-email').value,
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
            cancelButtonColor: '#000',
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
        return (
            <div style={styles.loading}>
                <ClimbingBoxLoader
                    color="#87bc9d"
                    loading
                    size={30}
                    speedMultiplier={0.5}
                />
            </div>
        )
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

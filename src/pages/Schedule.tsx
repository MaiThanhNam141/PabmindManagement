import { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, Timestamp, updateDoc, addDoc, query, orderBy, limit, startAfter, QueryDocumentSnapshot } from '@firebase/firestore';
import { Trash, Edit, Info, ChevronRight, ChevronLeft, PackagePlus } from 'lucide-react';
import { ClimbingBoxLoader } from 'react-spinners'
import { useLocation, useNavigate } from 'react-router-dom';
import { styles } from '../style/pagination.tsx';
import { confirmDelete, errorAlert, showInfoAppointmentAlert, successAlert } from '../component/SwalAlert';
import AppointmentModal from '../component/AppointmentModal.tsx';


const Schedule = () => {
    interface Appointment {
        id: string;
        displayName?: string;
        phone?: string;
        email?: string;
        age?: number;
        address?: string;
        servicePackage?: string;
        topic?: string;
        adviseDirect?: string;
        consultationDate?: Timestamp | null;
    }

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectAppointment, setSelectAppointment] = useState<Appointment | null>(null);

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
    }, [searchTerm, navigate, location]);

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
            errorAlert("Lấy dữ liệu thất bại");
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
                errorAlert("Lấy dữ liệu thất bại");
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

    const handlePageClick = (pageIndex: number) => {
        setCurrentPage(pageIndex);
        if (pageIndex > currentPage) {
            refetchMoreData(pageIndex - currentPage);
        }
    };

    const handleAdd = async (formValues: Appointment) => {
        if (formValues) {
            try {
                const newAppointment = {
                    ...formValues,
                    time: Timestamp.fromDate(new Date()),
                };
                await addDoc(collection(db, "AdviseSchedule"), newAppointment);
                successAlert('Thêm lịch hẹn thành công')
                setAppointments((prev) => [...prev, {...newAppointment, id: Math.random().toString()}]);
            } catch (error) {
                console.error("Error add appointment: ", error);
                errorAlert("Không thể thêm lịch hẹn");
                throw Error
            }
        }
        console.error("formValues:", formValues)
        errorAlert("Không thể thêm lịch hẹn");
        throw Error;
    };

    const handleInfo = (appointment: Appointment) => {
        showInfoAppointmentAlert(appointment)
    };

    const handleEditAppointment = async (formValues: Appointment) => {
        if (formValues) {
            try {
                const newAppointment = {
                    ...formValues,
                    time: Timestamp.fromDate(new Date()),
                };

                await updateDoc(doc(db, "AdviseSchedule", newAppointment.id), newAppointment);
                successAlert('Cập nhật lịch hẹn thành công')
                setAppointments(appointments.map(item => item.id === newAppointment.id ? { ...item, ...newAppointment } : item));
                return true;
            } catch (error) {
                console.error("Error updating appointment: ", error);
                errorAlert("Không thể cập nhật lịch hẹn");
                throw Error;
            }
        }
        errorAlert("Không thể cập nhật lịch hẹn");
        throw Error;
    };

    const handleDelete = async (id: number | string) => {
        try {
            await deleteDoc(doc(db, "AdviseSchedule", id.toString()));
            setAppointments(appointments.filter(a => a.id !== id));
            successAlert('Lịch hẹn đã được xóa')
        } catch (error) {
            errorAlert("Không thể xóa lịch hẹn");
            console.error("Error deleting appointment: ", error);
            throw Error;
        }
    }

    const handleDeleteAppointment = async (appointment: Appointment) => {
        confirmDelete(appointment.id, appointment.displayName || '', handleDelete)
    };

    const makeColorIndex = (appointment: Appointment) => {
        if (!appointment.consultationDate) return { backgroundColor: 'gray' };
        const appointmentDate = new Date(appointment.consultationDate.seconds * 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) return { backgroundColor: 'gray' };
        if (appointmentDate.toDateString() === today.toDateString()) return { backgroundColor: 'red', fontWeight: 'bold' };
        return { backgroundColor: 'lightgreen' };
    };

    const makeAdviseDirectColorIndex = (appointment: Appointment) => {
        if (appointment.adviseDirect === "Tư vấn online") return { color: 'red' };
        return { color: 'blue' };
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <ClimbingBoxLoader color="#87bc9d" loading size={30} speedMultiplier={0.5} />
            </div>
        )
    }

    const handleSubmit = (formValues: { 
        id?: string; 
        displayName: string; 
        phone: string; 
        email?: string; 
        age: number; 
        address?: string; 
        servicePackage: string; 
        topic?: string; 
        adviseDirect: string; 
        consultationDate: Timestamp | null; 
    }) => {
        setIsModalOpen(false);
        setSelectAppointment(null);

        if (formValues.id) {
            if (formValues.id) {
                handleEditAppointment(formValues as Appointment);
            } else {
                console.error("Missing id in formValues");
                errorAlert("Không thể cập nhật lịch hẹn do thiếu id");
            }
        } else {
            handleAdd({ ...formValues, id: formValues.id || Math.random().toString() })
        }
    }

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectAppointment(null);
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
                <button style={styles.addButton} onClick={() => setIsModalOpen(true)}><PackagePlus size={16} />Thêm lịch hẹn mới</button>
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
                            {paginated.map((item: Appointment, index: number) => (
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
                                            <button style={styles.actionButton} className="actionButton" onClick={() => { setSelectAppointment(item); setIsModalOpen(true) }}>
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
            {
                isModalOpen &&
                <AppointmentModal
                    isOpen={isModalOpen}
                    onClose={handleClose}
                    onSubmit={handleSubmit}
                    initState={selectAppointment ? { ...selectAppointment, consultationDate: selectAppointment.consultationDate ? { seconds: selectAppointment.consultationDate.seconds } : null } : null}
                />
            }

        </div>
    );
};

export default Schedule;

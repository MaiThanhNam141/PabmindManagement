import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { auth, db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { getAuth } from '@firebase/auth';
import { Edit, Trash, ChevronRight, ChevronLeft } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastVisible, setLastVisible] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const itemPerPage = 50;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const dataQuery = query(
                usersCollection,
                orderBy('email'),
                limit(itemPerPage)
            );
    
            const dataSnapshot = await getDocs(dataQuery);
            const itemList = dataSnapshot.docs.map((doc, index) => ({
                id: doc.id,
                ...doc.data(),
                index: index + 1,
            }));
    
            setUsers(itemList);
    
            const lastVisible = dataSnapshot.docs[dataSnapshot.docs.length - 1];
            setLastVisible(lastVisible);
    
            // Fetch total number of users to calculate totalPages
            const totalDataSnapshot = await getDocs(usersCollection);
            const totalData = totalDataSnapshot.size;
            const totalPages = Math.ceil(totalData / itemPerPage);
            setTotalPages(totalPages);
    
        } catch (error) {
            console.error("Error fetching users: ", error);
        } finally {
            setLoading(false);
        }
    };
    

    // Lọc người dùng theo tìm kiếm (theo displayName hoặc email)
    const filteredItems = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * itemPerPage;
    const indexOfFirstUser = indexOfLastUser - itemPerPage;
    const paginatedUsers = filteredItems.slice(indexOfFirstUser, indexOfLastUser);

    const refetchMoreData = async (multiple = 1) => {
        if (lastVisible) {
            try {
                setLoading(true);
                const usersCollection = collection(db, 'users');
                const dataQuery = query(
                    usersCollection,
                    orderBy('email'),
                    startAfter(lastVisible),
                    limit(itemPerPage * multiple)
                );

                const dataSnapshot = await getDocs(dataQuery);
                const itemList = dataSnapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    ...doc.data(),
                    index: index + 1,
                }));

                setUsers(prev => [...prev, ...itemList]);
                setLastVisible(dataSnapshot.docs[dataSnapshot.docs.length - 1]);
            } catch (error) {
                console.error("Error fetching next page: ", error);
            } finally {
                setLoading(false);
            }
        }
    };   

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

    const handleEditUser = async (user) => {
        // Fetch last sign-in time from Firebase Auth metadata
        const authUser = getAuth(auth);
        const userAuth = await authUser.getUser(user.id); // Adjust to use Firebase Admin SDK or client SDK method
        const lastSignInTime = userAuth.metadata.lastSignInTime;

        // Get the last user type
        const lastUserType = Array.isArray(user.userType)
            ? user.userType[user.userType.length - 1]
            : user.userType || '';

        // Display the Swal modal with additional fields (Last Sign-In Time, Avatar)
        const { value: formValues } = await Swal.fire({
            title: 'Sửa thông tin người dùng',
            icon: 'question',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            html: `
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Link Avatar</label>
                    <input id="swal-input1" class="swal2-input" value="${user.photoURL || ''}" placeholder="Link Avatar" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Name</label>
                    <input id="swal-input2" class="swal2-input" value="${user.displayName || ''}" placeholder="Name" style="width: 85%;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Last Sign-In Time</label>
                    <input id="swal-input3" class="swal2-input" value="${formatTimestamp(lastSignInTime)}" placeholder="Last Sign-In Time" style="width: 85%;" disabled>
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">User Type (Last Element)</label>
                    <input id="swal-input4" class="swal2-input" value="${lastUserType}" placeholder="User Type" style="width: 85%;" disabled>
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Thẻ thành viên:</label>
                    <input id="swal-input5" class="swal2-input" value="${user?.memberActive ? "Có" : "Không"}" placeholder="User Type" style="width: 85%;" disabled>
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Ngày bắt đầu thẻ thành viên</label>
                    <input id="swal-input6" class="swal2-input" value="${user?.startDateMember ? formatTimestamp(user.startDateMember) : "Không có"}" placeholder="User Type" style="width: 85%;" disabled>
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Ngày hết hạn thẻ thành viên</label>
                    <input id="swal-input7" class="swal2-input" value="${user?.endDateMember ? formatTimestamp(user.endDateMember) : "Không có"}" placeholder="User Type" style="width: 85%;" disabled>
                </div>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const photoURL = Swal.getPopup().querySelector('#swal-input1').value;
                const displayName = Swal.getPopup().querySelector('#swal-input2').value;
                return { photoURL, displayName };
            }
        });

        if (formValues) {
            try {
                const { photoURL, displayName } = formValues;
                await updateDoc(doc(db, "users", user.id), { photoURL, displayName });
                Swal.fire('Thành công!', 'Cập nhật dữ liệu tài khoản thành công', 'success');
                setUsers(users.map(u => u.id === user.id ? { ...u, photoURL, displayName } : u));
            } catch (error) {
                console.error("Error updating user: ", error);
                Swal.fire('Thất bại!', 'Đã xảy ra lỗi nào đó', 'error');
            }
        }
    };

    const handleDeleteUser = async (user) => {
        Swal.fire({
            title: `Xác nhận?`,
            text: `Xác nhận xóa ${user.displayName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'OK',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteDoc(doc(db, "users", user.id));
                    setUsers(users.filter(u => u.id !== user.id));
                    Swal.fire('Thành công!', 'Người dùng này đã bị xóa', 'success');
                } catch (error) {
                    console.error("Error deleting user: ", error);
                    Swal.fire('Thất bại', 'Đã xảy ra lỗi nào đó', 'error');
                }
            }
        });
    };

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
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
            <h2 style={styles.header}>Danh sách Người dùng</h2>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={styles.searchInput}
                />
            </div>
            <h4 style={styles.subHeader}>Có {paginatedUsers.length} người dùng trong trang này</h4>

            {paginatedUsers.length === 0 ? (
                <div style={styles.noData}>Không tìm thấy người dùng nào</div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableRow}>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Hình đại diện</th>
                                <th style={styles.th}>Tên hiển thị</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map(user => (
                                <tr key={user.id} className="userRow" style={styles.tableRow}>
                                    <td style={styles.td}>{user.index}</td>
                                    <td style={styles.td}>
                                        <img
                                            src={user.photoURL || "https://placehold.co/600x400"}
                                            alt={`${user.displayName}'s avatar`}
                                            style={styles.avatar}
                                        />
                                    </td>
                                    <td style={styles.td}>{user.displayName}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actionContainer}>
                                            <button style={styles.actionButton} className="actionButton" onClick={() => handleEditUser(user)}>
                                                <Edit size={20} color="#4CAF50" />
                                            </button>
                                            <button style={styles.actionButton} className="actionButton" onClick={() => handleDeleteUser(user)}>
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

export default Users;

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

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Edit, Trash, ChevronRight, ChevronLeft } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 100;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map((doc, index) => ({ id: doc.id, ...doc.data(), index: index + 1 }));
                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const paginatedUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(users.length / usersPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleEditUser = async (user) => {
        const { value: formValues } = await Swal.fire({
            title: 'Sửa thông tin người dùng',
            icon: 'question',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            html:
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Link Avatar</label>
                    <input id="swal-input1" class="swal2-input" value="${user.photoURL}" placeholder="Link Avatar" style="width: 80%;">
                </div>` +
                `<div style="text-align: left; margin-bottom: 10px;">
                    <label style="display: block; font-weight: bold;">Name</label>
                    <input id="swal-input2" class="swal2-input" value="${user.displayName}" placeholder="Name" style="width: 80%;">
                </div>`,
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
                console.log(photoURL, displayName);
                
                // Cập nhật tài liệu Firestore của người dùng
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
        return <div>Loading...</div>;
    }

    return (
        <div style={styles.container}>
            <h3 style={{ alignSelf: 'flex-start', color: '#807F7F' }}>Có {paginatedUsers.length} users trong trang này</h3>

            {paginatedUsers.length === 0 ? (
                <h1>Không tìm thấy người dùng nào</h1>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableRow}>
                            <th>#</th>
                            <th>Hình đại diện</th>
                            <th>Tên hiển thị</th>
                            <th>Email</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map(user => (
                            <tr key={user.id} style={styles.tableRow}>
                                <td>{user.index}</td>
                                <td>
                                    <img
                                        src={user.photoURL || "https://via.placeholder.com/32"}
                                        alt={`${user.displayName}'s avatar`}
                                        style={styles.avatar}
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/32"; }}
                                    />
                                </td>
                                <td style={styles.text}>{user.displayName}</td>
                                <td style={styles.text}>{user.email}</td>
                                <td style={styles.actions}>
                                    <button style={styles.actionButton} onClick={() => handleEditUser(user)}>
                                        <Edit size={20} color='black' />
                                    </button>
                                    <button style={styles.actionButton} onClick={() => handleDeleteUser(user)}>
                                        <Trash size={20} color='red' />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={styles.pagination}>
                <button style={styles.btnNavigationPage} onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft size={25} />
                </button>
                <div>
                    {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, index) => (
                        <span key={index} style={{
                            border: '2px solid #000',
                            color: '#000',
                            backgroundColor: '#f9f9f9',
                            padding: '5px 10px',
                            display: 'inline-block',
                            margin: '0 5px',
                            cursor: 'pointer'
                        }}
                            onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                        </span>
                    ))}
                </div>
                <button style={styles.btnNavigationPage} onClick={handleNextPage} disabled={currentPage === Math.ceil(users.length / usersPerPage)}>
                    <ChevronRight size={25} />
                </button>
            </div>
        </div>
    );
};

export default Users;

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
        height: '100%',
        minHeight: '100vh',
    },
    text: {
        color: '#000',
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
    },
    table: {
        width: '100%',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 150px)',
    },
    tableRow: {
        minHeight: '50px',
        textAlign: 'center',
        borderBottom: '1px solid #ccc',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
    },
    actions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        height:'32px'
    },
    actionButton: {
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        width: '50%',
    },
    btnNavigationPage: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: '50px',
        height: '80px',
        cursor: 'pointer',
        border: '0px'
    }
};

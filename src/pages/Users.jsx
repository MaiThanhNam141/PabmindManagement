import React, { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit, startAfter } from '@firebase/firestore';
import { Edit, Trash, ChevronRight, ChevronLeft } from 'lucide-react';
import { ClimbingBoxLoader } from 'react-spinners'
import { useLocation, useNavigate } from 'react-router-dom';
import { styles } from '../style/pagination';
import EditUserForm from '../component/EditUserForm';
import { motion } from 'framer-motion';
import { confirmDelete, successAlert } from '../component/SwalAlert';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastVisible, setLastVisible] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [editingUser, setEditingUser] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState(new URLSearchParams(location.search).get("search") || '');

    const itemPerPage = 100;

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
            errorAlert("Lấy dữ liệu thất bại");
            console.error("Error fetching users: ", error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleUpdateUser = async (updatedData) => {
        try {
            const { id, ...data } = updatedData;
            await updateDoc(doc(db, "users", id), data);
            setUsers(prevUsers => prevUsers.map(user => user.id === id ? { ...user, ...data } : user));
            successAlert('Cập nhật dữ liệu người dùng thành công')
        } catch (error) {
            console.error(error);
            errorAlert("Không thể cập nhật user")
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "users", id));
            setUsers(users.filter(u => u.id !== id));
            successAlert("User đã được xóa thành công")
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            errorAlert("Không thể xóa người dùng");
        }
    }

    const handleDeleteUser = async (user) => {
        confirmDelete(user.id, user.displayName, handleDelete)
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <ClimbingBoxLoader color="#87bc9d" loading size={30} speedMultiplier={0.5} />
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <style>
                {`
                    .userRow {transition: background-color 0.3s, transform 0.3s;}
                    .userRow:hover {background-color: #f0f8ff; transform: translateY(-3px);}
                    .actionButton:hover {transform: scale(1.1);}
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
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            style={styles.actionButton}
                                            onClick={() => window.open(user.photoURL, '_blank')}
                                        >
                                            <img
                                                src={user.photoURL || "https://placehold.co/600x400"}
                                                alt={`${user.displayName}'s avatar`}
                                                style={styles.avatar}
                                            />
                                        </motion.button>
                                    </td>
                                    <td style={styles.td}>{user.displayName}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actionContainer}>
                                            <button style={styles.actionButton} className="actionButton" onClick={() => setEditingUser(user)}>
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
            {editingUser && (
                <EditUserForm
                    user={editingUser}
                    onSave={handleUpdateUser}
                    onClose={() => setEditingUser(null)}
                />
            )}
        </div>
    );
};

export default Users;

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from "../firebase/config";
import {
    collection, getDocs, deleteDoc, doc, updateDoc,
    query, orderBy, where
} from '@firebase/firestore';
import { Edit, Trash, Search as SearchIcon } from 'lucide-react';
import { ClimbingBoxLoader } from 'react-spinners';
import { useLocation, useNavigate } from 'react-router-dom';
import EditUserForm from '../component/EditUserForm.tsx';
import { motion } from 'framer-motion';
import { confirmDelete, successAlert, errorAlert } from '../component/SwalAlert';
import { Table, Input, Typography, Space, Button, Image, Spin, Alert } from 'antd';
import { Timestamp, QueryDocumentSnapshot, DocumentData } from '@firebase/firestore';

const { Title } = Typography;
const { Search } = Input;

interface GAD7 {
    qIndex: number;
    point: number;
}

interface User {
    id: string;
    displayName: string;
    email: string;
    startDateMember: Timestamp | null;
    endDateMember: Timestamp | null;
    eq: number;
    age: number;
    coin: number;
    userType: string[];
    DISCType: string;
    phone: string;
    address: string;
    memberActive: boolean;
    memberID: string;
    photoURL: string;
    GAD7CriticalPoint: GAD7[] | null;
    token: string;
    charity: number;
    bmi: number;
    essayComment: string;
    BDIRateID: string;
    GAD7Result: string;
    displayNameLower: string;
    emailLower: string;
}

const Users = () => {
    const [allUsers, setAllUsers] = useState<User[]>();
    const [filteredUsers, setFilteredUsers] = useState<User[]>();
    const [loading, setLoading] = useState<boolean>(true);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState<boolean>(false);
    const [noLocalResults, setNoLocalResults] = useState<boolean>(false);
    const [noGlobalResultsFound, setNoGlobalResultsFound] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const location = useLocation();
    const navigate = useNavigate();
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) {
            const params = new URLSearchParams(location.search);
            if (searchTerm) {
                params.set("search", searchTerm);
            } else {
                params.delete("search");
            }
            navigate(`?${params.toString()}`, { replace: true });
        } else {
            isMounted.current = true;
        }
    }, [searchTerm, navigate, location.search]);

    const filterLocalUsers = useCallback((searchValue: string, sourceData: User[]) => {
        const lowerCaseValue = searchValue.toLowerCase().trim();
        setNoGlobalResultsFound(false);

        if (!lowerCaseValue) {
            setFilteredUsers(sourceData);
            setNoLocalResults(false);
            setIsSearchingGlobal(false);
            return true;
        }

        const localResults = sourceData.filter(user =>
            user.displayName?.toLowerCase().includes(lowerCaseValue) ||
            user.email?.toLowerCase().includes(lowerCaseValue)
        );

        setFilteredUsers(localResults);
        setNoLocalResults(localResults.length === 0);
        setIsSearchingGlobal(false);
        return localResults.length > 0;
    }, []);

    const fetchAllUsers = useCallback(async () => {
        console.log("Fetching initial user list from Firestore...");
        setLoading(true);
        setNoLocalResults(false);
        setNoGlobalResultsFound(false);
        setIsSearchingGlobal(false);
        try {
            const usersCollection = collection(db, 'users');
            const dataQuery = query(usersCollection, orderBy('email'));
            const dataSnapshot = await getDocs(dataQuery);

            const itemList = dataSnapshot.docs.map((doc, index) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    displayName: data.displayName || '',
                    email: data.email || '',
                    startDateMember: data.startDateMember || null,
                    endDateMember: data.endDateMember || null,
                    eq: data.eq || 0,
                    age: data.age || 0,
                    coin: data.coin || 0,
                    userType: data.userType || [],
                    DISCType: data.DISCType || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    memberActive: data.memberActive || false,
                    memberID: data.memberID || '',
                    photoURL: data.photoURL || '',
                    GAD7CriticalPoint: data.GAD7CriticalPoint || null,
                    token: data.token || '',
                    charity: data.charity || 0,
                    bmi: data.bmi || 0,
                    essayComment: data.essayComment || '',
                    BDIRateID: data.BDIRateID || '',
                    GAD7Result: data.GAD7Result || '',
                    displayNameLower: data.displayNameLower || data.displayName?.toLowerCase() || '',
                    emailLower: data.emailLower || data.email?.toLowerCase() || '',
                    index: index + 1,
                };
            });

            setAllUsers(itemList);

            const params = new URLSearchParams(location.search);
            const initialSearchTerm = params.get('search') || '';
            setSearchTerm(initialSearchTerm);
            filterLocalUsers(initialSearchTerm, itemList);

        } catch (error) {
            console.error("Error fetching initial users:", error);
            errorAlert("Unable to load user data.");
            setAllUsers([]);
            setFilteredUsers([]);
        } finally {
            setLoading(false);
        }
    }, [filterLocalUsers, location.search]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        filterLocalUsers(value, allUsers || []);
    };

    const searchHandler = useCallback(handleSearchChange, [allUsers, filterLocalUsers]);

    const searchGlobally = async () => {
        const currentSearchTerm = searchTerm.trim();
        if (!currentSearchTerm) return;

        const lowerCaseValue = currentSearchTerm.toLowerCase();

        console.log("Performing optimized global search (starts with) in Firestore for:", lowerCaseValue);
        setIsSearchingGlobal(true);
        setNoLocalResults(false);
        setNoGlobalResultsFound(false);
        setFilteredUsers([]);

        try {
            const usersCollection = collection(db, 'users');
            const searchEnd = lowerCaseValue + '\uf8ff';

            const nameQuery = query(
                usersCollection,
                where('displayNameLower', '>=', lowerCaseValue),
                where('displayNameLower', '<', searchEnd)
            );

            const emailQuery = query(
                usersCollection,
                where('emailLower', '>=', lowerCaseValue),
                where('emailLower', '<', searchEnd)
            );

            const [nameSnapshot, emailSnapshot] = await Promise.all([
                getDocs(nameQuery),
                getDocs(emailQuery)
            ]);

            const resultsMap = new Map();

            const addUserToMap = (doc: QueryDocumentSnapshot<DocumentData>) => {
                if (!resultsMap.has(doc.id)) {
                    const data = doc.data() as User;
                    resultsMap.set(doc.id, {
                        ...data,
                        displayNameLower: data.displayNameLower || data.displayName?.toLowerCase() || '',
                        emailLower: data.emailLower || data.email?.toLowerCase() || '',
                    });
                }
            };

            nameSnapshot.docs.forEach(addUserToMap);
            emailSnapshot.docs.forEach(addUserToMap);

            const finalResults = Array.from(resultsMap.values())
                .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
                .map((user, index) => ({ ...user, index: index + 1 }));

            setFilteredUsers(finalResults);
            setNoGlobalResultsFound(finalResults.length === 0);
            if (finalResults.length === 0) {
                console.log("No results found in global search.");
            }

        } catch (err) {
            console.error("Global search failed:", err);
            errorAlert("Global search failed. Check Firestore indexes or connection.");
            setFilteredUsers([]);
            setNoGlobalResultsFound(true);
        } finally {
            setIsSearchingGlobal(false);
        }
    };

    const handleUpdateUser = async (updatedData: User) => {
        const { id, ...data } = updatedData;
        if (data.displayName) data.displayNameLower = data.displayName.toLowerCase();
        if (data.email) data.emailLower = data.email.toLowerCase();

        setIsSearchingGlobal(true);
        try {
            await updateDoc(doc(db, "users", id), data);

            const updatedAllUsers = allUsers ? allUsers.map(user =>
                user.id === id ? { ...user, ...data } : user
            ) : [];
            setAllUsers(updatedAllUsers);
            filterLocalUsers(searchTerm, updatedAllUsers);

            successAlert('User data updated successfully.');
        } catch (error) {
            console.error("Error updating user:", error);
            errorAlert("Unable to update user data.");
        } finally {
            setEditingUser(null);
            setIsSearchingGlobal(false);
        }
    };

    const handleDeleteUser = (user: User) => {
        confirmDelete(user.id, user.displayName, handleDelete);
    };

    const handleDelete = async (id: string | number) => {
        id = id.toString();
        setIsSearchingGlobal(true);
        try {
            await deleteDoc(doc(db, "users", id.toString()));

            const updatedAllUsers = allUsers ? allUsers
                .filter(u => u.id !== id)
                .map((user, index) => ({ ...user, index: index + 1 })) : [];

            setAllUsers(updatedAllUsers);

            filterLocalUsers(searchTerm, updatedAllUsers);

            successAlert("User deleted successfully.");
        } catch (error) {
            console.error("Error deleting user:", error);
            errorAlert("Unable to delete user.");
            throw Error;
        } finally {
            setIsSearchingGlobal(false);
        }
    };

    const columns = [
        {
            title: <strong>#</strong>,
            dataIndex: 'index',
            key: 'index',
            width: 60,
        },
        {
            title: <strong>Avatar</strong>,
            dataIndex: 'photoURL',
            key: 'avatar',
            width: 100,
            render: (photoURL: string) => (
                <motion.div whileHover={{ scale: 1.05 }}>
                    <Image
                        src={photoURL || 'https://via.placeholder.com/50/92c952'}
                        width={50}
                        height={50}
                        style={{ borderRadius: 8, cursor: 'pointer', objectFit: 'cover' }}
                        preview={true}
                        fallback='https://via.placeholder.com/50/cccccc'
                    />
                </motion.div>
            )
        },
        {
            title: <strong>Display Name</strong>,
            dataIndex: 'displayName',
            key: 'displayName',
            ellipsis: true,
            sorter: (a: User, b: User) => (a.displayName || '').localeCompare(b.displayName || ''),
        },
        {
            title: <strong>Email</strong>,
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            sorter: (a: User, b: User) => (a.email || '').localeCompare(b.email || ''),
        },
        {
            title: <strong>Actions</strong>,
            key: 'actions',
            width: 120,
            render: (_: unknown, user: User) => (
                <Space>
                    <motion.div whileHover={{ scale: 1.2 }}>
                        <Button
                            type="text" shape="circle"
                            icon={<Edit size={16} color="#4CAF50" />}
                            onClick={() => setEditingUser(user)}
                            title="Edit User"
                            style={{ border: 'none', background: 'transparent' }}
                        />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.2 }}>
                        <Button
                            type="text" danger shape="circle"
                            icon={<Trash size={16} />}
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                            style={{ border: 'none', background: 'transparent' }}
                        />
                    </motion.div>
                </Space>
            ),
        },
    ];

    if (loading && !allUsers) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
                <ClimbingBoxLoader color="#87bc9d" loading size={25} speedMultiplier={0.8} />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={3} style={{ marginBottom: 20, color: '#333' }}>User Management</Title>
            <Search
                placeholder="Search locally by Name or Email..."
                enterButton={<><SearchIcon size={16} /> Search</>}
                onChange={(e) => searchHandler(e.target.value)}
                onSearch={handleSearchChange}
                value={searchTerm}
                allowClear
                style={{ maxWidth: 400, marginBottom: 20 }}
            />
            {noLocalResults && searchTerm && !isSearchingGlobal && (
                <Alert
                    message="No users found locally matching your search."
                    type="info" showIcon
                    action={
                        <Button
                            size="small" type="primary"
                            onClick={searchGlobally}
                            icon={<SearchIcon size={14} />}
                        >
                            Search Globally (starts with...)
                        </Button>
                    }
                    style={{ marginBottom: 20 }}
                />
            )}
            {noGlobalResultsFound && !isSearchingGlobal && searchTerm && (
                <Alert
                    message={`No users found in database starting with "${searchTerm}".`}
                    type="warning" showIcon style={{ marginBottom: 20 }}
                />
            )}
            <Spin spinning={isSearchingGlobal} tip="Processing...">
                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    rowClassName={() => 'user-row-hover'}
                    bordered
                    scroll={{ x: 'max-content' }}
                    style={{
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    }}
                    locale={{
                        emptyText: (
                            <div style={{ textAlign: 'center', padding: 20 }}>
                                No users available
                            </div>
                        ),
                    }}
                />
            </Spin>
            {editingUser && (
                <EditUserForm
                    user={editingUser!}
                    onSave={(data) => handleUpdateUser({ ...data, displayNameLower: data.displayName?.toLowerCase(), emailLower: data.email?.toLowerCase() })}
                    onClose={() => setEditingUser(null)}
                />
            )}
            <style>{`
                .user-row-hover:hover {
                    background-color: #e6f7ff !important;
                    cursor: pointer;
                }
                .ant-spin-nested-loading > div > .ant-spin {
                     max-height: none;
                     position: absolute;
                     top: 50%; left: 50%;
                     transform: translate(-50%, -50%);
                     z-index: 10;
                     background-color: rgba(255, 255, 255, 0.7); /* Add semi-transparent background to overlay */
                     padding: 20px;
                     border-radius: 8px;
                 }
                 .ant-spin-nested-loading > div > .ant-spin .ant-spin-text {
                      margin-top: 8px;
                      text-shadow: none; /* Remove shadow if background added */
                      color: #555;
                 }
                 .ant-table-cell .ant-space-item button {
                    color: #555;
                 }
                 .ant-table-cell .ant-space-item button:hover {
                     background-color: rgba(0, 0, 0, 0.05);
                 }
            `}</style>
        </div>
    );
};

export default Users;

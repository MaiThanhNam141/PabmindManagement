import { useState } from 'react'
import Swal from 'sweetalert2'
import { Loader2 } from 'lucide-react'

const FCM = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [token, setToken] = useState('');
    const [isSending, setIsSending] = useState(false);

    const sendNotificationToUser = async (title, body, token) => {
        try {
            const response = await fetch('https://us-central1-namthanhstores.cloudfunctions.net/sendNotificationToUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body, token }),
            })
    
            if (response.ok) {
                console.log('Successfully sent message to user');
                return true;
            } else {
                console.error('Error sending message to user:', await response.json())
                throw new Error('Failed to send message to user');
            }
        } catch (error) {
            console.error('Error sending message to user:', error)
            throw error;
        }
    }

    const sendFCMNotification = async (title, body) => {
        try {
            const response = await fetch('https://us-central1-namthanhstores.cloudfunctions.net/sendNotification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body }),
            })
    
            if (response.ok) {
                console.log('Successfully sent message');
                return true;
            } else {
                console.error('Error sending message:', await response.json())
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error)
            throw error;
        }
    }
    

    const handleSend = async () => {
        if (!title || !body) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng nhập cả tiêu đề và nội dung thông báo',
            })
            return;
        }

        setIsSending(true)
        try {
            if (token) {
                await sendNotificationToUser(title, body, token)
            } else {
                await sendFCMNotification(title, body)
            }
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Đã gửi thông báo thành công',
            })
            setTitle('');
            setBody('');
            setToken('');
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: 'Có lỗi xảy ra khi gửi thông báo',
            })
        } finally {
            setIsSending(false);
        }
    }


    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Gửi thông báo</h2>
            </div>
            <div style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="title" style={styles.label}>
                        Tiêu đề
                    </label>
                    <input
                        type="text"
                        id="title"
                        placeholder="Nhập tiêu đề thông báo"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="body" style={styles.label}>
                        Nội dung
                    </label>
                    <textarea
                        id="body"
                        placeholder="Nhập nội dung thông báo"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={6}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="token" style={styles.label}>
                        Token thông báo của người dùng (tùy chọn)
                    </label>
                    <input
                        type="text"
                        id="token"
                        placeholder="Nhập token FCM (nếu có)"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        style={styles.input}
                    />
                </div>
            </div>
            <div>
                <button
                    onClick={handleSend}
                    disabled={isSending}
                    style={isSending ? styles.disabledButton : styles.button}
                >
                    {isSending ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Loader2 style={{ animation: 'spin 1s linear infinite', marginRight: '0.75rem' }} />
                            Đang gửi...
                        </span>
                    ) : (
                        'Gửi thông báo'
                    )}
                </button>
            </div>
        </div>
    )
}

export default FCM

const styles = {
    container: {
        width: '100%',
        maxWidth: '42rem',
        margin: '0 auto',
        backgroundColor: '#f0f0f0',
        border: '2px solid #87bc9d',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '1.5rem',
        minHeight: '80vh',
    },

    header: {
        color: '#87bc9d',
        padding: '1rem',
        borderTopLeftRadius: '0.375rem',
        borderTopRightRadius: '0.375rem',
        textAlign: 'center',
    },

    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },

    description: {
        color: '#f0f0f0',
        marginTop: '0.5rem',
    },

    form: {
        marginTop: '1.5rem',
    },

    inputGroup: {
        marginBottom: '1.5rem',
    },

    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#87bc9d',
        marginBottom: '0.5rem',
    },

    input: {
        width: '95%',
        padding: '0.5rem 0.75rem',
        border: '1px solid #87bc9d',
        borderRadius: '0.375rem',
        outline: 'none',
        height:'15%',
        maxWidth:'95%',
        minWidth:'95%',
    },

    button: {
        width: '100%',
        height: '10vh',
        backgroundColor: '#87bc9d',
        color: 'white',
        fontWeight: 'bold',
        padding: '0.75rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    disabledButton: {
        width: '100%',
        height: '10vh',
        backgroundColor: '#87bc9d',
        color: 'white',
        fontWeight: 'bold',
        padding: '0.75rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
        cursor: 'not-allowed',
    },
}
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { db, storage } from "../firebase/config";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc, getDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Blog = () => {
  const [title, setTitle] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Lấy dữ liệu blog từ Firestore
  const fetchBlogs = async () => {
    const querySnapshot = await getDocs(collection(db, 'SliderImages'));
    const blogsData = querySnapshot.docs.map((docSnap, index) => ({
      id: docSnap.id,
      index: index + 1,
      ...docSnap.data()
    }));
    setBlogs(blogsData);
  };

  // Xử lý file upload (chỉ chấp nhận PNG, JPG)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setFileUpload(file);
    } else {
      Swal.fire('Lỗi', 'Chỉ hỗ trợ file PNG, JPG', 'error');
      e.target.value = null; // reset file input
    }
  };

  // Xử lý thêm blog mới
  const handleSubmitPost = async () => {
    if (!title || !shareLink || !fileUpload) {
      Swal.fire('Lỗi', 'Vui lòng nhập đầy đủ thông tin', 'error');
      return;
    }

    if (blogs.length >= 5) {
      Swal.fire('Lỗi', 'Chỉ có thể lưu tối đa 5 bài blog, hãy xóa bớt!', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận thêm blog?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Thêm',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;

    try {
      setIsSending(true);
      // Tạo tên file với 5 ký tự số ngẫu nhiên
      const randomNumber = Math.floor(10000 + Math.random() * 90000);
      const fileExt = fileUpload.name.split('.').pop();
      const fileName = `${randomNumber}.${fileExt}`;

      const storagePath = `Blog/${fileName}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, fileUpload);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'SliderImages'), {
        title,
        link: shareLink,
        urlImages: downloadURL,
        storagePath,
      });
      Swal.fire('Thành công', 'Bài viết đã được thêm!', 'success');
      setBlogs(prev => [...prev, { id: randomNumber, title, link: shareLink, urlImages: downloadURL, storagePath }])

      setTitle('');
      setShareLink('');
      setFileUpload(null);
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại!', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Xử lý xóa blog
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;

    try {
      // Lấy document cần xóa để biết storagePath
      const docRef = doc(db, 'SliderImages', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const storagePath = await data.storagePath; // đường dẫn file đã lưu
        if (storagePath) {
          // Xóa file trong Storage
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
        } else {
          Swal.fire('Lỗi', 'Không tìm thấy địa chỉ hình ảnh cần xóa', 'error');
        }
        // Sau đó xóa document trong Firestore
        await deleteDoc(docRef);
        setBlogs(prev => prev.filter(item => item.id !== id));
        Swal.fire('Đã xóa!', 'Bài viết đã được xóa thành công', 'success');
      } else {
        Swal.fire('Lỗi', 'Không tìm thấy dữ liệu cần xóa', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Không thể xóa bài viết', 'error');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Quản lý Blog</h2>
      <div style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Tiêu đề</label>
          <input
            type='text'
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề blog"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Link chia sẻ</label>
          <input
            type='text'
            style={styles.input}
            value={shareLink}
            onChange={(e) => setShareLink(e.target.value)}
            placeholder="Nhập link chia sẻ"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Upload Hình ảnh (chỉ PNG, JPG)</label>
          <input
            type='file'
            accept='image/png, image/jpeg'
            style={styles.input}
            onChange={handleFileChange}
          />
        </div>
        <button
          style={isSending ? styles.disabledButton : styles.button}
          onClick={handleSubmitPost}
          disabled={isSending}
        >
          {isSending ? 'Đang gửi...' : 'Thêm Blog'}
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={styles.tableTitle}>Danh sách Blog (Tối đa 5 Blog)</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableTh}>STT</th>
              <th style={styles.tableTh}>Tiêu đề Blog</th>
              <th style={styles.tableTh}>Hình ảnh</th>
              <th style={styles.tableTh}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id} style={styles.tableTr}>
                <td style={styles.indexTd}>{blog.index}</td>
                <td style={styles.tableTd}>
                  <a href={blog.link} target='_blank' rel='noopener noreferrer' style={styles.link}>
                    {blog.title}
                  </a>
                </td>
                <td style={styles.tableTd}>
                  <img src={blog.urlImages} alt={blog.title} style={styles.image} />
                </td>
                <td style={styles.tableTd}>
                  <button
                    style={{ ...styles.actionButton, backgroundColor: '#e74c3c' }}
                    onClick={() => handleDelete(blog.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Blog;

const styles = {
  container: {
    width: '100%',
    maxWidth: '900px',
    margin: '2rem auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#2c3e50'
  },
  header: {
    textAlign: 'center',
    color: '#34495e',
    marginBottom: '1.5rem',
    fontSize: '2rem'
  },
  form: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  inputGroup: {
    marginBottom: '1.2rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#34495e',
    fontWeight: '600'
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '4px',
    border: '1px solid #bdc3c7',
    fontSize: '1rem'
  },
  button: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  disabledButton: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  tableTitle: {
    marginBottom: '1rem',
    textAlign: 'center',
    color: '#34495e',
    fontSize: '1.5rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableTh: {
    border: '1px solid #ecf0f1',
    padding: '0.75rem',
    backgroundColor: '#ecf0f1',
    color: '#34495e',
    textAlign: 'center'
  },
  tableTd: {
    border: '1px solid #ecf0f1',
    padding: '0.75rem',
    textAlign: 'center'
  },
  tableTr: {
    backgroundColor: '#fff'
  },
  // Đổi màu cho cột index (đảm bảo không trùng với nền)
  indexTd: {
    border: '1px solid #ecf0f1',
    padding: '0.75rem',
    textAlign: 'center',
    color: '#2c3e50', // màu chữ tối
    fontWeight: 'bold'
  },
  link: {
    color: '#2980b9',
    textDecoration: 'none',
    fontWeight: '500'
  },
  image: {
    width: '100px',
    height: 'auto',
    borderRadius: '4px'
  },
  actionButton: {
    margin: '0 0.3rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }
};

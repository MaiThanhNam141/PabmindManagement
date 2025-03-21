import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage } from "../firebase/config";
import { getDownloadURL, ref, uploadBytes, deleteObject } from '@firebase/storage';
import { collection, addDoc, getDoc, getDocs, deleteDoc, doc } from '@firebase/firestore';
import { ClimbingBoxLoader } from 'react-spinners'
import ImageCropper from '../component/ImageCropper';
import { styles } from '../style/blog';

const Blog = () => {
  const [title, setTitle] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropSrc, setCropSrc] = useState('');
  const [croppedImage, setCroppedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'SliderImages'));
      const blogsData = querySnapshot.docs.map((docSnap, index) => ({
        id: docSnap.id,
        index: index + 1,
        ...docSnap.data()
      }));
      setBlogs(blogsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setFileUpload(file);
      const imageUrl = URL.createObjectURL(file);
      setCropSrc(imageUrl);
      setShowCropper(true);
    } else {
      Swal.fire('Lỗi', 'Chỉ hỗ trợ file PNG, JPG', 'error');
      e.target.value = null;
    }
  };


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
      const fileName = `${Date.now()}.jpg`;
      const storagePath = `Blog/${fileName}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, croppedImage || fileUpload);
      const downloadURL = await getDownloadURL(storageRef);

      const newBlog = {
        title,
        link: shareLink,
        urlImages: downloadURL,
        storagePath,
      };

      const docRef = await addDoc(collection(db, 'SliderImages'), newBlog);

      Swal.fire('Thành công', 'Bài viết đã được thêm!', 'success');

      setBlogs(prev => [
        ...prev,
        { ...newBlog, id: docRef.id, index: prev.length + 1 }
      ]);

      setTitle('');
      setShareLink('');
      setFileUpload(null);

      setCroppedImage(null);
      setCropSrc('');
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại!', 'error');
    } finally {
      setIsSending(false);
    }
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;
    setBlogs(prev => prev.filter(item => item.id !== id));

    try {
      const docRef = doc(db, 'SliderImages', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const storagePath = await data.storagePath;
        if (storagePath) {
          const fileRef = ref(storage, storagePath);
          Promise.all([
            await deleteObject(fileRef),
            await deleteDoc(docRef),
          ])
          Swal.fire('Đã xóa!', 'Bài viết đã được xóa thành công', 'success');
        } else {
          Swal.fire('Lỗi', 'Không tìm thấy địa chỉ hình ảnh cần xóa', 'error');
        }
        setBlogs(prev => prev.filter(item => item.id !== id));
      } else {
        Swal.fire('Lỗi', 'Không tìm thấy dữ liệu cần xóa', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Không thể xóa bài viết', 'error');
    }
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
        {showCropper && cropSrc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ImageCropper
              src={cropSrc}
              onComplete={(blob) => {
                setCroppedImage(blob);
                setShowCropper(false);
              }}
              onCancel={() => setShowCropper(false)}
            />
          </motion.div>
        )}

        {/* Review ảnh đã cắt */}
        {croppedImage && (
          <div style={{ marginBottom: '1rem' }}>
            <h3>Hình ảnh đã cắt:</h3>
            <img
              src={URL.createObjectURL(croppedImage)}
              alt="Cropped"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
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
            <AnimatePresence>
              {blogs.map((blog) => (
                <tr key={blog.id} style={styles.tableTr}>
                  <td style={styles.indexTd}>{blog.index}</td>
                  <td style={styles.tableTd}>
                    <a href={blog.link} target='_blank' rel='noopener noreferrer' style={styles.link}>
                      {blog.title}
                    </a>
                  </td>
                  <td style={styles.tableTd}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      style={styles.actionButton}
                      onClick={() => window.open(blog.urlImages, '_blank')}
                    >
                      <img src={blog.urlImages} alt={blog.title} style={styles.image} />
                    </motion.button>
                  </td>
                  <td style={styles.tableTd}>
                    <motion.button
                      whileHover={{ scale: 1.3 }}
                      style={{ ...styles.actionButton, backgroundColor: '#e74c3c' }}
                      onClick={() => handleDelete(blog.id)}
                    >
                      Xóa
                    </motion.button>
                  </td>
                </tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Blog;

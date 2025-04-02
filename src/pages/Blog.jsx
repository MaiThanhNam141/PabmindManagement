import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage } from "../firebase/config";
import { getDownloadURL, ref, uploadBytes, deleteObject } from '@firebase/storage';
import { collection, addDoc, getDoc, getDocs, deleteDoc, doc } from '@firebase/firestore';
import { ClimbingBoxLoader } from 'react-spinners'
import ImageCropper from '../component/ImageCropper';
import { styles } from '../style/blog';
import { confirmAdd, confirmDelete, errorAlert, successAlert } from '../component/SwalAlert';

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

  const fileInputRef = useRef(null);

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
      errorAlert("Lấy dữ liệu thất bại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setFileUpload(file);
      const imageUrl = URL.createObjectURL(file);
      setCropSrc(imageUrl);
      setShowCropper(true);
    } else {
      e.target.value = null;
    }
  };

  const addBlog = async () => {
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

      successAlert("Bài viết đã được thêm!")
      setBlogs(prev => [
        ...prev,
        { ...newBlog, id: docRef.id, index: prev.length + 1 }
      ]);
    } catch (error) {
      console.error(error);
      errorAlert("Có lỗi xảy ra, vui lòng thử lại!")
    } finally {
      setIsSending(false);
      reNewState();
    }
  }

  const reNewState = () => {
    setTitle('');
    setShareLink('');
    setFileUpload(null);

    setCroppedImage(null);
    setCropSrc('');
  }

  const handleSubmitPost = async () => {
    if (!title || !shareLink || !fileUpload) {
      errorAlert('Vui lòng nhập đầy đủ thông tin')
      return;
    }
    if (blogs.length >= 5) {
      errorAlert('Chỉ có thể lưu tối đa 5 bài blog, hãy xóa bớt!')
      return;
    }

    confirmAdd(addBlog)
  };

  const handleDelete = (id, name) => {
    confirmDelete(id, name, deleteBlog);
  }

  const deleteBlog = async (id) => {
    try {
      const docRef = doc(db, "SliderImages", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        errorAlert("Không tìm thấy dữ liệu cần xóa")
        return;
      }

      const { storagePath } = docSnap.data();

      if (!storagePath) {
        errorAlert("Không tìm thấy địa chỉ hình ảnh cần xóa")
        return;
      }

      const fileRef = ref(storage, storagePath);
      await Promise.all([deleteObject(fileRef), deleteDoc(docRef)]);

      setBlogs((prev) => prev.filter((item) => item.id !== id));

      successAlert("Bài viết đã được xóa thành công");
    } catch (error) {
      console.error(error);
      errorAlert("Đã xảy ra lỗi nào đó")
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
          <motion.button
            style={styles.buttonFile}
            onClick={handleButtonClick}
            onMouseOver={(e) => Object.assign(e.target.style, styles.buttonFileHover)}
            onMouseOut={(e) => Object.assign(e.target.style, styles.buttonFile)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
          >
            Chọn ảnh
          </motion.button>
          <input
            type='file'
            accept='image/png, image/jpeg'
            style={styles.inputFile}
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
        {showCropper && cropSrc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
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
          <motion.div style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => window.open(URL.createObjectURL(croppedImage), '_blank')}>
            <h3>Hình ảnh đã cắt:</h3>
            <img
              src={URL.createObjectURL(croppedImage)}
              alt="Cropped"
              style={{ maxWidth: '100%' }}
            />
          </motion.div>
        )}
        <motion.button
          style={isSending ? styles.disabledButton : styles.button}
          onClick={handleSubmitPost}
          disabled={isSending}
          whileHover={{ scale: 1.1 }}
        >
          {isSending ? 'Đang gửi...' : 'Thêm Blog'}
        </motion.button>
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
                <motion.tr key={blog.id} style={styles.tableTr} whileHover={{ scale: 1.01, backgroundColor: "#f0f8ff" }}>
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
                      whileHover={{ scale: 1.1 }}
                      style={{ ...styles.actionButton, backgroundColor: '#e74c3c' }}
                      onClick={() => handleDelete(blog.id, blog.title)}
                    >
                      Xóa
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Blog;

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage } from "../firebase/config";
import { getDownloadURL, ref, uploadBytes, deleteObject } from '@firebase/storage';
import { collection, addDoc, getDoc, getDocs, deleteDoc, doc } from '@firebase/firestore';
import { ClimbingBoxLoader } from 'react-spinners'
import ImageCropper from '../component/ImageCropper.tsx';
import { styles } from '../style/blog.tsx';
import { confirmAdd, confirmDelete, errorAlert, successAlert } from '../component/SwalAlert';
import { Image } from 'antd';

interface BlogData {
  id: string;
  index: number;
  title: string;
  link: string;
  urlImages: string;
}

const Blog = () => {
  const [title, setTitle] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cropSrc, setCropSrc] = useState<string>('');
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [showCropper, setShowCropper] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'SliderImages'));
      const blogsData = querySnapshot.docs.map((docSnap, index) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          index: index + 1,
          title: data.title || '',
          link: data.link || '',
          urlImages: data.urlImages || ''
        };
      });
      setBlogs(blogsData);
    } catch (error) {
      errorAlert("Lấy dữ liệu thất bại");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files.length === 0) return;
    if (e.target.files.length > 1) {
      errorAlert('Chỉ được chọn một file hình ảnh');
      e.target.value = '';
      return;
    }
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
      setFileUpload(file);
      const imageUrl = URL.createObjectURL(file);
      setCropSrc(imageUrl);
      setShowCropper(true);
    } else {
      e.target.value = '';
    }
  };

  const addBlog = async () => {
    try {
      setIsSending(true);
      const fileName = `${Date.now()}.jpg`;
      const storagePath = `Blog/${fileName}`;
      const storageRef = ref(storage, storagePath);

      if (croppedImage || fileUpload) {
        if (croppedImage) {
          await uploadBytes(storageRef, croppedImage);
        } else if (fileUpload) {
          await uploadBytes(storageRef, fileUpload);
        } else {
          throw new Error("No valid file or cropped image to upload.");
        }
      } else {
        throw new Error("No valid file or cropped image to upload.");
      }
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
      throw Error;
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

  const handleDelete = (id: string, name: string) => {
    confirmDelete(id, name, deleteBlog);
  }

  const deleteBlog = async (id: string | number) => {
    try {
      const docRef = doc(db, "SliderImages", id.toString());
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        errorAlert("Không tìm thấy dữ liệu cần xóa")
        throw new Error("No such document!");
      }

      const { storagePath } = docSnap.data();

      if (!storagePath) {
        errorAlert("Không tìm thấy địa chỉ hình ảnh cần xóa")
        throw new Error("No such document!");
      }

      const fileRef = ref(storage, storagePath);
      await Promise.all([deleteObject(fileRef), deleteDoc(docRef)]);

      setBlogs((prev) => prev.filter((item) => item.id !== id));

      successAlert("Bài viết đã được xóa thành công");
    } catch (error) {
      console.error(error);
      errorAlert("Đã xảy ra lỗi nào đó")
      throw new Error("Error deleting document: ");
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
            onMouseOver={(e) => Object.assign((e.target as HTMLButtonElement).style, styles.buttonFileHover)}
            onMouseOut={(e) => Object.assign((e.target as HTMLButtonElement).style, styles.buttonFile)}
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
              onComplete={(blob: Blob) => {
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
                <motion.tr key={blog.id} style={{ ...styles.tableTr }} whileHover={{ scale: 1.01, backgroundColor: "#f0f8ff" }}>
                  <td style={{ ...styles.indexTd, ...styles.tableTd }}>{blog.index}</td>
                  <td style={{ ...styles.tableTd }}>
                    <a href={blog.link} target='_blank' rel='noopener noreferrer' style={styles.link}>
                      {blog.title}
                    </a>
                  </td>
                  <td style={styles.tableTd}>
                    <motion.button
                      style={styles.actionButton}
                    >
                      <Image
                        src={blog.urlImages || 'https://via.placeholder.com/50/92c952'}
                        preview={true}
                        fallback='https://via.placeholder.com/50/cccccc'
                        alt={blog.title}
                        style={styles.image}
                      />
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

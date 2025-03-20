import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import { motion } from 'framer-motion';

const ImageCropper = ({ src, onComplete, onCancel }) => {
  const [crop, setCrop] = useState({ aspect: 390 / 200 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const onImageLoad = (e) => {
    imageRef.current = e.currentTarget;
  };

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imageRef.current) return;
    const image = imageRef.current;
    const canvas = previewCanvasRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
  }, [completedCrop]);

  const handleConfirm = () => {
    if (!completedCrop || !previewCanvasRef.current) return;
    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        console.error('Không tạo được ảnh cắt');
        return;
      }
      blob.name = 'cropped.jpg';
      onComplete(blob);
    }, 'image/jpeg');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ReactCrop
        crop={crop}
        onChange={(newCrop) => setCrop(newCrop)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={390 / 200}
      >
        <img
          src={src}
          alt="Crop me"
          onLoad={onImageLoad}
          style={{ maxWidth: '100%', maxHeight: '80vh' }}
        />
      </ReactCrop>
      <div style={{ marginTop: '1rem' }}>
        <h3>Preview</h3>
        <canvas
          ref={previewCanvasRef}
          style={{
            width: completedCrop ? completedCrop.width : 0,
            height: completedCrop ? completedCrop.height : 0,
            border: '1px solid #ccc'
          }}
        />
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <motion.button
          onClick={handleConfirm}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Xác nhận
        </motion.button>
        <motion.button
          onClick={onCancel}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Hủy
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ImageCropper;

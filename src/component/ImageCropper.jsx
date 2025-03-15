import '../style/Blog.css'
import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';

const ImageCropper = ({ src, onComplete, onCancel }) => {
  const [crop, setCrop] = useState({ aspect: 390 / 200 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imageRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Xử lý khi ảnh được load
  const onImageLoad = (e) => {
    imageRef.current = e.currentTarget;
  };

  // Cập nhật canvas preview khi crop thay đổi
  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imageRef.current) return;
    const image = imageRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
  }, [completedCrop, crop]);

  // Xử lý xác nhận crop, chuyển canvas thành blob
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
    <div>
      <ReactCrop
        crop={crop}
        onChange={(newCrop) => setCrop(newCrop)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={390/200}
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
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleConfirm} style={{ marginRight: '1rem' }}>
          Xác nhận
        </button>
        <button onClick={onCancel}>Hủy</button>
      </div>
    </div>
  );
};

export default ImageCropper;

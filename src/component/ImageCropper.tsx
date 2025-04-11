import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import { motion } from 'framer-motion';
import 'react-image-crop/dist/ReactCrop.css';

const styles:{ [key: string]: React.CSSProperties } = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '1rem',
		padding: '1rem',
		background: '#f8f9fa',
		borderRadius: '8px',
		boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
		width: '100%'
	},
	canvasWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		border: '1px solid #ccc',
		padding: '10px',
		borderRadius: '4px',
		background: '#fff',
		marginTop: '-10px',
		width: '100%'
	},
	previewText: {
		color: 'black',
		marginBottom: '5px',
	},
	buttonGroup: {
		display: 'flex',
		gap: '1rem',
	},
	button: {
		padding: '8px 16px',
		fontSize: '16px',
		border: 'none',
		borderRadius: '4px',
		cursor: 'pointer',
		transition: '0.1s',
	},
	primaryButton: {
		background: '#007bff',
		color: 'white',
	},
	secondaryButton: {
		background: '#e0e0e0',
		color: 'black',
	},
};

interface ImageCropperProps {
	src: string;
	onComplete: (blob: Blob) => void;
	onCancel: () => void;
}

const ImageCropper = ({ src, onComplete, onCancel }: ImageCropperProps) => {
	const [crop, setCrop] = useState<Crop>({ unit: 'px', width: 390, height: 200, x: 0, y: 0 });
	const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
	const imageRef = useRef<HTMLImageElement | null>(null);
	const previewCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!completedCrop || !previewCanvasRef.current || !imageRef.current) return;
		const image = imageRef.current;
		const canvas = previewCanvasRef.current;
		const crop = completedCrop;
		const scaleX = image.naturalWidth / image.width;
		const scaleY = image.naturalHeight / image.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			console.error('Không thể lấy được ngữ cảnh 2D từ canvas');
			return;
		}
		canvas.width = crop.width * scaleX;
		canvas.height = crop.height * scaleY;
		ctx.drawImage(
			image,
			crop.x * scaleX,
			crop.y * scaleY,
			crop.width * scaleX,
			crop.height * scaleY,
			0,
			0,
			canvas.width,
			canvas.height
		);
	}, [completedCrop]);

	const handleConfirm = () => {
		if (!completedCrop || !previewCanvasRef.current) return;
		previewCanvasRef.current.toBlob((blob) => {
			if (!blob) {
				console.error('Không tạo được ảnh cắt');
				return;
			}
			const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
			onComplete(file);
		}, 'image/jpeg', 1.0);
	};

	return (
		<div style={styles.container}>
			<ReactCrop
				crop={crop}
				onChange={(newCrop) => setCrop(newCrop)}
				onComplete={(c) => setCompletedCrop(c)}
				aspect={390 / 200}
			>
				<img 
					src={src} 
					alt="Crop me" 
					onLoad={(e) => (imageRef.current = e.currentTarget)} 
					style={{ maxWidth: '100%', maxHeight: '80vh' }} 
				/>
			</ReactCrop>
			<div style={styles.canvasWrapper}>
				<h3 style={styles.previewText}>Preview</h3>
				<canvas ref={previewCanvasRef} style={{ width: completedCrop?.width || 0, height: completedCrop?.height || 0 }} />
			</div>
			<div style={styles.buttonGroup}>
				<motion.button whileHover={{ scale: 1.1 }} style={{ ...styles.button, ...styles.primaryButton }} onClick={handleConfirm}>Xác nhận</motion.button>
				<motion.button whileHover={{ scale: 1.1 }} style={{ ...styles.button, ...styles.secondaryButton }} onClick={onCancel}>Hủy</motion.button>
			</div>
		</div>
	);
};

export default ImageCropper;
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import styles from "../style/add-appointment.styles.module.css";

const AppointmentModal = ({ isOpen, onClose, onSubmit, initState = null }) => {
	const [formData, setFormData] = useState(() => {
		return initState || {
			displayName: "",
			phone: "",
			address: "",
			email: "",
			servicePackage: "",
			topic: "",
			adviseDirect: "",
			age: "",
			consultationDate: "",
			consultationTime: "",
		};
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSave = () => {
		if (!formData.consultationDate || !formData.consultationTime) return;
		const consultationDate = new Date(
			`${formData.consultationDate}T${formData.consultationTime}:00`
		);

		onSubmit({
			...formData,
			consultationDate,
			time: new Date(),
		});

		onClose(); // Đóng modal sau khi lưu
	};

	if (!isOpen) return null;

	return (
		<div className={styles.overlay}>
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -50 }}
				className={styles.modal}
			>
				<div className={styles.header}>
					<h2>Thêm lịch hẹn mới</h2>
					<button onClick={onClose} className={styles.closeBtn}>
						<X size={20} />
					</button>
				</div>

				<div className={styles.form}>
					<Input label="Tên khách hàng" name="displayName" value={formData.displayName} onChange={handleChange} />
					<Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} />
					<Input label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} />
					<Input label="Email" name="email" value={formData.email} onChange={handleChange} />
					<Input label="Gói dịch vụ" name="servicePackage" value={formData.servicePackage} onChange={handleChange} />
					<Input label="Chủ đề" name="topic" value={formData.topic} onChange={handleChange} />
					<Input label="Hình thức tư vấn" name="adviseDirect" value={formData.adviseDirect} onChange={handleChange} />
					<Input label="Tuổi" name="age" value={formData.age} onChange={handleChange} type="number" />
					<Input label="Ngày tư vấn" name="consultationDate" value={formData.consultationDate} onChange={handleChange} type="date" />
					<Input label="Giờ tư vấn" name="consultationTime" value={formData.consultationTime} onChange={handleChange} type="time" />
				</div>

				<div className={styles.footer}>
					<button onClick={onClose} className={styles.cancelBtn}>Hủy</button>
					<button onClick={handleSave} className={styles.saveBtn}>Lưu</button>
				</div>
			</motion.div>
		</div>
	);
};

const Input = ({ label, name, value, onChange, type = "text" }) => (
	<div className={styles.inputGroup}>
		<label>{label}</label>
		<input
			type={type}
			name={name}
			value={value}
			onChange={onChange}
		/>
	</div>
);

export default AppointmentModal;

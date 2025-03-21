import React, { useState } from "react";
import { getAuth, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const ChangePassword = () => {
	const auth = getAuth();
	const user = auth.currentUser;

	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// 🔐 Hàm kiểm tra mật khẩu mạnh
	const isStrongPassword = (password) => {
		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
		return regex.test(password);
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();

		if (!user) {
			Swal.fire("Lỗi!", "Bạn chưa đăng nhập!", "error");
			return;
		}

		if (newPassword !== confirmPassword) {
			Swal.fire("Lỗi!", "Mật khẩu mới và xác nhận mật khẩu không khớp!", "error");
			return;
		}

		if (!isStrongPassword(newPassword)) {
			Swal.fire(
				"Lỗi!",
				"Mật khẩu phải có ít nhất 10 ký tự, bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt!",
				"error"
			);
			return;
		}

		try {
			const credential = EmailAuthProvider.credential(user.email, oldPassword);
			await reauthenticateWithCredential(user, credential);
			await updatePassword(user, newPassword);

			Swal.fire({
				icon: "success",
				title: "Thành công!",
				text: "🎉 Đổi mật khẩu thành công!",
			});

			// Reset fields
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			Swal.fire("Lỗi!", error.message, "error");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			style={styles.container}
		>
			<h2 style={styles.title}>🔐 Đổi Mật Khẩu</h2>
			<motion.form
				onSubmit={handleChangePassword}
				style={styles.form}
				initial={{ scale: 0.9 }}
				animate={{ scale: 1 }}
				transition={{ duration: 0.3 }}
			>
				<div style={styles.inputGroup}>
					<label style={styles.label}>Mật khẩu cũ:</label>
					<input
						type="password"
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						required
						style={styles.input}
					/>
				</div>
				<div style={styles.inputGroup}>
					<label style={styles.label}>Mật khẩu mới:</label>
					<input
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						required
						style={styles.input}
					/>
				</div>
				<div style={styles.inputGroup}>
					<label style={styles.label}>Xác nhận mật khẩu mới:</label>
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						style={styles.input}
					/>
				</div>
				<motion.button
					type="submit"
					style={styles.button}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					Đổi Mật Khẩu
				</motion.button>
			</motion.form>
		</motion.div>
	);
};

// 🎨 STYLE CSS-IN-JS
const styles = {
	container: {
		width: "60%",
		margin: "50px auto",
		padding: "50px",
		borderRadius: "10px",
		boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
		backgroundColor: "#fff",
		textAlign: "center",
	},
	label: {
		color: "black",
	},
	title: {
		fontSize: "22px",
		fontWeight: "bold",
		marginBottom: "100px",
		color: "black",
	},
	form: {
		display: "flex",
		flexDirection: "column",
	},
	inputGroup: {
		marginBottom: "15px",
		textAlign: "left",
	},
	input: {
		width: "100%",
		padding: "10px",
		borderRadius: "5px",
		border: "1px solid #ccc",
		fontSize: "16px",
		outline: "none",
	},
	button: {
		border: "2px solid #007bff",
		backgroundColor: "white",
		color: "black",
		padding: "10px",
		fontSize: "16px",
		borderRadius: "5px",
		cursor: "pointer",
		transition: "0.3s",
		width: "220px",
		alignSelf: "center",
	},
};

export default ChangePassword;

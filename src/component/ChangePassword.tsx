import { useState, useContext } from "react";
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider, signOut } from "@firebase/auth";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { auth } from "../firebase/config.tsx";
import { AuthContext } from "../context/AuthContextInstance";

import { User as FirebaseUser } from "@firebase/auth";

interface User extends FirebaseUser {
	role?: string;
};

const ChangePassword = () => {
	const [oldPassword, setOldPassword] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");

	const { currentUser, dispatch } = useContext(AuthContext) as { currentUser: User, dispatch: React.Dispatch<{ type: string; payload?: string | number | boolean | object | null; }> };

	const handleLogout = async () => {
		try {
			await signOut(auth);
			dispatch({ type: "LOGOUT" });
		} catch (error) {
			console.error(error);
		}
	};
	// 🔐 Hàm kiểm tra mật khẩu mạnh
	const isStrongPassword = (password: string) => {
		const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
		return regex.test(password);
	};

	const handleChangePassword = async (e: { preventDefault: () => void; }) => {
		e.preventDefault();

		Swal.fire({
			title: "Đang xử lý...",
			text: "Vui lòng đợi trong giây lát!",
			allowOutsideClick: false,
			allowEscapeKey: false,
			showConfirmButton: false,
			willOpen: () => {
				Swal.showLoading();
			},
		});

		if (!currentUser) {
			Swal.fire("Lỗi!", "Bạn chưa đăng nhập!", "error");
			return;
		}

		if (newPassword !== confirmPassword) {
			Swal.fire("Lỗi!", "Mật khẩu mới và xác nhận mật khẩu không khớp!", "error");
			return;
		}

		if (newPassword === oldPassword) {
			Swal.fire("Lỗi!", "Mật khẩu mới phải khác mật khẩu cũ!", "error");
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
			if (!currentUser.email) {
				Swal.fire("Lỗi!", "Email của bạn không hợp lệ!", "error");
				return;
			}
			const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
			await reauthenticateWithCredential(currentUser, credential);
			await updatePassword(currentUser, newPassword);

			Swal.fire({
				icon: "success",
				title: "Thành công!",
				text: "🎉 Đổi mật khẩu thành công!",
			});

			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			handleLogout();
		} catch (error: unknown) {
			if (error instanceof Error) {
                Swal.fire("Lỗi!", error.message, "error");
            }
			else {
				Swal.fire("Lỗi!", "Đã xảy ra lỗi không xác định!", "error");
			}
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

const styles: { [key: string]: React.CSSProperties } = {
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

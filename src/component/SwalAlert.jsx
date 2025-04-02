import Swal from 'sweetalert2';

const formatTimestamp = (timestamp) => {
	if (!timestamp || !timestamp.toDate) return "Không có";

	const date = timestamp.toDate();
	return new Intl.DateTimeFormat('vi-VN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);
};


export const confirmSendNotification = async (title, body, token = "", fn) => {
	const result = await Swal.fire({
		title: `Xác nhận gửi thông báo?`,
		html: `
		<p><strong>📢 Tiêu đề:</strong> ${title}</p>
		<p><strong>📝 Nội dung:</strong> ${body}</p>
		${token ? `<p><strong>🔑 Token:</strong> ${token}</p>` : ''}
		<p>Bạn có chắc muốn gửi thông báo này?</p>
	`,
		icon: 'question',
		showCancelButton: true,
		confirmButtonText: 'Gửi ngay 🚀',
		cancelButtonText: 'Hủy',
	});

	if (result.isConfirmed) {
		Swal.fire({
			title: "Đang xử lý...",
			text: "Vui lòng đợi trong giây lát.",
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			},
		});
		await fn();
	}
}

export const confirmDelete = async (id, name, fn) => {
	const result = await Swal.fire({
		title: `Bạn có chắc chắn muốn xóa ${name}?`,
		icon: "warning",
		showCancelButton: true,
		confirmButtonText: "Xóa",
		cancelButtonText: "Hủy",
	});

	if (result.isConfirmed) {
		Swal.fire({
			title: "Đang xử lý...",
			text: "Vui lòng đợi trong giây lát.",
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			},
		});
		await fn(id);
	}
};

export const confirmAdd = async (fn) => {
	const result = await Swal.fire({
		title: `Xác nhận thêm?`,
		icon: 'question',
		showCancelButton: true,
		confirmButtonText: 'Thêm',
		cancelButtonText: 'Hủy',
	});

	if (result.isConfirmed) {
		Swal.fire({
			title: "Đang xử lý...",
			text: "Vui lòng đợi trong giây lát.",
			allowOutsideClick: false,
			didOpen: () => {
				Swal.showLoading();
			},
		});
		await fn();
	}
};

export const successAlert = (message) => {
	Swal.fire('Thành công', message, 'success');
}

export const errorAlert = (message) => {
	Swal.fire('Thất bại', message, 'error');
}

export const showInfoAppointmentAlert = (appointment) => {
	Swal.fire({
		title: 'Thông tin chi tiết',
		html: `
			<p><strong>Tên:</strong> ${appointment?.displayName || "Không có dữ liệu"}</p>
			<p><strong>Số điện thoại:</strong> ${appointment?.phone || "Không có dữ liệu"}</p>
			<p><strong>Địa chỉ:</strong> ${appointment?.address || "Không có dữ liệu"}</p>
			<p><strong>Email:</strong> ${appointment?.email || "Không có dữ liệu"}</p>
			<p><strong>Gói dịch vụ:</strong> ${appointment?.servicePackage || "Không có dữ liệu"}</p>
			<p><strong>Chủ đề:</strong> ${appointment?.topic || "Không có dữ liệu"}</p>
			<p><strong>Hình thức tư vấn:</strong> ${appointment?.adviseDirect || "Không có dữ liệu"}</p>
			<p><strong>Tuổi:</strong> ${appointment?.age || "Không có dữ liệu"}</p>
			<p><strong>Ngày hẹn:</strong> ${formatTimestamp(appointment?.consultationDate) || "Không có dữ liệu"}</p>
			<p><strong>Ngày đặt lịch:</strong> ${formatTimestamp(appointment?.time) || "Không có dữ liệu"}</p>
				`,
		confirmButtonText: 'Đóng'
	});
}
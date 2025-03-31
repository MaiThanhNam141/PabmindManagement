import Swal from 'sweetalert2';

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
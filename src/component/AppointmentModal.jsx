import { Modal, Input, Form, DatePicker, Row, Col, Card, TimePicker, Select } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { confirmAdd, confirmExit } from "./SwalAlert";
import { Timestamp } from "@firebase/firestore";

const { Option } = Select;

const AppointmentModal = ({ isOpen, onClose, onSubmit, initState = null }) => {
	const [form] = Form.useForm();
	const [isDirty, setIsDirty] = useState(false);
	const [recordId, setRecordId] = useState(null);

	useEffect(() => {
		if (initState) {
			const { id, consultationDate } = initState;

			setRecordId(id || null);

			const dateValue = consultationDate ? dayjs.unix(consultationDate.seconds) : null;
			const timeValue = dateValue ? dayjs(dateValue.format("HH:mm"), "HH:mm") : null;

			form.setFieldsValue({
				...initState,
				consultationDate: dateValue,
				consultationTime: timeValue,
			});
		} else {
			form.resetFields();
			setRecordId(null);
		}
		setIsDirty(false);
	}, [initState, isOpen, form]);

	const saveForm = async () => {
		try {
			const values = await form.validateFields();
			const { consultationDate, consultationTime, ...restValues } = values;

			let timestamp = null;
			if (consultationDate && consultationTime) {
				const combinedDateTime = consultationDate
					.hour(consultationTime.hour())
					.minute(consultationTime.minute());

				timestamp = Timestamp.fromDate(combinedDateTime.toDate());
			}

			const formattedData = {
				...restValues,
				consultationDate: timestamp
			};

			return onSubmit(initState ? {...formattedData, id: recordId} : { ...formattedData, time: new Date()});
		} catch (error) {
			console.log("Validation failed:", error);
			throw Error;
		}
	};

	const handleClose = () => {
		if (!isDirty) {
			onClose();
			return;
		}

		confirmExit(onClose);
	};

	return (
		<Modal open={isOpen} onCancel={handleClose} onOk={() => confirmAdd(saveForm)} title="Thông tin lịch hẹn" okText="Lưu" cancelText="Hủy" width={800} centered>
			<Card style={{ background: "#f9f9f9", borderRadius: 8, padding: 16 }}>
				<Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
					<Row gutter={[4, 2]}>
						<Col span={12}>
							<Form.Item label="Tên khách hàng" name="displayName" rules={[{ required: true, message: "Vui lòng nhập tên" }]} style={{ marginBottom: 8 }}>
								<Input placeholder="Nhập tên khách hàng" />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]} style={{ marginBottom: 8 }}>
								<Input placeholder="Nhập số điện thoại" />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Email" name="email" rules={[{ type: "email", message: "Email không hợp lệ" }]} style={{ marginBottom: 8 }}>
								<Input placeholder="Nhập email" />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Tuổi" name="age" rules={[{ required: true, message: "Vui lòng nhập tuổi" }]} style={{ marginBottom: 8 }}>
								<Input type="number" placeholder="Nhập tuổi" />
							</Form.Item>
						</Col>

						<Col span={24}>
							<Form.Item label="Địa chỉ" name="address" style={{ marginBottom: 8 }}>
								<Input placeholder="Nhập địa chỉ" />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Gói dịch vụ" name="servicePackage" rules={[{ required: true, message: "Vui lòng chọn gói dịch vụ" }]} style={{ marginBottom: 8 }}>
								<Select placeholder="Chọn gói dịch vụ">
									<Option value="Basic">Basic</Option>
									<Option value="Medium">Medium</Option>
									<Option value="Premium">Premium</Option>
								</Select>
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Chủ đề" name="topic" style={{ marginBottom: 8 }}>
								<Input placeholder="Nhập chủ đề" />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Hình thức tư vấn" name="adviseDirect" rules={[{ required: true, message: "Vui lòng chọn hình thức tư vấn" }]} style={{ marginBottom: 8 }}>
								<Select placeholder="Chọn hình thức tư vấn">
									<Option value="Tư vấn online">Tư vấn online</Option>
									<Option value="Tư vấn trực tiếp">Tư vấn trực tiếp</Option>
								</Select>
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Ngày tư vấn" name="consultationDate" rules={[{ required: true, message: "Vui lòng chọn ngày" }]} style={{ marginBottom: 8 }}>
								<DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
							</Form.Item>
						</Col>

						<Col span={12}>
							<Form.Item label="Giờ tư vấn" name="consultationTime" rules={[{ required: true, message: "Vui lòng chọn giờ" }]} style={{ marginBottom: 8 }}>
								<TimePicker format="HH:mm" style={{ width: "100%" }} />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Card>
		</Modal>
	);
};

export default AppointmentModal;

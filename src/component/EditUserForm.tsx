import { useState } from "react";
import "../style/EditUserForm.css";
import Swal from "sweetalert2";
import { Timestamp } from "@firebase/firestore";

interface GAD7 {
    qIndex: number;
    point: number;
}

interface User {
    id: string;
    displayName: string;
    email: string;
    startDateMember: Timestamp | null;
    endDateMember: Timestamp | null;
    eq: number;
    age: number;
    coin: number;
    userType: string[];
    DISCType: string;
    phone: string;
    address: string;
    memberActive: boolean;
    memberID: string;
    photoURL: string;
    GAD7CriticalPoint: GAD7[] | null;
    token: string;
    charity: number;
    bmi: number;
    essayComment: string;
    BDIRateID: string;
    GAD7Result: string;
}

const convertTimestampToDateTimeLocal = (timestamp: Timestamp) => {
    return timestamp ? new Date(timestamp.seconds * 1000).toISOString().slice(0, -1) : "";
};

const convertDateTimeLocalToTimestamp = (dateString: string) => {
    return dateString ? Timestamp.fromDate(new Date(dateString)) : null;
};

const EditUserForm = ({ user, onSave, onClose }: { user: User; onSave: (data: User) => void; onClose: () => void }) => {
    const [formData, setFormData] = useState({
        id: user.id || "",
        displayName: user.displayName || "",
        email: user.email || "",
        startDateMember: user.startDateMember? convertTimestampToDateTimeLocal(user.startDateMember) : null,
        endDateMember: user.endDateMember ? convertTimestampToDateTimeLocal(user.endDateMember) : null,
        eq: user.eq || 0,
        age: user.age || 0,
        coin: user.coin || 0,
        userType: user.userType || [],
        DISCType: user.DISCType || "",
        phone: user.phone || "",
        address: user.address || "",
        memberActive: user.memberActive || false,
        memberID: user.memberID || "",
        photoURL: user.photoURL || "",
        GAD7CriticalPoint: user.GAD7CriticalPoint?.map((item: GAD7) => `Câu ${item.qIndex + 1} ở mức ${item.point}`).join("\n") || "",
        token: user.token || "",
        charity: user.charity || 0,
        bmi: user.bmi || 0,
        essayComment: user.essayComment || "",
        BDIRateID: user.BDIRateID || "",
        GAD7Result: user.GAD7Result || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const updatedData = {
            ...formData,
            startDateMember: formData.startDateMember ? convertDateTimeLocalToTimestamp(formData.startDateMember) : null,
            endDateMember: formData.endDateMember ? convertDateTimeLocalToTimestamp(formData.endDateMember) : null,
            GAD7CriticalPoint: user.GAD7CriticalPoint || null,
        };

        if (!updatedData.memberActive && (updatedData.startDateMember || updatedData.endDateMember)) {
            Swal.fire('error', 'Nếu bạn không kích hoạt thẻ thành viên, hãy xóa ngày bắt đầu và ngày kết thúc', 'error');
            return false;
        }
        if (updatedData.memberActive && (!updatedData.startDateMember || !updatedData.endDateMember)) {
            Swal.fire('error', 'Bạn cần nhập đầy đủ ngày bắt đầu và ngày kết thúc thẻ thành viên', 'error');
            return false;
        }
        if (updatedData.memberActive && formData.startDateMember && formData.endDateMember && (new Date(formData.startDateMember) > new Date(formData.endDateMember))) {
            Swal.fire('error', 'Ngày bắt đầu không được lớn hơn ngày kết thúc', 'error');
            return false;
        }

        onSave(updatedData);
        onClose();
    };

    const handleClose = (e: React.MouseEvent<HTMLElement>) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
            onClose();
        }
    };

    const removeUserType = (index: number) => {
        const updatedUserType = formData.userType.filter((_: string, i: number) => i !== index);
        setFormData({ ...formData, userType: updatedUserType });
    };

    const addUserType = () => {
        const newType = prompt("Nhập nhóm MBTI mới (VD: INFP, ESTJ, ...):");
        if (newType && !formData.userType.includes(newType.toUpperCase())) {
            setFormData({ ...formData, userType: [...formData.userType, newType.toUpperCase()] });
        }
    };
    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content">
                <h2>Chỉnh sửa thông tin User</h2>
                <button className="close-button" onClick={onClose}>✖</button>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Nhóm thông tin cá nhân */}
                        <div className="input-group">
                            <label>ID (Không thể sửa)</label>
                            <input className="disable" type="text" value={user.id} disabled />
                        </div>
                        <div className="input-group">
                            <label>Tên hiển thị</label>
                            <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Email (Không thể sửa)</label>
                            <input type="email" name="email" value={formData.email} disabled />
                        </div>
                        <div className="input-group">
                            <label>Số điện thoại</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Địa chỉ</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Tuổi</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} />
                        </div>

                        {/* Nhóm thông tin tài khoản & thành viên */}
                        <div className="input-group">
                            <label>ID Thành viên (Không thể sửa)</label>
                            <input type="text" value={user.memberID} disabled />
                        </div>
                        <div className="input-group">
                            <label>Trạng thái thành viên</label>
                            <input type="checkbox" name="memberActive" checked={formData.memberActive} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Ngày bắt đầu thành viên (Không thể sửa)</label>
                            <input type="datetime-local" name="startDateMember" value={formData.startDateMember || ""} disabled />
                        </div>
                        <div className="input-group">
                            <label>Ngày kết thúc thành viên</label>
                            <input type="datetime-local" name="endDateMember" value={formData.endDateMember || ""} onChange={handleChange} />
                        </div>

                        {/* Nhóm hình ảnh và token */}
                        <div className="input-group">
                            <label>Photo URL</label>
                            <input type="text" name="photoURL" value={formData.photoURL} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Token</label>
                            <input type="text" name="token" value={formData.token} onChange={handleChange} />
                        </div>

                        {/* Nhóm chỉ số cá nhân & tính cách */}
                        <div className="input-group">
                            <label>Điểm EQ</label>
                            <input type="number" name="eq" value={formData.eq} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>BMI</label>
                            <input type="number" name="bmi" value={formData.bmi} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>DISC Type</label>
                            <input type="text" name="DISCType" value={formData.DISCType} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Nhóm MBTI</label>
                            <div className="tag-container">
                                {formData.userType.map((type: string, index: number) => (
                                    <span key={index} className="tag">
                                        {type} <button type="button" className="remove-tag" onClick={() => removeUserType(index)}>✖</button>
                                    </span>
                                ))}
                                <button type="button" className="add-tag" onClick={addUserType}>+ Thêm</button>
                            </div>
                        </div>

                        {/* Nhóm tài chính & điểm số */}
                        <div className="input-group">
                            <label>Coin</label>
                            <input type="number" name="coin" value={formData.coin} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Charity</label>
                            <input type="number" name="charity" value={formData.charity} onChange={handleChange} />
                        </div>

                        {/* Nhóm đánh giá tâm lý */}
                        <div className="input-group">
                            <label>Câu trả lời có vấn đề trong GAD7 (Không thể sửa)</label>
                            <textarea name="GAD7CriticalPoint" value={formData.GAD7CriticalPoint} rows={3} disabled />
                        </div>
                        <div className="input-group">
                            <label>BDI Rate</label>
                            <input type="text" name="BDIRateID" value={formData.BDIRateID} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>GAD7 Result</label>
                            <input type="text" name="GAD7Result" value={formData.GAD7Result} onChange={handleChange} />
                        </div>

                        {/* Nhóm nhận xét & phản hồi */}
                        <div className="input-group" style={{ flex: "1 1 100%" }}>
                            <label>Nhận xét bài luận</label>
                            <textarea name="essayComment" value={formData.essayComment} onChange={handleChange} rows={3} />
                        </div>
                    </div>

                    <button type="submit" className="save-button">Lưu thay đổi</button>
                </form>
            </div>
        </div>
    );
};

export default EditUserForm;

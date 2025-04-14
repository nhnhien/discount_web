"use client";

import { useState } from "react";
import {
  Modal,
  Upload,
  Button,
  message,
  Alert,
  Progress,
  Typography,
  Space,
} from "antd";
import {
  FileExcelOutlined,
  InboxOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  importProductsFromExcel,
  downloadProductTemplate,
} from "@/service/product";

const { Dragger } = Upload;
const { Text, Title } = Typography;

const ExcelImportModal = ({ visible, onCancel, onSuccess }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    const file = fileList[0]?.originFileObj || fileList[0];

    // ⚠️ Không kiểm tra instanceof File để tránh lỗi trên các trình duyệt/build khác nhau
    if (!file || !file.name || !file.type) {
      message.error("Vui lòng chọn file Excel để import");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate fake progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 10);
          return next >= 90 ? 90 : next;
        });
      }, 300);

      const response = await importProductsFromExcel(formData);
      clearInterval(interval);
      setUploadProgress(100);

      if (response.success) {
        message.success(`Import thành công ${response.data.productIds.length} sản phẩm`);
        setFileList([]);
        onSuccess();
      } else {
        setError(response.message || "Import thất bại");
        message.error("Import thất bại");
      }
    } catch (error) {
      console.error("❌ Error importing:", error);
      setError(error.message || "Không thể import sản phẩm");
      message.error(error.message || "Import thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadProductTemplate();
    } catch (error) {
      console.error("❌ Error downloading template:", error);
      message.error("Không thể tải file mẫu");
    }
  };

  const props = {
    beforeUpload: (file) => {
      const isExcel =
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        message.error("Chỉ hỗ trợ file Excel (.xlsx, .xls)");
        return Upload.LIST_IGNORE;
      }

      // ✅ Đảm bảo luôn có originFileObj
      setFileList([{ ...file, originFileObj: file }]);
      return false; // Ngăn upload tự động
    },
    fileList,
    maxCount: 1,
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <Modal
      title="Import sản phẩm từ Excel"
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="download" onClick={handleDownloadTemplate} icon={<FileExcelOutlined />}>
          Tải file mẫu
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="upload"
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
        >
          {uploading ? "Đang import..." : "Import"}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Alert
          message="Hướng dẫn import"
          description={
            <ul>
              <li>Tải file mẫu để biết cấu trúc dữ liệu</li>
              <li>Điền thông tin đầy đủ và đúng định dạng</li>
              <li>Upload lại file để hệ thống xử lý</li>
              <li>Các trường có dấu * là bắt buộc</li>
            </ul>
          }
          type="info"
          showIcon
        />

        <Dragger {...props} style={{ marginTop: 16 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Kéo file vào đây hoặc click để chọn file Excel</p>
          <p className="ant-upload-hint">Chỉ hỗ trợ định dạng .xlsx hoặc .xls</p>
        </Dragger>

        {uploading && (
          <div style={{ marginTop: 16 }}>
            <Progress percent={uploadProgress} status={uploadProgress === 100 ? "success" : "active"} />
          </div>
        )}

        {fileList.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">Đã chọn: {fileList[0].name}</Text>
          </div>
        )}

        {error && <Alert type="error" showIcon message="Lỗi import" description={error} />}
      </Space>
    </Modal>
  );
};

export default ExcelImportModal;

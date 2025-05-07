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
      message.error("Please select an Excel file to import");
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
        message.success(`Import successful ${response.data.productIds.length} products`);
        setFileList([]);
        onSuccess();
      } else {
        setError(response.message || "Import failed");
        message.error("Import failed");
      }
    } catch (error) {
      console.error("❌ Error importing:", error);
      setError(error.message || "Cannot import products");
      message.error(error.message || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadProductTemplate();
    } catch (error) {
      console.error("❌ Error downloading template:", error);
      message.error("Cannot download template");
    }
  };

  const props = {
    beforeUpload: (file) => {
      const isExcel =
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        message.error("Only Excel files (.xlsx, .xls) are supported");
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
      title="Import Products from Excel"
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="download" onClick={handleDownloadTemplate} icon={<FileExcelOutlined />}>
          Download Template
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="upload"
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
        >
          {uploading ? "Importing..." : "Import"}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Alert
          message="Import Instructions"
          description={
            <ul>
              <li>Download the template to understand the data structure</li>
              <li>Fill in complete information in the correct format</li>
              <li>Upload the file back for system processing</li>
              <li>Fields marked with * are required</li>
            </ul>
          }
          type="info"
          showIcon
        />

        <Dragger {...props} style={{ marginTop: 16 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Drag file here or click to select Excel file</p>
          <p className="ant-upload-hint">Only .xlsx or .xls formats are supported</p>
        </Dragger>

        {uploading && (
          <div style={{ marginTop: 16 }}>
            <Progress percent={uploadProgress} status={uploadProgress === 100 ? "success" : "active"} />
          </div>
        )}

        {fileList.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">Selected: {fileList[0].name}</Text>
          </div>
        )}

        {error && <Alert type="error" showIcon message="Import Error" description={error} />}
      </Space>
    </Modal>
  );
};

export default ExcelImportModal;

"use client";
import React, { FC, useState } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import FanpageService from "@/service/fanpageService";
import { imageService } from "@/service/cloudinaryService";

interface CreatePageModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string, file?: File) => void;
  placeholder: string;
  error?: string;
}

const ImageUpload: FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
}) => {
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(value);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setPreviewUrl(previewUrl);
      onChange("", file); 
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setSelectedFile(null);
    setPreviewUrl(url);
    onChange(url);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    onChange("");
  };

  return (
    <div className="image-upload-container">
      <label className="image-upload-label">{label}</label>

      <div className="upload-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${uploadMode === "url" ? "active" : ""}`}
          onClick={() => {
            setUploadMode("url");
            if (selectedFile) {
              handleRemove();
            }
          }}
        >
          <DynamicFeatherIcon iconName="Link" />
          URL
        </button>
        <button
          type="button"
          className={`mode-btn ${uploadMode === "file" ? "active" : ""}`}
          onClick={() => {
            setUploadMode("file");
            if (value && !selectedFile) {
              handleRemove();
            }
          }}
        >
          <DynamicFeatherIcon iconName="Upload" />
          Tải lên
        </button>
      </div>

      {uploadMode === "url" ? (
        <input
          type="url"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          className={error ? "error" : ""}
          placeholder={placeholder}
        />
      ) : (
        <div className="file-upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
            id={`file-${label}`}
          />
          <label htmlFor={`file-${label}`} className="file-upload-label">
            <DynamicFeatherIcon iconName="Image" />
            {selectedFile ? selectedFile.name : "Chọn ảnh từ máy"}
          </label>
        </div>
      )}

      {error && <span className="error-message">{error}</span>}

      {previewUrl && (
        <div className="image-preview">
          <img src={previewUrl} alt="Preview" />
          <button type="button" className="remove-image" onClick={handleRemove}>
            <DynamicFeatherIcon iconName="X" />
          </button>
          {selectedFile && (
            <div className="file-info">
              <small>
                {selectedFile.name} (
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </small>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .image-upload-container {
          margin-bottom: 20px;
        }

        .image-upload-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #495057;
        }

        .upload-mode-toggle {
          display: flex;
          margin-bottom: 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          overflow: hidden;
        }

        .mode-btn {
          flex: 1;
          padding: 8px 12px;
          background: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
          font-size: 13px;
          transition: all 0.2s ease;
          color: #6c757d;
        }

        .mode-btn.active {
          background: #1976d2;
          color: white;
        }

        .mode-btn:hover:not(.active) {
          background: #f8f9fa;
        }

        .file-upload-area {
          position: relative;
        }

        .file-input {
          display: none;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border: 2px dashed #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6c757d;
          font-size: 14px;
        }

        .file-upload-label:hover {
          border-color: #1976d2;
          background: #f8f9fa;
        }

        .image-preview {
          position: relative;
          margin-top: 12px;
          display: inline-block;
        }

        .image-preview img {
          max-width: 200px;
          max-height: 150px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
          display: block;
        }

        .file-info {
          margin-top: 6px;
          color: #6c757d;
          font-size: 12px;
        }

        .remove-image {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-image:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

const CreatePageModal: FC<CreatePageModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    avatar: "",
    cover_image: "",
    type: "",
    email: "",
    phone: "",
    link: "",
  });
  const [imageFiles, setImageFiles] = useState<{
    avatar?: File;
    cover_image?: File;
  }>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (
    field: "avatar" | "cover_image",
    url: string,
    file?: File
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: url,
    }));

    if (file) {
      setImageFiles((prev) => ({
        ...prev,
        [field]: file,
      }));
    } else {
      setImageFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[field];
        return newFiles;
      });
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên trang là bắt buộc";
    }

    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang";
    }

    if (
      formData.email &&
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
    ) {
      newErrors.email = "Email không hợp lệ";
    }

    if (formData.phone && !/^[0-9\-\+\s()]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      let finalFormData = { ...formData };
      if (imageFiles.avatar) {
        try {
          const avatarUrl = await imageService.uploadPageImage({
            image: imageFiles.avatar,
            type: "avatar",
          });

          finalFormData.avatar = avatarUrl.url;
        } catch (error) {
          console.error("Avatar upload error:", error);
          setErrors({ avatar: "Không thể upload ảnh đại diện" });
          return;
        }
      }

      if (imageFiles.cover_image) {
        try {
          const coverUrl = await imageService.uploadPageImage({
            image: imageFiles.cover_image,
            type: "cover_image",
          });
          finalFormData.cover_image = coverUrl.url;
        } catch (error) {
          console.error("Cover image upload error:", error);
          setErrors({ cover_image: "Không thể upload ảnh bìa" });
          return;
        }
      }

      const result = await FanpageService.createPage(finalFormData);

      if (result) {
        onSuccess();
      } else {
        setErrors({ general: "Có lỗi xảy ra khi tạo trang" });
      }
    } catch (error) {
      console.error("Create page error:", error);
      setErrors({ general: "Có lỗi xảy ra khi tạo trang" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>Tạo trang mới</h5>
          <button className="close-btn" onClick={onClose}>
            <DynamicFeatherIcon iconName="X" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <div className="form-group">
            <label htmlFor="name">Tên trang *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "error" : ""}
              placeholder="Nhập tên trang"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              className={errors.slug ? "error" : ""}
              placeholder="ten-trang-cua-ban"
            />
            {errors.slug && (
              <span className="error-message">{errors.slug}</span>
            )}
            <small className="form-help">
              Để trống để tự động tạo từ tên trang
            </small>
          </div>

          <div className="form-group">
            <label>Loại trang (type)</label>
            <select
              name="type"
              value={formData.type}
              onChange={(e) => handleInputChange(e as any)}
              className={errors.type ? "input error" : "input"}
            >
              <option value="">-- Chọn loại trang --</option>
              <option value="business">Doanh nghiệp</option>
              <option value="community">Cộng đồng</option>
              <option value="brand">Thương hiệu</option>
              <option value="public_figure">Nghệ sĩ / Người nổi tiếng</option>
              <option value="personal">Cá nhân</option>
              <option value="other">Khác</option>
            </select>
            {errors.type && (
              <span className="error-message">{errors.type}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "input error" : "input"}
              placeholder="contact@example.com"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? "input error" : "input"}
              placeholder="Số điện thoại liên hệ"
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả (tùy chọn)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Mô tả về trang của bạn"
            />
          </div>

          <ImageUpload
            label="Ảnh đại diện"
            value={formData.avatar}
            onChange={(url, file) => handleImageChange("avatar", url, file)}
            placeholder="https://example.com/avatar.jpg"
            error={errors.avatar}
          />

          <ImageUpload
            label="Ảnh bìa"
            value={formData.cover_image}
            onChange={(url, file) =>
              handleImageChange("cover_image", url, file)
            }
            placeholder="https://example.com/cover.jpg"
            error={errors.cover_image}
          />

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner small"></div>
                  {imageFiles.avatar || imageFiles.cover_image
                    ? "Đang upload..."
                    : "Đang tạo..."}
                </>
              ) : (
                "Tạo trang"
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h5 {
          margin: 0;
          font-weight: 600;
          color: #495057;
        }

        .close-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #6c757d;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .close-btn:hover {
          background-color: #f8f9fa;
        }

        .modal-body {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #495057;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #dc3545;
        }

        .form-help {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #6c757d;
        }

        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .general-error {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          margin-top: 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #5a6268;
        }

        .btn-primary {
          background-color: #1976d2;
          color: white;
        }

        .btn-primary:hover {
          background-color: #1565c0;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner.small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 576px) {
          .modal-content {
            margin: 10px;
          }

          .modal-header,
          .modal-body {
            padding: 16px;
          }

          .modal-footer {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CreatePageModal;

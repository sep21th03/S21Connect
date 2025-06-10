"use client";
import React, { FC } from "react";

interface FanpageHeaderProps {
  userHasPages: boolean;
  onCreatePage: () => void;
}

const FanpageHeader: FC<FanpageHeaderProps> = ({ userHasPages, onCreatePage }) => {
  return (
    <div className="fanpage-header">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Fanpages</h2>
          <p className="text-muted">
            {userHasPages 
              ? "Quản lý các fanpage của bạn" 
              : "Tạo fanpage đầu tiên để kết nối với cộng đồng"
            }
          </p>
        </div>
        <button 
          className="btn btn-secondary btn-sm btn-solid"
          onClick={onCreatePage}
        >
          <i className="fa fa-plus me-2"></i>
          Tạo Fanpage
        </button>
      </div>
    </div>
  );
};

export default FanpageHeader;
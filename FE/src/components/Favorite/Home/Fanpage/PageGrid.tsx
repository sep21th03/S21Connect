"use client";
import React, { FC } from "react";
import PageCard from "./PageCard";
import { Page } from "@/components/Favorite/Fanpagetype";

interface PageGridProps {
  pages: Page[];
  loading: boolean;
  activeTab: string;
  onRefresh: () => void;
  userHasPages: boolean;
}

const PageGrid: FC<PageGridProps> = ({
  pages,
  loading,
  activeTab,
  onRefresh,
  userHasPages,
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case "my_pages":
        return "Trang của bạn";
      case "liked":
        return "Trang đã thích";
      case "invitations":
        return "Lời mời";
      default:
        return "Tất cả trang";
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "my_pages":
        return "Bạn chưa tạo trang nào. Hãy tạo trang đầu tiên của bạn!";
      case "liked":
        return "Bạn chưa thích trang nào.";
      case "invitations":
        return "Bạn không có lời mời nào.";
      default:
        return "Không có trang nào được tìm thấy.";
    }
  };


  return (
    <div className="page-grid-container">
      <div className="page-grid-header">
        <h4>{getTitle()}</h4>
        <span className="page-count">({pages.length} trang)</span>
      </div>

      {pages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h5>Chưa có trang nào</h5>
          <p>{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className="page-grid">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} onUpdate={onRefresh} />
          ))}
        </div>
      )}

      <style jsx>{`
        .page-grid-container {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .page-grid-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .page-grid-header h4 {
          margin: 0;
          color: #495057;
          font-weight: 600;
        }

        .page-count {
          color: #6c757d;
          font-size: 14px;
        }

        .page-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .loading-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: #6c757d;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h5 {
          margin-bottom: 8px;
          color: #495057;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .page-grid {
            grid-template-columns: 1fr;
          }

          .page-grid-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default PageGrid;

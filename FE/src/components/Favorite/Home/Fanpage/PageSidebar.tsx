"use client";
import React, { FC } from "react";

interface PageSidebarProps {
  activeTab: "all" | "my_pages" | "liked" | "invitations";
  onTabChange: (tab: "all" | "my_pages" | "liked" | "invitations") => void;
  onCreatePage: () => void;
  userHasPages: boolean;
}

const PageSidebar: FC<PageSidebarProps> = ({
  activeTab,
  onTabChange,
  onCreatePage,
  userHasPages,
}) => {
  const menuItems = [
    { key: "all", label: "Tất cả Fanpage", icon: "fa-globe" },
    {
      key: "my_pages",
      label: "Fanpage của tôi",
      icon: "fa-user",
      badge: userHasPages ? null : "Chưa có",
    },
    { key: "liked", label: "Đã thích", icon: "fa-heart" },
    { key: "invitations", label: "Lời mời", icon: "fa-envelope" },
  ];

  return (
    <div className="page-sidebar">
      <div className="sidebar-content">
        {!userHasPages && (
          <div className="welcome-section mb-4 p-3 bg-light rounded">
            <h6>Chào mừng đến với Fanpages!</h6>
            <p className="small text-muted mb-2">
              Bạn chưa có fanpage nào. Hãy tạo fanpage đầu tiên!
            </p>
            <button
              className="btn btn-solid btn-secondary btn-sm w-100"
              onClick={onCreatePage}
            >
              <i className="fa fa-plus me-1"></i>
              Tạo Fanpage Ngay
            </button>
          </div>
        )}

        <ul className="nav nav-pills flex-column">
          {menuItems.map((item) => (
            <li key={item.key} className="nav-item mb-1">
              <button
                className={`nav-link w-100 text-start btn-sm ${
                  activeTab === item.key ? "btn-solid btn btn-secondary no-hover" : ""
                }`}
                onClick={() => onTabChange(item.key as any)}
                style={
                  activeTab === item.key
                    ? undefined
                    : { color: "rgba(var(--font-color))" }
                }
              >
                <i className={`fa ${item.icon} me-2`}></i>
                {item.label}
                {item.badge && (
                  <span className="badge bg-secondary ms-2 small">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        button.no-hover:hover,
        button.no-hover:focus {
          background-color: var(--bs-secondary) !important;
          color: white !important;
          cursor: default;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default PageSidebar;

"use client";
import React, { FC, useState } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import CustomImage from "@/Common/CustomImage";
import { ImagePath } from "@/utils/constant";
import { Page } from "@/components/Favorite/Fanpagetype";

interface PageCardProps {
  page: Page;
  onUpdate: () => void;
}

const PageCard: FC<PageCardProps> = ({ page, onUpdate }) => {
  const [isFollowing, setIsFollowing] = useState(page.is_followed || false);
  const [followersCount, setFollowersCount] = useState(page.followers_count);
  const [loading, setLoading] = useState(false);

  console.log(page);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      const response = await fetch(`/api/pages/${page.id}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageClick = () => {
    window.location.href = `/favourite/home/${page.slug}`;
  };

  return (
    <div className="page-card">
      <div className="page-cover" onClick={handlePageClick}>
        {page.cover_image ? (
          <CustomImage
            src={page.cover_image || `${ImagePath}/cover/default.jpg`}
            className="cover-image"
            alt={page.name}
          />
        ) : (
          <div className="cover-image" />
        )}
        <div className="page-overlay">
          <div className="page-stats">
            <span>
              <DynamicFeatherIcon iconName="Users" className="stat-icon" />
              {followersCount ?? 0} người theo dõi
            </span>
          </div>
        </div>
      </div>

      <div className="page-info">
        <div className="page-avatar">
          <img
            src={page.avatar || `${ImagePath}/pages-logo/default.png`}
            className="avatar-image"
            alt={page.name}
          />
        </div>

        <div className="page-details">
          <h6 className="page-name" onClick={handlePageClick}>
            {page.name}
          </h6>
          {page.description && (
            <p className="page-description">{page.description}</p>
          )}
          <p className="page-creator">
            Tạo bởi{" "}
            <a
              href={`/profile/timeline/${page.creator.username}`}
              className="page-creator-link"
            >
              {page.creator.first_name} {page.creator.last_name}
            </a>
          </p>
        </div>

        <div className="page-actions">
          {page.admins.some((admin) => admin.role === "admin") ? (
            <button className="btn btn-admin" onClick={handlePageClick}>
              <DynamicFeatherIcon iconName="Settings" className="btn-icon" />
              Quản lý
            </button>
          ) : (
            <button
              className={`btn ${isFollowing ? "btn-following" : "btn-follow"}`}
              onClick={handleFollow}
              disabled={loading}
            >
              <DynamicFeatherIcon
                iconName={isFollowing ? "UserMinus" : "UserPlus"}
                className="btn-icon"
              />
              {loading
                ? "Đang xử lý..."
                : isFollowing
                ? "Bỏ theo dõi"
                : "Theo dõi"}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-creator-link {
          color: black;
          text-decoration: none;
        }

        .page-creator-link:hover {
          text-decoration: underline;
        }
        .page-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .page-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .page-cover {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .page-card:hover .cover-image {
          transform: scale(1.05);
        }

        .page-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(0, 0, 0, 0.7)
          );
          display: flex;
          align-items: flex-end;
          flex-direction: row-reverse;
        }

        .page-stats {
          padding: 16px;
        }

        .page-stats span {
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-icon {
          width: 14px;
          height: 14px;
        }

        .page-info {
          padding: 16px;
          position: relative;
        }

        .page-avatar {
          position: absolute;
          top: -30px;
          left: 16px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid white;
          overflow: hidden;
          background: white;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .page-details {
          margin-top: 40px;
        }

        .page-name {
          font-weight: 600;
          color: #495057;
          margin: 0 0 8px 0;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .page-name:hover {
          color: #1976d2;
        }

        .page-description {
          font-size: 14px;
          color: #6c757d;
          margin: 0 0 8px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .page-creator {
          font-size: 12px;
          color: #6c757d;
          margin: 0 0 16px 0;
        }

        .page-actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }

        .btn-follow {
          background-color: #1976d2;
          color: white;
        }

        .btn-follow:hover {
          background-color: #1565c0;
        }

        .btn-following {
          background-color: #e3f2fd;
          color: #1976d2;
          border: 1px solid #1976d2;
        }

        .btn-following:hover {
          background-color: #ffebee;
          color: #d32f2f;
          border-color: #d32f2f;
        }

        .btn-admin {
          background-color: #1976d2;
          color: white;
        }

        .btn-admin:hover {
          background-color: #1565c0;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PageCard;

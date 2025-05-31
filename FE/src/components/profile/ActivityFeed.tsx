import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { ActivityFeeds, ImagePath, LoadMore } from "../../utils/constant";
import CommonDropDown from "@/Common/CommonDropDown";
import { activityFeedDropDown, activityFeedsData } from "@/Data/profile";
import { Fragment } from "react";
import { Media } from "reactstrap";
import { formatTimeAgo } from "@/utils/formatTime";

interface ActivityFeedProps {
  activityLogs: any[];
  onRefresh?: () => void;
  onLoadMore?: () => void;
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activityLogs,
  onRefresh,
  onLoadMore,
  loading = false,
  loadingMore = false,
  error = null,
}) => {
  const handleRefreshClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading || loadingMore) {
      console.log('Đang tải, không thể tải lại');
      return;
    }
    
    onRefresh?.();
  };

  const handleLoadMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading || loadingMore) {
      console.log('Đang tải, không thể tải thêm');
      return;
    }
    
    onLoadMore?.();
  };

  return (
    <div className="activity-list actitvity-page">
      <div className="card-title">
        <h3>{ActivityFeeds}</h3>
        <div className="settings">
          <div className="setting-btn">
            <button
              type="button"
              className="d-flex btn-unstyled"
              onClick={handleRefreshClick}
              disabled={loading || loadingMore}
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0,
                cursor: loading || loadingMore ? 'not-allowed' : 'pointer',
                opacity: loading || loadingMore ? 0.6 : 1
              }}
            >
              <DynamicFeatherIcon
                iconName="RotateCw"
                className={`icon icon-theme stroke-width-3 iw-11 ih-11 ${loading ? 'rotating' : ''}`}
              />
            </button>
          </div>
          <div className="setting-btn setting-dropdown">
            <CommonDropDown
              mainClassName="icon-dark stroke-width-3 icon iw-11 ih-11"
              mainIcon="Sun"
              menuList={activityFeedDropDown}
            />
          </div>
        </div>
      </div>
      
      <div className="activity-content">
        {error && (
          <div className="alert alert-danger" role="alert">
            <small>{error}</small>
          </div>
        )}
        
        {activityLogs?.length === 0 && !loading ? (
          <div className="text-center py-4">
            <p>Không có hoạt động gần đây.</p>
          </div>
        ) : (
          activityLogs?.map((data, index) => (
            <Fragment key={`${data.id || index}`}>
              <ul>
                <li>
                  <Media>
                    <div className="img-part bg-size blur-up lazyloaded">
                      <img
                        src={`${data.target_user?.avatar}`}
                        className="img-fluid lazyload bg-img rounded-circle"
                        alt=""
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // target.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <Media body>
                      <h4>
                        {data.metadata?.content || 'Không có nội dung'}{" "}
                        {data.action !== "created_post" && data.target_user && (
                          <span>
                            {data.target_user.first_name}{" "}
                            {data.target_user.last_name}
                          </span>
                        )}
                      </h4>
                      <h6>{formatTimeAgo(data.created_at)}</h6>
                    </Media>
                  </Media>
                </li>
              </ul>
            </Fragment>
          ))
        )}
        
        {onLoadMore && (
          <div className="load-more">
            <button
              type="button"
              className="btn btn-solid"
              onClick={handleLoadMoreClick}
              disabled={loading || loadingMore}
              style={{
                opacity: loading || loadingMore ? 0.6 : 1,
                cursor: loading || loadingMore ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingMore ? 'Đang tải...' : LoadMore}
            </button>
          </div>
        )}
        
        {loading && activityLogs.length === 0 && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Đang tải...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
"use client";
import SufiyaElizaFirstPost from "@/components/NewsFeed/Style1/ContentCenter/SufiyaElizaFirstPost";
import ActivityFeed from "@/components/profile/ActivityFeed";
import ProfileLayout from "@/layout/ProfileLayout";
import { Col, Container, Row } from "reactstrap";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import LoadingLoader from "@/layout/LoadingLoader";
import { getActivityLogsByUsername } from "@/service/userSerivice";

const ProfileTimeLine = () => {
  const params = useParams();
  const username = params.username as string;
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadActivityLogs = useCallback(async (pageToLoad: number, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const res = await getActivityLogsByUsername(username, pageToLoad);
      
      if (!res || !res.data) {
        throw new Error('Invalid response from API');
      }
      
      const newLogs = res.data.data || [];
      const hasMoreFromApi = res.data.meta?.has_more ?? false;
  
      setActivityLogs(prev => {
        if (reset) {
          return newLogs;
        } else {
          const existingIds = new Set(prev.map(log => log.id));
          const uniqueNewLogs = newLogs.filter((log: any) => !existingIds.has(log.id));
          return [...prev, ...uniqueNewLogs];
        }
      });
      
      setPage(pageToLoad);
      setHasMore(hasMoreFromApi);
      
    } catch (error: any) {
      console.error('Error loading activity logs:', error);
      setError(error?.message || 'Failed to load activity logs');
      
      if (reset) {
        setActivityLogs([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      loadActivityLogs(1, true);
    }
  }, [username, loadActivityLogs]);

  const handleRefresh = useCallback(async () => {
    if (loading || loadingMore) return; 
    
    try {
      await loadActivityLogs(1, true);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  }, [loadActivityLogs, loading, loadingMore]);
  
  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return; 
    
    try {
      await loadActivityLogs(page + 1, false);
    } catch (error) {
      console.error('Load more failed:', error);
    }
  }, [loadActivityLogs, loading, loadingMore, hasMore, page]);

  if (error && activityLogs.length === 0) {
    return (
      <ProfileLayout title="activity feed" loaderName="activityFeedProfile">
        <Container fluid className="section-t-space px-0">
          <Row>
            <Col lg="12">
              <div className="text-center">
                <p>Error: {error}</p>
                <button 
                  className="btn btn-primary" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  Try Again
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </ProfileLayout>
    );
  }

  if (loading && activityLogs.length === 0) {
    return <LoadingLoader />;
  }

  return (
    <ProfileLayout title="activity feed" loaderName="activityFeedProfile">
      <Container fluid className="section-t-space px-0">
        <Row>
          <Col lg="5" className="content-left">
            <ActivityFeed
              activityLogs={activityLogs}
              onRefresh={handleRefresh} 
              onLoadMore={hasMore ? handleLoadMore : undefined}
              loading={loading}
              loadingMore={loadingMore}
              error={error}
            />
          </Col>
          <Col lg="7" className="content-center">
            <div className="post-panel">
              <div className="post-wrapper">
                {/* <SufiyaElizaFirstPost mainImage={1} userImage={1} /> */}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </ProfileLayout>
  );
};

export default ProfileTimeLine;
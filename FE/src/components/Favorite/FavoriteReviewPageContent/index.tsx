"use client";
import { FC, useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import RatingStars from "./RatingStars";
import ReviewStateMent from "./ReviewStateMent";
import Headers from "./Headers";
import Reviews from "./common/Reviews";
import Recommends from "./common/Recommends";
import CreatePageReview from "@/Common/CreatePost/CreatePageReview";
import { useSelector } from "react-redux";
import { RootState } from "@/redux-toolkit/store";
import { usePageInfo } from "@/contexts/PageInfoContext";
import fanpageService, { Page } from "@/service/fanpageService";

const FavoriteReviewPageContent: FC<{ page: string }> = ({ page }) => {
  const pageInfo = usePageInfo() as unknown as Page;
  const user = useSelector((state: RootState) => state.user.user);

  const isOwnPage = pageInfo?.admins?.some(
    (admin) => admin.role === "admin" && admin.id === user?.id
  );

  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!pageInfo?.id) return;

    const fetchReviews = async () => {
      const reviews = await fanpageService.getPageReview(pageInfo?.id);
      setReviews(reviews);
    };
    fetchReviews();
  }, [pageInfo?.id]);

  return (
    <Row>
      <Col xs="4" className="content-left  order-1 res-full-width">
        <div className="sticky-top">
          <RatingStars reviews={reviews} />
          <ReviewStateMent reviews={reviews} />
        </div>
      </Col>
      <Col xl="8" className="content-center">
        {!isOwnPage && (
         <CreatePageReview
         pageId={pageInfo?.id}
         onReviewCreated={(newReview: any) => {
           setReviews((prev) => [newReview, ...prev]);
         }}
       />
       
        )}
        <Headers />

        <div className="post-panel infinite-loader-sec">
          {reviews.map((review) => (
            <Reviews key={review.id} review={review} />
          ))}
          {/* <Recommends image={15} />
        <Reviews  image={12} details="Best acadamy for dance, environment is so good.We had a great time learning the dances. Teacher was lovely as was the organisers. Lots of energy and quite a few laughs. Loads of fun!"/>
        <Reviews  image={11} details="The Team of Dance Academy were very welcoming, enthusiastic and full of energy. We had an incredible time which was fun and exciting. Relaxed atmosphere full of laughter."/>
        <Recommends image={14} /> */}
        </div>
      </Col>
    </Row>
  );
};

export default FavoriteReviewPageContent;

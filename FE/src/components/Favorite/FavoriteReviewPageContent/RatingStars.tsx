import { FC, useMemo } from "react";
import HeadingTittleCommon from "./common/HeadingTittleCommon";
import { Progress } from "reactstrap";

interface RatingStarsProps {
  reviews: { rate: number }[];
}

const RatingStars: FC<RatingStarsProps> = ({ reviews }) => {
  const { averageRating, totalRatings, ratingBreakdown } = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, curr) => acc + curr.rate, 0);
    const average = total ? sum / total : 0;

    const breakdown = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rate === star).length;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return { rating: star, count, percent };
    });

    return {
      averageRating: average.toFixed(1),
      totalRatings: total,
      ratingBreakdown: breakdown,
    };
  }, [reviews]);

  return (
    <div className="review-counter section-b-space">
      <HeadingTittleCommon title="Review" />
      <div className="review-content">
        <h2>{averageRating}</h2>
        <h4>Dựa trên {totalRatings} đánh giá</h4>

        <div className="review-part">
          <ul>
            {ratingBreakdown.map((item) => (
              <li key={item.rating}>
                <h5>{item.rating} sao</h5>
                <Progress value={item.percent} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RatingStars;

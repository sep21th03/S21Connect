import React, { FC, useMemo } from "react";
import HeadingTittleCommon from "./common/HeadingTittleCommon";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ReviewStateMentProps {
  reviews: { rate: number }[];
}

const ReviewStateMent: FC<ReviewStateMentProps> = ({ reviews }) => {
  const chartData = useMemo(() => {
    const total = reviews.length;
    const counts = [1, 2, 3, 4, 5].map((star) =>
      reviews.filter((r) => r.rate === star).length
    );

    return {
      series: counts,
      options: {
        chart: {
          type: "pie",
        },
        labels: ["1 sao", "2 sao", "3 sao", "4 sao", "5 sao"],
        legend: {
          position: "bottom",
        },
        colors: ["#FF6B6B", "#FFA94D", "#FFD43B", "#69DB7C", "#4C6EF5"],
        dataLabels: {
          formatter: (val: number, opts: any) => {
            const count = counts[opts.seriesIndex];
            return `${count} đánh giá (${val.toFixed(1)}%)`;
          },
        },
      },
    };
  }, [reviews]);

  return (
    <div className="review-bottom">
      <div className="review-statement pb-3 section-b-space">
        <HeadingTittleCommon title="Thông kê đánh giá" />
        <ReactApexChart
          options={chartData.options as ApexOptions}
          series={chartData.series}
          type="pie"
          height={275}
        />
      </div>
      {/* <div className="recommend-sec">
          <h3>Would you recommend Dance Acadamy?</h3>
          <div className="recommend-btn">
            <a href={Href} className="btn btn-solid">
              yes
            </a>
            <a href={Href} className="btn btn-outline">
              no
            </a>
          </div>
        </div> */}
    </div>
  );
};

export default ReviewStateMent;

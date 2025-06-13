import { FC, useEffect, useState } from "react";
import LikePage from "./LikePage";
import WeatherSection from "./WeatherSection";
import { useInView } from "react-intersection-observer";
import fanpageService from "@/service/fanpageService";

const LikedPages: FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,    
  });

  const [showWeather, setShowWeather] = useState(false);
  const [pageFollows, setPageFollows] = useState<any[]>([]);
  useEffect(() => {
    if (inView) {
      setShowWeather(true);
    }
  }, [inView]);

  useEffect(() => {
    const fetchPageFollows = async () => {
      const data = await fanpageService.getPageFollows();
      setPageFollows(data);
    };
    fetchPageFollows();
  }, []);
  
  return (
    <div className="sticky-top">
      {pageFollows.length > 0 && <LikePage pageFollows={pageFollows} />}
      <div ref={ref}>
        {showWeather && <WeatherSection />}
      </div>
    </div>
  );
};

export default LikedPages;

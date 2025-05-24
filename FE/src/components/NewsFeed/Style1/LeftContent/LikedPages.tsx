import { FC, useEffect, useState } from "react";
import LikePage from "./LikePage";
import WeatherSection from "./WeatherSection";
import { useInView } from "react-intersection-observer";

const LikedPages: FC = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,    
  });

  const [showWeather, setShowWeather] = useState(false);

  useEffect(() => {
    if (inView) {
      setShowWeather(true);
    }
  }, [inView]);

  return (
    <div className="sticky-top">
      <LikePage />
      <div ref={ref}>
        {showWeather && <WeatherSection />}
      </div>
    </div>
  );
};

export default LikedPages;

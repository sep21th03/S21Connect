import { Href, ImagePath, Weather } from "../../../../utils/constant";
import { FC, useEffect, useState } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import WeatherDropDown from "./WeatherDropDown";
import Image from "next/image";
import { Spinner } from "reactstrap";
import { fetchWeather, WeatherData } from "@/service/mockupSercive";

const WeatherSection: FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    try {
      setLoading(true);
      const data = await fetchWeather();
      setWeatherData(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thời tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  const handleReloadWeather = (e: React.MouseEvent) => {
    e.preventDefault();
    getWeather();
  };

  const icons = ["❅", "❆", "❅", "❆", "❅", "❆", "❅", "❆", "❅", "❆", "❅", "❆"];

  return (
    <div className="weather-section section-t-space">
      <div className="card-title light-version">
        <h3>{Weather}</h3>
        <div className="settings">
          <div className="setting-btn light-btn">
            <a href={Href} onClick={handleReloadWeather} className="d-flex">
              <DynamicFeatherIcon
                iconName="RotateCw"
                className="icon icon-light stroke-width-3 iw-11 ih-11"
              />
            </a>
          </div>
          {/* <WeatherDropDown /> */}
        </div>
      </div>

      <div className="weather-content" id="weather-info">
        {loading || !weatherData ? (
          <Spinner />
        ) : (
          <>
            <div className="top-title">
              <h2>{weatherData.temp}</h2>
              <h5>{weatherData.time}</h5>
            </div>
            <h5>{weatherData.condition}</h5>
            <h6>
              {weatherData.date} <span>{weatherData.country}</span>
            </h6>
          </>
        )}
      </div>

      <div className="flaks-img">
        <Image
          width={66}
          height={66}
          src={`${ImagePath}/icon/snow-flaks.png`}
          className="img-fluid blur-up lazyloaded"
          alt="snow"
        />
      </div>

      <div className="snowflakes">
        {icons.map((data, index) => (
          <div key={index} className="snowflake">
            {data}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherSection;

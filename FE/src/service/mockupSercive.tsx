// src/services/weatherService.ts
import axios from "axios";

export interface WeatherData {
    temp: string;
    time: string;
    condition: string;
    date: string;
    country: string;
  }
  
  export const fetchWeather = async (): Promise<WeatherData> => {
    const url = process.env.NEXT_PUBLIC_WEATHER_API;
  
    if (!url) throw new Error("Weather API URL is not defined");
  
    const res = await fetch(url);
    const data = await res.json();
  
    const feelsLike = data.current.feelslike_c;
    const condition = data.current.condition.text;
    const country = data.location.country;
    const localtime = new Date(data.location.localtime.replace(" ", "T"));
  
    const hours = localtime.getHours();
    const minutes = localtime.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const timeFormatted = `${((hours + 11) % 12 + 1)}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateFormatted = localtime.toLocaleDateString("en-GB", dateOptions);
  
    return {
      temp: `${feelsLike}°C`,
      time: timeFormatted,
      condition,
      date: dateFormatted,
      country,
    };
  };
  

  const JAMENDO_CLIENT_ID = "95cc4091"; 

export const searchTracks = async (query: string) => {
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${query}&audioformat=mp31`;

  try {
    const response = await axios.get(url);
    return response.data.results;
  } catch (error) {
    console.error("Lỗi khi lấy track từ Jamendo:", error);
    return [];
  }
};
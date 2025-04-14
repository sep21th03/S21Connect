import { FC } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  height: "100%",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

const MapGoogle: FC = () => {
  // const { isLoaded } = useJsApiLoader({
  //   id: "google-map-script",
  //   googleMapsApiKey:
  //     "https://maps.googleapis.com/maps/api/js?key=your_api_key",
  // });
  return (
    <div className="img-wrapper">
      <div className="map-wrapper">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          />
      </div>
    </div>
  );
};

export default MapGoogle;

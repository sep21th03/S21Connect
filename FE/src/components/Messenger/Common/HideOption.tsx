import { SvgPath } from "../../../utils/constant";
import Image from "next/image";

const HideOption = ({ onImageClick }: { onImageClick: () => void }) => {
  const imageList = ["image", "paperclip", "camera"];

  return (
    <div className="options ">
      <ul>
        {imageList.map((data,index) => (
          <li key={index} onClick={() => {
            if (data === "image") {
              onImageClick();
            }
          }}>
            <Image
              height={16}
              width={16}
              src={`${SvgPath}/${data}.svg`}
              alt=""
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HideOption;

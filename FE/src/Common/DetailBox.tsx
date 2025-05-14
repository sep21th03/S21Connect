import { FC, useState } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { DetailBoxProps } from "./CommonInterFace";
import { ImagePath, PeopleReactThisPost } from "../utils/constant";
import CustomImage from "./CustomImage";
import { toast } from 'react-toastify';

const DetailBox: FC<DetailBoxProps> = ({ heading, span, post }) => {
  const [bookMarkActive, setBookMarkActive] = useState(false);
  const numbers = [1, 2, 3];
  return (
    <div className={`detail-box ${post?.bg_id ? `${post?.bg_id}` : ""}`} style={post?.bg_id ? { padding: "100px 20px 100px 20px" } : {}}>
      <h3 style={{textAlign: "center"}}>{post?.content}</h3>
      {/* <h5 className="tag" dangerouslySetInnerHTML={{ __html: span }} /> */}
      {/* <p>
        {post?.content}
      </p> */}
      <div className={`bookmark favorite-btn ${bookMarkActive ? "active" : ""}`}>
        <DynamicFeatherIcon iconName="Bookmark" className="iw-14 ih-14" onClick={() => {setBookMarkActive(!bookMarkActive); toast.success(`${bookMarkActive?"un-":""}bookmark successful`);}   }/>
      </div>
      {/* <div className="people-likes">
        <ul>
          {numbers.map((data, index) => (
            <li key={index} className="popover-cls bg-size blur-up lazyloaded">
              <CustomImage src={`${ImagePath}/user-sm/${data}.jpg`} className="img-fluid blur-up lazyload bg-img" alt="image"/>
            </li>
          ))}
        </ul>
        <h6>+12 {PeopleReactThisPost}</h6>
      </div> */}
    </div>
  );
};

export default DetailBox;

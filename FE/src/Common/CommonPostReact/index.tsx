import { FC, useEffect, useState } from "react";
import DynamicFeatherIcon from "../DynamicFeatherIcon";
import { Comment, Href, Reaction, Share, SvgPath } from "../../utils/constant";
import Image from "next/image";
import CommentSection from "./CommentSection";
import ShareModal from "./ShareModal";
import { reactions } from "@/Data/common";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/constant/api";
import { ReactionResponse } from "@/components/NewsFeed/Style1/Style1Types";
import { Post } from "@/components/NewsFeed/Style1/Style1Types";
interface CommonPostReactProps {
  post: Post;
  onReactionChange?: (data: ReactionResponse) => void;
}



const CommonPostReact: FC<CommonPostReactProps> = ({ post, onReactionChange }) => {
  const [showReaction, setShowReaction] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reactionData, setReactionData] = useState<ReactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const postId = post?.id;
  const toggleModal = () => {
    setShowModal(prevState => !prevState); // Dùng callback để cập nhật dựa trên giá trị trước đó
  };
  

  useEffect(() => {
    fetchPostReactions();
  }, [postId]);

  const fetchPostReactions = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.POSTS.REACTIONS.GET(postId));
      setReactionData(response.data);
      onReactionChange?.(response.data);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleReactionClick = async (type: string) => {
    setIsLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.POSTS.REACTIONS.TOGGLE(postId), {
        type: type,
        post_id: postId,
      });
      
      await fetchPostReactions();
      
      setShowReaction(false);
    } catch (error) {
      console.error("Error toggling reaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReactionIcon = () => {
    if (!reactionData || !reactionData.user_reaction) {
      return <DynamicFeatherIcon iconName="Smile" className="iw-18 ih-18" />;
    }
    
    const userReactionObj = reactions.find(r => r.tittle.toLowerCase() === reactionData.user_reaction);
    
    if (userReactionObj) {
      return (
        <Image 
          width={18} 
          height={18} 
          src={`${SvgPath}/emoji/${userReactionObj.imageName}.svg`} 
          alt={userReactionObj.tittle} 
          className="reaction-icon"
        />
      );
    }
    
    return <DynamicFeatherIcon iconName="Smile" className="iw-18 ih-18" />;
  };

  return (
    <>
      <div className="post-react">
        <ul>
          <li className="react-btn">
            <a className={`react-click ${reactionData?.user_reaction ? 'active' : ''}`} href={Href} onClick={() => setShowReaction(!showReaction)}>  
              {/* <DynamicFeatherIcon iconName="Smile" className="iw-18 ih-18" />{Reaction} */}
              {getReactionIcon()}
              {reactionData?.user_reaction 
                ? reactionData.user_reaction.charAt(0).toUpperCase() + reactionData.user_reaction.slice(1) 
                : Reaction}
            </a>
            <div className={`react-box ${showReaction ? "show" : ""}`}>
              <ul>
              {reactions.map((data, index) => (
                  <li 
                    key={index} 
                    data-title={data.tittle}
                    onClick={() => !isLoading && handleReactionClick(data.tittle.toLowerCase())}
                    style={{ cursor: isLoading ? 'wait' : 'pointer' }}
                  >
                    <a href={Href} onClick={(e) => e.preventDefault()}>
                      <Image 
                        width={28} 
                        height={28} 
                        src={`${SvgPath}/emoji/${data.imageName}.svg`} 
                        alt={data.tittle}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          <li className="comment-click"  onClick={()=>setShowComment(!showComment)}>
            <a href={Href}>
              <DynamicFeatherIcon iconName="MessageSquare" className="iw-18 ih-18"/>{Comment}
            </a>
          </li>
          <li onClick={toggleModal}>
            <a href={Href} >
              <DynamicFeatherIcon iconName="Share" className="iw-16 ih-16" />{Share}
            </a>
          </li>
        </ul>
      </div>  
      <CommentSection  showComment={showComment} postId={postId}/>
      <ShareModal showModal={showModal} toggleModal={toggleModal} post={post}/>
    </>
  );
};

export default CommonPostReact;

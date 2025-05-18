import { Comment, Share, SvgPath } from "../utils/constant";
import Image from "next/image";
import { FC } from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { reactions } from "@/Data/common";

interface CommonLikePanelProps {
  commentCount?: number;
  shareCount?: number;
  reactionCount?: {
    [key: string]: number;
  };
  total_reactions?: number;
}
const CommonLikePanel: FC<CommonLikePanelProps> = ({
  commentCount,
  shareCount,
  reactionCount,
  total_reactions,
}) => {
  const activeReactions = reactions.filter((reaction) => {
    return (
      reactionCount?.[reaction.tittle] && reactionCount[reaction.tittle] > 0
    );
  });
  return (
    <div className="like-panel">
      <div className="left-emoji">
        <ul>
          {activeReactions.map((data, index) => (
            <li key={index}>
              <Image
                width={20}
                height={20}
                src={`${SvgPath}/emoji/${data.imageName}.svg`}
                alt={data.tittle}
              />
            </li>
          ))}
        </ul>
        {typeof total_reactions === "number" && total_reactions > 0 && (
          <h6>+{total_reactions}</h6>
        )}
      </div>
      <div className="right-stats">
        <ul>
          <li>
            {typeof commentCount === "number" && commentCount > 0 && (
              <li>
                <h5>
                  <DynamicFeatherIcon
                    iconName="MessageSquare"
                    className="iw-16 ih-16"
                  />
                  <span>{commentCount}</span> {Comment}
                </h5>
              </li>
            )}
          </li>
          <li>
            {typeof shareCount === "number" && shareCount > 0 && (
              <li>
                <h5>
                  <DynamicFeatherIcon
                    iconName="Share"
                    className="iw-16 ih-16"
                  />
                  <span>{shareCount}</span> {Share}
                </h5>
              </li>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CommonLikePanel;

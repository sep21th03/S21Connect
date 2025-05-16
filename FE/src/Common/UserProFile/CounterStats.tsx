import { UserAbout } from "@/utils/interfaces/user";
import { Followers, Following, Likes } from "../../utils/constant";
import { FC } from "react";

const CounterStats: FC<{ userData: UserAbout["user_data"] | null }> = ({ userData }) => {  
  return (
    <div className="counter-stats">
      <ul>
        <li>
          <h3 className="counter-value">{userData?.following}</h3>
          <h5>{Following}</h5>
        </li>
        <li>
          <h3 className="counter-value">{userData?.friends}</h3>
          <h5>{Likes}</h5>
        </li>
        <li>
          <h3 className="counter-value">{userData?.followers}</h3>
          <h5>{Followers}</h5>
        </li>
      </ul>
    </div>
  );
};

export default CounterStats;

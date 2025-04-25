import { FC } from "react";

const UserData: FC<{ userData: { followers: number; following: number; friends: number } }> = ({ userData }) => {
  const displayData = [
    { title: "Following", value: userData?.following },
    { title: "Followers", value: userData?.followers },
    { title: "Friends", value: userData?.friends },
  ];

  return (
    <div className="counter-stats">
      <ul>
        {displayData.map((data, index) => (
          <li key={index}>
            <h3 className="counter-value">{data.value}</h3>
            <h5>{data.title}</h5>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserData;

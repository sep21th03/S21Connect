import { FC } from "react";

const UserData: FC<{ userData: { followers: number | null; following: number | null; friends: number | null } }> = ({ userData }) => {
  const displayData = [
    { title: "Following", value: userData?.following || 0 },
    { title: "Followers", value: userData?.followers || 0 },
    { title: "Friends", value: userData?.friends || 0 },
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

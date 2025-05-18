import Link from "next/link";
import { Spay } from "../../../utils/constant";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";

const SpayList = () => {
  return (
    <li>
      <Link href="/spay/home">
      <DynamicFeatherIcon iconName={"CreditCard"} className="bar-icon" />   
        <div className="tooltip-cls">
          <span>{Spay}</span>
        </div>
      </Link>
    </li>
  );
};

export default SpayList;

import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Href } from "../../../utils/constant";
import Link from "next/link";
import { FC, useState, useRef, useEffect } from "react";

interface RightOptionProps {
  showArchived: boolean;
  setShowArchived: (showArchived: boolean) => void;
}

const RightOption: FC<RightOptionProps> = ({ showArchived, setShowArchived }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="right-option">
      <ul className="d-flex gap-2 align-items-center">
        <li>
          <Link href="/messanger">
            <DynamicFeatherIcon iconName="Maximize" className="iw-16 ih-16" />
          </Link>
        </li>
        <li>
          <a href={Href}>
            <DynamicFeatherIcon iconName="Edit" className="iw-16 ih-16" />
          </a>
        </li>
        <li ref={dropdownRef} className="position-relative">
          <button
            type="button"
            className="btn btn-link p-0 border-0"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <DynamicFeatherIcon
              iconName="MoreHorizontal"
              className="iw-16 ih-16"
            />
          </button>

          {isDropdownOpen && (
            <div
              className="dropdown-menu-right show position-absolute end-0 mt-2 shadow-sm"
              style={{ width: "150px", zIndex: 1000, backgroundColor: "white" }}
            >
              <button
                className="dropdown-item d-flex align-items-center gap-2"
                onClick={() => {
                  setShowArchived(true);
                  setIsDropdownOpen(false);
                }}
              >
                <DynamicFeatherIcon iconName="Archive" className="iw-14" />
                Lưu trữ
              </button>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default RightOption;

import Icon from "@/components/common/Icon";
import Image from "@/components/common/Image";
import { ROUTES } from "@/constants/routePath";
import { currentUser } from "@/redux/ducks/user";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";
import { useSelector } from "react-redux";
import { matchPath, useLocation, useNavigate } from "react-router-dom";

const Header: React.FC<PropsWithChildren> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(currentUser);
  const routeData = Object.values(ROUTES).find((route) =>
    matchPath(route.path, location.pathname)
  );
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef<HTMLInputElement>(null);

  const profileDropdown = () => setIsVisible((v) => !v);
  const handleClickOutside = (event: MouseEvent) => {
    if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
      setIsVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className="w-full bg-white px-6 py-3 flex items-center justify-between border-b border-gray-200 shadow-sm"
      ref={headerRef}
    >
      {/* Page Title */}
      <div className="flex-1 flex justify-left">
        <h4 className="text-xl font-semibold text-gray-900 tracking-tight">
          {routeData?.headerName || "Dashboard"}
        </h4>
      </div>
      <div className="flex items-center gap-6 min-w-[260px] justify-end relative">
        <div className="relative">
          <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer border border-gray-200">
            <Icon name="notification" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 border border-white">3</span>
          </div>
        </div>
        <div className="relative">
          <div
            onClick={profileDropdown}
            className="flex items-center gap-2 bg-emerald-900 px-3 py-1.5 rounded-full cursor-pointer hover:bg-emerald-800 transition"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
              <Image
                imgPath={user?.logo_path || ""}
                firstName={user?.first_name}
                lastName={user?.last_name}
                alt="User Avatar"
                imageClassName="rounded-full object-cover object-center w-full h-full"
                className="w-full h-full"
                initialClassName="!text-base"
              />
            </div>
            <div className="flex flex-col items-start text-white">
              <span className="font-semibold text-sm leading-tight">
                {user?.first_name} {user?.last_name}
              </span>
              <span className="text-xs opacity-80 leading-tight">
                {user?.email}
              </span>
            </div>
            <Icon name="dropDown" className="ml-1" />
          </div>
          {isVisible && (
            <ul className="absolute right-0 mt-2 w-44 bg-white shadow-lg border-t-4 border-emerald-900 rounded-lg z-30 py-2">
              <li
                className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-emerald-50 hover:text-emerald-900 text-gray-700"
                onClick={() => {
                  setIsVisible(false);
                  navigate(ROUTES.PROFILE.path);
                }}
              >
                <Icon name="profile" />
                <span>Profile</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

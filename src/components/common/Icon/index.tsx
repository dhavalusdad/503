import type { SVGAttributes } from "react";
import Notification from "@/assets/svg/Notification.svg?react";
import BlackDropdown from "@/assets/svg/DropDown.svg?react";
import Profile from "@/assets/svg/DropDown.svg?react";
import LeftArrow from "@/assets/svg/LeftArrow.svg?react";
import Dashboard from "@/assets/svg/Dashboard.svg?react";
import Appointment from "@/assets/svg/Appointment.svg?react";
import Client from "@/assets/svg/Client.svg?react";
import Calendar from "@/assets/svg/Calendar.svg?react";
import Chat from "@/assets/svg/Chat.svg?react";
import Settings from "@/assets/svg/Settings.svg?react";
import Spinner from "@/components/common/Loader/Spinner";
import Image from "@/components/common/Image";
import Logo from "@/assets/svg/Logo.svg?react";
import Phone from "@/assets/svg/Phone.svg?react";
import Close from "@/assets/svg/Close.svg?react";
import Search from "@/assets/svg/Search.svg?react";
import Loading from "@/assets/svg/Loading.svg?react";
import Mail from "@/assets/svg/Mail.svg?react";
import Website from "@/assets/svg/Website.svg?react";
import Facebook from "@/assets/svg/Facebook.svg?react";
import Instagram from "@/assets/svg/Instagram.svg?react";

export type IconNameType =
  | "notification"
  | "dropDown"
  | "profile"
  | "leftarrow"
  | "dashboard"
  | "appointment"
  | "client"
  | "calendar"
  | "chat"
  | "settings"
  | "logo"
  | "phone"
  | "close"
  | "search"
  | "loading"
  | "mail"
  | "website"
  | "facebook"
  | "instagram";

type IconProps = {
  name: IconNameType;
  iconType?: "default" | "custom";
  className?: string;
  svgWrapperClass?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  iIconStyle?: { backgroundColor: string };
  title?: string;
  isSpinner?: boolean;
  fill?: string;
  stroke?: string;
} & SVGAttributes<SVGElement>;

export const Icon = ({
  name,
  iconType = "default",
  className = "",
  svgWrapperClass = "",
  iIconStyle,
  onClick,
  isSpinner,
  fill,
  stroke,
  ...restProps
}: IconProps) => {
  const style = {
    color: fill,
    stroke,
    ...iIconStyle,
  };
  const renderIcon = (icon: IconNameType) => {
    const iconProps = { ...restProps };

    switch (icon) {
      case "notification":
        return <Notification {...iconProps} />;
      case "dropDown":
        return <BlackDropdown {...iconProps} />;
      case "profile":
        return <Profile {...iconProps} />;
      case "leftarrow":
        return <LeftArrow {...iconProps} />;
      case "dashboard":
        return <Dashboard {...iconProps} />;
      case "appointment":
        return <Appointment {...iconProps} />;
      case "client":
        return <Client {...iconProps} />;
      case "calendar":
        return <Calendar {...iconProps} />;
      case "chat":
        return <Chat {...iconProps} />;
      case "settings":
        return <Settings {...iconProps} />;
      case "logo":
        return <Logo {...iconProps} />;
      case "phone":
        return <Phone {...iconProps} />;
      case "close":
        return <Close {...iconProps} />;
      case "search":
        return <Search {...iconProps} />;
      case "loading":
        return <Loading {...iconProps} />;
      case "mail":
        return <Mail {...iconProps} />;
      case "website":
        return <Website {...iconProps} />;
      case "facebook":
        return <Facebook {...iconProps} />;
      case "instagram":
        return <Instagram {...iconProps} />;
      default:
        return null;
    }
  };

  const renderIconContent = () => {
    if (iconType === "default") {
      return isSpinner ? (
        <Spinner />
      ) : (
        <div className={svgWrapperClass}>{renderIcon(name)}</div>
      );
    }
    if (iconType === "custom") {
      return <Image imgPath={name} isServerPath width={32} height={32} />;
    }
    return null;
  };

  return (
    <div className={className} onClick={onClick} style={style}>
      {renderIconContent()}
    </div>
  );
};

export default Icon;

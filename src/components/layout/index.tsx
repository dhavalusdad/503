import { type PropsWithChildren } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type AppLayoutProps = PropsWithChildren;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <Header />
      <div>{children}</div>
    </div>
  );
};

export default AppLayout;

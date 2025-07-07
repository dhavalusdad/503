import { useState, type PropsWithChildren } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type AppLayoutProps = PropsWithChildren;

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="flex bg-Gray-300 h-screen">
      <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div
        className={`relative h-full ml-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[calc(100%-66px)] xl:w-[calc(100%-255px)]' : 'w-[calc(100%-66px)]'}`}>
        <Header />
        <div
          className="px-4 md:px-26px py-4 sm:py-5 h-[calc(100%-60px)] sm:h-[calc(100%-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

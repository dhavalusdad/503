import { NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routePath";
import { Icon, type IconNameType } from "@/components/common/Icon";
import clsx from "clsx";

interface SidebarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const menuItems: { icon: IconNameType; label: string; path: string }[] = [
  { icon: "dashboard", label: "Dashboard", path: ROUTES.DASHBOARD.path },
  { icon: "appointment", label: "Appointment", path: ROUTES.APPOINTMENT.path },
  { icon: "client", label: "Client", path: ROUTES.CLIENT.path },
  { icon: "calendar", label: "Calendar", path: ROUTES.CALENDAR.path },
  { icon: "chat", label: "Chat", path: ROUTES.CHAT.path },
  { icon: "settings", label: "Settings", path: ROUTES.SETTINGS.path },
];

const Sidebar: React.FC<SidebarProps> = ({
  toggleSidebar,
  isSidebarOpen = window.innerWidth >= 1200,
}) => {
  const location = useLocation();

  const containerWidthClass = isSidebarOpen ? "w-64" : "w-16";
  const sidebarTextVisibility = isSidebarOpen
    ? "opacity-100"
    : "opacity-0 w-0 overflow-hidden";
  const justifyIfClosed = !isSidebarOpen ? "justify-center" : "";

  return (
    <aside
      className={clsx(
        "h-screen bg-white border-r border-gray-200 flex flex-col justify-between fixed top-0 left-0 z-30 shadow-sm transition-all duration-300 ease-in-out",
        containerWidthClass
      )}
    >
      <div>
        <div className="flex items-center gap-2 px-6 py-6 relative">
          <img src="/vite.svg" alt="Logo" className="h-8 w-8 flex-shrink-0" />
          <span
            className={clsx(
              "font-bold text-lg text-emerald-900 tracking-tight transition-all duration-300 ease-in-out",
              sidebarTextVisibility
            )}
          >
            CytiPsychological
          </span>

          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            className={clsx(
              "absolute -right-3 top-2/4 -translate-y-2/4 z-10 bg-Primary-800 border-2 border-white shadow-inner w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300",
              {
                "rotate-180": isSidebarOpen,
              }
            )}
          >
            <Icon name="leftarrow" />
          </div>
        </div>

        <nav className="mt-6">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.path}
                    className={({ isActive: navLinkActive }) =>
                      clsx(
                        "flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg font-medium transition-all duration-300 ease-in-out",
                        {
                          "bg-emerald-100 text-emerald-900": navLinkActive || isActive,
                          [justifyIfClosed]: true,
                        }
                      )
                    }
                    end
                  >
                    <Icon
                      name={item.icon}
                      className="w-6 transition-all duration-300 ease-in-out flex-shrink-0"
                    />
                    <span
                      className={clsx(
                        "transition-all duration-300 ease-in-out",
                        sidebarTextVisibility
                      )}
                    >
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Actions */}
      <div
        className={clsx(
          "mb-6 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "px-6" : "px-2"
        )}
      >
        <button
          className={clsx(
            "flex items-center gap-3 w-full px-3 py-2 mb-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg font-medium transition-all duration-300 ease-in-out",
            justifyIfClosed
          )}
        >
          <span className="w-5 h-5 inline-block bg-gray-300 rounded flex-shrink-0" />
          <span className={clsx("transition-all duration-300 ease-in-out", sidebarTextVisibility)}>
            Help & Support
          </span>
        </button>
        <button
          className={clsx(
            "flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition-all duration-300 ease-in-out",
            justifyIfClosed
          )}
        >
          <span className="w-5 h-5 inline-block bg-red-200 rounded flex-shrink-0" />
          <span className={clsx("transition-all duration-300 ease-in-out", sidebarTextVisibility)}>
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

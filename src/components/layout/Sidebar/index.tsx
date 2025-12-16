import React, { useState, useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';

import { type User, UserRole } from '@/api/types/user.dto';
import MenuPopup from '@/components/layout/Sidebar/MenuPopup';
import { type SidebarMenuItem, getMenuItemsByRole } from '@/config/sidebarConfig';
import ChatUnreadBadge from '@/features/chat/components/ChatUnreadBadge';
import { useDeviceType } from '@/hooks/useDeviceType';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import Tooltip from '@/stories/Common/Tooltip/Tooltip';

interface SidebarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  logout: () => void;
}

// export interface ChildSidebarMenuItem {
//   [x: string]: any;
//   icon: string;
//   label: string;
//   path: string;
//   roles: string[];
// }

const Sidebar: React.FC<SidebarProps> = ({
  logout,
  toggleSidebar,
  isSidebarOpen = window.innerWidth >= 1279,
}) => {
  const location = useLocation();

  const user: User = useSelector(currentUser);
  const userRole = user.role || UserRole.CLIENT;
  const menuItems = getMenuItemsByRole(userRole, user.permissions);
  const [hoveredItem, setHoveredItem] = useState<SidebarMenuItem | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const deviceType = useDeviceType();
  // const [currentSidebar, setCurrentSidebar] = useState<string>(
  //   `/${location.pathname?.split('/')[1]}`

  // );
  const containerWidthClass = isSidebarOpen ? 'w-270px' : 'w-79px';
  const sidebarTextVisibility = isSidebarOpen ? 'w-full' : 'w-0';
  const [sidebarChildListOpen, setSidebarChildListOpen] = useState<string | null>(
    `/${location.pathname?.split('/')[1]}`
  );

  // const currentSelectedScreen: string = `/${location.pathname.split('/')[1]}`;
  // useEffect(() => {
  //   setCurrentSidebar(currentSelectedScreen);
  // }, [currentSelectedScreen]);

  const queryClient = useQueryClient();

  // Handle responsive behavior - auto close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1279 && isSidebarOpen) {
        toggleSidebar();
      } else if (window.innerWidth >= 1279 && !isSidebarOpen) {
        toggleSidebar();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isSidebarOpen, toggleSidebar]);

  const handleLogout = () => {
    queryClient.clear();
    logout();
  };

  const handleMenuItemClick = () => {
    if (
      (deviceType === 'mobile' ||
        deviceType === 'mobilehorizontal' ||
        deviceType === 'tablet' ||
        deviceType === 'tabletbigger') &&
      isSidebarOpen
    ) {
      removePopUp();
      toggleSidebar();
    }
  };

  const childMenuHandler = (item: SidebarMenuItem) => {
    if (!item.childRoute) {
      if (
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
      ) {
        setSidebarChildListOpen(null);
      } else {
        // setCurrentSidebar(`/${item.path.split('/')[1]}`);
        setSidebarChildListOpen(null);
      }
    } else {
      if (sidebarChildListOpen?.includes(item.path)) {
        setSidebarChildListOpen(null);
      } else {
        setSidebarChildListOpen(item.path);
      }
    }
  };

  const isMenuItemActive = (item: SidebarMenuItem): boolean => {
    const currentPath = location.pathname;

    // Exact path match
    if (currentPath === item.path) {
      return true;
    }

    // Check if current path starts with item path (for nested routes)
    if (currentPath.startsWith(`${item.path}/`)) {
      return true;
    }

    // Check if any child route is active
    if (item.childRoute) {
      return item.childRoute.some(
        child => currentPath === child.path || currentPath.startsWith(`${child.path}/`)
      );
    }

    // Special handling for preferences routes
    if (item.path.includes('/preferences/') && currentPath.includes('/preferences/')) {
      return currentPath.startsWith(item.path);
    }

    return false;
  };

  const removePopUp = () => {
    setHoveredItem(null);
    setAnchorRect(null);
  };

  // inside component
  const submenuRefs = useRef<Record<string, HTMLUListElement | null>>({});
  const forceRerender = useState(0)[1]; // used to recalc if needed

  useEffect(() => {
    const onResize = () => {
      // trigger recalculation so styles update with new scrollHeights
      forceRerender(n => n + 1);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      onMouseLeave={() => {
        removePopUp();
      }}
      className={clsx(
        'h-screen bg-white border-r border-surface fixed xl:relative top-0 left-0 z-999 transition-all duration-300 ease-in-out py-5',
        containerWidthClass
      )}
    >
      <div className='flex flex-col gap-6 h-full'>
        <div className={clsx('relative transition-all duration-300 ease-in-out px-3.5')}>
          <div
            className={clsx(
              'flex items-center px-3.5 overflow-hidden transition-all duration-300 ease-in-out'
            )}
          >
            <Icon name='logo-secondary' className='icon-wrapper h-8 min-w-52 whitespace-nowrap' />
          </div>
          <div
            onClick={e => {
              e.stopPropagation();
              toggleSidebar();
            }}
            className={clsx(
              'z-10 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer absolute top-2/4 -translate-y-2/4 bg-primary text-white -right-2.5'
            )}
          >
            <Icon
              name='toggleArrow'
              className={clsx('icon-wrapper w-3 h-3 transition-all duration-300 ease-in-out', {
                'rotate-180': !isSidebarOpen,
              })}
            />
          </div>
        </div>
        <div
          className={clsx(
            'transition-all duration-300 ease-in-out px-3.5 flex flex-col gap-6 justify-between flex-1 overflow-hidden'
          )}
        >
          <ul className='flex flex-col gap-1.5 overflow-y-auto flex-1 scroll-disable'>
            {menuItems.map(item => {
              const isActive = isMenuItemActive(item);
              const isOpen =
                isSidebarOpen &&
                item?.childRoute?.length &&
                sidebarChildListOpen &&
                item.path.includes(sidebarChildListOpen);

              return (
                <li
                  key={item.label}
                  onClick={e => {
                    e.stopPropagation();
                    childMenuHandler(item);
                  }}
                  onMouseEnter={e => {
                    if (!isSidebarOpen) {
                      setHoveredItem(item);
                      setAnchorRect((e.currentTarget as HTMLLIElement).getBoundingClientRect());
                    } else if (item.label !== hoveredItem?.label) {
                      removePopUp();
                    }
                  }}
                >
                  <Tooltip
                    placement='right'
                    className='bg-primary text-white text-sm px-3 py-1 rounded-lg shadow-lg'
                    label={item.label}
                    disable={isSidebarOpen || !!item.childRoute}
                  >
                    <NavLink
                      id={item.elementId}
                      to={!item.childRoute ? item.path : ''}
                      onClick={!item.childRoute ? handleMenuItemClick : undefined}
                      className={() =>
                        clsx(
                          'flex items-center gap-2 px-4 py-4 text-blackdark text-base leading-18px font-medium hover:bg-primarylight hover:text-white rounded-lg transition-all duration-300 ease-in-out whitespace-nowrap',
                          {
                            'bg-primary text-white hover:!bg-primary': isActive,
                          }
                        )
                      }
                      end
                    >
                      <div className='w-5'>
                        <Icon name={item.icon} className='w-18px h-18px icon-wrapper' />
                      </div>

                      <span
                        className={clsx(
                          'transition-all duration-300 ease-in-out flex-1 overflow-hidden',
                          sidebarTextVisibility
                        )}
                      >
                        {item.label}
                      </span>

                      {item.label == 'Chat' && (
                        <ChatUnreadBadge active={isActive} compact={!isSidebarOpen} />
                      )}

                      {isSidebarOpen && item.childRoute && (
                        <Icon
                          name='dropdownArrow'
                          className={clsx(
                            'ml-1 transform transition-transform duration-300',
                            !(sidebarChildListOpen === item.path) ? 'rotate-0' : 'rotate-180'
                          )}
                        />
                      )}
                    </NavLink>
                  </Tooltip>
                  {/* Submenu Items */}
                  <ul
                    ref={el => {
                      if (el) submenuRefs.current[item.path] = el;
                    }}
                    style={{
                      maxHeight:
                        isOpen && submenuRefs.current[item.path]
                          ? `${submenuRefs.current[item.path]!.scrollHeight}px`
                          : '0px',
                    }}
                    className={clsx(
                      'relative ml-6 before:w-1px before:h-[calc(100%-22px)] before:bg-primarylight before:left-0 before:absolute transition-all duration-500 ease-in-out overflow-hidden'
                    )}
                  >
                    {item?.childRoute?.map((item: SidebarMenuItem) => {
                      const isChildActive = location.pathname.startsWith(item.path);
                      return (
                        <li
                          key={item.path}
                          onClick={e => {
                            e.stopPropagation();
                            // setCurrentSidebar(`/${item.path.split('/')[1]}`);
                          }}
                          className='relative pl-6 before:absolute before:w-4 before:h-1px before:bg-primarylight before:left-0 before:top-2/4 before:-translate-y-2/4'
                        >
                          <NavLink
                            to={item.path}
                            onClick={handleMenuItemClick}
                            id={item.elementId}
                            className={({ isActive: navLinkActive }) =>
                              clsx(
                                'flex items-center gap-2 py-3 text-blackdark text-sm font-medium hover:text-primary transition-all duration-300 ease-in-out whitespace-nowrap',
                                {
                                  '!text-primary !font-bold': navLinkActive || isChildActive,
                                }
                              )
                            }
                            end
                          >
                            <div className='w-5'>
                              <Icon name={item.icon} className='w-18px h-18px icon-wrapper' />
                            </div>
                            <span
                              className={clsx(
                                'transition-all duration-300 ease-in-out flex-1 overflow-hidden',
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
                </li>
              );
            })}
          </ul>
          {hoveredItem && anchorRect && !isSidebarOpen && (
            <MenuPopup
              items={hoveredItem.childRoute!}
              parentRect={anchorRect}
              level={1}
              removePopUp={removePopUp}
              currentSidebarHandler={childMenuHandler}
            />
          )}

          {/* Footer Actions */}
          <ul className={clsx('flex flex-col gap-1.5 transition-all duration-300 ease-in-out')}>
            {/* <li
              className={clsx(
                'flex items-center px-4 py-3 text-blackdark text-base font-medium hover:bg-primarylight hover:text-white rounded-lg transition-all duration-300 ease-in-out cursor-pointer whitespace-nowrap',
                isSidebarOpen ? 'gap-2' : ''
              )}
            >
              <Icon name='helpsupport' className='w-5 transition-all duration-300 ease-in-out' />
              <span
                className={clsx(
                  'transition-all duration-300 ease-in-out w-[calc(100%-28px)]',
                  sidebarTextVisibility
                )}
              >
                Help & Support
              </span>
            </li> */}
            <li
              onClick={handleLogout}
              className={clsx(
                'flex items-center px-4 py-4 gap-2 text-base leading-18px font-medium rounded-lg transition-all duration-300 ease-in-out cursor-pointer text-red bg-redlight hover:bg-red hover:text-white whitespace-nowrap'
              )}
            >
              <div className='w-5'>
                <Icon name='logout' className='icon-wrapper w-18px h-18px' />
              </div>
              <span
                className={clsx(
                  'transition-all duration-300 ease-in-out flex-1 overflow-hidden',
                  sidebarTextVisibility
                )}
              >
                Log Out
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

import { useCallback, useMemo, useRef } from 'react';

import { useInfiniteTherapistStatus } from '@/api/admin-dashboard';
import defaultUserPng from '@/assets/images/default-user.webp';
import AdminDashboardDataCountCards from '@/pages/Admin/Dashboard/AdminDashboardDataCountCards';
import AdminDashboardUpcomingSessions from '@/pages/Admin/Dashboard/AdminDashboardUpcomingSessions';
import './style/style.css';
import PatientFormCompletionRate from '@/pages/Admin/Dashboard/PatientFormCompletionRate';
import Image from '@/stories/Common/Image';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteTherapistStatus({
    limit: 10,
    sortColumn: 'updated_at',
    sortOrder: 'desc',
    // userId: user.id,
  });

  const therapist = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items || []);
  }, [data?.pages]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastTherapistElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return (
    <div className='flex flex-col gap-5'>
      <AdminDashboardDataCountCards />
      <div className='flex xl:flex-row flex-col gap-5 '>
        <div className='xl:w-1/2 w-full'>
          <AdminDashboardUpcomingSessions />
        </div>

        <div className='flex flex-col gap-5 xl:w-1/2 w-full'>
          <PatientFormCompletionRate />
          <div className='bg-white p-5 rounded-20px shadow-cardshadow w-full'>
            <h5 className='text-lg font-bold leading-6 text-blackdark mb-5'>Therapist Status</h5>
            <div className='h-80 overflow-y-auto scroll-disable'>
              {therapist.length === 0 ? (
                <div className='text-center py-8 text-base font-bold text-blackdark'>
                  No incomplete memo found
                </div>
              ) : (
                <>
                  {therapist.map(
                    (
                      item: {
                        id?: string;
                        user?: {
                          profile_image?: string;
                          first_name?: string;
                          last_name?: string;
                          user_settings?: { is_active: boolean }[];
                        };
                      },
                      index: number
                    ) => {
                      if (therapist.length === index + 1) {
                        return (
                          <div
                            ref={lastTherapistElementRef}
                            className='flex items-center gap-3.5 justify-between border-b border-surface pb-5 last:pb-0 mb-5 last:mb-0 last:border-b-0'
                            key={item.id}
                          >
                            <div className='flex items-center gap-3.5'>
                              <Image
                                imgPath={
                                  item?.user?.profile_image
                                    ? `${SERVER_URL}${item?.user?.profile_image}`
                                    : defaultUserPng
                                }
                                firstName={item?.user?.first_name}
                                lastName={item?.user?.last_name}
                                alt='User Avatar'
                                imageClassName='rounded-full object-cover object-center w-full h-full'
                                className='w-12 h-12 rounded-full overflow-hidden bg-surface'
                                initialClassName='!text-base'
                              />
                              <div className='flex flex-col gap-1.5'>
                                <h3 className='text-base font-semibold text-blackdark'>
                                  {`Dr. ${item?.user?.first_name} ${item?.user?.last_name}`}
                                </h3>
                              </div>
                            </div>
                            <div
                              className={`px-3.5 py-1 rounded-md text-sm font-medium ${
                                item?.user?.user_settings?.[0]?.is_active
                                  ? 'bg-Greendarklight/12 text-Green'
                                  : 'bg-reddark/12 text-red'
                              }`}
                            >
                              <span>
                                {item?.user?.user_settings?.[0]?.is_active
                                  ? 'Available'
                                  : 'Not Available'}
                              </span>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            className='flex items-center gap-3.5 justify-between border-b border-surface pb-5 last:pb-0 mb-5 last:mb-0 last:border-b-0'
                            key={item.id}
                          >
                            <div className='flex items-center gap-3.5'>
                              <Image
                                imgPath={
                                  item?.user?.profile_image
                                    ? `${SERVER_URL}${item?.user?.profile_image}`
                                    : defaultUserPng
                                }
                                firstName={item?.user?.first_name}
                                lastName={item?.user?.last_name}
                                alt='User Avatar'
                                imageClassName='rounded-full object-cover object-center w-full h-full'
                                className='w-12 h-12 rounded-full overflow-hidden bg-surface'
                                initialClassName='!text-base'
                              />
                              <div className='flex flex-col gap-1.5'>
                                <h3 className='text-base font-semibold text-blackdark'>
                                  {`Dr. ${item?.user?.first_name} ${item?.user?.last_name}`}
                                </h3>
                              </div>
                            </div>
                            <div
                              className={`px-3.5 py-1 rounded-md text-sm font-medium ${
                                item?.user?.user_settings?.[0]?.is_active
                                  ? 'bg-Greendarklight/12 text-Green'
                                  : 'bg-reddark/12 text-red'
                              }`}
                            >
                              <span>
                                {item?.user?.user_settings?.[0]?.is_active
                                  ? 'Available'
                                  : 'Not Available'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    }
                  )}

                  {isFetchingNextPage && (
                    <div className='flex items-center justify-center py-4'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                      <span className='ml-2 text-sm text-primarygray'>Loading more Memo...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

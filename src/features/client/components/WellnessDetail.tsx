import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import moment from 'moment';
import { useParams } from 'react-router-dom';

import {
  useCreateTherapyGoals,
  useGetAllTherapyGoals,
  useUpdateTherapyGoals,
  useDeleteTherapyGoal,
} from '@/api/therapy-goals';
import { usePatientWellnessAll } from '@/api/wellness';
import { TherapyGoalsContent } from '@/features/client/components/TherapyGoalsContent';
import { AlertTag } from '@/stories/Common/AlertTag';
import Button from '@/stories/Common/Button';
import Drawer from '@/stories/Common/Drawer';
import Icon from '@/stories/Common/Icon';

const WellnessDetails = () => {
  const { id: clientId } = useParams();

  // Wellness data API call
  const {
    data: wellnessData,
    hasNextPage: wellnessHasNextPage,
    isFetchingNextPage: wellnessIsFetchingNextPage,
    fetchNextPage: wellnessFetchNextPage,
    // isLoading: wellnessIsLoading,
    isFetching: wellnessIsFetching,
  } = usePatientWellnessAll({
    patient_id: clientId as string,
    limit: 10,
    sortColumn: 'created_at',
    sortOrder: 'desc',
  });

  // Therapy goals data API call
  const {
    data: therapyGoalsData,
    // hasNextPage: therapyGoalsHasNextPage,
    // isFetchingNextPage: therapyGoalsIsFetchingNextPage,
    // fetchNextPage: therapyGoalsFetchNextPage,
    // isLoading: therapyGoalsIsLoading,
    // isFetching: therapyGoalsIsFetching,
  } = useGetAllTherapyGoals({
    client_id: clientId as string,
    limit: 10,
    sortColumn: 'created_at',
    sortOrder: 'desc',
  });

  const wellnessItems = useMemo(() => {
    if (!wellnessData?.pages) return [];
    return wellnessData.pages.flatMap(page => page.items || []);
  }, [wellnessData?.pages]);

  const therapyGoalsItems = useMemo(() => {
    if (!therapyGoalsData?.pages) return [];
    return therapyGoalsData.pages.flatMap(page => page.items || []);
  }, [therapyGoalsData?.pages]);

  const { mutateAsync: createTherapyGoal } = useCreateTherapyGoals();
  const { mutateAsync: updateTherapyGoals } = useUpdateTherapyGoals();
  const { mutateAsync: deleteTherapyGoal } = useDeleteTherapyGoal();

  const [therapyGoalSideBar, setTherapyGoalSideBar] = useState(false);
  const [newGoalsToSubmit, setNewGoalsToSubmit] = useState([]);
  const [existingGoalsToUpdate, setExistingGoalsToUpdate] = useState([]);

  const loaderRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && wellnessHasNextPage && !wellnessIsFetchingNextPage) {
        wellnessFetchNextPage();
      }
    },
    [wellnessFetchNextPage, wellnessHasNextPage, wellnessIsFetchingNextPage]
  );

  useEffect(() => {
    const element = loaderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [handleObserver]);

  const handleTherapyGoalSubmit = async () => {
    try {
      // Handle creating new goals (only if they have text content)
      const validNewGoals = newGoalsToSubmit.filter(goal => goal.text && goal.text.trim() !== '');
      if (validNewGoals.length > 0) {
        const newGoalsPayload = validNewGoals.map(({ text, completed }) => ({
          text,
          completed,
          client_id: clientId,
        }));
        await createTherapyGoal({ goal: newGoalsPayload });
      }

      // Handle updating existing goals (only if they were modified)
      if (existingGoalsToUpdate.length > 0) {
        // Assuming your update API accepts an array of goal updates
        // You might need to adjust this based on your actual API structure
        await updateTherapyGoals({
          client_id: clientId,
          updates: existingGoalsToUpdate,
        });
      }

      // Close sidebar and reset state
      setTherapyGoalSideBar(false);
      setNewGoalsToSubmit([]);
      setExistingGoalsToUpdate([]);
    } catch (error) {
      console.error('Error saving therapy goals:', error);
      // Handle error appropriately (show toast, etc.)
    }
  };

  // Determine if save button should be enabled
  const isSaveButtonEnabled = () => {
    const hasValidNewGoals = newGoalsToSubmit.some(goal => goal.text && goal.text.trim() !== '');
    const hasModifiedExistingGoals = existingGoalsToUpdate.length > 0;
    return hasValidNewGoals || hasModifiedExistingGoals;
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteTherapyGoal({ goalId, client_id: clientId });
      // The goal will be automatically removed from the list due to cache invalidation
    } catch (error) {
      console.error('Error deleting therapy goal:', error);
      // Handle error appropriately (show toast, etc.)
    }
  };

  // Show loading state if either API is loading initially
  // if (wellnessIsLoading || therapyGoalsIsLoading) {
  //   return (
  //     <div className='bg-white rounded-20px border border-solid border-surface p-5'>
  //       <div className='flex items-center flex-wrap gap-5 mb-5'>
  //         <h2 className='text-lg font-bold leading-6 text-blackdark mr-auto'>Wellness Details</h2>
  //         <Button
  //           variant='filled'
  //           title='Manage Therapy Goal'
  //           onClick={() => setTherapyGoalSideBar(true)}
  //           className='rounded-10px min-h-50px'
  //         />
  //       </div>
  //       <div className='flex items-center justify-center py-10'>
  //         <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
  //         <span className='ml-2'>Loading wellness data...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5 h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center flex-wrap gap-5 mb-5'>
        <h2 className='text-lg font-bold leading-6 text-blackdark mr-auto'>Wellness Details</h2>
        {/* <Button
          variant='filled'
          title='Manage Therapy Goal'
          onClick={() => setTherapyGoalSideBar(true)}
          className='rounded-10px min-h-50px'
        /> */}
      </div>

      {/* Wellness Cards Grid with Scroll Container */}
      <div className='flex-1 overflow-y-auto scroll-disable'>
        {wellnessItems?.length === 0 ? (
          <div className='text-center py-12 text-base font-bold text-blackdark'>
            No wellness data found
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
              {wellnessItems?.map((wellness, index) => (
                <div
                  key={wellness?.id || index}
                  className='bg-white rounded-10px p-5 border border-solid border-surface w-full flex flex-col gap-3.5'
                >
                  <div className='flex items-center gap-1'>
                    <h6 className='text-base leading-5 font-bold text-blackdark'>Date : </h6>
                    <span className='text-base leading-5 font-normal text-primarygray'>
                      {moment(wellness?.created_at).format('MMM D, YYYY, h:mm A')}
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <h6 className='text-base leading-5 font-bold text-blackdark'>Daily Mood : </h6>
                    <span className='text-base leading-5 font-normal text-primarygray'>
                      {wellness?.daily_mood}
                    </span>
                  </div>
                  <div className='flex items-start gap-2 flex-wrap'>
                    <h6 className='text-base leading-5 font-bold text-blackdark'>
                      Daily Gratitude :{' '}
                    </h6>
                    <div className='flex flex-wrap gap-2.5 2xl:flex-1'>
                      {wellness?.daily_gratitude?.length > 0 ? (
                        wellness?.daily_gratitude?.map((tag, tagIndex) => {
                          // Map tag labels to a color
                          const tagColorMap: Record<
                            string,
                            | 'red'
                            | 'yellow'
                            | 'green'
                            | 'blue'
                            | 'orange'
                            | 'purple'
                            | 'gray'
                            | 'indigo'
                            | 'pink'
                          > = {
                            'Anxious but coping': 'blue',
                            'Feeling overwhelmed': 'purple',
                            'Productive today': 'green',
                          };

                          const color = tagColorMap[tag] || 'gray';

                          return (
                            <AlertTag
                              key={tagIndex}
                              tag={tag}
                              color={color}
                              variant='filled'
                              icon={
                                <Icon name='tickcircle' className='icon-wrapper w-18px h-18px' />
                              }
                              className='flex rounded-lg items-center !px-2 py-1.5 text-white !text-sm leading-18px font-medium'
                            />
                          );
                        })
                      ) : (
                        <span className='text-base leading-5 font-normal text-primarygray'>
                          Not Specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className={wellnessIsFetchingNextPage ? 'py-4' : ''}>
              {wellnessIsFetchingNextPage && (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                  <span className='ml-2 text-sm text-blackdark'>Loading more wellness data...</span>
                </div>
              )}
            </div>

            {/* Manual load more button as fallback */}
            {wellnessHasNextPage && !wellnessIsFetchingNextPage && (
              <div className='text-center pt-6'>
                <Button
                  variant='outline'
                  title='Load More Wellness Data'
                  onClick={() => wellnessFetchNextPage()}
                  className='rounded-md hover:bg-primary hover:text-white'
                  isDisabled={wellnessIsFetching}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Side Drawer */}
      <Drawer
        width='w-471px'
        isOpen={therapyGoalSideBar}
        onClose={() => {
          setTherapyGoalSideBar(false);
          setNewGoalsToSubmit([]);
          setExistingGoalsToUpdate([]);
        }}
        title='Manage Therapy Goals'
        footerClassName='border-t border-solid border-surface'
        footer={
          <>
            <Button
              variant='outline'
              title='Cancel'
              onClick={() => {
                setTherapyGoalSideBar(false);
                setNewGoalsToSubmit([]);
                setExistingGoalsToUpdate([]);
              }}
              className='rounded-10px !px-6 min-h-50px'
            />
            <Button
              variant='filled'
              title='Save Therapy Goal'
              onClick={handleTherapyGoalSubmit}
              className='rounded-10px min-h-50px'
              isDisabled={!isSaveButtonEnabled()}
            />
          </>
        }
      >
        <TherapyGoalsContent
          handleGoal={setNewGoalsToSubmit}
          handleExistingGoalUpdate={setExistingGoalsToUpdate}
          handleDeleteGoal={handleDeleteGoal}
          initialData={therapyGoalsItems}
        />
      </Drawer>
    </div>
  );
};

export default WellnessDetails;

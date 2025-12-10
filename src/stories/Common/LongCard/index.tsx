import React, { FC, memo } from 'react';

import type { AllTherapistExperienceResponse } from '@/api/types/common.dto';
import { getMonthNameByMonthNumber, getWorkedDuration } from '@/api/utils';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

interface CardProps {
  data: AllTherapistExperienceResponse;
  isEnd?: boolean;
  onEdit?: (experience_id: string) => void;
  onDelete?: (experience_id: string) => void;
  isEditable?: boolean;
  isChild?: boolean;
}

type DateType = number | null;

const getExperienceDisplayDate = ({
  start_month,
  start_year,
  end_year,
  end_month,
}: {
  start_month: DateType;
  start_year: DateType;
  end_year: DateType;
  end_month: DateType;
}) => {
  return start_month && start_year
    ? `${getMonthNameByMonthNumber(start_month)} ${start_year} - ${
        !end_year && !end_month ? 'Present' : `${getMonthNameByMonthNumber(end_month)} ${end_year}`
      }`
    : 'Invalid Experience';
};

const LongCard: FC<CardProps> = memo(({ data, onEdit, onDelete, isEditable }) => {
  const { organization, location, experiences } = data;

  return (
    <div
      className={`pb-5 mb-5 last:pb-0 last:mb-0 flex relative border-b border-solid border-surface last:border-b-0`}
    >
      {experiences.length > 1 ? (
        <div className='w-full flex flex-col gap-6'>
          <div className='flex flex-col gap-1.5'>
            <h3 className='font-bold text-base leading-22px text-blackdark'>
              {organization || '-'}
            </h3>
            <p className='text-sm font-normal leading-18px text-primarygray'>
              {getWorkedDuration(experiences)}
            </p>
            {/* {location && ( */}
            <p className='text-sm font-normal leading-18px text-primarygray'>{location || '-'}</p>
            {/* )} */}
          </div>
          <div className='flex flex-col gap-6 w-full pl-6'>
            {experiences.map((item, index) => {
              const { designation, start_month, start_year, end_month, end_year } = item;
              return (
                <React.Fragment key={index}>
                  <div className='flex items-start gap-5 justify-between w-full relative before:-left-6 before:h-full before:w-1px before:bg-surface before:absolute last:before:w-0 before:top-6'>
                    <div className='absolute w-2 h-2 rounded-full bg-primarygray -left-6 -ml-[3px] top-2'></div>
                    <div
                      key={item.id ?? `${designation}-${index}`}
                      className='flex flex-col gap-1.5 w-full'
                    >
                      <h3 className='font-bold leading-22px text-blackdark text-base'>
                        {designation || '-'}
                      </h3>
                      <p className='text-sm font-normal leading-18px text-primarygray'>
                        {getExperienceDisplayDate({ start_year, start_month, end_month, end_year })}
                      </p>
                      <p className='text-sm font-normal leading-18px text-primarygray'>
                        {getWorkedDuration(item)}
                      </p>
                    </div>
                    {isEditable && (
                      <div className='flex items-center gap-2.5'>
                        {item.inRequest ? (
                          <span className='rounded-lg bg-primary text-white py-1.5 px-4 text-base leading-22px'>
                            Requested
                          </span>
                        ) : (
                          <>
                            <Button
                              onClick={() => onEdit(item.id)}
                              variant='none'
                              className='w-10 h-10 bg-surface rounded-lg !p-0'
                              aria-label={`Edit ${organization}`}
                              title=''
                              icon={<Icon name='edit' />}
                            />

                            <Button
                              onClick={() => onDelete(item.id)}
                              variant='none'
                              className='w-10 h-10 bg-surface rounded-lg !p-0'
                              aria-label={`Edit ${organization}`}
                              title=''
                              icon={<Icon name='delete' className='text-red' />}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <div className='flex items-start gap-5 justify-between w-full'>
          <div className='flex flex-col gap-1.5'>
            <h3 className='font-bold leading-22px text-blackdark text-base'>
              {experiences[0].designation || '-'}
            </h3>
            <p className='text-sm font-normal leading-18px text-primarygray'>
              {organization || '-'}
            </p>
            <p className='text-sm font-normal leading-18px text-primarygray'>
              {getExperienceDisplayDate({
                start_month: experiences[0].start_month,
                start_year: experiences[0].start_year,
                end_month: experiences[0].end_month,
                end_year: experiences[0].end_year,
              })}
            </p>
            <p className='text-sm font-normal leading-18px text-primarygray'>
              {getWorkedDuration(experiences)}
            </p>
            {/* {location && ( */}
            <p className='text-sm font-normal leading-18px text-primarygray'>{location || '-'}</p>
            {/* )} */}
          </div>
          {isEditable && (
            <div className='flex items-center gap-2.5'>
              {experiences[0].inRequest ? (
                <span className='rounded-full bg-primary/60 text-white py-1 px-4 text-sm leading-5'>
                  Requested
                </span>
              ) : (
                <>
                  <Button
                    onClick={() => onEdit(experiences[0].id)}
                    variant='none'
                    className='w-10 h-10 bg-surface rounded-lg !p-0'
                    aria-label={`Edit ${organization}`}
                    title=''
                    icon={<Icon name='edit' />}
                    isDisabled={experiences[0].inRequest}
                  />
                  <Button
                    onClick={() => onDelete(experiences[0].id)}
                    variant='none'
                    className='w-10 h-10 bg-surface rounded-lg !p-0'
                    aria-label={`Edit ${organization}`}
                    title=''
                    icon={<Icon name='delete' className='text-red' />}
                    isDisabled={experiences[0].inRequest}
                  />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default LongCard;

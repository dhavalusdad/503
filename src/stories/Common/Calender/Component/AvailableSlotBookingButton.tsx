import React, { memo, useCallback } from 'react';

import CheckImage from '@/assets/images/Check.webp';
import type { AvailableSlotBookingButtonInterface } from '@/stories/Common/Calender/types';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
const AvailableSlotBookingButtonComponent: React.FC<AvailableSlotBookingButtonInterface> = ({
  handleConfirmSelection,
  handleSelectionCleaner,
  shouldRenderAppointment,
}) => {
  const stopEventPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const handleConfirmClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      handleConfirmSelection();
    },
    [handleConfirmSelection]
  );

  const handleCancelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleSelectionCleaner?.();
    },
    [handleSelectionCleaner]
  );

  return (
    <div
      draggable={false}
      onMouseDown={stopEventPropagation}
      onMouseUp={stopEventPropagation}
      onClick={stopEventPropagation}
      className='z-10 flex items-center justify-end gap-1.5 absolute bottom-[-1px] right-1 left-1'
    >
      {!shouldRenderAppointment && (
        <>
          <div
            className='cursor-pointer bg-Green select-none text-white rounded-full w-5 h-5 flex items-center justify-center'
            onClick={handleConfirmClick}
          >
            <Image imgPath={CheckImage} alt='check' />
          </div>
          <div
            className='cursor-pointer bg-red text-white rounded-full w-5 h-5 flex items-center justify-center'
            onClick={handleCancelClick}
          >
            <Icon name='close' />
          </div>
        </>
      )}
    </div>
  );
};

export const AvailableSlotBookingButton = memo(AvailableSlotBookingButtonComponent);
AvailableSlotBookingButton.displayName = 'AvailableSlotBookingButton';

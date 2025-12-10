import { type ReactElement } from 'react';

import Tooltip from '@/stories/Common/Tooltip/Tooltip';

import type { Placement } from 'tippy.js';

const TherapistProfileTippy = ({
  children,
  enable = false,
  label = 'Request to update field is sent to admin.',
  placement = 'top',
}: {
  children: ReactElement;
  enable: boolean;
  label?: string;
  placement?: Placement;
}) => {
  return (
    <Tooltip
      placement={placement}
      label={label}
      className=' text-white text-sm px-3 py-1 rounded-lg shadow-lg bg-gray-800'
      disable={!enable}
    >
      {children}
    </Tooltip>
  );
};

export default TherapistProfileTippy;

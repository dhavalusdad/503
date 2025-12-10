import type { ReactElement } from 'react';

import Tippy from '@tippyjs/react/headless';

import type { Placement } from 'tippy.js';

type TippyHoverProps = {
  children: ReactElement;
  className?: string;
  label: string;
  disable?: boolean;
  placement?: Placement;
};

const Tooltip = ({
  children,
  className = 'bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg z-[1000]',
  label = 'demo text',
  disable = false,
  placement = 'right',
}: TippyHoverProps) => {
  if (disable) {
    return children;
  }

  return (
    <Tippy
      render={attrs => (
        <div {...attrs} className={className}>
          {label}
        </div>
      )}
      placement={placement}
    >
      {children}
    </Tippy>
  );
};

export default Tooltip;

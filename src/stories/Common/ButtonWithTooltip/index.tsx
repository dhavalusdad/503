import Button, { type ButtonProps } from '../Button';
import Tooltip from '../Tooltip/Tooltip';

import type { Placement } from 'tippy.js';

export interface ButtonWithTooltipProps extends ButtonProps {
  tooltipLabel: string;
  tooltipClassName?: string;
  tooltipPlacement?: Placement;
  tooltipDisable?: boolean;
}

export const ButtonWithTooltip = ({
  tooltipLabel,
  tooltipClassName,
  tooltipPlacement = 'top',
  tooltipDisable = false,
  ...buttonProps
}: ButtonWithTooltipProps) => {
  return (
    <Tooltip
      label={tooltipLabel}
      className={tooltipClassName}
      placement={tooltipPlacement}
      disable={tooltipDisable}
    >
      <div>
        <Button {...buttonProps} />
      </div>
    </Tooltip>
  );
};

export default ButtonWithTooltip;

import clsx from 'clsx';

import Icon from '@/stories/Common/Icon';

export interface StatusTagProps {
  status: 'active' | 'inactive';
  title: string;
  className?: string;
  titleClassName?: string;
  id?: string;
  parentClassName?: string;
}

export const StatusTag = ({
  status,
  title,
  className,
  titleClassName,
  id,
  parentClassName,
}: StatusTagProps) => {
  const classes = clsx(
    className,
    'group font-normal inline-flex items-center gap-1 text-base justify-center gap-2 px-4 py-2 leading-none rounded-md min-w-28',
    {
      'bg-Greendarklight/6 text-Green border border-Green': status === 'active',
      'bg-red/6 text-red border border-red': status === 'inactive',
    }
  );

  return (
    <div className={clsx('relative', parentClassName)}>
      <div id={id} className={classes}>
        <Icon name='dot' />
        <span className={titleClassName}>{title}</span>
      </div>
    </div>
  );
};

export default StatusTag;

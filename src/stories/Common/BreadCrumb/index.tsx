import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { getDashboardPath } from '@/helper';
import { currentUser } from '@/redux/ducks/user';

interface BreadcrumbProps {
  breadcrumbs: {
    label?: string | ((searchParams: URLSearchParams) => string);
    isActive?: boolean;
    path?: string;
    pathIdName?: string;
  }[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbs, className = '' }) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { role } = useSelector(currentUser);

  const handleBack = (crumb?: BreadcrumbProps['breadcrumbs'][number]) => {
    if (crumb?.path) {
      if (crumb.pathIdName) {
        navigate(crumb.path.replace(`:${crumb.pathIdName}`, `${params[crumb.pathIdName]}`));
      } else {
        navigate(crumb.path);
      }
    }
  };

  const dashboardPath = getDashboardPath(role as UserRole);

  if (location.pathname === dashboardPath) {
    return null;
  }

  return (
    <div
      className={clsx(
        'inline-flex flex-wrap gap-x-2 gap-y-1 items-center text-primarygray font-medium text-sm lg:text-base leading-18px lg:leading-22px ',
        className
      )}
    >
      <span onClick={() => navigate(dashboardPath)} className='cursor-pointer'>
        {'Dashboard'}
      </span>
      {breadcrumbs.map(crumb => (
        <span
          key={crumb.label}
          onClick={() => handleBack(crumb)}
          className={clsx({
            'text-blackdark': crumb.isActive,
            'cursor-pointer': !!crumb.path,
          })}
        >
          {'/ '}
          {crumb.label}
        </span>
      ))}
    </div>
  );
};

export default Breadcrumb;

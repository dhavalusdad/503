import { useEffect } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { UserRole } from '@/api/types/user.dto';
import { getDashboardPath } from '@/helper';
import { currentUser } from '@/redux/ducks/user';

const Root = () => {
  const navigate = useNavigate();
  const { role } = useSelector(currentUser);

  useEffect(() => {
    navigate(getDashboardPath(role as UserRole));
  }, [role]);
  return <div>Root</div>;
};

export default Root;

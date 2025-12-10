// ** Packages **
import { useRouteError } from 'react-router-dom';

import Error from '@/components/common/ErrorBoundary/Error';

interface ErrorElementProps {
  path?: string;
}

export const ErrorElement: React.FC<ErrorElementProps> = ({ path }) => {
  const error = useRouteError();

  return error ? <Error path={path} /> : null;
};

export default ErrorElement;

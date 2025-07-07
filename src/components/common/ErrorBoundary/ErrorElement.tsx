// ** Packages **
import { useRouteError } from 'react-router-dom';
import Error from './Error';

interface ErrorElementProps {
  path?: string;
}

export const ErrorElement: React.FC<ErrorElementProps> = ({ path }) => {
  const error = useRouteError();

  return error ? <Error path={path} /> : null;
};

export default ErrorElement;

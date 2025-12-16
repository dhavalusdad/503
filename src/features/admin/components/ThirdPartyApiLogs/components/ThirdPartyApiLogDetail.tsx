import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

import { useGetThirdPartyApiLogDetails, useRetryThirdPartyApiLog } from '@/api/thirdPartyApiLogs';
import { ROUTES } from '@/constants/routePath';
import { PermissionType } from '@/enums';
import { retryableOperations } from '@/features/admin/components/ThirdPartyApiLogs/constants';
import type { ThirdPartyApiLog } from '@/features/admin/components/ThirdPartyApiLogs/types';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

const ThirdPartyApiLogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { timezone } = useSelector(currentUser);
  const { mutateAsync: retryApi, isPending } = useRetryThirdPartyApiLog();
  const { hasPermission } = useRoleBasedRouting();

  const handleRetry = async () => {
    if (!id) return;
    try {
      await retryApi(id);
    } catch (error) {
      console.error('Retry Third Party API Log failed : ', error);
    }
  };

  if (!id) return <div>No ID provided</div>;

  const { data, isLoading } = useGetThirdPartyApiLogDetails(id);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!data) return <div>No data found</div>;

  const logData = data as ThirdPartyApiLog;

  const renderJsonData = (data: unknown, title: string) => (
    <div className='bg-Gray rounded-lg p-5 border border-solid border-surface'>
      <h4 className='font-bold text-blackdark text-lg leading-6 mb-2'>{title}</h4>
      <pre className='text-xs bg-white p-3 border border-solid border-surface rounded-lg overflow-auto max-h-246px'>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  const getSuccessBadge = (success: boolean) => {
    return (
      <span
        className={clsx(
          'px-3 py-1 rounded-full text-sm font-medium',
          success
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        )}
      >
        {success ? 'SUCCESS' : 'FAILED'}
      </span>
    );
  };

  const getStatusCodeBadge = (statusCode: number) => {
    const isSuccess = statusCode >= 200 && statusCode < 300;
    const isError = statusCode >= 400;

    return (
      <span
        className={clsx(
          'px-3 py-1 rounded-full text-sm font-medium',
          isSuccess
            ? 'bg-green-100 text-green-800 border border-green-200'
            : isError
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        )}
      >
        {statusCode}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodColors = {
      GET: 'bg-blue-100 text-blue-800 border-blue-200',
      POST: 'bg-green-100 text-green-800 border-green-200',
      PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DELETE: 'bg-red-100 text-red-800 border-red-200',
      PATCH: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    const colorClass =
      methodColors[method as keyof typeof methodColors] ||
      'bg-gray-100 text-gray-800 border-gray-200';

    return (
      <span className={clsx('px-3 py-1 rounded-full text-sm font-medium', colorClass)}>
        {method}
      </span>
    );
  };

  return (
    <div className='p-5 bg-white rounded-20px border border-solid border-surface'>
      {/* Header */}
      <div className='flex items-center flex-wrap mb-5'>
        <div className='flex items-center gap-2'>
          <Button
            variant='none'
            onClick={() => navigate(ROUTES.THIRD_PARTY_API_LOGS.path)}
            icon={<Icon name='arrowLeft' className='icon-wrapper w-5 h-5 text-primarygray' />}
            className='!p-0'
            parentClassName='h-5'
          />
          <p className='text-sm leading-18px text-primarygray font-normal'>
            Third Party API Log Details - {logData.id}
          </p>
        </div>
        <div className='flex gap-5 ml-auto'>
          {getSuccessBadge(logData.success)}
          {getStatusCodeBadge(logData.response_status_code)}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* Left Column - Basic Information */}
        <div className='flex flex-col gap-5'>
          {/* API Details */}
          <div className='bg-white border border-solid border-surface rounded-lg p-5'>
            <h3 className='text-lg font-bold text-blackdark leading-6 mb-5'>API Details</h3>
            <div className='flex flex-col gap-3.5'>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Service Name :
                </span>
                <span className='text-base font-normal text-primarygray leading-22px capitalize'>
                  {logData.service_name}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Operation Type :
                </span>
                <span className='text-base font-normal text-primarygray leading-22px capitalize'>
                  {logData.operation_type.replace(/_/g, ' ')}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Request URL :
                </span>
                <span
                  className='text-base font-normal text-primarygray leading-22px max-w-xs truncate'
                  title={logData.request_url}
                >
                  {logData.request_url}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Method :
                </span>
                {getMethodBadge(logData.request_method)}
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Status Code :
                </span>
                {getStatusCodeBadge(logData.response_status_code)}
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Success :
                </span>
                {getSuccessBadge(logData.success)}
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Duration :
                </span>
                <span className='text-base font-normal text-primarygray leading-22px'>
                  {logData.duration_ms}ms
                </span>
              </div>
            </div>
          </div>

          {/* Error Information */}
          {logData.error_message && (
            <div className='bg-white border border-solid border-surface rounded-lg p-5'>
              <h3 className='text-lg font-bold text-blackdark leading-6 mb-5'>Error Information</h3>
              <div className='flex flex-col gap-3.5'>
                <div className='flex items-center justify-between'>
                  <span className='text-base font-semibold text-blackdark leading-22px'>
                    Error Message :
                  </span>
                  <span className='text-base font-normal text-red leading-22px'>
                    {logData.error_message}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className='bg-white border border-solid border-surface rounded-lg p-5'>
            <h3 className='text-lg font-bold text-blackdark leading-6 mb-5'>Timestamps</h3>
            <div className='flex flex-col gap-3.5'>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Created At :
                </span>
                <div className='flex items-center gap-2 text-base font-normal text-primarygray leading-22px'>
                  <span>{moment(logData.created_at).tz(timezone).format('MMM DD, YYYY')}</span>
                  <span>{moment(logData.created_at).tz(timezone).format('h:mm A')}</span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-base font-semibold text-blackdark leading-22px'>
                  Updated At :
                </span>
                <div className='flex items-center gap-2 text-base font-normal text-primarygray leading-22px'>
                  <span>{moment(logData.updated_at).tz(timezone).format('MMM DD, YYYY')}</span>
                  <span>{moment(logData.updated_at).tz(timezone).format('h:mm A')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Request/Response Data */}
        <div className='flex flex-col gap-5'>
          {/* Request Headers */}
          <>{renderJsonData(logData.request_headers, 'Request Headers')}</>

          {/* Request Body */}
          <div className='bg-Gray rounded-lg p-5 border border-solid border-surface'>
            <h4 className='font-bold text-blackdark text-lg leading-6 mb-2'>Request Body</h4>
            <pre className='text-xs bg-white p-3 border border-solid border-surface rounded-lg overflow-auto max-h-246px'>
              {logData.request_body}
            </pre>
          </div>

          {/* Response Headers */}
          <>{renderJsonData(logData.response_headers, 'Response Headers')}</>

          {/* Response Body */}
          <div className='bg-Gray rounded-lg p-5 border border-solid border-surface'>
            <h4 className='font-bold text-blackdark text-lg leading-6 mb-2'>Response Body</h4>
            <pre className='text-xs bg-white p-3 border border-solid border-surface rounded-lg overflow-auto max-h-246px'>
              {logData.response_body}
            </pre>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-5 mt-5 pt-5 border-t border-solid border-surface'>
        {/* <Button
          variant='outline'
          title='Back to List'
          onClick={() => navigate(ROUTES.THIRD_PARTY_API_LOGS.path)}
          className='!px-6 rounded-10px min-h-50px'
        /> */}
        {logData.success === false &&
          retryableOperations.includes(logData.operation_type) &&
          hasPermission(PermissionType.THIRD_PARTY_LOGS_RETRY) && (
            <Button
              variant='filled'
              title='Retry'
              onClick={handleRetry}
              isLoading={isPending}
              className='!px-6 rounded-10px min-h-50px'
            />
          )}
        {logData.success === false &&
          logData.appointment_id &&
          hasPermission(PermissionType.APPOINTMENT_VIEW) && (
            <Button
              variant='outline'
              title='View Appointment'
              onClick={() =>
                navigate(ROUTES.APPOINTMENT_VIEW.navigatePath(logData.appointment_id!))
              }
              className='!px-6 rounded-10px min-h-50px'
            />
          )}
      </div>
    </div>
  );
};

export default ThirdPartyApiLogDetailPage;

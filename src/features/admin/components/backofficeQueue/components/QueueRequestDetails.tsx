import React, { useCallback, useEffect, useMemo, useState } from 'react';

import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { queueQueryKey } from '@/api/common/queue.query';
import { useGetQueueDetails, useUpdateQueueRequest } from '@/api/queueManagement';
import { PermissionType, QueueRequestType, QueueStatus } from '@/enums';
import {
  QUEUE_REQUEST_FIELD_TYPE_BY_TABLE_NAME,
  QUEUE_REQUEST_METADATA_ACTIONS,
  QUEUE_REQUEST_PROFILE_FIELD_TYPE,
  QueueRequestProfileChangeStatus,
  STATUS_STYLE,
  TABLE_NAME_ENUM,
  UpdateQueueRequestDataType,
} from '@/features/admin/components/backofficeQueue/constant';
import { transformTableData } from '@/features/admin/components/backofficeQueue/helper';
import type {
  AuditLog,
  DisplayFieldProps,
  FileItem,
  TableNamesType,
  THERAPIST_BIO_METADATA_TYPE,
} from '@/features/admin/components/backofficeQueue/types';
import { formatLabel, formatStatusLabel } from '@/helper';
import { useInvalidateQuery } from '@/hooks/data-fetching';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import InputField from '@/stories/Common/Input';
import Spinner from '@/stories/Common/Loader/Spinner.tsx';
import Modal from '@/stories/Common/Modal';
import TextArea from '@/stories/Common/Textarea';

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const getProfileImage = (profile: string) => {
  return profile ? `${SERVER_URL}${profile}` : '';
};

const getFieldValue = (fieldVal: string, fieldName: string) => {
  return Array.isArray(fieldVal)
    ? fieldName === 'clinic_address'
      ? fieldVal.join(' || ')
      : fieldVal.join(', ')
    : fieldVal || '';
};

export const DisplayField = ({ label, value }: DisplayFieldProps) => (
  <div className='relative w-full'>
    {label && (
      <label className='text-blackdark text-base font-normal mb-1.5 block leading-5'>{label}</label>
    )}
    <div
      className={clsx(
        'w-full sm:py-3.5 px-3.5 py-3 border border-solid border-surface rounded-10px text-sm text-blackdark',
        'bg-Gray focus:outline-none select-none'
      )}
    >
      {value || '-'}
    </div>
  </div>
);

const CollapsibleSection = ({
  title,
  children,
  status,
  buttons,
}: {
  title: string;
  children: React.ReactNode;
  status: QueueRequestProfileChangeStatus;
  buttons: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className='border border-solid border-surface rounded-10px bg-white'>
      <button
        onClick={() => setOpen(prev => !prev)}
        className={clsx(
          'w-full flex items-center gap-2 p-3 rounded-10px min-h-50px text-left text-base font-semibold hover:bg-surface cursor-pointer',
          open ? 'rounded-b-none' : ''
        )}
      >
        <span>{open ? '▲' : '▼'}</span>
        <span>{title}</span>
        {!open && (
          <span className={`${STATUS_STYLE[status].color}`}>{STATUS_STYLE[status].label}</span>
        )}
      </button>

      {open && (
        <div className='flex flex-col gap-5 p-5 border-t border-solid border-surface'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 items-end'>{children}</div>
          {buttons}
        </div>
      )}
    </div>
  );
};

const QueueRequestDetails: React.FC = () => {
  const { id } = useParams();
  const { timezone } = useSelector(currentUser);
  const { data: queueDetails, isLoading } = useGetQueueDetails(id || '');
  const { hasPermission } = useRoleBasedRouting();

  const { mutate: updateQueue, isPending: isQueueUpdating } = useUpdateQueueRequest();

  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingField, setLoadingField] = useState<string | null>(null);

  const { setValue } = useForm<FormData>({
    mode: 'onChange',
  });

  const { invalidate } = useInvalidateQuery();

  useEffect(() => {
    const latestComment =
      queueDetails?.audit_trails.length > 0
        ? queueDetails?.audit_trails[queueDetails?.audit_trails.length - 1]?.comment
        : '';
    setValue('comment', latestComment);
    const allUploads =
      queueDetails?.audit_trails.length > 0
        ? queueDetails.audit_trails.flatMap((trail: AuditLog) => trail.audit_trail_uploads || [])
        : [];
    if (allUploads.length > 0 && queueDetails?.audit_trails.length > 0) {
      setSelectedFiles(allUploads);
    }
  }, [queueDetails]);

  const getFilePreview = (fileItem: FileItem) => {
    const imageUrl =
      fileItem.image_path || (fileItem.file ? URL.createObjectURL(fileItem.file) : '');

    return (
      <Image
        imgPath={`${SERVER_URL}${imageUrl}`}
        alt={fileItem.name}
        className={` w-full bg-surface rounded-lg aspect-video`}
        imageClassName='object-cover'
      />
    );
  };

  const commanizeName = (name: string) => {
    if (!name) return '';

    return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleAction = async (
    action: string,
    field: string,
    field_type: QUEUE_REQUEST_PROFILE_FIELD_TYPE
  ) => {
    try {
      if (!id) return;
      setLoadingField(`${field}-${action}`);
      await updateQueue(
        {
          data: {
            action,
            field,
            type: UpdateQueueRequestDataType.PROFILE,
            field_type,
          },
          id: id,
        },
        {
          onSuccess: () => {
            invalidate(queueQueryKey.getQueueById(id));
            setTimeout(() => {
              setLoadingField(null);
            }, 0);
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const getButtons = useCallback(
    ({
      type,
      field_name,
      field_status,
    }: {
      type: QUEUE_REQUEST_PROFILE_FIELD_TYPE;
      field_name: string;
      field_status: QueueRequestProfileChangeStatus;
    }) => {
      const isButtonDisabled = [
        QueueRequestProfileChangeStatus.APPROVED,
        QueueRequestProfileChangeStatus.REJECTED,
      ].includes(field_status);

      return (
        <>
          {hasPermission(PermissionType.BACKOFFICE_QUEUE_EDIT) && (
            <div className='flex gap-2'>
              <Button
                key={`${field_name}-${QueueRequestProfileChangeStatus.APPROVED}`}
                variant='filled'
                title='Accept'
                className='rounded-lg !px-2 min-w-28 min-h-50px'
                onClick={() =>
                  handleAction(QueueRequestProfileChangeStatus.APPROVED, field_name, type)
                }
                isDisabled={isButtonDisabled}
                icon={
                  field_status === QueueRequestProfileChangeStatus.APPROVED && (
                    <Icon name='checked' className='icon-wrapper w-5 h-5' />
                  )
                }
                isLoading={
                  isQueueUpdating &&
                  loadingField === `${field_name}-${QueueRequestProfileChangeStatus.APPROVED}`
                }
                isIconFirst={true}
              />
              <Button
                key={`${field_name}-${QueueRequestProfileChangeStatus.REJECTED}`}
                variant='filled'
                title='Reject'
                className='bg-red hover:bg-red/85 border-red hover:border-red/85  rounded-lg !px-2 min-w-28 min-h-50px'
                onClick={() =>
                  handleAction(QueueRequestProfileChangeStatus.REJECTED, field_name, type)
                }
                isDisabled={isButtonDisabled}
                icon={
                  field_status === QueueRequestProfileChangeStatus.REJECTED && (
                    <Icon name='checked' className='icon-wrapper w-5 h-5' />
                  )
                }
                isIconFirst={true}
                isLoading={
                  loadingField === `${field_name}-${QueueRequestProfileChangeStatus.REJECTED}`
                }
              />
            </div>
          )}
        </>
      );
    },
    [isQueueUpdating]
  );

  const isSystemGenerated = useMemo(() => {
    return (
      [
        QueueRequestType.MISSING_SESSION_NOTE,
        QueueRequestType.INSURANCE_VERIFICATION_FAILED,
        QueueRequestType.INCOMPLETE_CLIENT_PROFILE,
      ].includes(queueDetails?.request_type) ||
      (queueDetails?.request_type === QueueRequestType.APPOINTMENT_CANCEL &&
        !!queueDetails.metadata.is_system_generated)
    );
  }, [queueDetails?.request_type, queueDetails?.metadata]);

  const getTableComparisonComponent = (
    tableData: THERAPIST_BIO_METADATA_TYPE[],
    table_name: TableNamesType
  ) => {
    return (
      <div className='flex flex-col gap-5'>
        <>
          <h3 className='text-lg font-bold leading-6 text-blackdark'>{_.capitalize(table_name)}</h3>
          {tableData.map(obj => {
            const modifiedData = transformTableData(obj, table_name);
            const action = obj.action;
            return (
              <CollapsibleSection
                key={obj.id}
                title={
                  table_name === 'experience'
                    ? `${_.capitalize(_.toLower(action))} Experience At ${obj.old_value?.organization || obj.new_value?.organization}`
                    : `${_.capitalize(_.toLower(action))} Degree At ${obj.old_value?.institution || obj.new_value?.institution}`
                }
                status={obj.status}
                buttons={
                  <div className='flex gap-2 justify-end'>
                    {getButtons({
                      type: QUEUE_REQUEST_FIELD_TYPE_BY_TABLE_NAME[table_name],
                      field_name: obj.id,
                      field_status: obj.status,
                    })}
                  </div>
                }
              >
                {modifiedData.map(field => {
                  const oldVal = {
                    label: `Old ${field.label}`,
                    value: field.old_value,
                  };
                  const newVal = {
                    label: `New ${field.label}`,
                    value: field.new_value,
                  };
                  const fieldArr =
                    action === QUEUE_REQUEST_METADATA_ACTIONS.CREATE
                      ? [newVal]
                      : action === QUEUE_REQUEST_METADATA_ACTIONS.UPDATE
                        ? [oldVal, newVal]
                        : action === QUEUE_REQUEST_METADATA_ACTIONS.DELETE
                          ? [oldVal]
                          : [];

                  return (
                    <React.Fragment key={field.label}>
                      {fieldArr.map(arrItem => (
                        <DisplayField
                          label={
                            fieldArr.length === 1
                              ? arrItem.label.split(' ').slice(1).join(' ')
                              : arrItem.label
                          }
                          value={arrItem.value}
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
              </CollapsibleSection>
            );
          })}
        </>
      </div>
    );
  };

  return (
    <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
      {isLoading ? (
        <>
          <Spinner />
        </>
      ) : (
        <div className='flex flex-col gap-5'>
          <h2 className='text-lg font-bold text-blackdark leading-6'>Request Details</h2>
          {/* Appointment Info Grid */}
          <div className='grid grid-cols-2 xl:grid-cols-3 gap-5'>
            <InputField
              readOnly={true}
              type='text'
              label='Ticket Raised'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              value={
                queueDetails?.created_at
                  ? moment(queueDetails.created_at).tz(timezone).format('MMM D, YYYY, h:mm A')
                  : 'Not available'
              }
            />
            <InputField
              type='text'
              readOnly={true}
              label='Ticket Updated'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              value={
                queueDetails?.updated_at
                  ? moment(queueDetails.updated_at).tz(timezone).format('MMM D, YYYY, h:mm A')
                  : 'Not available'
              }
            />
            <InputField
              type='text'
              readOnly={true}
              label='Request Type'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              value={formatLabel(queueDetails?.request_type)}
            />
            <InputField
              type='text'
              readOnly={true}
              label='Requester'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              value={
                isSystemGenerated
                  ? 'System Generated'
                  : `${queueDetails?.requester?.first_name} ${queueDetails?.requester?.last_name} (${queueDetails?.requester?.roles[0]?.name || ''})`
              }
            />
            <InputField
              type='text'
              readOnly={true}
              label='Status'
              labelClass='!text-base'
              inputClass='!text-base !leading-5'
              value={
                queueDetails?.status === QueueStatus.IN_PROGRESS
                  ? 'In Progress'
                  : queueDetails?.status
              }
            />

            {isSystemGenerated && (
              <>
                {/* Patient Name */}
                <InputField
                  type='text'
                  readOnly={true}
                  label='Patient Name'
                  labelClass='!text-base'
                  inputClass='!text-base !leading-5'
                  value={`${queueDetails?.appointment?.client?.user?.first_name || ''} ${queueDetails?.appointment?.client?.user?.last_name || ''}`}
                />
                {/* Therapist Name */}
                <InputField
                  type='text'
                  readOnly={true}
                  label='Therapist Name'
                  labelClass='!text-base'
                  inputClass='!text-base !leading-5'
                  value={`${queueDetails?.appointment?.therapist?.user?.first_name || ''} ${queueDetails?.appointment?.therapist?.user?.last_name || ''}`}
                />

                {/* Appointment Date & Time */}
                <InputField
                  type='text'
                  readOnly={true}
                  label='Appointment Date & Time'
                  labelClass='!text-base'
                  inputClass='!text-base !leading-5'
                  value={
                    queueDetails?.appointment?.slot?.start_time
                      ? `${moment(queueDetails.appointment.slot.start_time).tz(timezone).format('MMM D, YYYY, h:mm A')} - ${moment(queueDetails.appointment.slot.end_time).tz(timezone).format('h:mm A')}`
                      : 'Not Available'
                  }
                />

                {/* Form Name (Only for missing_session_note) */}
                {queueDetails?.request_type === QueueRequestType.MISSING_SESSION_NOTE &&
                  queueDetails?.metadata?.form_name && (
                    <InputField
                      type='text'
                      readOnly={true}
                      label='Form Name'
                      labelClass='!text-base'
                      inputClass='!text-base !leading-5'
                      value={queueDetails.metadata.form_name}
                    />
                  )}

                {queueDetails.metadata &&
                  queueDetails?.request_type !== QueueRequestType.INSURANCE_VERIFICATION_FAILED && (
                    <InputField
                      type='text'
                      readOnly={true}
                      label='Reason'
                      labelClass='!text-base'
                      inputClass='!text-base !leading-5'
                      value={queueDetails?.metadata.cancellation_reason}
                    />
                  )}
              </>
            )}
          </div>
          <TextArea
            name='comment'
            rows={3}
            placeholder='comments'
            label='Comments'
            labelClass='!text-base'
            className={`rounded-10px`}
            parentClassName='w-full'
            value={queueDetails?.comment}
            isDisabled={true}
          />
          <div className='flex flex-col gap-5 bg-white rounded-10px border border-solid border-surface p-5'>
            <h5 className='text-lg font-bold text-blackdark leading-6'>Uploaded Files</h5>
            {selectedFiles.length === 0 && (
              <div className='text-center inline-block mx-auto'>
                <div className='flex items-center gap-2.5 px-5 py-3 rounded-10px bg-surface'>
                  <Icon name='file' className='text-blackdark' />
                  <h3 className='text-base font-semibold text-blackdark leading-6'>
                    No files uploaded
                  </h3>
                </div>
              </div>
            )}
            {selectedFiles.length > 0 && (
              <>
                <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'>
                  {selectedFiles.map(fileItem => (
                    <div
                      key={fileItem.id}
                      className='relative group rounded-lg overflow-hidden bg-white cursor-pointer'
                      onClick={() => setPreviewImage(`${SERVER_URL}${fileItem.image_path}`)}
                    >
                      {/* File Preview */}
                      {getFilePreview(fileItem, false)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {queueDetails?.request_type === 'therapist_profile_change' &&
            (queueDetails?.metadata?.profile?.length ||
              queueDetails?.metadata?.experience?.length ||
              queueDetails?.metadata?.education?.length) && (
              <div className='flex flex-col gap-5'>
                <h3 className='text-lg font-bold leading-6 text-blackdark'>
                  Therapist Profile Changes
                </h3>
                <div className='flex flex-col gap-5'>
                  {queueDetails?.metadata.profile?.length ? (
                    <>
                      <h3 className='text-lg font-bold leading-6 text-blackdark'>Profile</h3>
                      {queueDetails?.metadata.profile.map(
                        (field: THERAPIST_BIO_METADATA_TYPE, index: number) => (
                          <div
                            key={index}
                            className='flex gap-5 items-end flex-wrap md:justify-end xl:justify-normal'
                          >
                            <div className='flex items-center gap-5 w-full flex-col lg:flex-row xl:flex-1'>
                              <DisplayField
                                label={`Old ${commanizeName(field.field_name)}`}
                                value={getFieldValue(field.old_value as string, field.field_name)}
                              />
                              <DisplayField
                                value={getFieldValue(field.new_value as string, field.field_name)}
                                label={`New ${commanizeName(field.field_name)}`}
                              />
                            </div>
                            <div className='flex gap-2'>
                              {getButtons({
                                type: QUEUE_REQUEST_PROFILE_FIELD_TYPE.PROFILE,
                                field_name: field.field_name,
                                field_status: field.status,
                              })}
                            </div>
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </div>
                {queueDetails?.metadata.experience?.length &&
                  getTableComparisonComponent(
                    queueDetails?.metadata.experience,
                    TABLE_NAME_ENUM.EXPERIENCE
                  )}
                {queueDetails?.metadata.education?.length &&
                  getTableComparisonComponent(
                    queueDetails?.metadata.education,
                    TABLE_NAME_ENUM.EDUCATION
                  )}
              </div>
            )}

          {/* Insurance Verification Failed Carriers View */}
          {queueDetails?.request_type === QueueRequestType.INSURANCE_VERIFICATION_FAILED &&
            queueDetails?.metadata?.carriers?.length > 0 && (
              <div className='col-span-3'>
                <h3 className='text-lg font-bold text-blackdark mb-3'>
                  Failed Insurance Verifications
                </h3>

                <div className='grid gap-5 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'>
                  {queueDetails.metadata.carriers.map((carrier, index) => (
                    <div
                      key={index}
                      className='border border-solid border-surface rounded-2xl p-5 bg-Gray flex flex-col gap-3.5'
                    >
                      <div className='flex items-center justify-between'>
                        <p className='text-base leading-5 font-bold text-blackdark'>#{index + 1}</p>
                        <span
                          className={`text-xs font-semibold px-3.5 py-1 rounded-full ${
                            carrier.status === 'failed'
                              ? 'bg-red-100 border border-solid border-red-300 text-red-600'
                              : 'bg-yellow-100 border border-solid border-yellow-300 text-yellow-700'
                          }`}
                        >
                          {carrier.status?.toUpperCase() || 'FAILED'}
                        </span>
                      </div>
                      <div className='flex items-center gap-5 justify-between'>
                        <p className='text-base leading-5 font-bold text-blackdark'>Carrier Name</p>
                        <p className='font-normal text-primarygray text-sm leading-18px'>
                          {carrier.carrier_name || 'Unknown Carrier'}
                        </p>
                      </div>
                      <div className='flex items-center gap-5 justify-between'>
                        <p className='text-base leading-5 font-bold text-blackdark'>Reason</p>
                        <p className='text-sm leading-18px text-red-600 bg-red-100 rounded-full py-1 px-3.5'>
                          {carrier.reason || 'No reason specified'}
                        </p>
                      </div>
                      {carrier.member_id && (
                        <div className='flex items-center gap-5 justify-between'>
                          <p className='text-base leading-5 font-bold text-blackdark'>Member ID</p>
                          <p className='font-normal text-primarygray text-sm leading-18px'>
                            {carrier.member_id}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          <Modal
            isOpen={!!previewImage}
            onClose={() => setPreviewImage(null)}
            size='2xl'
            closeButton={false}
            parentClassName='items-center justify-center'
            contentClassName='!p-0 !m-0 !border-0 !max-h-none overflow-hidden bg-transparent'
            className='bg-transparent shadow-none'
          >
            {previewImage && (
              <div className='relative flex justify-center items-center bg-transparent'>
                <Button
                  onClick={() => setPreviewImage(null)}
                  variant='filled'
                  className='!p-1 !rounded-full z-50 bg-black/60 text-white hover:bg-black/80 transition'
                  title=''
                  parentClassName='!absolute top-4 right-4'
                  icon={<Icon name='close' />}
                />
                <img
                  src={previewImage}
                  alt='Preview'
                  className='max-h-[90vh] max-w-[95vw] object-contain'
                />
              </div>
            )}
          </Modal>
          {queueDetails?.audit_trails?.length > 0 && (
            <h2 className='text-lg font-bold text-blackdark leading-6'>Audit Trail</h2>
          )}
          {queueDetails?.audit_trails?.length > 0 &&
            queueDetails?.audit_trails.map((audit_log: AuditLog) => (
              <div className='border border-solid border-surface rounded-20px p-5'>
                <div className='flex flex-col gap-2.5'>
                  <div className='flex items-center gap-2.5'>
                    <Image
                      imgPath={getProfileImage(audit_log?.user_info?.profile_image)}
                      firstName={audit_log?.user_info?.first_name}
                      lastName={audit_log?.user_info?.last_name}
                      alt='User Avatar'
                      imageClassName='rounded-full object-cover object-center w-full h-full'
                      className='w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface'
                      initialClassName='!text-base'
                    />
                    <h3 className='text-base font-semibold leading-22px text-blackdark'>
                      {audit_log.user_info.first_name}{' '}
                      {audit_log.comment
                        ? 'has commented on this and changed status to'
                        : 'has changed status to'}{' '}
                      {formatStatusLabel(queueDetails.status)}.
                    </h3>
                  </div>
                  <p className='text-primarygray text-base leading-22px font-normal'>
                    {audit_log.comment ? commanizeName(audit_log.comment) : 'No comment provided.'}
                  </p>
                  <p className='text-primarygray text-base leading-22px font-normal'>
                    {`From ${formatStatusLabel(audit_log?.prev_status)} -> ${formatStatusLabel(audit_log?.next_status)}.`}{' '}
                  </p>
                  {audit_log?.audit_trail_uploads?.length > 0 && (
                    <div className='grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2.5'>
                      {audit_log?.audit_trail_uploads.map(fileItem => (
                        <div
                          key={fileItem.id}
                          className='relative group rounded-lg overflow-hidden bg-white'
                        >
                          {/* File Preview */}
                          {getFilePreview(fileItem, false)}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className='text-primarygray text-sm leading-18px font-normal'>
                    {moment(audit_log.updated_at).tz(timezone).format('MMM D, YYYY, h:mm A')}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default QueueRequestDetails;

import { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';

import { useGetAppointmentDetails } from '@/api/appointment';
import {
  useCreateNote,
  useGetNoteById,
  useInfiniteNotesByAppointment,
  useUpdateNote,
} from '@/api/note';
import { useGetSessionTagById } from '@/api/tag';
import type { AppointmentDetailsAreaOfFocus } from '@/api/types/calendar.dto';
import { ROUTES } from '@/constants/routePath';
import { AppointmentStatus, SessionType } from '@/enums';
import { getProfileImage } from '@/features/admin/components/appointmentList/components/AppointmentView';
import type { UserAppointment } from '@/features/admin/components/appointmentList/types';
import { AppointmentStatusBadge } from '@/features/appointment/component/AppointmentStatusBadge';
import MemberCard from '@/features/appointment/component/ClientAppointmentsBooking/MemberCard';
import { useGetNotesColumns } from '@/features/appointment/component/TherapistAppointment/AppointmentColumns';
import AppointmentMarkAsCompletedModal from '@/features/appointment/component/TherapistAppointment/AppointmentMarkAsCompletedModal';
import { checkIfSessionCanBeStarted, START_TIME_DIFFERENCE } from '@/features/appointment/helper';
import type { SessionNote, TabsInterface } from '@/features/appointment/types';
import { noteSchema } from '@/features/appointment/validation';
import { normalizeText } from '@/helper';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import { InfiniteTable } from '@/stories/Common/InfiniteTable';
import useInfiniteTableManagement from '@/stories/Common/InfiniteTable/hook';
import InputField from '@/stories/Common/Input';
import Modal from '@/stories/Common/Modal';
import { NoteCard } from '@/stories/Common/NoteCard';
import RichTextEditorField from '@/stories/Common/RichTextEditer';
import SwiperComponent from '@/stories/Common/Swiper';
import TagsCell from '@/stories/Common/TagsCell';

interface NotesQueryParams {
  limit?: number;
  sortColumn?: string;
  sortOrder?: string;
  search?: string;
}
export interface SessionTag {
  id: string;
  name: string;
}

export interface AppointmentSessionTagResult {
  session_tag: SessionTag;
}

// Final response type
export type AppointmentSessionTagResponse = AppointmentSessionTagResult[];

type ModalType = {
  markAsCompleted: boolean;
  addNote: boolean;
};

const tabToNoteType: Record<'before' | 'during' | 'after', string> = {
  before: 'PreAppointment',
  during: 'DuringAppointment',
  after: 'PostAppointment',
};

const noteTypeToTab = {
  PreAppointment: 'before',
  DuringAppointment: 'during',
  PostAppointment: 'after',
} as const;

const AppointmentDetail = () => {
  const { appointment_id: appointmentId } = useParams<{
    appointment_id: string;
  }>();
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('note');
  const location = useLocation();
  const navigate = useNavigate();

  // ** Redux State **
  const { timezone, tenant_id } = useSelector(currentUser);

  // ** States **
  const [activeTab, setActiveTab] = useState<keyof typeof tabToNoteType>('before');
  const [openModal, setOpenModal] = useState({
    addNote: false,
    markAsCompleted: false,
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(noteId);
  const [noteContent, setNoteContent] = useState({
    title: '',
    content: '',
  });
  // const [content, setContent] = useState<string>('');

  // ** Constants **
  const noteType = tabToNoteType[activeTab];
  const { openNotes } = location?.state || { openNotes: undefined };

  // ** Services **
  const { data: appointmentDetails } = useGetAppointmentDetails(appointmentId || '');
  const { data: selectedNote } = useGetNoteById(selectedNoteId ?? '');
  const { mutateAsync: createNote } = useCreateNote(appointmentId!, noteType, tenant_id!);
  const { data: sessionTags } = useGetSessionTagById(appointmentId);

  const tagCellOption = sessionTags?.map(
    (session_tag: AppointmentSessionTagResult) => session_tag.session_tag
  );

  // ** Custom Hooks **
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loaderRef,
    sorting,
    setSorting,
    onSortingChange,
    apiData,
  } = useInfiniteTableManagement<SessionNote, NotesQueryParams>({
    apiCall: params =>
      useInfiniteNotesByAppointment({
        appointment_id: appointmentId!,
        note_type: noteType,
        enabled: !!appointmentId && !!noteType,
        limit: params.limit || 10,
        sortColumn: params.sortColumn,
        sortOrder: params.sortOrder,
        search: params.search,
        tenant_id,
      }),
    initialQueryParams: {
      sortColumn: 'created_at',
      sortOrder: 'desc',
    },
    defaultPageSize: 10,
  });

  useEffect(() => {
    if (openNotes) {
      openCloseModal('addNote', true);
    }
  }, [openNotes]);

  // ** Services **
  const { isLoading } = apiData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
    },
    mode: 'onChange',
    resolver: yupResolver(noteSchema),
  });

  const isLogSessionButtonDisabled = useMemo(() => {
    if (!appointmentDetails) return;
    const { slot } = appointmentDetails;
    const { minutesDiff } = checkIfSessionCanBeStarted({
      start_time: slot?.start_time,
      end_time: slot?.end_time,
      timezone,
    });
    return minutesDiff > START_TIME_DIFFERENCE;
  }, [appointmentDetails]);

  const openCloseModal = (modalName: keyof ModalType, actionBool: boolean, id?: string) => {
    setOpenModal(prev => ({
      ...prev,
      [modalName]: actionBool,
      id: id ?? undefined,
    }));
  };

  const closeNoteModal = () => {
    openCloseModal('addNote', false);
    reset();
  };

  const handleEdit = (note_id: string) => {
    setSelectedNoteId(note_id);
  };

  useEffect(() => {
    if (selectedNote) {
      setNoteContent(selectedNote);
    }
  }, [selectedNote, selectedNoteId]);

  const { columns } = useGetNotesColumns(selectedNoteId);
  const { mutateAsync: updateNote } = useUpdateNote(appointmentId!, noteType);

  const onSubmit = async (
    { title, content }: { title: string; content: string },
    action: 'save' | 'draft'
  ) => {
    if (!appointmentDetails) return;

    try {
      const createdNote = await createNote({
        data: {
          appointment_id: appointmentDetails.id,
          therapist_id: appointmentDetails.therapist.id,
          client_id: appointmentDetails.client.id,
          title: title.trim(),
          content: content,
          is_draft: action === 'draft' ? true : false,
        },
      });
      // setContent('');
      closeNoteModal();
      setActiveTab(
        noteTypeToTab[createdNote?.data?.note_type as keyof typeof noteTypeToTab] ?? 'before'
      );
      setSelectedNoteId(createdNote?.data?.id);
    } catch (error) {
      console.error(error);
    }
  };

  const isBookedByClickable =
    appointmentDetails?.booked_by_user?.id === appointmentDetails?.client?.user?.id;

  // if (!appointmentDetails) {
  //   return (
  //     <div className='flex justify-center items-center h-64'>Loading appointment details...</div>
  //   );
  // }

  return (
    <div className='flex flex-col md:gap-6 gap-3'>
      {/* Appointment Details Card */}
      <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
        <div className='flex flex-wrap gap-3 items-center justify-between mb-3.5 border-b border-surface pb-3.5'>
          <h2 className='text-lg font-bold text-blackdark'>Appointment Details</h2>
          <div className='flex items-center gap-2'>
            <span className='text-primarygray text-base font-normal'>Status:</span>
            <AppointmentStatusBadge status={appointmentDetails?.status} type='appointment_status' />
            {![AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW].includes(
              appointmentDetails?.status
            ) && (
              <Button
                variant='filled'
                title='Log Session Time'
                className='rounded-lg'
                onClick={() => openCloseModal('markAsCompleted', true)}
                isDisabled={
                  appointmentDetails?.session_type === SessionType.VIRTUAL
                    ? isLogSessionButtonDisabled
                    : false
                }
              />
            )}
          </div>
        </div>

        <div className='grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 mb-5'>
          {/* Client */}
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Booked By</h3>
            <div
              className={clsx('flex items-center gap-3', isBookedByClickable && 'cursor-pointer')}
              onClick={
                isBookedByClickable
                  ? () =>
                      navigate(ROUTES.MY_CLIENT_DETAIL.navigatePath(appointmentDetails?.client?.id))
                  : undefined
              }
            >
              <Image
                imgPath={getProfileImage(appointmentDetails?.booked_by_user?.profile_image)}
                firstName={
                  appointmentDetails?.booked_by_user?.first_name ||
                  appointmentDetails?.therapist?.user?.first_name
                }
                lastName={
                  appointmentDetails?.booked_by_user?.last_name ||
                  appointmentDetails?.therapist?.user?.last_name
                }
                alt='User Avatar'
                imageClassName='rounded-full object-cover object-center w-full h-full'
                className='w-10 min-w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface'
                initialClassName='!text-base'
              />
              <p
                className={clsx(
                  'text-base font-bold leading-22px text-primary',
                  isBookedByClickable && 'hover:underline cursor-pointer underline-offset-2'
                )}
              >
                {appointmentDetails?.booked_by_user?.first_name ||
                  appointmentDetails?.therapist?.user?.first_name}{' '}
                {appointmentDetails?.booked_by_user?.last_name ||
                  appointmentDetails?.therapist?.user?.last_name}
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Client Name</h3>
            <div
              className='flex items-center gap-3 cursor-pointer'
              onClick={() =>
                navigate(ROUTES.MY_CLIENT_DETAIL.navigatePath(appointmentDetails?.client?.id))
              }
            >
              <Image
                imgPath={getProfileImage(appointmentDetails?.client?.user?.profile_image)}
                firstName={appointmentDetails?.client?.user?.first_name}
                lastName={appointmentDetails?.client?.user?.last_name}
                alt='User Avatar'
                imageClassName='rounded-full object-cover object-center w-full h-full'
                className='w-10 min-w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface'
                initialClassName='!text-base'
              />
              <p className='text-base font-bold leading-22px text-primary hover:underline cursor-pointer underline-offset-2'>
                {appointmentDetails?.client?.user?.first_name}{' '}
                {appointmentDetails?.client?.user?.last_name}
              </p>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Therapist Name</h3>
            <div className='flex items-center gap-3'>
              <Image
                imgPath={getProfileImage(appointmentDetails?.therapist?.user?.profile_image)}
                firstName={appointmentDetails?.therapist?.user?.first_name}
                lastName={appointmentDetails?.therapist?.user?.last_name}
                alt='User Avatar'
                imageClassName='rounded-full object-cover object-center w-full h-full'
                className='w-10 min-w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-surface'
                initialClassName='!text-base'
              />
              <p className='text-base font-bold leading-22px text-primary'>
                {appointmentDetails?.therapist?.user?.first_name}{' '}
                {appointmentDetails?.therapist?.user?.last_name}
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Booked On</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.created_at
                ? moment.tz(moment(appointmentDetails?.created_at), timezone).format('MMM DD, YYYY')
                : 'Not available'}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Appointment Date</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.slot?.start_time
                ? moment(appointmentDetails.slot.start_time)
                    .tz(timezone)
                    .format('dddd, MMMM D, YYYY')
                : 'Not available'}
            </p>
          </div>

          {/* Appointment Info Grid */}
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Appointment Time</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.slot?.start_time && appointmentDetails?.slot?.end_time
                ? moment(appointmentDetails.slot.start_time).tz(timezone).format('hh:mm A')
                : 'Not available'}
            </p>
          </div>

          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Appointment Type</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.amd_appointment_types &&
              appointmentDetails.amd_appointment_types.length > 0
                ? appointmentDetails.amd_appointment_types
                    .map((type: { amd_id: string; name: string }) => normalizeText(type.name))
                    .join(', ')
                : 'Not specified'}
            </p>
          </div>

          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Duration</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.status === AppointmentStatus.COMPLETED
                ? (() => {
                    const startTime = appointmentDetails?.logged_start_time
                      ? appointmentDetails?.logged_start_time
                      : appointmentDetails?.actual_start_time;
                    const endTime = appointmentDetails?.logged_end_time
                      ? appointmentDetails?.logged_end_time
                      : appointmentDetails?.actual_end_time;

                    if (!startTime || !endTime) return 'Not available';

                    const duration = Math.round(moment(endTime).diff(moment(startTime), 'minutes'));
                    return duration ? `${duration} minutes` : 'Not available';
                  })()
                : 'Not available'}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Area of Focus</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.appointment_area_of_focus &&
              appointmentDetails.appointment_area_of_focus.length > 0
                ? appointmentDetails.appointment_area_of_focus
                    .map((area: AppointmentDetailsAreaOfFocus) => area.area_of_focus?.name)
                    .join(', ')
                : 'Not specified'}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Therapy Type</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.therapy_type?.name || 'Not specified'}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Session Type</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.session_type || 'Not specified'}
            </p>
          </div>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Session Type</h3>
            <p className='text-base font-normal leading-22px text-primarygray'>
              {appointmentDetails?.payment_method?.name || 'Not specified'}
            </p>
          </div>
          {appointmentDetails?.session_type === SessionType.CLINIC && (
            <div className='flex flex-col gap-1.5'>
              <h3 className='text-base font-bold text-blackdark leading-22px'>Clinic Address</h3>
              <p className='text-base font-normal leading-22px text-primarygray break-words'>
                {appointmentDetails?.clinic_display_name
                  ? `${appointmentDetails?.clinic_address?.name} - ${[appointmentDetails?.clinic_address?.address, appointmentDetails?.clinic_address?.city?.name, appointmentDetails?.clinic_address?.state?.name].filter(Boolean).join(', ')}`
                  : 'Not available'}
              </p>
            </div>
          )}
          <div className='flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3 2xl:col-span-4'>
            <h3 className='text-base font-bold text-blackdark leading-22px'>Reason for Visit</h3>
            <p className='text-base font-normal leading-22px text-primarygray break-all'>
              {appointmentDetails?.appointment_reason || 'No reason provided'}
            </p>
          </div>
          {(tagCellOption || []).length ? (
            <div className='flex flex-wrap items-center gap-2'>
              <span>Session Tags</span>
              {tagCellOption && <TagsCell tags={tagCellOption} />}
            </div>
          ) : (
            <></>
          )}
        </div>
        {/* member card  */}

        {appointmentDetails?.users_appointment &&
          appointmentDetails?.users_appointment.length > 0 && (
            <div className='flex flex-col gap-5'>
              <div className='bg-blackdark/12 h-1px w-full'></div>
              <div className='flex items-center gap-2'>
                <h5 className='text-lg font-bold text-blackdark leading-6'>Dependents List</h5>
                <span className='min-w-5 min-h-5 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center'>
                  {appointmentDetails.users_appointment.length}
                </span>
              </div>
              <div>
                <SwiperComponent
                  slidesPerView={1}
                  spaceBetween={15}
                  className='w-full'
                  breakpoints={{
                    576: {
                      slidesPerView: 1,
                    },
                    768: {
                      slidesPerView: 1.5,
                    },
                    1024: {
                      slidesPerView: 2,
                    },
                    1280: {
                      slidesPerView: 2.3,
                    },
                    1536: {
                      slidesPerView: 3,
                    },
                  }}
                >
                  {appointmentDetails.users_appointment.map(
                    (item: UserAppointment, index: number) => (
                      <div key={item.user.id} className='w-full'>
                        <MemberCard member={item.user} index={index} showDeleteButton={false} />
                      </div>
                    )
                  )}
                </SwiperComponent>
              </div>
            </div>
          )}
      </div>

      {/* Session Notes Card */}
      <div className='bg-white rounded-20px p-5 border border-solid border-surface'>
        <div className='flex flex-wrap gap-3 items-center justify-between mb-5 pb-3.5 border-b border-solid border-surface  '>
          <h2 className='text-lg font-bold text-blackdark'>Session Memo</h2>
          <Button
            variant='filled'
            title='Add Memo'
            className='rounded-lg'
            onClick={() => openCloseModal('addNote', true)}
            icon={<Icon name='plus' className='icon-wrapper' />}
            isIconFirst
          />
        </div>

        {/* Tab Navigation */}
        <div className='flex gap-8 mb-5 border-b border-surface'>
          {[
            { key: 'before', label: 'Before Session' },
            { key: 'during', label: 'During Session' },
            { key: 'after', label: 'After Session' },
          ].map(tab => (
            <Button
              key={tab.key}
              variant='none'
              onClick={() => {
                setActiveTab(tab?.key as TabsInterface['key']);
                setNoteContent({ title: '', content: '' });
                setSelectedNoteId(null);
              }}
              className={`pb-3 text-sm font-medium transition-colors !rounded-[0px] ${
                activeTab === tab.key
                  ? 'text-blackdark border-b-2 border-primary '
                  : 'text-primarygray'
              }`}
              title={activeTab === tab.key ? `${tab.label} (${data?.length})` : tab.label}
            />
          ))}
        </div>

        <div className='flex lg:flex-row flex-col gap-5'>
          {/* Notes Table */}
          <div className='flex-1'>
            <InfiniteTable
              data={data}
              columns={columns}
              loaderRef={loaderRef}
              isFetchingNextPage={isFetchingNextPage}
              activeRowClassName={'!bg-primary border-none'}
              tdClassName='first:rounded-l-10px last:rounded-r-10px'
              hasNextPage={hasNextPage}
              onLoadMore={fetchNextPage}
              sorting={sorting}
              setSorting={setSorting}
              onSortingChange={onSortingChange}
              onRowClick={row => {
                if (row?.id) {
                  handleEdit(row.id);
                }
              }}
              selectedRowId={selectedNoteId}
              className='max-h-500px'
              isLoading={isLoading}
            />
          </div>

          {/* Note Detail Panel */}
          <div className='flex-1'>
            {noteContent.title ? (
              <NoteCard
                {...noteContent}
                onSave={async ({ title, content, is_draft }) => {
                  await updateNote({
                    id: selectedNoteId,
                    data: { title: title.trim(), content: content.trim(), is_draft },
                  });
                }}
                // onDiscard={() => console.log('data')}
              ></NoteCard>
            ) : (
              <div className='text-center text-primarygray text-lg font-semibold sm:mt-8 mt-3'>
                Select a memo to view details
              </div>
            )}
          </div>
        </div>
      </div>
      {/* updated modeal */}
      <Modal
        isOpen={openModal.addNote}
        title='Add New Memo'
        onClose={() => {
          openCloseModal('addNote', false);
          reset();
          // setContent('');
        }}
        footer={
          <div className='flex items-center gap-5 justify-end'>
            <Button
              variant='filled'
              title='Save as Draft'
              className='!px-4 rounded-10px'
              onClick={handleSubmit(data => onSubmit(data, 'draft'))}
            />
            <Button
              variant='filled'
              title='Save Memo'
              className='!px-4 rounded-10px'
              onClick={handleSubmit(data => onSubmit(data, 'save'))}
            />
          </div>
        }
      >
        <div className='flex flex-col gap-5'>
          <InputField
            label='Title'
            name='title'
            register={register}
            error={errors.title?.message}
            type='text'
            placeholder='Memo Title'
            className='w-full'
          />
          {/* <TextArea
            label='Content'
            name='content'
            register={register}
            error={errors.content?.message}
            placeholder='Write your memo here...'
            labelClass='!text-base !leading-22px'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none'
            rows={6}
          /> */}
          <RichTextEditorField
            onChange={note => {
              setValue('content', note, { shouldDirty: true, shouldValidate: true });
            }}
            value={getValues('content')}
            placeholder='Write your memo here...'
            label='Content'
            isRequired={true}
            className='border border-gray-300 rounded-lg'
            parentClassName='w-full'
            error={errors?.content?.message}
          />
        </div>
      </Modal>

      {openModal.markAsCompleted && appointmentId && (
        <AppointmentMarkAsCompletedModal
          appointment_id={appointmentId}
          openModal={openModal.markAsCompleted}
          onClose={() => openCloseModal('markAsCompleted', false)}
          session_type={appointmentDetails?.session_type}
        />
      )}
    </div>
  );
};

export default AppointmentDetail;

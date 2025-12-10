// import { useEffect } from 'react';

// import moment from 'moment';
// import { useForm } from 'react-hook-form';

// import Modal from '@/stories/Common/Modal';

// type AppointmentFormData = {
//   date: string; // YYYY-MM-DD
//   time: string; // HH:mm
//   clientName: string;
//   therapistName: string;
//   therapyType: string;
//   status: string;
// };

// interface DefaultAppointmentFormData {
//   date: string; // YYYY-MM-DD
//   time: string; // HH:mm
//   clientName: string;
//   therapistName: string;
//   therapyType: string;
//   status: string;
// }

// interface AppointmentListModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: {
//     date: Date | null; // UTC datetime
//     clientName: string;
//     therapistName: string;
//     therapyType: string;
//     status: string;
//   }) => void;
//   defaultValues: DefaultAppointmentFormData;
//   isEditing?: boolean;
//   readOnly?: boolean;
// }

// const therapyOptions: OptionTypeGlobal[] = [
//   { value: 'Individual Therapy', label: 'Individual Therapy' },
//   { value: 'Group Therapy', label: 'Group Therapy' },
//   { value: 'Family Therapy', label: 'Family Therapy' },
//   {value:"Couples Therapy",label:"Couples Therapy"}
// ];

// const statusOptions: OptionTypeGlobal[] = [
//   { value: 'Scheduled', label: 'Scheduled' },
//   { value: 'Upcoming', label: 'Upcoming' },
//   { value: 'In progress', label: 'In progress' },
//   { value: 'Completed', label: 'Completed' },
//   { value: 'Cancelled', label: 'Cancelled' },
//   { value: 'No show', label: 'No show' },
//   { value: 'Escalated', label: 'Escalated' },
// ];

// export const AppointmentListModal: React.FC<AppointmentListModalProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   defaultValues,
//   isEditing = false,
//   readOnly = false,
// }) => {
//   const {
//     handleSubmit,
//     register,
//     watch,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm<AppointmentFormData>({
//     mode: 'onChange',
//     defaultValues: {
//       date: '',
//       time: '',
//       clientName: '',
//       therapistName: '',
//       therapyType: '',
//       status: '',
//     },
//   });

//   const watchedDate = watch('date');
//   const watchedTime = watch('time');
//   const therapyValue = watch('therapyType');
//   const statusValue = watch('status');

//   // Safe conversion for DatePicker with better validation
//   const getValidDate = (dateStr: string) => {
//     if (!dateStr || typeof dateStr !== 'string') return null;

//     // Try to parse with moment first for better validation
//     const momentDate = moment(dateStr, 'YYYY-MM-DD', true);
//     if (momentDate.isValid()) {
//       return momentDate.toDate();
//     }

//     // Fallback to native Date parsing
//     const d = new Date(dateStr);
//     return isNaN(d.getTime()) ? null : d;
//   };

//   // Safe time parsing for TimeSelect
//   const getValidTimeDate = (dateStr: string, timeStr: string) => {
//     if (!dateStr || !timeStr) return null;

//     const combinedDateTime = `${dateStr}T${timeStr}`;
//     const momentDateTime = moment(combinedDateTime, 'YYYY-MM-DDTHH:mm', true);

//     return momentDateTime.isValid() ? momentDateTime.toDate() : null;
//   };

//   // Reset form on open/edit with better error handling
//   useEffect(() => {
//     if (isOpen) {
//       if (isEditing && defaultValues) {
//         try {
//           // Safely parse and format the date
//           let formattedDate = '';
//           if (defaultValues.date) {
//             // Handle multiple date formats with strict parsing
//             let momentDate;

//             // Try ISO format first
//             momentDate = moment(defaultValues.date, moment.ISO_8601, true);

//             // If not ISO, try common formats
//             if (!momentDate.isValid()) {
//               const formats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DDTHH:mm:ss'];
//               momentDate = moment(defaultValues.date, formats, true);
//             }

//             // Last resort: try without strict mode but log warning
//             if (!momentDate.isValid()) {
//               console.warn('Using non-strict date parsing for:', defaultValues.date);
//               momentDate = moment(defaultValues.date);
//             }

//             if (momentDate.isValid()) {
//               formattedDate = momentDate.format('YYYY-MM-DD');
//             }
//           }

//           // Safely parse and format the time
//           let formattedTime = '';
//           if (defaultValues.time) {
//             // Handle different time formats with strict parsing
//             let momentTime;

//             // If time is just HH:mm format, use it directly
//             if (/^\d{2}:\d{2}$/.test(defaultValues.time)) {
//               formattedTime = defaultValues.time;
//             } else {
//               // Try parsing with specific formats
//               const timeFormats = ['HH:mm', 'HH:mm:ss', 'h:mm A', 'h:mm a'];
//               momentTime = moment(defaultValues.time, timeFormats, true);

//               // If we have both date and time, try combined parsing
//               if (!momentTime.isValid() && defaultValues.date) {
//                 const combinedFormats = [
//                   'YYYY-MM-DDTHH:mm',
//                   'YYYY-MM-DDTHH:mm:ss',
//                   'YYYY-MM-DDTHH:mm:ss.SSSZ',
//                 ];
//                 const timeToFormat = defaultValues.time.includes('T')
//                   ? defaultValues.time
//                   : `${defaultValues.date}T${defaultValues.time}`;

//                 momentTime = moment(timeToFormat, combinedFormats, true);
//               }

//               // Last resort: try ISO parsing
//               if (!momentTime.isValid()) {
//                 momentTime = moment(defaultValues.time, moment.ISO_8601, true);
//               }

//               if (momentTime.isValid()) {
//                 formattedTime = momentTime.format('HH:mm');
//               }
//             }
//           }

//           reset({
//             ...defaultValues,
//             date: formattedDate,
//             time: formattedTime,
//           });
//         } catch (error) {
//           console.error('Error formatting default values:', error);
//           // Reset to empty form if there's an error
//           reset({
//             date: '',
//             time: '',
//             clientName: defaultValues.clientName || '',
//             therapistName: defaultValues.therapistName || '',
//             therapyType: defaultValues.therapyType || '',
//             status: defaultValues.status || '',
//           });
//         }
//       } else {
//         // Not editing, reset to empty form
//         reset({
//           date: '',
//           time: '',
//           clientName: '',
//           therapistName: '',
//           therapyType: '',
//           status: '',
//         });
//       }
//     }
//   }, [isOpen, defaultValues, isEditing, reset]);

//   const onFormSubmit = (data: AppointmentFormData) => {
//     try {
//       let dateTimeUTC = null;

//       if (data.date && data.time) {
//         const combinedDateTime = `${data.date}T${data.time}`;
//         const momentDateTime = moment(combinedDateTime);

//         if (momentDateTime.isValid()) {
//           dateTimeUTC = momentDateTime.utc().toDate();
//         }
//       }

//       onSubmit({
//         date: dateTimeUTC,
//         clientName: data.clientName,
//         therapistName: data.therapistName,
//         therapyType: data.therapyType,
//         status: data.status,
//       });

//       onClose();
//     } catch (error) {
//       console.error('Error submitting form:', error);
//     }
//   };

//   const handleSelectChange = (fieldName: 'therapyType' | 'status') => (selected: OptionTypeGlobal | null) => {
//     setValue(fieldName, selected?.value || '');
//   };
//   if (!isOpen) return null;

//   return (
//     <Modal
//       title={`${readOnly ? 'View' : isEditing ? 'Edit' : 'Create'} Appointment`}
//       isOpen={isOpen}
//       onClose={onClose}
//       size='lg'
//       closeButton
//       footer={
//         <div className='flex justify-end mt-6 gap-2'>
//           <Button title='Close' variant='outline' type='button' onClick={onClose} />
//           {!readOnly && (
//             <Button
//               title='Save Changes'
//               variant='filled'
//               type='button'
//               onClick={handleSubmit(onFormSubmit)}
//             />
//           )}
//         </div>
//       }
//     >
//       <div className='grid grid-cols-2 gap-4'>
//         {/* Date */}
//         <CustomDatePicker
//           label='Date'
//           isRequired
//           placeholderText='Select date'
//           dateFormat='MM/dd/yyyy'
//           selected={getValidDate(watchedDate)}
//           onChange={(val: Date | null) => {
//             setValue('date', val ? moment(val).format('YYYY-MM-DD') : '');
//           }}
//           disabled={readOnly}
//           error={errors?.date?.message}
//         />

//         {/* Time */}
//         <TimeSelect
//           label='Time'
//           value={getValidTimeDate(watchedDate, watchedTime)}
//           onChange={(val: string) => {
//             // Parse the time value safely
//             try {
//               if (val && typeof val === 'string') {
//                 // Handle ISO string format from TimeSelect
//                 if (val.includes('T') || val.includes('Z')) {
//                   const momentTime = moment(val);
//                   if (momentTime.isValid()) {
//                     setValue('time', momentTime.format('HH:mm'), { shouldValidate: true });
//                   } else {
//                     setValue('time', '', { shouldValidate: true });
//                   }
//                 } else {
//                   // Direct time string (already in HH:mm format)
//                   setValue('time', val, { shouldValidate: true });
//                 }
//               } else {
//                 setValue('time', '', { shouldValidate: true });
//               }
//             } catch (error) {
//               console.error('Error parsing time:', error);
//               setValue('time', '', { shouldValidate: true });
//             }
//           }}
//           name='time'
//           isRequired
//           error={errors?.time?.message}
//           isDisabled={readOnly}
//           isISOString={false}
//         />

//         {/* Client Name */}
//         <InputField
//           type='text'
//           label='Client Name'
//           placeholder='Enter client name'
//           isDisabled={readOnly}
//           name='clientName'
//           register={register}
//           required={true}
//           error={errors?.clientName?.message}
//         />

//         {/* Therapist Name */}
//         <InputField
//           type='text'
//           label='Therapist Name'
//           name='therapistName'
//           register={register}
//           placeholder='Enter therapist name'
//           isDisabled={readOnly}
//           required={true}
//           error={errors?.therapistName?.message}
//         />

//         {/* Therapy Type */}
//         <div className='flex flex-col gap-1.5'>
//           <label className='block text-sm font-medium text-gray-700 mb-1'>
//             Therapy Type
//           </label>

//           <Select
//             options={therapyOptions}
//             placeholder="Select therapy type"
//             isDisabled={readOnly}
//             value={therapyOptions.find(opt => opt.value === therapyValue) || null}
//             onChange={handleSelectChange}
//             error={errors.therapyType?.message}
//           />

//           {errors.therapyType && (
//             <p className='text-sm text-red-500'>{errors.therapyType.message}</p>
//           )}
//         </div>

//         {/* Status */}
//        <div className='flex flex-col gap-1.5'>
//         <label className='block text-sm font-medium text-gray-700 mb-1'>
//           Status
//         </label>

//         <Select
//           options={statusOptions}
//           placeholder="Select status"
//           isDisabled={readOnly}
//           value={statusOptions.find(opt => opt.value === statusValue) || null}
//           onChange={handleSelectChange}
//           error={errors.status?.message}
//         />

//         {errors.status && (
//           <p className='text-sm text-red-500'>{errors.status.message}</p>
//         )}
//       </div>
//       </div>
//     </Modal>
//   );
// };

import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { type MultiValue } from 'react-select';

import { getCarrierByStateAsync } from '@/api/carrier';
import { useGetCitiesByState } from '@/api/city';
import { cityQueryKey } from '@/api/common/city.queryKey';
import { fieldOptionsQueryKey } from '@/api/common/fieldOptions.queryKey';
import { getFieldOptionsAsync } from '@/api/field-option';
import { getLanguagesAsync } from '@/api/language';
import { useGetAllCredentialedStates } from '@/api/state';
import Slide1 from '@/assets/images/Slide 16_9 - 1.webp';
import Slide10 from '@/assets/images/Slide 16_9 - 10.webp';
import Slide11 from '@/assets/images/Slide 16_9 - 11.webp';
import Slide12 from '@/assets/images/Slide 16_9 - 12.webp';
import Slide2 from '@/assets/images/Slide 16_9 - 2.webp';
import Slide3 from '@/assets/images/Slide 16_9 - 3.webp';
import Slide4 from '@/assets/images/Slide 16_9 - 4.webp';
import Slide5 from '@/assets/images/Slide 16_9 - 5.webp';
import Slide6 from '@/assets/images/Slide 16_9 - 6.webp';
import Slide7 from '@/assets/images/Slide 16_9 - 7.webp';
import Slide8 from '@/assets/images/Slide 16_9 - 8.webp';
import Slide9 from '@/assets/images/Slide 16_9 - 9.webp';
import { selectStyles, GENDER_OPTION, SESSION_OPTIONS } from '@/constants/CommonConstant';
import { FieldOptionType, PaymentMethodEnum } from '@/enums';
import AppointmentConfirmedDashboard from '@/features/appointment/component/ClientAppointmentsBooking/AppointmentConfirmedDashboard';
import BookSlot from '@/features/appointment/component/ClientAppointmentsBooking/BookSlot';
import ClientQuickDetails from '@/features/appointment/component/ClientAppointmentsBooking/ClientQuickDetails';
import { useBookAppointment } from '@/features/appointment/component/ClientAppointmentsBooking/hooks/useBookAppointment';
import RequestSlot from '@/features/appointment/component/ClientAppointmentsBooking/RequestSlot';
import SuccessSlotRequestModal from '@/features/appointment/component/ClientAppointmentsBooking/SuccessSlotRequest';
import type {
  AppointmentBookedResponse,
  AppointmentDateTimeProps,
  ClientQuickDetailsProps,
  RequestSlotProps,
} from '@/features/appointment/component/ClientAppointmentsBooking/types';
import type { FilterState } from '@/features/appointment/types';
import { AddClientDependentModal } from '@/features/client/components/ClientProfile/AddClientDependentModal';
import type { DependentFormValues } from '@/features/client/types';
import { Footer, Header } from '@/features/landing';
import { selectAppliedAppointmentFilters } from '@/redux/ducks/appointment-filters';
import Button from '@/stories/Common/Button';
import Card from '@/stories/Common/Card';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import Modal from '@/stories/Common/Modal';
import MultiSelectValueContainer from '@/stories/Common/MultiSelectValueContainer';
import Select, { CustomAsyncSelect, type SelectOption } from '@/stories/Common/Select';
// import SwiperComponent from '@/stories/Common/Swiper';
const SwiperComponent = React.lazy(() => import('@/stories/Common/Swiper'));

type Filters = {
  gender: string;
  availability: string; // or Date if you're storing actual dates
  language: string;
  sessionType: string;
};

const clientFormInitialValue = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  dob: null,
  clinic: {},
  reason_for_visit: '',
  appointment_type: null,
};

const Landing = () => {
  const [clearAll, setClearAll] = useState(false);

  const savedFilters = useSelector(selectAppliedAppointmentFilters);

  const {
    filter,
    therapistList,
    isLoading,
    handleSelectChange,
    onSearch,
    handleDateChange,
    clearFilters,
    activeSearch,
    handleRemoveFilter,
    handleTherapistClick,
    selectedTherapist,
    isModalOpen,
    setIsModalOpen,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    setSelectedTherapist,
  } = useBookAppointment(savedFilters as FilterState);

  const loaderRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [label, setLabel] = useState<string>('Availability');
  const [open, setOpen] = useState(false);
  const [modalStep, setModalStep] = useState<number>(1);
  const [dependentData, setDependentData] = useState<Partial<DependentFormValues[]>>([]);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDateTimeProps>();
  const [appointmentBookedResponse, setAppointmentBookedResponse] =
    useState<AppointmentBookedResponse>();
  const [savedValues, setSavedValues] = useState<ClientQuickDetailsProps>(clientFormInitialValue);
  const [mode, setMode] = useState<'create' | 'view' | 'edit'>('create');
  const [isSeachButtonClicked, setIsSeachButtonClicked] = useState<boolean>(false);
  const [requestSlotModalOpen, setRequestSlotModalOpen] = useState<boolean>(false);
  const [clickedFromCalender, setClickedFromCalender] = useState<boolean>(false);
  const [successSlotRequestOpen, setSuccessSlotRequestOpen] = useState<boolean>(false);
  const [slotRequestData, setSlotRequestData] = useState<RequestSlotProps>();
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const forward = () => {
    setModalStep(prev => prev + 1);
  };

  const { data: statesData, isLoading: statesLoading } = useGetAllCredentialedStates({
    isCredentialed: true,
  });

  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesByState(
    filter.state?.value || '',
    {
      options: {
        enabled: !!filter.state,
        queryKey: cityQueryKey.getCitiesByStateKey(filter.state?.value || ''),
      },
      isCredentialed: true,
    }
  );

  const backward = () => {
    if (modalStep === 3) {
      setDependentData(prev => {
        // Filter out dependents where all main fields are empty
        const cleaned = prev.filter(dep => {
          const { first_name, last_name, email, phone } = dep as DependentFormValues;
          return first_name?.trim() || last_name?.trim() || email?.trim() || phone?.trim();
        });

        return cleaned;
      });
    }

    if (modalStep === 2 && !clickedFromCalender) {
      setIsModalOpen(false);
    }

    setModalStep(prev => prev - 1);
  };

  const getAppointmentData = (data: AppointmentDateTimeProps) => {
    setAppointmentDetails(data);
    forward();
  };
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    gender: '',
    availability: '',
    language: '',
    sessionType: '',
  });

  useEffect(() => {
    const { availability, gender, language, sessionType } = appliedFilters;
    if (
      availability! == '' ||
      gender !== '' ||
      language !== '' ||
      sessionType !== '' ||
      (startDate !== null && endDate !== null)
    ) {
      onSearch();
    }
  }, [appliedFilters, dateRange]);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as HTMLElement;

  //     if (target.closest('.react-datepicker')) return;

  //     if (popoverRef.current && !popoverRef.current.contains(target)) {
  //       setOpen(false);
  //     }
  //   };
  //   getAreaOfFocusAsync().then(res => {
  //     console.log('res---->', res);
  //     setAreaOfFocusList(res.data);
  //   });

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  const updateFilter = (key: keyof Filters, value: string) => {
    setAppliedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    setSavedValues(clientFormInitialValue);
    setIsModalOpen(false);
    setClickedFromCalender(false);
    setModalStep(1);
  };

  const handleCloseRequestModal = () => {
    setRequestSlotModalOpen(false);
  };

  const handleRequestModalSubmit = (data: RequestSlotProps) => {
    setRequestSlotModalOpen(false);
    setSuccessSlotRequestOpen(true);
    setSlotRequestData(data);
  };
  const handleQuickSelect = (option: string) => {
    let start: Date | null = null;
    let end: Date | null = null;

    if (option === 'today') {
      start = moment().utc().startOf('day').toDate();
      end = moment().endOf('day').toDate();

      setLabel(`${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`);
      handleDateChange('availability_start_date', start);
      handleDateChange('availability_end_date', end);
    } else if (option === 'this_week') {
      start = moment().utc().startOf('week').toDate();
      end = moment().endOf('week').toDate();

      setLabel(`${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM')}`);
      handleDateChange('availability_start_date', start);
      handleDateChange('availability_end_date', end);
    }

    setDateRange([start, end]);
  };
  const handleClearLocalFilter = () => {
    handleSelectChange('language', null);
    handleSelectChange('availability_start_date', '');
    handleSelectChange('availability_end_date', '');
    handleSelectChange('therapistGender', null);
    setAppliedFilters({
      gender: '',
      availability: '',
      language: '',
      sessionType: '',
    });
    setDateRange([null, null]);
    setLabel('Availability');
  };

  const handleAppointmentBooked = (data: AppointmentBookedResponse) => {
    setAppointmentBookedResponse(data);
    setModalStep(4);
  };

  const handleAppointmentBookedModalClose = () => {
    setIsModalOpen(false);
    setClickedFromCalender(false);
    clearFilters();
    setSavedValues(clientFormInitialValue);
    setDependentData([]);
    setModalStep(1);
    setIsSeachButtonClicked(false);
  };

  const handleAddClientModalOpen = (cardmode: 'create' | 'view' | 'edit') => {
    setMode(cardmode);
    forward();
  };

  useEffect(() => {
    if (!loaderRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen]);

  const FilterTagList = ({
    filters = [],
    labelKey,
    removeKey,
    label,
  }: {
    filters: object[];
    labelKey?: string;
    removeKey: keyof FilterState;
    label?: string;
  }) => {
    if (filters.length == 0) {
      return <></>;
    }
    return (
      <div className='flex flex-wrap gap-2.5 items-center'>
        <span className='text-blackdark text-base font-bold'>
          {label && filters?.length > 0 ? `${label} : ` : ''}{' '}
        </span>
        {filters?.map(filterItem => (
          <Button
            key={filterItem.value || filterItem}
            variant='none'
            title={labelKey ? filterItem[labelKey] : filterItem.label || filterItem}
            icon={
              <Icon
                name='close'
                onClick={e => {
                  e.stopPropagation();
                  handleRemoveFilter(removeKey, filterItem);
                }}
                className='icon-wrapper w-4 h-4'
              />
            }
            className='!gap-1 !px-2 !py-1 rounded-md bg-blackdark text-white cursor-pointer !text-sm leading-4'
          />
        ))}
        {filters?.length > 0 && (
          <Button
            variant='none'
            title='Clear all'
            className='text-blackdark !p-0 hover:underline'
            onClick={e => {
              e.preventDefault();
              setClearAll(true);
              // clear only the specific filter group
              if (removeKey === 'areaOfFocus') {
                handleSelectChange('areaOfFocus', []);
              }
            }}
          />
        )}
      </div>
    );
  };
  return (
    <>
      <section className='bg-primarylight w-full pt-5 xl:pt-10 pb-5 lg:pb-10 xl:pb-20 2xl:pb-100px'>
        <div className='container mx-auto px-5 3xl:px-0'>
          <Header />
          <div className='pt-5 lg:pt-10 xl:pt-20 2xl:pt-100px flex flex-col-reverse xl:flex-row gap-24 lg:gap-28 xl:gap-24 items-start'>
            <div className='w-full xl:w-2/4'>
              <div className='relative flex flex-col gap-2.5 lg:gap-5'>
                <div className='text-white absolute right-0 -top-2'>
                  <Icon name='loading' />
                </div>
                <h1 className='text-5xl lg:text-56px xl:text-50px 2xl:text-64px 3xl:text-68px leading-14 lg:leading-16 2xl:leading-20 font-bold text-primary'>
                  Therapy that fits your life, on your schedule
                </h1>
                <p className='text-xl leading-7 font-normal text-blackdark'>
                  We’re glad you’re here. Please use the filters below to view our therapists and
                  schedule online. Or Let Us Match You and we will reach out to personally match you
                  with your ideal therapist
                </p>
              </div>
              <div className='flex flex-col gap-5 w-full xl:w-90%'>
                <div className='grid sm:grid-cols-2 grid-cols-1 gap-5 mt-5 lg:mt-10'>
                  <Select
                    name='state'
                    isRequired={true}
                    isClearable={true}
                    labelClassName='!text-base'
                    options={statesData?.length ? statesData : []}
                    placeholder='Select State'
                    onChange={value => {
                      handleSelectChange('carrier', null);
                      handleSelectChange('city', null);
                      handleSelectChange('state', value as SelectOption);
                    }}
                    isLoading={statesLoading}
                    StylesConfig={selectStyles}
                    value={filter.state}
                    leftIcon='location'
                    leftIconClassname='icon-wrapper w-5 h-5'
                  />

                  <Select
                    name='city'
                    key={`landing-city-${filter.state}`}
                    isRequired={true}
                    isClearable={true}
                    labelClassName='!text-base'
                    options={citiesData?.length ? citiesData : []}
                    placeholder='Select City'
                    onChange={selected => {
                      handleSelectChange('city', selected as SelectOption);
                    }}
                    isLoading={citiesLoading}
                    StylesConfig={selectStyles}
                    value={filter.city}
                    leftIcon='location'
                    leftIconClassname='icon-wrapper w-5 h-5'
                  />

                  <CustomAsyncSelect
                    key='payment_method'
                    leftIcon='paymentmethod'
                    placeholder='Payment Method'
                    isClearable={true}
                    labelClassName='!text-base'
                    loadOptions={(page, searchTerm) =>
                      getFieldOptionsAsync('PaymentMethod', page, searchTerm)
                    }
                    queryKey={fieldOptionsQueryKey.getFieldOptionsKey('PaymentMethod')}
                    pageSize={10}
                    onChange={value => {
                      handleSelectChange('paymentMethod', value as SelectOption);
                      handleSelectChange('carrier', null);
                    }}
                    StylesConfig={selectStyles}
                    value={filter.paymentMethod}
                  />

                  {filter.paymentMethod?.label == PaymentMethodEnum.Insurance && (
                    <CustomAsyncSelect
                      key={`insurance`}
                      placeholder='insurance'
                      isClearable={true}
                      leftIcon='carrier'
                      refetchOnChangeValue={[filter.state]}
                      leftIconClassname='icon-wrapper w-5 h-5'
                      loadOptions={(page, searchTerm) =>
                        getCarrierByStateAsync(page, searchTerm, filter.state?.value)
                      }
                      queryKey={fieldOptionsQueryKey.getFieldOptionsKey('Carrier')}
                      pageSize={10}
                      onChange={value => handleSelectChange('carrier', value as SelectOption)}
                      StylesConfig={{ ...selectStyles }}
                      value={filter.carrier}
                    />
                  )}

                  <Select
                    key={`session`}
                    placeholder='Session Type'
                    isClearable={true}
                    leftIcon='adminStaff'
                    leftIconClassname='icon-wrapper w-5 h-5'
                    options={SESSION_OPTIONS}
                    onChange={value => {
                      handleSelectChange('sessionType', value as SelectOption);
                    }}
                    StylesConfig={selectStyles}
                    value={filter.sessionType}
                  />
                  <CustomAsyncSelect
                    key={`therapy`}
                    placeholder='Therapy Type'
                    isClearable={true}
                    leftIcon='therapytype2'
                    leftIconClassname='icon-wrapper w-5 h-5'
                    loadOptions={(page, searchTerm) =>
                      getFieldOptionsAsync(FieldOptionType.THERAPY_TYPE, page, searchTerm)
                    }
                    queryKey={fieldOptionsQueryKey.getFieldOptionsKey(FieldOptionType.THERAPY_TYPE)}
                    pageSize={10}
                    onChange={value => handleSelectChange('therapyType', value as SelectOption)}
                    StylesConfig={{ ...selectStyles }}
                    value={filter.therapyType}
                  />
                  <CustomAsyncSelect
                    key={`focus`}
                    placeholder='Area of Focus'
                    leftIcon='brain'
                    leftIconClassname='icon-wrapper w-5 h-5'
                    isClearable={true}
                    labelClassName='!text-base'
                    loadOptions={(page, searchTerm) =>
                      getFieldOptionsAsync(FieldOptionType.AREA_OF_FOCUS, page, searchTerm)
                    }
                    components={{
                      ValueContainer: MultiSelectValueContainer,
                    }}
                    maxSelectedToShow={1}
                    queryKey={fieldOptionsQueryKey.getFieldOptionsKey(
                      FieldOptionType.AREA_OF_FOCUS
                    )}
                    pageSize={10}
                    isMulti
                    onChange={value =>
                      handleSelectChange('areaOfFocus', value as MultiValue<SelectOption>)
                    }
                    value={filter.areaOfFocus?.length > 0 ? filter.areaOfFocus : null}
                    StylesConfig={{ ...selectStyles }}
                  />
                </div>

                <FilterTagList
                  label='Area of focus'
                  filters={filter.areaOfFocus}
                  labelKey='label'
                  removeKey='areaOfFocus'
                />
                <Button
                  variant='filled'
                  type='button'
                  title='Search'
                  icon={<Icon name='search' className='icon-wrapper w-5 h-5' />}
                  isIconFirst
                  className='rounded-10px w-full'
                  onClick={() => {
                    setClearAll(false);
                    setIsSeachButtonClicked(true);
                    onSearch();
                  }}
                  isLoading={isLoading && activeSearch}
                  isDisabled={
                    !filter.areaOfFocus.length ||
                    !filter.therapyType ||
                    !filter.sessionType ||
                    !filter.paymentMethod ||
                    (filter.paymentMethod?.label === PaymentMethodEnum.Insurance && !filter.carrier)
                  }
                />
              </div>
            </div>
            <div className='w-full xl:w-2/4 relative'>
              <div className='w-full no-arrow landing-swiper'>
                <SwiperComponent
                  className='!pb-10'
                  autoplayDelay={5000}
                  slidesPerView={1}
                  spaceBetween={10}
                  showBullets={true}
                >
                  {[
                    <Image
                      imgPath={Slide1}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide2}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide3}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide4}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide5}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide6}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide7}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide8}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide9}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide10}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide11}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                    <Image
                      imgPath={Slide12}
                      className='rounded-4xl w-full aspect-square lg:aspect-auto lg:max-h-650px xl:max-h-[unset] xl:aspect-square'
                      imageClassName='object-cover xl:object-contain xl:max-w-full w-full h-full rounded-4xl'
                    />,
                  ]}
                </SwiperComponent>
                {/* <img
                  className='mx-auto'
                  src={businesswomanImage}
                  alt='Businesswoman greeting coworker'
                /> */}
              </div>
              <div className='absolute xl:bottom-28 -bottom-20 xl:-left-[85px] left-1/2 -translate-x-1/2 xl:translate-x-0 bg-white p-5 rounded-2xl w-363px shadow-content z-10'>
                <div className='flex flex-col gap-5'>
                  <h4 className='text-xl leading-5 font-bold text-blackdark'>
                    Need Help Choosing a Therapist?
                  </h4>
                  <p className='text-base font-medium leading-6 text-primarygray'>
                    We’re here to walk you through it. If you’re unsure who to pick, just give us a
                    quick call — we’ll match you personally.
                  </p>
                  <Button
                    className='rounded-10px'
                    title={'Talk to a Care Coordinator'}
                    variant='filled'
                    icon={<Icon name='phone' />}
                    isIconFirst
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {isSeachButtonClicked && !clearAll && (
        <section className='my-5 lg:my-10 xl:my-20 2xl:my-100px'>
          <div className='container mx-auto px-5 3xl:px-0'>
            <div className='flex flex-wrap items-center justify-center lg:justify-between mb-8 lg:mb-10 xl:mb-60px'>
              <h2 className='text-center lg:text-left mb-5 lg:mb-0 w-full lg:w-auto text-3xl lg:text-4xl xl:text-5xl font-bold leading-12 xl:leading-14 text-primary'>
                Search Results
              </h2>
              <div className='flex flex-wrap items-center gap-2.5'>
                <Select
                  key={`gender`}
                  placeholder='Gender'
                  isClearable={true}
                  options={GENDER_OPTION}
                  value={filter?.therapistGender}
                  onFocus={() => setOpen(false)}
                  onChange={value => {
                    handleSelectChange('therapistGender', value as SelectOption);
                    updateFilter('gender', value?.label as string);
                  }}
                  StylesConfig={selectStyles}
                />
                <div className='relative inline-block cursor-pointer' key={label} ref={popoverRef}>
                  <div
                    onClick={() => setOpen(!open)}
                    className='w-60 px-4 py-3 border border-surface rounded-lg flex gap-2 justify-between items-center bg-white '
                  >
                    <span className='text-blackdark'>{label}</span>
                    <Icon
                      name={'dropdownArrow'}
                      className={clsx(
                        'transition-transform duration-300 ease-in-out text-blackdark',
                        open ? 'rotate-180' : 'rotate-0'
                      )}
                    />
                  </div>
                  {open && (
                    <div className='absolute left-1/2 mt-2 z-50 bg-white rounded-xl p-5 flex flex-col gap-5 w-360px -translate-x-1/2 shadow-surfaceshadow'>
                      <div
                        className=' cursor-pointer absolute -top-1.5 -right-1.5 bg-primary rounded-full p-1 text-white'
                        onClick={() => setOpen(!open)}
                      >
                        <Icon name='close' className='icon-wrapper w-3 h-3' />
                      </div>
                      <Button
                        variant='none'
                        className='bg-Gray rounded-10px w-full !leading-5 min-h-50px'
                        onClick={() => {
                          handleQuickSelect('this_week');
                          setOpen(!open);
                        }}
                        title=' This Week'
                      />
                      <div onClick={e => e.stopPropagation()} className='w-full'>
                        <CustomDatePicker
                          selected={startDate}
                          onChange={(update: [Date | null, Date | null]) => {
                            const [start, end] = update;
                            // Keep them in local timezone
                            const startLocal = start ? moment(start).startOf('day').toDate() : null;
                            const endLocal = end ? moment(end).endOf('day').toDate() : null;
                            setDateRange([startLocal, endLocal]);
                            handleDateChange('availability_start_date', startLocal);
                            handleDateChange('availability_end_date', endLocal);

                            setLabel(
                              startLocal && endLocal
                                ? `${moment(startLocal).format('DD MMM')} - ${moment(endLocal).format('DD MMM')}`
                                : 'Custom Range'
                            );
                          }}
                          shouldCloseOnSelect={false}
                          selectsRange
                          startDate={startDate}
                          endDate={endDate}
                          isClearable
                          placeholderText='Custom Range...'
                          className='!w-full !p-3 !bg-Gray'
                          minDate={moment().add(24, 'hours').startOf('day').toDate()}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <CustomAsyncSelect
                  key={`language`}
                  placeholder='Language'
                  isClearable={true}
                  onFocus={() => setOpen(false)}
                  loadOptions={getLanguagesAsync}
                  queryKey={['languages']}
                  value={
                    filter?.language
                      ? { label: appliedFilters?.language, value: filter?.language }
                      : null
                  }
                  pageSize={10}
                  isSearchable={true}
                  onChange={value => {
                    handleSelectChange('language', value as SelectOption);
                    updateFilter('language', value?.label as string);
                  }}
                  StylesConfig={selectStyles}
                  loadingMessage='Loading languages...'
                  noOptionsMessage='No languages found'
                />

                {/* <p className='px-5 py-2.5 border border-solid border-surface rounded-10px'>
                  Sort By
                </p> */}
                {(filter.language ||
                  filter.availability_end_date ||
                  filter.availability_start_date ||
                  filter.therapistGender) && (
                  <Button
                    variant='none'
                    type='button'
                    title='Clear Filters'
                    className='rounded-10px border border-solid border-surface !leading-5'
                    onClick={handleClearLocalFilter}
                  />
                )}
              </div>
            </div>

            {isLoading && !therapistList?.length ? (
              // Loading state
              <div className='mt-6 flex justify-center items-center py-8 gap-3'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                <span className='text-primarygray'>Searching for therapists...</span>
              </div>
            ) : therapistList && therapistList.length > 0 ? (
              <>
                {!isFetchingNextPage && isFetching ? (
                  <div className='mt-6 w-full flex justify-center items-center py-8 gap-3'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    <span className='text-primarygray'>Searching for therapists...</span>
                  </div>
                ) : (
                  <></>
                )}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
                  {therapistList.map((therapist, index) => (
                    // <div ref={therapistList.length - 1 == index ? loaderRef : null}>
                    <Card
                      index={index}
                      data={therapist}
                      key={therapist?.id}
                      isDatepicker={true}
                      onClick={() => {
                        setClickedFromCalender(true);
                        setSelectedTherapist(therapist);
                        handleTherapistClick(therapist, true);
                      }}
                      onRequestSlot={() => {
                        setSelectedTherapist(therapist);
                        setRequestSlotModalOpen(true);
                      }}
                      handleSlot={data => {
                        setSelectedTherapist(therapist);
                        handleTherapistClick(therapist, true);
                        getAppointmentData(data);
                      }}
                      fromDashboard={true}
                    />
                    // </div>
                  ))}
                  {/* Infinite Scroll Loader */}
                  {(hasNextPage || isFetchingNextPage) && (
                    <div
                      ref={loaderRef}
                      className='col-span-full flex justify-center items-center py-4'
                    >
                      {isFetchingNextPage && (
                        <div className='flex items-center gap-2'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                          <span className='text-primarygray'>Loading more therapists...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // No results
              <div className='text-center py-8'>
                <Icon
                  name='therapist'
                  className='text-primarygray icon-wrapper w-16 h-16 inline-block'
                />
                <h3 className='text-2xl font-bold text-primarygray my-2'>No therapists found</h3>
                <p className='text-primarygray text-lg font-semibold'>
                  No therapists match your current search criteria. Try adjusting your filters or
                  search terms.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      <Footer />
      {isModalOpen && selectedTherapist && (
        // updated modal
        <Modal
          title={
            <>
              {modalStep !== 1 && (
                <Icon onClick={backward} name='arrowLeft' className='cursor-pointer' />
              )}
              {modalStep === 1
                ? `Book a Session with ${selectedTherapist?.user?.first_name || ''} ${selectedTherapist?.user?.last_name || ''}`
                : modalStep === 2
                  ? 'Add a Few Quick Details'
                  : modalStep === 3
                    ? 'Add Dependent'
                    : ''}
            </>
          }
          titleClassName='flex items-center gap-2.5'
          isOpen={isModalOpen}
          // showBackIcon={modalStep !== 1 ? true : false}
          onClose={handleClose}
          // onBack={backward}
          closeButton={false}
          size={modalStep === 1 ? '3xl' : 'lg'}
          contentClassName='pt-30px'
        >
          {modalStep === 1 && (
            <BookSlot
              therapist_id={selectedTherapist.id}
              onContinue={getAppointmentData}
              onBack={handleClose}
            />
          )}
          {modalStep == 2 && (
            <ClientQuickDetails
              onContinue={handleAddClientModalOpen}
              dependentData={dependentData}
              appointmentDetails={appointmentDetails}
              selectedTherapist={selectedTherapist}
              filter={filter}
              setDependentData={setDependentData}
              onAppointmentBooked={handleAppointmentBooked}
              appointmentBookedResponse={appointmentBookedResponse}
              savedValues={savedValues}
              setSavedValues={setSavedValues}
            />
          )}
          {modalStep == 3 && (
            <AddClientDependentModal
              mode={mode}
              setDependentData={setDependentData}
              onSubmit={backward}
              filter={filter}
              dependentData={dependentData}
            />
          )}
          {modalStep == 4 && (
            <AppointmentConfirmedDashboard
              isOpen={true}
              closeButton={false}
              appointmentData={appointmentDetails}
              onClose={handleAppointmentBookedModalClose}
              selectedTherapist={selectedTherapist}
              appointmentResponse={appointmentBookedResponse}
            />
          )}
        </Modal>
      )}
      {requestSlotModalOpen && selectedTherapist && (
        // upadted modal
        <Modal
          title={`Request a slot to ${selectedTherapist?.user?.first_name || ''} ${selectedTherapist?.user?.last_name || ''}`}
          isOpen={requestSlotModalOpen}
          onClose={handleCloseRequestModal}
          size={'xl'}
          closeButton={false}
          contentClassName='pt-30px'
        >
          <RequestSlot
            selectedTherapist={selectedTherapist}
            onClose={handleCloseRequestModal}
            fromDashboard={true}
            onSubmit={handleRequestModalSubmit}
          />
        </Modal>
      )}
      {successSlotRequestOpen && (
        <SuccessSlotRequestModal
          isOpen={successSlotRequestOpen}
          closeButton={true}
          onClose={() => setSuccessSlotRequestOpen(false)}
          fromDashboard={true}
          selectedTherapist={selectedTherapist}
          preferredTime={slotRequestData?.preferred_time}
        />
      )}
    </>
  );
};

export default Landing;

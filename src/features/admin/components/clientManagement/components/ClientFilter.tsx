import { useEffect, useMemo, useRef, useState } from 'react';

import moment from 'moment';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { getTagsAsync } from '@/api/clientManagement';
import type { AlertTags, FilterData } from '@/features/admin/components/clientManagement/types';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import CustomDatePicker from '@/stories/Common/CustomDatePicker';
import Icon from '@/stories/Common/Icon';
import { CustomAsyncSelect } from '@/stories/Common/Select';

type Props = {
  isLoading: boolean;
  setFilters: React.Dispatch<React.SetStateAction<FilterData>>;
  applyFilter: (values: FilterData) => void;
};
const ClientFilter = (props: Props) => {
  const { isLoading, setFilters, applyFilter } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const user = useSelector(currentUser);

  // ** Refs **
  const filterRef = useRef<FilterData>({});

  const {
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FilterData>({
    mode: 'onChange',
    defaultValues: {
      startDate: '',
      endDate: '',
      alertTags: [],
    },
  });

  const values = getValues();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    const obj = isVisible ? filterRef.current : values;
    const { alertTags, startDate, endDate } = obj;
    if (alertTags && alertTags.length > 0) count++;
    if (startDate || endDate) count++;
    return count;
  }, [values]);

  const handleToggle = () => {
    setIsVisible(prev => !prev);
  };

  useEffect(() => {
    if (isVisible) {
      filterRef.current = getValues();
    } else {
      reset(filterRef.current);
      const { startDate, endDate } = filterRef.current;
      const start = startDate ? moment(startDate, 'YYYY-MM-DD').toDate() : null;
      const end = endDate ? moment(endDate, 'YYYY-MM-DD').toDate() : null;
      setDateRange([start, end]);
    }
  }, [isVisible]);

  return (
    <div className='relative'>
      <Button
        variant='none'
        icon={<Icon name='dropdownArrow' />}
        className='rounded-lg border-primary border border-solid py-4 px-6 flex items-center gap-2'
        onClick={handleToggle}
      >
        Filter By
        {activeFilterCount > 0 && (
          <span className='inline-flex items-center justify-center w-5 h-5 text-white text-xs font-semibold bg-primary rounded-full'>
            {activeFilterCount}
          </span>
        )}
      </Button>
      {isVisible && (
        <div
          // ref={popupRef}
          className='absolute right-0 z-10 mt-2 min-w-[400px] bg-white rounded-lg p-5 border border-solid border-surface shadow-dropdown'
        >
          <div className='flex flex-col gap-3'>
            <CustomDatePicker
              label='Select Range'
              labelClass='!text-base !leading-22px'
              selected={startDate}
              onChange={(update: [Date | null, Date | null]) => {
                const [start, end] = update;
                setDateRange([start, end]);
                setValue(
                  'startDate',
                  start ? moment(start, user?.timezone).format('YYYY-MM-DD') : null,
                  {
                    shouldValidate: true,
                  }
                );
                setValue('endDate', end ? moment(end, user?.timezone).format('YYYY-MM-DD') : null, {
                  shouldValidate: true,
                });
              }}
              isClearable
              parentClassName='z-[0]'
              selectsRange
              startDate={startDate}
              endDate={endDate}
              placeholderText='Select date range'
            />

            <CustomAsyncSelect
              label='Alert Tags'
              labelClassName='!text-base !leading-22px'
              loadOptions={getTagsAsync}
              queryKey={['tags']}
              pageSize={10}
              isMulti
              onChange={selectedOptions => {
                const options = selectedOptions as unknown as AlertTags[];
                setValue('alertTags', options, {
                  shouldValidate: true,
                });
              }}
              value={getValues('alertTags') || []}
              placeholder='Select Alert Tags'
              error={errors?.alertTags && errors?.alertTags?.message}
              StylesConfig={{
                control: () => ({
                  minHeight: '50px',
                  padding: '4px 6px',
                }),
                singleValue: () => ({
                  fontSize: '16px',
                }),
              }}
            />

            <div className='flex gap-4 '>
              <Button
                variant='outline'
                title='Clear Filters'
                className='px-6 py-3.5 rounded-10px'
                onClick={() => {
                  const clearVals = {
                    startDate: null,
                    endDate: null,
                    tags: null,
                  };
                  reset(clearVals);
                  filterRef.current = clearVals;
                  setDateRange([null, null]);
                  setFilters({});
                  setIsVisible(false);
                }}
                type='button'
              />
              <Button
                variant='filled'
                title='Apply Filter'
                className='px-6 py-3.5 rounded-10px'
                type='button'
                onClick={() => {
                  applyFilter(values);
                  filterRef.current = values;
                  setIsVisible(false);
                }}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientFilter;

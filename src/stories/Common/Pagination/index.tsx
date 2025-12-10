import React, { useState } from 'react';

import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';
import Select from '@/stories/Common/Select';

interface PaginationProps<TData> {
  table: TData; // Using any for demo, but should be Table<TData> from @tanstack/react-table
  totalCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

function getPaginationRange(current: number, total: number): (number | 'dots')[] {
  const siblingCount = 2;
  const totalPageNumbers = siblingCount * 2 + 5;

  if (total <= totalPageNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 2);
  const rightSibling = Math.min(current + siblingCount, total - 1);

  const shouldShowLeftDots = leftSibling > 2;
  const shouldShowRightDots = rightSibling < total - 1;

  const range: (number | 'dots')[] = [1];

  if (shouldShowLeftDots) range.push('dots');
  for (let i = leftSibling; i <= rightSibling; i++) {
    range.push(i);
  }
  if (shouldShowRightDots) range.push('dots');

  if (total > 1) range.push(total);
  return range;
}

export const Pagination = <TData,>({
  table,
  totalCount,
  onPageChange,
  onPageSizeChange,
  className = '',
}: PaginationProps<TData>) => {
  const [goToValue, setGoToValue] = useState('');

  // Get pagination state from table
  const pageIndex = table?.getState?.()?.pagination?.pageIndex || 1;
  const pageSize = table?.getState?.()?.pagination?.pageSize || 10;

  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPage = pageIndex;
  const pageRange = getPaginationRange(currentPage, totalPages);

  const pageSizeOptions = [10, 20, 30, 40, 50];

  const handleGoToSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = Number(goToValue);
      if (!isNaN(value) && value >= 1 && value <= totalPages) {
        onPageChange(value);
        setGoToValue('');
      }
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onPageSizeChange(newPageSize);
    onPageChange(1); // Reset to first page
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm ${className}`}>
      {/* Total count */}
      <span className='text-gray-600 font-medium'>Total {totalCount} items</span>

      {/* Pagination controls */}
      <div className='flex items-center'>
        {/* Previous button */}
        <Button
          icon={<Icon name='previousArrow' color='black' />}
          variant='none'
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          className='flex items-center justify-center !rounded-r-none sm:min-w-8 sm:min-h-8 !py-0 !px-1 border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
        />

        {/* Page numbers */}
        <div className='flex'>
          {pageRange.map((page, i) =>
            page === 'dots' ? (
              <div
                key={`dots-${i}`}
                className='flex items-center justify-center !text-[10px] sm:min-w-8 sm:min-h-8 border-t border-b border-r border-gray-300 text-primary '
              >
                •••
              </div>
            ) : (
              <Button
                title={page.toString()}
                variant='none'
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex items-center !font-semibold sm:text-base text-xs !rounded-none !py-0 !px-1 justify-center sm:min-w-8 sm:min-h-8 border-t border-b border-r border-gray-300  transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white  border-primary'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              />
            )
          )}
        </div>

        {/* Next button */}
        <Button
          icon={<Icon name='nextArrow' color='black' />}
          variant='none'
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
          className='flex items-center sm:text-base text-xs justify-center !rounded-l-none sm:min-w-8 sm:min-h-8 !py-0 !px-1 border-l-0 border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
        />
      </div>

      {/* Page size selector */}
      <div className='relative'>
        <Select
          isSearchable={false}
          labelClassName='!text-base'
          value={{ value: pageSize, label: `${pageSize} / Page` }}
          options={pageSizeOptions.map(d => ({ value: d, label: `${d} / Page` }))}
          onChange={value => {
            const selectedValue = value;
            handlePageSizeChange(selectedValue?.value);
          }}
          StylesConfig={{
            control: () => ({
              borderRadius: '6px',
              minHeight: '30px',
              '& > div': {
                minHeight: '30px',
              },
            }),
            singleValue: () => ({
              fontSize: '14px',
            }),
            menu: () => ({
              borderRadius: '6px',
            }),
            option: () => ({
              fontSize: '14px',
              padding: '8px 12px',
            }),
          }}
        />
      </div>

      {/* Go to page input */}
      <div className='flex items-center gap-2'>
        <span className='text-gray-600'>Go to</span>
        <InputField
          iconClassName='text-primarygray'
          type='text'
          value={goToValue}
          onChange={e => setGoToValue(e.target.value)}
          onKeyDown={handleGoToSubmit}
          placeholder=''
          inputClass='!w-[50px] !px-2 !py-5px !rounded-[5px] border border-gray-300 text-center'
        />
      </div>
    </div>
  );
};

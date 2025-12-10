import Icon from '@/stories/Common/Icon';
import type { SelectOption } from '@/stories/Common/Select';

/**
 * Render card icon based on card type
 */
export const renderCardIcon = (cardType: string) => {
  const cardIcons: Record<string, 'Visa' | 'MasterCard' | 'Amex'> = {
    Visa: 'Visa',
    MasterCard: 'MasterCard',
    AmericanExpress: 'Amex',
  };

  const iconName = cardIcons[cardType];

  if (iconName) {
    return <Icon name={iconName} className='icon-wrapper w-14 h-14 relative -top-2' />;
  }

  return (
    <div className='w-14 h-10 bg-surface rounded flex items-center justify-center text-blackdark font-semibold text-sm'>
      CARD
    </div>
  );
};

/**
 * Generate month options for select dropdown
 */
export const getMonthOptions = (): SelectOption[] => [
  { value: '01', label: '01 - January' },
  { value: '02', label: '02 - February' },
  { value: '03', label: '03 - March' },
  { value: '04', label: '04 - April' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - June' },
  { value: '07', label: '07 - July' },
  { value: '08', label: '08 - August' },
  { value: '09', label: '09 - September' },
  { value: '10', label: '10 - October' },
  { value: '11', label: '11 - November' },
  { value: '12', label: '12 - December' },
];

/**
 * Generate year options (current year + 20 years)
 */
export const getYearOptions = (): SelectOption[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 21 }, (_, i) => {
    const year = currentYear + i;
    return { value: year.toString(), label: year.toString() };
  });
};

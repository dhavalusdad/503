import React from 'react';

import { differenceInYears } from 'date-fns';
import moment, { type Moment } from 'moment';

import type { UserDependentResponse } from '@/api/types/calendar.dto';
import Icon from '@/stories/Common/Icon';
import Tooltip from '@/stories/Common/Tooltip/Tooltip';

interface MemberCardProps {
  member: UserDependentResponse;
  index: number;
  onRemove?: (index: number) => void;
  showDeleteButton?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  index,
  onRemove,
  showDeleteButton = true,
}) => {
  // const getMemberTypeLabel = () => {
  //   switch (memberType) {
  //     case 'family':
  //       return 'Family Member';
  //     case 'couple':
  //       return 'Couple Member';
  //     case 'minor':
  //       return 'Minor Member';
  //     default:
  //       return 'Member';
  //   }
  // };

  const calculateAge = (birth_date: string): string => {
    if (!birth_date) return '';
    const mDate: Moment = moment(birth_date, 'YYYY-MM-DD');
    if (!mDate.isValid()) return '';
    return String(differenceInYears(new Date(), mDate.toDate()));
  };
  const getMemberDetails = () => {
    const baseDetails = [
      { label: 'Age', value: `${calculateAge(member.dob)} years` },
      { label: 'Gender', value: member?.gender },
      { label: 'Phone', value: member?.phone },
      { label: 'Email', value: member?.email },
    ];

    // switch (memberType) {
    //   case 'family':
    //     return [
    //       ...baseDetails,
    //       { label: 'Phone', value: (member as FamilyMember).phone },
    //       { label: 'Email', value: (member as FamilyMember).email },
    //     ];
    //   case 'couple':
    //     return [
    //       ...baseDetails,
    //       { label: 'Relationship Type', value: (member as CoupleMember).relationshipType },
    //     ];
    //   case 'minor':
    //     return [
    //       ...baseDetails,
    //       { label: 'Emergency Contact', value: (member as MinorMember).emergencyContact },
    //       { label: 'Relationship', value: (member as MinorMember).relationshipType },
    //     ];
    //   default:
    //     return baseDetails;
    // }
    return baseDetails;
  };

  const details = getMemberDetails();

  return (
    <div className='bg-white rounded-2xl relative shadow-calenderheader border border-solid border-surface'>
      <div className='flex items-center justify-between px-5 py-2.5 border-b border-solid border-surface'>
        {/* Member Card Header */}
        <h6 className='text-lg font-semibold text-blackdark'>
          {member?.first_name} {member?.last_name}
        </h6>
        {showDeleteButton && (
          <div
            className=' w-6 h-6 rounded-full bg-black text-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors'
            onClick={() => {
              if (onRemove) onRemove(index);
            }}
          >
            <Icon name='close' className='icon-wrapper w-4 h-4' />
          </div>
        )}
      </div>

      {/* Member Details Grid */}
      <div className='grid grid-cols-2 gap-5 px-5 py-2.5'>
        {details.map((detail, idx) => (
          <div key={idx} className='flex flex-col gap-1.5'>
            <label className='text-base font-medium text-blackdark tracking-wide'>
              {detail?.label}
            </label>
            <Tooltip
              placement='auto'
              className='bg-primary text-white text-sm px-3 py-1 rounded-lg shadow-lg'
              label={`${detail?.value}`}
            >
              <p className='text-sm font-medium text-primarygray truncate'>{detail?.value}</p>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberCard;

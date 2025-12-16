import { useEffect, useState } from 'react';

import _ from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetTherapistBasicDetails } from '@/api/therapist';
import { PermissionType } from '@/enums';
import { formatExperience, formatTitleCase } from '@/helper';
import { useRoleBasedRouting } from '@/hooks/useRoleBasedRouting';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import Image from '@/stories/Common/Image';
import SectionLoader from '@/stories/Common/Loader/Spinner';

type DetailsType = {
  bio: string;
  address: string;
  clinic_address: string;
  specializations: string[];
  languages: string[];
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_image: string;
  experience: string;
  therapy_types: string[];
  // TODO
  license: object;
  is_active: boolean;
  city?: string;
  country?: string;
  state?: string;
  postal_code?: string;
  amd_provider_id?: string;
  amd_provider_name?: string;
};

const getTags = (tagData?: string[], formatTags: boolean = false) => {
  return (
    <>
      {tagData?.length ? (
        <div className='flex flex-wrap gap-3'>
          {tagData?.map(item => {
            return (
              <span
                className='bg-surface text-blackdark !leading-22px rounded-md px-3 py-1.5'
                key={item}
              >
                {formatTags ? formatTitleCase(item) : item}
              </span>
            );
          })}
        </div>
      ) : (
        <>
          <span>-</span>
        </>
      )}
    </>
  );
};

const extractNames = (item: { id: string; name: string }[]) => {
  return item?.length ? item.map(item => item.name) : null;
};

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const TherapistDetailsPage = () => {
  // ** Hooks **
  const { therapist_id } = useParams();
  const navigate = useNavigate();
  if (!therapist_id) {
    return <></>;
  }
  const { hasPermission } = useRoleBasedRouting();

  // ** States **
  const [details, setDetails] = useState<DetailsType>();

  const { data, isPending, dataUpdatedAt } = useGetTherapistBasicDetails({
    therapist_id,
    options: {
      enabled: !!therapist_id,
      refetchOnMount: true,
    },
  });

  useEffect(() => {
    if (data) {
      const {
        profile_image,
        first_name,
        last_name,
        area_of_focus,
        languages,
        therapy_types,
        experiences,
        address1,
        address2,
        city,
        country,
        state,
        postal_code,
        amd_provider_id,
        amd_provider_name,
        clinic_address,
      } = data;
      setDetails({
        ...data,
        profile_image: profile_image ? `${SERVER_URL}${profile_image}` : '',
        full_name: [first_name, last_name].filter(Boolean).join(' '),
        specializations: extractNames(area_of_focus) || [],
        languages: extractNames(languages) || [],
        therapy_types: extractNames(therapy_types) || [],
        experience: formatExperience(experiences),
        address: [
          address1,
          address2,
          _.isObject(city) ? city?.label || '' : city,
          _.isObject(state) ? state?.full_form || '' : state,
          _.isObject(country) ? country?.label || '' : state,
          postal_code,
        ]
          .filter(Boolean)
          .join(', '),
        amd_provider_id,
        amd_provider_name,
        clinic_address: clinic_address?.map(c => c.label).join(' || '),
      });
    }
  }, [dataUpdatedAt]);

  return (
    <>
      {isPending ? (
        <SectionLoader />
      ) : (
        <div className='bg-white rounded-20px border border-solid border-surface p-5'>
          <div className='flex flex-col gap-5'>
            <div className='flex sm:flex-row flex-col sm:items-center sm:gap-5 gap-3'>
              <Image
                imgPath={details?.profile_image || ''}
                firstName={details?.first_name}
                lastName={details?.last_name}
                className='w-90px h-90px rounded-full'
                imageClassName='object-cover object-center rounded-full'
                initialClassName='!text-xl'
              />
              <div className='flex flex-col gap-2.5'>
                <div className='flex items-center gap-2.5'>
                  <h4 className='text-lg font-bold leading-6 text-blackdark'>{`Dr. ${details?.full_name}`}</h4>
                  <Button
                    variant='none'
                    {...(details?.is_active
                      ? {
                          title: 'Available',
                          className:
                            'border border-solid border-Green !py-1 !px-2 !text-xs !leading-4 text-Greendarklight !gap-1 bg-Greendarklight/6',
                        }
                      : {
                          title: 'Unavailable',
                          className:
                            'border border-solid !py-1 !px-2 !text-xs !leading-4 !gap-1  !bg-red/6 !text-red !border-red',
                        })}
                    icon={
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${details?.is_active ? 'bg-Green' : 'bg-red'}`}
                      ></div>
                    }
                    isIconFirst
                  />
                </div>

                {details?.experience && (
                  <>
                    <div className='flex flex-wrap items-center gap-2.5'>
                      {/* <p className='text-sm font-normal leading-18px text-primarygray'>
                    Mental Health Therapist
                  </p> */}
                      {/* <span className='bg-primarylight w-1px h-3.5'></span> */}
                      <p className='text-sm font-normal leading-18px text-primarygray'>
                        {details?.experience}
                      </p>
                    </div>
                  </>
                )}
                <div className='flex flex-wrap items-center gap-2.5'>
                  <div className='flex items-center gap-1.5'>
                    <Icon name='phone' className='icon-wrapper w-4 h-4 text-blackdark' />
                    <span className='text-sm font-normal leading-18px text-primarygray underline underline-offset-2'>
                      {details?.phone}
                    </span>
                  </div>
                  <span className='bg-primarylight w-1px h-3.5'></span>
                  <div className='flex items-center gap-1.5'>
                    <Icon name='mail' className='icon-wrapper w-4 h-4 text-blackdark' />
                    <span className='text-sm font-normal leading-18px text-primarygray underline underline-offset-2'>
                      {details?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-2.5'>
              <div className='flex items-center gap-1.5'>
                <Icon name='info' className='icon-wrapper w-5 h-5 text-blackdark' />
                <h5 className='text-lg font-bold text-blackdark leading-6'>About</h5>
              </div>
              <p className='text-base font-normal leading-22px text-blackdark'>
                {details?.bio || '-'}
              </p>
            </div>
            <span className='w-full h-1px bg-surface'></span>
            <div className='flex lg:flex-row flex-col items-start gap-5 relative'>
              <div className='flex flex-col gap-2.5 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <Icon name='personaladdress' className='icon-wrapper w-5 h-5 text-blackdark' />
                  <h5 className='text-lg font-bold text-blackdark leading-6'>Personal Address</h5>
                </div>
                {details?.address ? (
                  <p className='text-base font-normal leading-22px text-blackdark break-all'>
                    {details.address}
                  </p>
                ) : (
                  <>-</>
                )}
              </div>
              <span className='w-full h-1px lg:h-auto lg:w-1px lg:self-stretch bg-surface'></span>
              <div className='flex flex-col gap-2.5 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <Icon name='clinicaddress' className='icon-wrapper w-5 h-5 text-blackdark' />
                  <h5 className='text-lg font-bold text-blackdark leading-6'>Clinic Address</h5>
                </div>
                {details?.clinic_address ? (
                  <p className='text-base font-normal leading-22px text-blackdark'>
                    {details?.clinic_address}
                  </p>
                ) : (
                  <>-</>
                )}
              </div>
            </div>
            <span className='w-full h-1px bg-surface'></span>
            <div className='flex flex-col gap-2.5'>
              <div className='flex items-center gap-1.5'>
                <Icon name='specialized' className='text-blackdark' />
                <h5 className='text-lg font-bold text-blackdark leading-6'>Specialized In</h5>
              </div>
              {getTags(details?.specializations, true)}
            </div>
            <span className='w-full h-1px bg-surface'></span>
            <div className='flex lg:flex-row flex-col items-start gap-5 relative'>
              <div className='flex flex-col gap-2.5 lg:max-w-2/4'>
                <div className='flex items-center gap-1.5'>
                  <Icon name='global' className='text-blackdark' />
                  <h5 className='text-lg font-bold text-blackdark leading-6'>Languages Known</h5>
                </div>
                {getTags(details?.languages)}
              </div>
              <span className='w-full h-1px lg:h-auto lg:w-1px lg:self-stretch bg-surface'></span>
              <div className='flex flex-col gap-2.5'>
                <div className='flex items-center gap-1.5'>
                  <Icon name='appointment' className='text-blackdark' />
                  <h5 className='text-lg font-bold text-blackdark leading-6'>
                    Appointment Types Offered
                  </h5>
                </div>
                {getTags(details?.therapy_types, true)}
              </div>
            </div>
            <span className='w-full h-1px bg-surface'></span>
            {/* <span className='w-full h-1px bg-surface'></span>
            <div className='flex flex-col gap-2.5'>
              <div className='flex items-center gap-1.5'>
                <Icon name='license' className='text-blackdark' />
                <h5 className='text-lg font-bold text-blackdark leading-6'>License</h5>
              </div>
              <div className='flex flex-col gap-1.5'>
                <h6 className='text-base font-bold leading-22px text-blackdark'>Licenses - 1</h6>
                <p className='text-base font-normal leading-22px text-blackdark'>
                  Mental Health Therapy
                </p>
                <span className='text-sm font-normal leading-18px text-primarygray'>May 2010</span>
              </div>
            </div> */}
            <div className='flex lg:flex-row flex-col items-start gap-5 relative'>
              <div className='flex flex-col gap-2.5 lg:max-w-2/4'>
                <div className='flex items-center gap-1.5'>
                  {/* <Icon name='personaladdress' className='icon-wrapper w-5 h-5 text-blackdark' /> */}
                  <h5 className='text-lg font-bold text-blackdark leading-6'>AMD Provider ID</h5>
                </div>
                {details?.amd_provider_id ? (
                  <p className='text-base font-normal leading-22px text-blackdark break-all'>
                    {details?.amd_provider_id}
                  </p>
                ) : (
                  <>-</>
                )}
              </div>
              <span className='w-full h-1px lg:h-auto lg:w-1px lg:self-stretch bg-surface'></span>
              <div className='flex flex-col gap-2.5'>
                <div className='flex items-center gap-1.5'>
                  {/* <Icon name='clinicaddress' className='icon-wrapper w-5 h-5 text-blackdark' /> */}
                  <h5 className='text-lg font-bold text-blackdark leading-6'>AMD Provider Name</h5>
                </div>

                {details?.amd_provider_name ? (
                  <p className='text-base font-normal leading-22px text-blackdark break-all'>
                    {details?.amd_provider_name}
                  </p>
                ) : (
                  <>-</>
                )}
              </div>
            </div>
            {hasPermission(PermissionType.APPOINTMENT_VIEW) && (
              <div className='text-end pt-5 border-t border-solid border-surface'>
                <Button
                  variant='filled'
                  title='Go to All Appointment'
                  className='!text-base !leading-5 !px-6 rounded-10px'
                  icon={<Icon name='rightArrow' className='icon-wrapper w-5 h-5 text-white' />}
                  onClick={() =>
                    navigate(`/therapist-management/view-therapist/${therapist_id}/appointments`)
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TherapistDetailsPage;

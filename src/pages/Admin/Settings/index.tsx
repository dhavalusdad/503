import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { useGetPreferences, usePutPreferences } from '@/api/preferences';
import { UserRole } from '@/api/types/user.dto';
import { TIMEZONE_OPTIONS } from '@/constants/CommonConstant';
import { dispatchSetUser } from '@/redux/dispatch/user.dispatch';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import Select from '@/stories/Common/Select';
import Switch from '@/stories/Common/Switch';

const Settings = () => {
  const { data, dataUpdatedAt } = useGetPreferences();
  const user = useSelector(currentUser);
  const { mutateAsync: updatePreference } = usePutPreferences();

  useEffect(() => {
    const timezone = data?.timezone;

    if (timezone !== user?.timezone) {
      dispatchSetUser({ ...user, timezone });
    }
  }, [dataUpdatedAt]);

  return (
    <div className='flex flex-col gap-5'>
      <div className='bg-white rounded-20px p-5 flex flex-col gap-5'>
        <h5 className='text-lg font-bold leading-6 text-blackdark'>
          General Notification Settings
        </h5>
        <div className='flex flex-wrap gap-5 items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Icon name='todotimer' />
            <p className='text-base font-bold leading-22px text-blackdark'>Time-Zone</p>
          </div>
          <Select
            options={TIMEZONE_OPTIONS}
            value={TIMEZONE_OPTIONS.find(option => option.value === data?.timezone)}
            onChange={value => {
              if (value && 'value' in value) {
                updatePreference({ key: 'timezone', value: value.value });
              }
            }}
            parentClassName='w-72'
            StylesConfig={{
              control: () => ({
                minHeight: '50px',
                padding: '4px 6px',
              }),
              singleValue: () => ({
                fontSize: '16px',
              }),
              option: () => ({
                fontSize: '16px',
              }),
            }}
          />
        </div>
      </div>
      {user.role !== UserRole.BACKOFFICE && (
        <>
          <div className='bg-white rounded-20px p-5 flex flex-col gap-5'>
            <div className='flex flex-col gap-2'>
              <h5 className='text-lg font-bold leading-6 text-blackdark'>Notifications</h5>
              <p className='text-base font-normal leading-22px text-primarygray'>
                By default, we will send you notifications for appointments, assessments, etc.
                depending on your organization's settings. Turning off email, or text below will
                affect ALL notifications, including the ones set by your organization.
              </p>
            </div>
            <hr className='border-surface' />
            <div className='flex flex-col gap-3.5'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Icon name='mail' className='icon-wrapper w-5 h-5' />
                  <p className='text-base font-bold leading-22px text-blackdark'>Email</p>
                </div>
                <Switch
                  isChecked={data?.email_notifications_enabled ?? false}
                  onChange={e => {
                    updatePreference({
                      key: 'email_notifications_enabled',
                      value: e.target.checked,
                    });
                  }}
                />
              </div>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Icon name='textmessage' className='icon-wrapper w-5 h-5' />
                  <p className='text-base font-bold leading-22px text-blackdark'>Text</p>
                </div>
                <Switch
                  isChecked={data?.text_notifications_enabled ?? false}
                  onChange={e => {
                    updatePreference({
                      key: 'text_notifications_enabled',
                      value: e.target.checked,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          {user.role !== UserRole.ADMIN && (
            <div className='bg-white rounded-20px p-5 flex flex-col gap-5'>
              <div className='flex flex-col gap-2'>
                <h5 className='text-lg font-bold leading-6 text-blackdark'>
                  Additional Notifications
                </h5>
                <p className='text-base font-normal leading-22px text-primarygray'>
                  Please select when else you'd like to receive email, or text notifications.
                </p>
              </div>
              <hr className='border-surface' />
              <div className='flex items-start gap-5 justify-between'>
                <div className='flex items-start gap-3.5'>
                  <Icon name='mobilenotification' />
                  <div className='flex flex-col gap-1.5'>
                    <h6 className='text-base font-bold leading-22px text-blackdark'>
                      When someone is waiting for me to join a video call
                    </h6>
                    <p className='text-base font-normal leading-22px text-primarygray'>
                      Alerts you when someone is waiting for you to connect to your telehealth visit
                      at your appointment time.
                    </p>
                  </div>
                </div>
                <Switch
                  isChecked={data?.video_call_waiting_notifications_enabled ?? false}
                  onChange={e => {
                    updatePreference({
                      key: 'video_call_waiting_notifications_enabled',
                      value: e.target.checked,
                    });
                  }}
                />
              </div>
            </div>
          )}
          {/* <div className='bg-white rounded-20px p-5 flex flex-col gap-5'>
            <h5 className='text-lg font-bold leading-6 text-blackdark'>Chose the TPI</h5>
            <hr className='border-surface' />
            <div className='flex flex-wrap items-center gap-5'>
              <div className='relative bg-surfacelight border border-solid border-surface rounded-10px py-2.5 px-3.5'>
                <span className='text-blackdark text-base font-semibold leading-22px'>
                  Always available in the client portal
                </span>
              </div>
              <Switch isChecked />
              <div className='relative bg-surfacelight border border-solid border-surface rounded-10px py-2.5 px-3.5'>
                <span className='text-blackdark text-base font-semibold leading-22px'>
                  Only triggered as required pre-session forms.
                </span>
              </div>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
};

export default Settings;

import { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { useGetPreferences, usePutPreferences } from '@/api/preferences';
import { TIMEZONE_OPTIONS } from '@/constants/CommonConstant';
import { dispatchSetUser } from '@/redux/dispatch/user.dispatch';
import { currentUser } from '@/redux/ducks/user';
import Icon from '@/stories/Common/Icon';
import Select from '@/stories/Common/Select';
import Switch from '@/stories/Common/Switch';

export const ClientGeneralSettings = () => {
  const { data, dataUpdatedAt } = useGetPreferences();
  const { mutateAsync: updatePreference } = usePutPreferences();
  const user = useSelector(currentUser);

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
        <div className='flex flex-wrap gap-3 items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Icon name='todotimer' />
            <p className='text-base font-bold leading-22px text-blackdark'>Time-Zone</p>
          </div>
          <Select
            id='tour-timezone-select'
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

      <div className='bg-white rounded-20px p-5 flex flex-col gap-5' id='tour-notification-section'>
        <div className='flex flex-col gap-2'>
          <h5 className='text-lg font-bold leading-6 text-blackdark'>Notifications</h5>
          <p className='text-base font-normal leading-22px text-primarygray'>
            By default, we will send you notifications for appointments, assessments, etc. depending
            on your organization's settings. Turning off email, or text below will affect ALL
            notifications, including the ones set by your provider.
          </p>
        </div>
        <hr className='border-surface' />
        <div className='flex flex-col gap-3.5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-6'>
                <Icon name='mail' className='icon-wrapper w-5 h-5' />
              </div>
              <p className='text-base font-bold leading-22px text-blackdark'>Email</p>
            </div>
            <Switch
              isChecked={data?.email_notifications_enabled || false}
              onChange={e => {
                updatePreference({ key: 'email_notifications_enabled', value: e.target.checked });
              }}
            />
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-6'>
                <Icon name='textmessage' className='icon-wrapper w-5 h-5' />
              </div>
              <p className='text-base font-bold leading-22px text-blackdark'>Text</p>
            </div>
            <Switch
              isChecked={data?.text_notifications_enabled || false}
              onChange={e => {
                updatePreference({ key: 'text_notifications_enabled', value: e.target.checked });
              }}
            />
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-6'>
                <Icon name='doublemessage' className='icon-wrapper w-6 h-6' />
              </div>
              <p className='text-base font-bold leading-22px text-blackdark'>
                Chat Message <span className='text-sm font-normal text-gray-500'>(In app)</span>
              </p>
            </div>
            <Switch
              isChecked={data?.chat_notifications_enabled || false}
              onChange={e => {
                updatePreference({ key: 'chat_notifications_enabled', value: e.target.checked });
              }}
            />
          </div>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-6'>
                <Icon name='fillannouncement' className='icon-wrapper w-5 h-5' />
              </div>
              <p className='text-base font-bold leading-22px text-blackdark'>Marketing Campaigns</p>
            </div>
            <Switch
              isChecked={data?.marketing_notifications_enabled || false}
              onChange={e => {
                updatePreference({
                  key: 'marketing_notifications_enabled',
                  value: e.target.checked,
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className='bg-white rounded-20px p-5 flex flex-col gap-5'>
        <div className='flex flex-col gap-2'>
          <h5 className='text-lg font-bold leading-6 text-blackdark'>Additional Notifications</h5>
          <p className='text-base font-normal leading-22px text-primarygray'>
            Please select when else you'd like to receive notifications.
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
                Alerts you when someone is waiting for you to connect to your telehealth visit at
                your appointment time.
              </p>
            </div>
          </div>
          <Switch
            isChecked={data?.video_call_waiting_notifications_enabled || false}
            onChange={e => {
              updatePreference({
                key: 'video_call_waiting_notifications_enabled',
                value: e.target.checked,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

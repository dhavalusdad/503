import { useState, useEffect } from 'react';

import {
  getMediaDevices,
  getStoredDevicePreferences,
  storeDevicePreferences,
  type MediaDevices,
} from '@/features/video-call/utils/media';
import Select from '@/stories/Common/Select';

export function DeviceSelector() {
  const [devices, setDevices] = useState<MediaDevices>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInputId: '',
    videoInputId: '',
    audioOutputId: '',
  });

  useEffect(() => {
    loadDevices();
    loadStoredPreferences();
  }, []);

  const loadDevices = async () => {
    try {
      const mediaDevices = await getMediaDevices();
      setDevices(mediaDevices);
    } catch (error) {
      console.error('Failed to load media devices:', error);
    }
  };

  const loadStoredPreferences = () => {
    const preferences = getStoredDevicePreferences();
    setSelectedDevices(preferences);
  };

  const handleDeviceChange = (deviceType: keyof typeof selectedDevices, deviceId: string) => {
    const newSelection = { ...selectedDevices, [deviceType]: deviceId };
    setSelectedDevices(newSelection);
    storeDevicePreferences(
      newSelection.audioInputId,
      newSelection.videoInputId,
      newSelection.audioOutputId
    );
  };

  return (
    <div className='space-y-4'>
      <h3 className='text-white text-sm font-medium'>Device Settings</h3>

      <div className='space-y-3'>
        <div>
          <label className='block text-xs text-gray-300 mb-1'>Microphone</label>
          <Select
            value={selectedDevices.audioInputId}
            onChange={value => handleDeviceChange('audioInputId', value as string)}
            options={['', ...devices.audioInputs.map(device => device.deviceId)]}
            getOptionLabel={option => {
              if (option === '') return 'Default Microphone';
              const found = devices.audioInputs.find(d => d.deviceId === option);
              return found ? found.label : option;
            }}
            className='w-full'
          />
        </div>

        <div>
          <label className='block text-xs text-gray-300 mb-1'>Camera</label>
          <Select
            value={selectedDevices.videoInputId}
            onChange={value => handleDeviceChange('videoInputId', value as string)}
            options={['', ...devices.videoInputs.map(device => device.deviceId)]}
            getOptionLabel={option => {
              if (option === '') return 'Default Camera';
              const found = devices.videoInputs.find(d => d.deviceId === option);
              return found ? found.label : option;
            }}
            className='w-full'
          />
        </div>

        <div>
          <label className='block text-xs text-gray-300 mb-1'>Speaker</label>
          <Select
            value={selectedDevices.audioOutputId}
            onChange={value => handleDeviceChange('audioOutputId', value as string)}
            options={['', ...devices.audioOutputs.map(device => device.deviceId)]}
            getOptionLabel={option => {
              if (option === '') return 'Default Speaker';
              const found = devices.audioOutputs.find(d => d.deviceId === option);
              return found ? found.label : option;
            }}
            className='w-full'
          />
        </div>
      </div>
    </div>
  );
}

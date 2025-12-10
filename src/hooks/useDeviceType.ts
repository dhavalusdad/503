import { useEffect, useState } from 'react';

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState('desktop');

  const checkDeviceType = () => {
    const width = window.innerWidth;
    if (width <= 639) {
      setDeviceType('mobile');
    } else if (width <= 767) {
      setDeviceType('mobilehorizontal');
    } else if (width <= 1023) {
      setDeviceType('tablet');
    } else if (width < 1279) {
      setDeviceType('tabletbigger');
    } else {
      setDeviceType('desktop');
    }
  };

  useEffect(() => {
    checkDeviceType(); // run on mount
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  return deviceType;
}

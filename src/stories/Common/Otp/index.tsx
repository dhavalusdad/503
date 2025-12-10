import React, { useEffect, useState } from 'react';

import { InputField } from '@/stories/Common/Input';

interface OtpProps {
  length: number;
  isValid: boolean;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
}

const Otp = ({ setValue, length = 6, isValid, value }: OtpProps) => {
  const [OtpValue, setOtpValue] = useState(Array.from({ length }).fill(''));

  const handleCopiedOtp = (e: ClipboardEvent) => {
    // e.preventDefault();
    const pastedData = e.clipboardData?.getData('text/plain').replace(/\D/g, ''); // Remove non-digits

    if (!pastedData) return;
    const newOtpValue = [...OtpValue];
    for (let i = 0; i < length; i++) {
      newOtpValue[i] = pastedData[i] || '';
    }
    setOtpValue(newOtpValue);
  };

  useEffect(() => {
    if (!value) {
      setOtpValue(Array.from({ length }).fill(''));
    }
  }, [value]);

  useEffect(() => {
    const input = document.getElementById('input-otp-div');
    if (input) {
      input.addEventListener('paste', handleCopiedOtp);
    }
    window.addEventListener('paste', handleCopiedOtp);
    return () => {
      if (input) {
        input.removeEventListener('paste', handleCopiedOtp);
      }
      window.removeEventListener('paste', handleCopiedOtp);
    };
  }, [OtpValue, length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value;

    if (inputValue.length > 1) {
      e.target.value = inputValue.slice(0, 1);
    }

    const newOtpValue = [...OtpValue];
    newOtpValue[index] = e.target.value;
    setOtpValue(newOtpValue);

    if (e.target.value && index < length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'v' && e.ctrlKey) {
      handleChangeNavigator().then(windowClipBoard => {
        const newOtpValue = [...OtpValue];
        const pastedData = windowClipBoard.replace(/\D/g, '');
        for (let i = 0; i < Math.min(pastedData.length, length); i++) {
          newOtpValue[i] = pastedData[i];
        }
        setOtpValue(newOtpValue);
      });
      return;
    }
    // Handle backspace
    if (e.key === 'Backspace') {
      const newOtpValue = [...OtpValue];

      if (OtpValue[index]) {
        newOtpValue[index] = '';
        setOtpValue(newOtpValue);
      } else if (index > 0) {
        newOtpValue[index - 1] = '';
        setOtpValue(newOtpValue);
        const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
        prevInput?.focus();
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }

    if (
      !/[0-9]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // console.log(e)
    // e.preventDefault()

    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, ''); // Remove non-digits

    const newOtpValue = [...OtpValue];
    for (let i = 0; i < Math.min(pastedData.length, length); i++) {
      newOtpValue[i] = pastedData[i];
    }
    setOtpValue(newOtpValue);

    // Focus the next empty field or last field
    const nextEmptyIndex = newOtpValue.findIndex(val => val === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    const targetInput = document.getElementById(`otp-${focusIndex}`) as HTMLInputElement;
    targetInput?.focus();
  };
  const handleChangeNavigator = async () => {
    const text = await navigator.clipboard.readText();
    return text;
  };
  // This useEffect will call setValue whenever OtpValue changes
  useEffect(() => {
    const otpString = OtpValue.join('');
    setValue(otpString);
  }, [OtpValue, setValue]);

  return (
    <>
      <div className='flex items-center gap-2.5 sm:gap-6 justify-between w-full' id='input-otp-div'>
        {OtpValue.map((digit, index) => (
          <InputField
            key={index}
            id={`otp-${index}`}
            onChange={e => handleChange(e, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onPaste={handlePaste}
            value={digit as string} // Changed from 'number' to 'string'
            type='text'
            inputMode='text'
            pattern='[0-9]*'
            maxLength={1}
            inputClass={`text-center text-xl !py-2.5 !w-11 sm:!w-[50px] ${!isValid ? 'border-red-500' : ''}`}
            autoComplete='one-time-code'
          />
        ))}
      </div>
      {!isValid && ( // Fixed: should show error when NOT valid
        <p className={'text-xs text-red-500 mt-1.5'}>Please enter valid OTP</p>
      )}
    </>
  );
};

export default Otp;

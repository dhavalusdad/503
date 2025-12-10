import { useEffect, useState } from 'react';

import Icon from '@/stories/Common/Icon';

export interface PasswordCheckerInterface {
  password: string;
}

const PasswordChecker = ({ password = '' }: PasswordCheckerInterface) => {
  const [validatePassword, setValidatePassword] = useState({
    uppercase: false,
    lowercase: false,
    number: false,
    specialCharacter: false,
    length: false,
  });

  const handleValidatePassword = () => {
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const specialCharacterRegex = /[@#$%^&*(),.?":{}|<>!]/;

    setValidatePassword({
      uppercase: uppercaseRegex.test(password),
      lowercase: lowercaseRegex.test(password),
      number: numberRegex.test(password),
      specialCharacter: specialCharacterRegex.test(password),
      length: password.length >= 8,
    });
  };

  const customClass = (key: string) =>
    `flex items-center gap-2 text-sm font-normal leading-3.5 ${
      validatePassword[key as keyof typeof validatePassword] ? 'text-Green' : 'text-Red'
    }`;

  const validationList = [
    { title: 'At least 8 characters', key: 'length' },
    { title: 'Contains one lowercase letter', key: 'lowercase' },
    { title: 'Contains one uppercase letter', key: 'uppercase' },
    { title: 'Contain one number', key: 'number' },
    { title: 'Contain one special character (@,#,$,%, etc.)', key: 'specialCharacter' },
  ];

  useEffect(() => {
    handleValidatePassword();
  }, [password]);

  return (
    <ul className='flex flex-col gap-2.5'>
      {validationList.map((element, index) => (
        <li key={index} className={customClass(element.key)}>
          <Icon
            name={
              validatePassword[element.key as keyof typeof validatePassword]
                ? 'validcheck'
                : 'invalidcross'
            }
            className='icon-wrapper w-18px h-18px'
          />
          <span>{element.title}</span>
        </li>
      ))}
    </ul>
  );
};

export default PasswordChecker;

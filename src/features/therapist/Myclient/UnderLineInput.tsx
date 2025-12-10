import { type UseFormRegisterReturn } from 'react-hook-form';

type UnderlineInputProps = {
  register: UseFormRegisterReturn;
  placeholder?: string;
  full?: boolean;
};

export const UnderlineInput: React.FC<UnderlineInputProps> = ({
  register,
  placeholder = '',
  full = false,
}) => (
  <input
    {...register}
    placeholder={placeholder}
    className={`
      border-b-2 border-black bg-transparent outline-none px-1 text-base font-medium text-gray-900
      ${full ? 'w-full block' : 'inline-block min-w-64'}
    `}
  />
);

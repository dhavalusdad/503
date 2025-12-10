import { useEffect, useState } from 'react';

export const CustomRatingSlider = ({
  onLabelChange,
}: {
  onLabelChange?: (label: string) => void;
}) => {
  const [value, setValue] = useState(50);

  const labels = ['Awful', 'Bad', 'Okay', 'Good', 'Great'];

  const getActiveLabel = () => {
    const index = Math.round((value / 100) * (labels.length - 1));
    return labels[index];
  };

  useEffect(() => {
    if (onLabelChange) {
      onLabelChange(getActiveLabel());
    }
  }, [value]);

  const colors = ['#FF834D', '#E0864C', '#C18A4B', '#839149', '#08A045'];

  return (
    <div className='w-full'>
      <div className='relative h-18px'>
        <input
          type='range'
          min='0'
          max='100'
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className='absolute w-full h-2.5 appearance-none bg-transparent pointer-events-auto z-20'
        />
        <div className='absolute top-1/2 w-full h-2.5 rounded-full -translate-y-1/2 bg-black/14'></div>
        <div
          className='absolute top-1/2 h-2.5 rounded-full -translate-y-1/2 z-10'
          style={{
            width: `${value}%`,
            background: `linear-gradient(to right, ${colors.join(', ')})`,
          }}
        ></div>
        <div
          className='absolute top-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md -translate-y-1/2 pointer-events-none z-30'
          style={{
            left: `calc(${value}% - 10px)`,
            backgroundColor: '#08A045',
          }}
        ></div>
      </div>
      <div className='flex justify-between mt-5 text-gray-700 font-medium'>
        {labels.map((label, idx) => (
          <span
            key={idx}
            className={`text-sm font-medium ${getActiveLabel() === label ? '!font-bold' : ''}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CustomRatingSlider;

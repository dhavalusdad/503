export function Timer({ time }: { time: string }) {
  return (
    <div
      className='flex items-center gap-2 bg-white/10 border border-solid border-white/20 px-3.5 py-2
     rounded-10px backdrop-blur-[18px]'
    >
      <div className='w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse' />
      <span className='text-base font-medium leading-22px text-white'>{time}</span>
    </div>
  );
}

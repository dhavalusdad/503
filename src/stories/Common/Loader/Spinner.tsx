export const SectionLoader = ({
  className,
  size = 'h-16 w-16'
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <div
      className={`absolute inset-0 bg-white/50 backdrop-blur-sm z-[9] flex items-center justify-center ${className}`}>
      <span
        className={`relative border-[5px] border-lime-200 border-b-lime-500 rounded-full block animate-spin ${size}`}
      />
    </div>
  );
};

export default SectionLoader;

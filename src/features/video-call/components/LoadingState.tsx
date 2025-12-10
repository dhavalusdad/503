interface LoadingStateProps {
  roomId: string;
}

export const LoadingState = ({ roomId }: LoadingStateProps) => (
  <div className='min-h-screen bg-blacklightdark flex items-center justify-center'>
    <div className='text-center text-white'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
      <h2 className='text-2xl font-bold mb-2'>Joining Room</h2>
      <p className='text-gray-400'>Connecting to {roomId}...</p>
    </div>
  </div>
);

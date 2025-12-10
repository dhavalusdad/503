interface ErrorStateProps {
  connectionError: string | null;
  onRetry: () => void;
}

export const ErrorState = ({ connectionError, onRetry }: ErrorStateProps) => (
  <div className='h-screen bg-blacklightdark flex items-center justify-center'>
    <div className='text-center text-white'>
      <h2 className='text-2xl font-bold mb-2'>Connection Lost</h2>
      <p className='text-gray-400 mb-4'>{connectionError || 'Disconnected from the room'}</p>
      <div className='flex gap-4 justify-center flex-wrap'>
        <button
          onClick={onRetry}
          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

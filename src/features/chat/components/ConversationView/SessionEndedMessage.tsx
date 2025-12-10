import React from 'react';

const SessionEndedMessage: React.FC<{ recipientName: string }> = React.memo(({ recipientName }) => (
  <div className='w-full pb-5 px-3.5'>
    <div className='bg-surface p-2.5 flex flex-col items-center justify-center gap-1.5 rounded-10px'>
      <h6 className='text-sm font-semibold text-blackdark leading-18px'>
        Your session with {recipientName} has ended.
      </h6>
      <p className='text-sm font-normal text-primarygray text-center leading-18px'>
        For any further queries, please reach out via our support chat or contact us directly.
      </p>
    </div>
  </div>
));

export default SessionEndedMessage;

import { useEffect } from 'react';

import DOMPurify from 'dompurify';

import Button from '@/stories/Common/Button';

interface ClientAgreementRendererProps {
  title: string;
  description: string;
  onAgree: () => void;
  isAgreed: boolean;
  isLoading: boolean;
}

const ClientAgreementRenderer = ({
  title,
  description,
  onAgree,
  isAgreed,
  isLoading,
}: ClientAgreementRendererProps) => {
  const safeDescription = DOMPurify.sanitize(description);

  // Inject styles for rendered HTML
  useEffect(() => {
    const styleId = 'rendered-html-list-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .rendered-html-content ul { list-style-type: disc !important; margin: 1em 0 !important; padding-left: 2em !important; }
        .rendered-html-content ol { list-style-type: decimal !important; margin: 1em 0 !important; padding-left: 2em !important; }
        .rendered-html-content li { display: list-item !important; margin: 0.25em 0 !important; padding-left: 0.25em !important; }
        .rendered-html-content ul ul { list-style-type: circle !important; margin: 0.5em 0 !important; }
        .rendered-html-content ul ul ul { list-style-type: square !important; }
        .rendered-html-content ol ol { list-style-type: lower-alpha !important; }
        .rendered-html-content p { margin: 0.5em 0; }
        .rendered-html-content h1, .rendered-html-content h2, .rendered-html-content h3 { margin: 1em 0 0.5em 0; font-weight: bold; }
        .rendered-html-content h1 { font-size: 1.5em; }
        .rendered-html-content h2 { font-size: 1.3em; }
        .rendered-html-content h3 { font-size: 1.1em; }
        .rendered-html-content blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em; font-style: italic; }
        .rendered-html-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .rendered-html-content table th, .rendered-html-content table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .rendered-html-content table th { background-color: #f2f2f2; font-weight: bold; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='bg-white rounded-20px border border-solid border-surface p-5'>
      <div className='flex flex-col justify-center flex-wrap gap-5'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-2xl font-bold leading-8 text-blackdark'>{title}</h3>
          <div
            className='rendered-html-content'
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>
        <div className='flex flex-col justify-end items-end gap-5'>
          <Button
            onClick={onAgree}
            variant='filled'
            className='bg-primary text-white px-4 py-2 rounded-10px'
            title={isAgreed ? 'Agreed' : 'Agree'}
            isDisabled={isAgreed}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientAgreementRenderer;

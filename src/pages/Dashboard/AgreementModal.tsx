import { useState } from 'react';

import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';

import { useSignAgreementBulk } from '@/api/user';
import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Modal from '@/stories/Common/Modal';

interface Agreement {
  id: string;
  title: string;
  description: string;
  doc?: string;
  doc_path?: string;
}

interface AgreementModalProps {
  isOpen: boolean;
  pendingAgreements: Agreement[];
}

const SERVER_URL = import.meta.env.VITE_BASE_URL;

const AgreementModal = ({ isOpen, pendingAgreements }: AgreementModalProps) => {
  const { mutateAsync: signAgreementBulk } = useSignAgreementBulk();
  const [checkedAgreements, setCheckedAgreements] = useState<string[]>([]);
  const [isAgreeCheckedLoading, setIsAgreeCheckedLoading] = useState(false);
  const [isAgreeAllLoading, setIsAgreeAllLoading] = useState(false);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckedAgreements(prev => (checked ? [...prev, id] : prev.filter(item => item !== id)));
  };

  const allChecked = pendingAgreements?.length === checkedAgreements.length;

  // Agree selected checked agreements
  const handleAgreeChecked = async () => {
    if (checkedAgreements.length === 0) return;
    try {
      setIsAgreeCheckedLoading(true);
      await signAgreementBulk({ agreement_ids: checkedAgreements });
      setCheckedAgreements([]);
    } catch (error) {
      console.error('Failed to sign agreements:', error);
    } finally {
      setIsAgreeCheckedLoading(false);
    }
  };

  // Agree all agreements
  const handleAgreeAll = async () => {
    if (!pendingAgreements?.length) return;
    try {
      setIsAgreeAllLoading(true);
      const allIds = pendingAgreements.map((a: Agreement) => a.id);
      await signAgreementBulk({ agreement_ids: allIds });
      setCheckedAgreements([]);
    } catch (error) {
      console.error('Failed to sign all agreements:', error);
    } finally {
      setIsAgreeAllLoading(false);
    }
  };

  if (!pendingAgreements?.length) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      className='max-w-4xl'
      size='3xl'
      title='Pending Agreements'
      closeButton={false}
      footerClassName='pt-30px'
      footer={
        <div className='flex items-center justify-end gap-5'>
          <Button
            variant='filled'
            onClick={handleAgreeChecked}
            isDisabled={checkedAgreements.length === 0 || isAgreeCheckedLoading}
            isLoading={isAgreeCheckedLoading}
            title={isAgreeCheckedLoading ? 'Submitting...' : 'Agree Checked Items'}
            className='!px-6 rounded-lg'
          />
          <Button
            variant='filled'
            onClick={handleAgreeAll}
            isDisabled={allChecked || isAgreeAllLoading}
            isLoading={isAgreeAllLoading}
            title={isAgreeAllLoading ? 'Submitting...' : 'Agree All'}
            className='!px-6 rounded-lg'
          />
        </div>
      }
    >
      <div className='relative flex flex-col gap-5'>
        <h5 className='text-blackdark text-xl font-semibold'>
          Please review agreements below and agree to continue.
        </h5>
        {pendingAgreements.map((agreement: Agreement) => {
          const safeDescription = DOMPurify.sanitize(agreement?.description || '');
          return (
            <div
              key={agreement.id}
              className='bg-Graylight border border-solid border-surface rounded-lg p-5'
            >
              <h3 className='text-lg font-semibold mb-2'>{agreement.title}</h3>
              <div
                className='text-sm text-blackdark mb-3 agreement-content'
                dangerouslySetInnerHTML={{ __html: safeDescription }}
              />
              {agreement?.doc_path && agreement?.doc && (
                <Link
                  to={`${SERVER_URL}/${agreement.doc_path}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary text-sm font-medium hover:underline block mb-3'
                >
                  {agreement.doc}
                </Link>
              )}
              <CheckboxField
                id={`agree-${agreement.id}`}
                label='I agree to the terms above'
                labelClass='whitespace-nowrap'
                isChecked={checkedAgreements.includes(agreement.id)}
                onChange={e => handleCheckboxChange(agreement.id, e.target.checked)}
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default AgreementModal;

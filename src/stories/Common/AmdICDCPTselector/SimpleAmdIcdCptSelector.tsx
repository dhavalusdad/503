import { useMemo, useState } from 'react';

import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { useGetProblemList } from '@/api/ amdForm';
import type { ProblemListItem } from '@/api/types/amd.dto';
import { currentUser } from '@/redux/ducks/user';
import Button from '@/stories/Common/Button';
import Select from '@/stories/Common/Select';

import cptJson from './CPTcode.json';
import icdJson from './icd10_clean_with_refinement.json';

type ICDSourceItem = {
  code?: string;
  description?: string;
};

type CPTSourceItem = {
  chargeCode?: string;
  description?: string;
  usageCount?: number;
};

type NormalizedICDItem = {
  code: string;
  description: string;
};

type NormalizedCPTItem = {
  chargeCode: string;
  description: string;
  usageCount?: number;
};

type SelectOption<T> = {
  value: string;
  label: string;
  data: T;
};

type ICDOption = SelectOption<NormalizedICDItem>;
type CPTOption = SelectOption<NormalizedCPTItem>;
type ProblemListOption = SelectOption<ProblemListItem>;

export interface AmdSimpleIcdCptSelectorChange {
  icdCodes: NormalizedICDItem[];
  cptCodes: NormalizedCPTItem[];
  problemList: ProblemListItem[];
}

interface AmdSimpleIcdCptSelectorProps {
  onChange?: (payload: AmdSimpleIcdCptSelectorChange) => void;
  className?: string;
  problemListLabel?: string;
}

const normalizeIcdData = (item: ICDSourceItem, index: number): ICDOption => {
  const code = item.code?.trim() || `ICD-${index}`;
  const description = item.description?.trim() || 'No description available';
  return {
    value: code,
    label: `${code} - ${description}`,
    data: {
      code,
      description,
    },
  };
};

const normalizeCptData = (item: CPTSourceItem, index: number): CPTOption => {
  const code = item.chargeCode?.trim() || `CPT-${index}`;
  const description = item.description?.trim() || 'No description available';
  return {
    value: code,
    label: `${code} - ${description}`,
    data: {
      chargeCode: code,
      description,
      usageCount: item.usageCount,
    },
  };
};

export const AmdSimpleIcdCptSelector = ({
  onChange,
  className = '',
}: AmdSimpleIcdCptSelectorProps) => {
  const [selectedIcdCodes, setSelectedIcdCodes] = useState<ICDOption[]>([]);
  const [selectedCptCodes, setSelectedCptCodes] = useState<CPTOption[]>([]);
  const [selectedProblemListItems, setSelectedProblemListItems] = useState<ProblemListOption[]>([]);

  const { client_id } = useSelector(currentUser);

  const { id } = useParams();

  const icdOptions = useMemo<ICDOption[]>(() => icdJson.map(normalizeIcdData), []);
  const cptOptions = useMemo<CPTOption[]>(() => cptJson.map(normalizeCptData), []);

  const { data: problemListResponse, isLoading: isProblemListLoading } = useGetProblemList(
    client_id ?? id
  );

  const normalizedProblemList = useMemo<ProblemListItem[]>(() => {
    return (
      problemListResponse?.data?.map((item: ProblemListItem) => ({
        ...item,
        code: item.code || item.diagnosisCode || '',
        description: item.description || item.diagnosisDescription || item.name || '',
      })) ?? []
    );
  }, [problemListResponse]);

  const problemListOptions = useMemo<ProblemListOption[]>(() => {
    return normalizedProblemList.map((item, index) => {
      const code = item.code?.trim() || item.id || `problem-${index}`;
      const description = item.description?.trim() || item.name || 'No description available';
      return {
        value: String(code),
        label: `${code} - ${description}`,
        data: item,
      };
    });
  }, [normalizedProblemList]);

  const emitChange = (
    icd = selectedIcdCodes,
    cpt = selectedCptCodes,
    problemItems = selectedProblemListItems
  ) => {
    onChange?.({
      icdCodes: icd.map(option => option.data),
      cptCodes: cpt.map(option => option.data),
      problemList: problemItems.map(option => option.data),
    });
    setSelectedIcdCodes([]);
    setSelectedCptCodes([]);
    setSelectedProblemListItems([]);
  };

  return (
    <div
      className={`flex flex-col gap-6 bg-white border border-gray-200 rounded-10px p-5 ${className}`}
    >
      <section className='flex flex-col gap-3'>
        <Select
          placeholder='Search ICD-10 codes'
          isMulti
          label='ICD Codes'
          options={icdOptions}
          value={selectedIcdCodes}
          onChange={value => setSelectedIcdCodes((value as ICDOption[]) ?? [])}
          noOptionsMessage={() => 'No ICD codes found'}
        />

        <div className='flex flex-col gap-3 lg:flex-row lg:items-end'>
          <div className='flex-1'>
            <Select
              label={'Patient Problem List'}
              placeholder='Search problem list'
              isMulti
              isDisabled={problemListOptions.length === 0 && !isProblemListLoading}
              isLoading={isProblemListLoading}
              options={problemListOptions}
              value={selectedProblemListItems}
              onChange={value => setSelectedProblemListItems((value as ProblemListOption[]) ?? [])}
              noOptionsMessage={() =>
                isProblemListLoading ? 'Loading problem list...' : 'No items in the problem list'
              }
            />
          </div>
        </div>
      </section>

      <section className='flex flex-col gap-3'>
        <Select
          label='CPT Codes'
          placeholder='Search CPT codes'
          isMulti
          options={cptOptions}
          value={selectedCptCodes}
          onChange={value => setSelectedCptCodes((value as CPTOption[]) ?? [])}
          noOptionsMessage={() => 'No CPT codes found'}
        />
      </section>
      <Button
        variant='filled'
        title='Add selected problems'
        className='rounded-10px lg:w-[220px]'
        onClick={() => emitChange()}
      />
    </div>
  );
};

export default AmdSimpleIcdCptSelector;

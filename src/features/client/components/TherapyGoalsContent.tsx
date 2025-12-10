import React, { useState, useEffect } from 'react';

import Button from '@/stories/Common/Button';
import CheckboxField from '@/stories/Common/CheckBox';
import Icon from '@/stories/Common/Icon';
import InputField from '@/stories/Common/Input';

export const TherapyGoalsContent: React.FC = ({
  handleGoal,
  handleExistingGoalUpdate,
  handleDeleteGoal,
  initialData,
}: {
  handleGoal?: (goals: { id: string; text: string; completed: boolean }[]) => void;
  handleExistingGoalUpdate?: (updates: { id: string; completed: boolean }[]) => void;
  handleDeleteGoal?: (goalId: string) => void;
  initialData?: { id: string; text: string; completed: boolean }[];
}) => {
  const [existingGoals, setExistingGoals] = useState<
    { id: string; text: string; completed: boolean }[]
  >([]);
  const [newGoals, setNewGoals] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: Date.now().toString(), text: '', completed: false },
  ]);

  const [modifiedExistingGoals, setModifiedExistingGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setExistingGoals(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const goalsToSubmit = newGoals.filter(goal => goal.text.trim() !== '');
    handleGoal?.(goalsToSubmit);
  }, [newGoals, handleGoal]);

  useEffect(() => {
    if (modifiedExistingGoals.size > 0) {
      const updatedGoals = existingGoals
        .filter(goal => modifiedExistingGoals.has(goal.id))
        .map(goal => ({ id: goal.id, completed: goal.completed }));
      handleExistingGoalUpdate?.(updatedGoals);
    } else {
      handleExistingGoalUpdate?.([]);
    }
  }, [existingGoals, modifiedExistingGoals, handleExistingGoalUpdate]);

  const toggleExistingGoal = (id: string) => {
    setExistingGoals(prev =>
      prev.map(goal => (goal.id === id ? { ...goal, completed: !goal.completed } : goal))
    );

    setModifiedExistingGoals(prev => new Set(prev).add(id));
  };

  const addNewGoal = () => {
    setNewGoals(prev => [...prev, { id: Date.now().toString(), text: '', completed: false }]);
  };

  const updateNewGoal = (id: string, text: string) => {
    setNewGoals(prev => prev.map(goal => (goal.id === id ? { ...goal, text } : goal)));
  };

  const toggleNewGoal = (id: string) => {
    setNewGoals(prev =>
      prev.map(goal => (goal.id === id ? { ...goal, completed: !goal.completed } : goal))
    );
  };

  const removeNewGoal = (id: string) => {
    if (newGoals.length > 1) {
      setNewGoals(prev => prev.filter(goal => goal.id !== id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addNewGoal();
    }
  };

  return (
    <div className='flex flex-col gap-5'>
      {/* Existing Goals Section - Checkbox + Delete Icon */}
      {existingGoals.length > 0 && (
        <div className='flex flex-col gap-5'>
          <h3 className='text-lg font-bold text-blackdark leading-6'>Current Therapy Goals</h3>
          {existingGoals.map(goal => (
            <div key={goal.id} className='flex items-center gap-3'>
              <div className='flex-1 overflow-hidden flex items-center px-3 py-3.5 bg-Gray border border-solid border-surface rounded-lg'>
                <CheckboxField
                  id={`existing-${goal.id}`}
                  labelClass='flex-1 truncate !w-auto'
                  parentClassName='flex-1 overflow-hidden'
                  label={goal.text}
                  isChecked={goal.completed}
                  onChange={() => toggleExistingGoal(goal.id)}
                  className='!w-5 !h-5'
                />
              </div>
              {/* Delete button for existing goals */}
              <div
                className='w-50px h-50px bg-red-100 flex items-center justify-center rounded-lg cursor-pointer hover:bg-red-200 transition-colors'
                onClick={() => handleDeleteGoal?.(goal.id)}
                title='Delete this goal'
              >
                <Icon name='close' color='red' />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Goals Section - Fully Editable */}
      <div className='flex flex-col gap-5'>
        <h3 className='text-lg font-bold text-blackdark leading-6'>Add New Therapy Goals</h3>
        {newGoals.map((goal, index) => (
          <div key={goal.id} className='flex items-center gap-3'>
            <CheckboxField
              id={`new-${goal.id}`}
              labelClass='w-full'
              parentClassName='w-full'
              label={
                <div className='flex gap-2 w-full'>
                  <InputField
                    id={`${goal.id}input`}
                    type='text'
                    placeholder={`Enter your new Goal ${existingGoals.length + index + 1}`}
                    value={goal.text}
                    onKeyDown={handleKeyDown}
                    onChange={e => updateNewGoal(goal.id, e.target.value)}
                    parentClassName='w-full'
                    className='flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 focus:border-blue-500'
                  />
                  {newGoals.length > 1 && (
                    <div
                      className='bg-red-100 flex items-center rounded-md cursor-pointer p-1 hover:bg-red-200 transition-colors'
                      onClick={() => removeNewGoal(goal.id)}
                      title='Remove this goal'
                    >
                      <Icon name='close' color='red' />
                    </div>
                  )}
                </div>
              }
              isChecked={goal.completed}
              onChange={() => toggleNewGoal(goal.id)}
              className='w-4 h-4 text-green-600 rounded focus:ring-green-500'
            />
          </div>
        ))}
      </div>

      <Button
        variant='none'
        title=' Add Another Goal'
        icon={<Icon name='plus' color='red' />}
        onClick={addNewGoal}
        parentClassName='w-full'
        className=' text-blackdark w-full border-2 border-dashed border-surface rounded-lg hover:border-blackdark/40'
      />

      <div className='p-4 bg-indigo-200 rounded-lg'>
        <p className='text-sm text-indigo-600'>
          <span className='font-bold'>Tips : </span>
          Press Enter to move to the next goal or create a new one. Check the box to mark goals as
          completed.
        </p>
      </div>
    </div>
  );
};

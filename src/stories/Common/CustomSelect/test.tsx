import React, { useState } from 'react';
import CustomSelect, { type SelectOption } from './index';

/**
 * Test component to verify CustomSelect functionality
 */
const CustomSelectTest: React.FC = () => {
  const [testValue, setTestValue] = useState<SelectOption | null>(null);
  const [testMultiValue, setTestMultiValue] = useState<SelectOption[]>([]);

  const testOptions: SelectOption[] = [
    { value: 'apple', label: 'Apple', icon: 'dashboard' },
    { value: 'banana', label: 'Banana', icon: 'client' },
    { value: 'cherry', label: 'Cherry', icon: 'appointment' },
    { value: 'date', label: 'Date', icon: 'calendar' },
    { value: 'elderberry', label: 'Elderberry', icon: 'chat' },
    { value: 'fig', label: 'Fig', icon: 'settings' },
    { value: 'grape', label: 'Grape', icon: 'phone' },
    { value: 'honeydew', label: 'Honeydew', icon: 'mail' },
    // { value: 'disabled', label: 'Disabled Option', disabled: true, icon: 'close' },
  ];

  const handleSingleChange = (value: SelectOption | SelectOption[] | null) => {
    if (Array.isArray(value)) {
      setTestValue(value[0] || null);
    } else {
      setTestValue(value);
    }
  };

  const handleMultiChange = (value: SelectOption | SelectOption[] | null) => {
    if (Array.isArray(value)) {
      setTestMultiValue(value);
    } else if (value) {
      setTestMultiValue([value]);
    } else {
      setTestMultiValue([]);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Custom Select Test</h1>
      
      {/* Single Select Test */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Single Select Test</h2>
        <CustomSelect
          options={testOptions}
          value={testValue}
          onChange={handleSingleChange}
          placeholder="Select a fruit..."
          label="Single Select"
          isClearable
        />
        <div className="text-sm">
          <strong>Selected:</strong> {testValue ? testValue.label : 'None'} 
          {testValue && ` (${testValue.value})`}
        </div>
      </div>

      {/* Single Select with Icons */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Single Select with Icons</h2>
        <CustomSelect
          options={testOptions}
          value={testValue}
          onChange={handleSingleChange}
          placeholder="Select a fruit with icon..."
          label="Single Select with Icons"
          isClearable
          showIcons
        />
        <div className="text-sm">
          <strong>Selected:</strong> {testValue ? testValue.label : 'None'} 
          {testValue && ` (${testValue.value})`}
        </div>
      </div>

      {/* Multi Select Test */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Multi Select Test</h2>
        <CustomSelect
          options={testOptions}
          value={testMultiValue}
          onChange={handleMultiChange}
          placeholder="Select multiple fruits..."
          label="Multi Select"
          isMulti
          isClearable
        />
        <div className="text-sm">
          <strong>Selected:</strong> {testMultiValue.length > 0 
            ? testMultiValue.map(v => v.label).join(', ') 
            : 'None'
          }
        </div>
      </div>

      {/* Multi Select with Icons */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Multi Select with Icons</h2>
        <CustomSelect
          options={testOptions}
          value={testMultiValue}
          onChange={handleMultiChange}
          placeholder="Select multiple fruits with icons..."
          label="Multi Select with Icons"
          isMulti
          isClearable
          showIcons
          iconClassName="text-blue-600"
        />
        <div className="text-sm">
          <strong>Selected:</strong> {testMultiValue.length > 0 
            ? testMultiValue.map(v => v.label).join(', ') 
            : 'None'
          }
        </div>
      </div>

      {/* Multi Select with Chip Limit */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Multi Select with Chip Limit (Max 3)</h2>
        <CustomSelect
          options={testOptions}
          value={testMultiValue}
          onChange={handleMultiChange}
          placeholder="Select multiple fruits (max 3 chips shown)..."
          label="Multi Select with Chip Limit"
          isMulti
          isClearable
          showIcons
          iconClassName="text-blue-600"
          maxChips={3}
          moreChipsText="more items"
        />
        <div className="text-sm">
          <strong>Selected:</strong> {testMultiValue.length > 0 
            ? testMultiValue.map(v => v.label).join(', ') 
            : 'None'
          }
        </div>
      </div>

      {/* Multi Select with Chip Limit (Max 2) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Multi Select with Chip Limit (Max 2)</h2>
        <CustomSelect
          options={testOptions}
          value={testMultiValue}
          onChange={handleMultiChange}
          placeholder="Select multiple fruits (max 2 chips shown)..."
          label="Multi Select with Chip Limit"
          isMulti
          isClearable
          showIcons
          iconClassName="text-blue-600"
          maxChips={2}
          moreChipsText="more"
        />
        <div className="text-sm">
          <strong>Selected:</strong> {testMultiValue.length > 0 
            ? testMultiValue.map(v => v.label).join(', ') 
            : 'None'
          }
        </div>
      </div>

      {/* Test Controls */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Test Controls</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTestValue({ value: 'apple', label: 'Apple' })}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set Apple
          </button>
          <button
            onClick={() => setTestValue(null)}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Single
          </button>
          <button
            onClick={() => setTestMultiValue([{ value: 'banana', label: 'Banana', icon: 'client' }, { value: 'cherry', label: 'Cherry', icon: 'appointment' }])}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Set Banana & Cherry
          </button>
          <button
            onClick={() => setTestMultiValue([
              { value: 'apple', label: 'Apple', icon: 'dashboard' },
              { value: 'banana', label: 'Banana', icon: 'client' },
              { value: 'cherry', label: 'Cherry', icon: 'appointment' },
              { value: 'date', label: 'Date', icon: 'calendar' },
              { value: 'elderberry', label: 'Elderberry', icon: 'chat' }
            ])}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Set 5 Items
          </button>
          <button
            onClick={() => setTestMultiValue([])}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Multi
          </button>
        </div>
      </div>

    </div>
  );
};

export default CustomSelectTest; 
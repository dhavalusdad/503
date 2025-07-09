import { Button } from '@/stories/Common';
import Input from '@/stories/Common/Input';
import { X } from 'lucide-react';
import { useState, KeyboardEvent, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  age: string;
  maritalStatus: string;
  languages: string[];
  specializations: string[];
  videoSessions: boolean;
  atClinic: boolean;
  clinicAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  bio: string;
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

interface TagInputProps {
  tags: string[];
  onRemove: (tag: string) => void;
  placeholder?: string;
  labelkey: string;
}

const Profile: React.FC = () => {



  const methods = useForm<FormData>({
    // resolver: ()=>console.log('working'),
    mode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      age: '',
      maritalStatus: '',
      languages: [],
      specializations: [],
      videoSessions: true,
      atClinic: true,
      clinicAddress: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      bio: ""
    }
  });

  const {
    handleSubmit,
    register,
    formState: { errors, submitCount },
    setValue: setFormData,
    watch,
    getValues,
    setError,
    reset,
    clearErrors
  } = methods;


  const [activeTab, setActiveTab] = useState<string>('Basic Details');
  const topNavigation: string[] = ['Basic Details', 'Experience', 'License', 'Awards'];

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]): void => {
    setFormData(field, value , {shouldValidate :  true});
  };

  const removeTag = (array: string[], item: string): string[] => {
    return array.filter(tag => tag !== item);
  };

  const addTag = (e: KeyboardEvent<HTMLInputElement>, array: string[], key: keyof FormData): void => {
    if (e.key !== 'Enter') return;

    const target = e.target as HTMLInputElement;
    const item = target.value.trim();

    e.preventDefault();

    if (item && !array.includes(item)) {
      const newTags = [...array, item];
      setFormData(key, newTags);
      target.value = '';
    }
  };


  const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 cursor-pointer rounded-lg text-[1rem] transition-colors ${isActive
        ? 'bg-primary text-white font-semibold'
        : ' text-gray-600 hover:bg-gray-200 font-medium'
        }`}
    >
      {label}
    </button>
  );

  const TagInput: React.FC<TagInputProps> = ({ tags, onRemove, placeholder = '', labelkey }) => (
    <div className="flex flex-wrap gap-2 mb-4 border p-1 rounded-md border-gray-300">
      {tags.map((tag: string, index: number) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-white rounded-md text-sm"
        >
          {tag}
          <button
            onClick={() => onRemove(tag)}
            className="text-white hover:text-gray-300"
            type="button"
          >
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        className='bg-none border-none focus:outline-0'
        placeholder={placeholder}
        onKeyDown={(e) => addTag(e, tags, labelkey as keyof FormData)}
      />
    </div>
  );

  const handleSelectChange = (field: keyof FormData) => (e: ChangeEvent<HTMLSelectElement>) => {
    handleInputChange(field, e.target.value);
  };

  const handleInputChangeEvent = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(field, e.target.value);
  };

  const handleTextareaChange = (field: keyof FormData) => (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(field, e.target.value);
  };

  const handleCheckboxChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(field, e.target.checked);
  };

  return (
    <div className="bg-gray-50">
      <div className="mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg">
          {topNavigation.map(tab => (
            <TabButton
              key={tab}
              label={tab}
              isActive={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Profile Picture Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/api/placeholder/80/80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Profile Image</div>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="filled"
                    title='Upload Image'
                    className="px-3 py-1 bg-green-700 text-white rounded text-sm"
                    type="button"
                  >

                  </Button>
                  <Button
                    title='Delete'
                    variant="filled"
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                    type="button"
                  >

                  </Button>
                </div>
                <p className="text-xs text-gray-500">Your Image should Below 2 MB, Accepted format jpg,png.</p>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>

            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <Input
                  type="text"
                  value={getValues('firstName')}
                  onChange={handleInputChangeEvent('firstName')}


                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <Input
                  type="text"
                  value={getValues('lastName')}
                  onChange={handleInputChangeEvent('lastName')}

                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <Input
                  type="email"

                  value={getValues('email')}
                  onChange={handleInputChangeEvent('email')}
                />
              </div>
            </div>

            {/* Phone and DOB Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className='w-full'>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <div className="flex w-full">

                  <select className=" border h-[40px] rounded-l-md bg-gray-50 ">
                    <option>+1</option>
                  </select>

                  <Input
                    type="text"
                    value={getValues("phone")}
                    onChange={handleInputChangeEvent('phone')}
                    className="w-full "
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={getValues("dateOfBirth")}
                    onChange={handleInputChangeEvent('dateOfBirth')}
                    childClassName='w-full'
                  />

                </div>
              </div>
            </div>

            {/* Gender, Age, Marital Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={getValues("gender")}
                  onChange={handleSelectChange('gender')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <Input
                  type="text"
                  value={getValues("age")}
                  onChange={handleInputChangeEvent('age')}

                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                
                   value={getValues("maritalStatus")}
                  onChange={handleSelectChange('maritalStatus')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            {/* Languages */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <TagInput
                tags={               
                  getValues("languages")}
                labelkey="languages"
                onRemove={(tag: string) => handleInputChange('languages', removeTag(formData.languages, tag))}
              />
            </div>

            {/* Specializations */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialized In</label>
              <TagInput
                tags={ getValues("specializations")}
                labelkey="specializations"
                onRemove={(tag: string) => handleInputChange('specializations', removeTag(formData.specializations, tag))}
              />
            </div>

            {/* Preferences */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose your preferences</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    checked={ getValues("videoSessions")}
                    onChange={handleCheckboxChange('videoSessions')}

                  />
                  <span className="text-sm text-gray-700">Video Sessions</span>
                </label>
                <label className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    checked={ getValues("atClinic")}
                    onChange={handleCheckboxChange('atClinic')}

                  />
                  <span className="text-sm text-gray-700">At Clinic</span>
                </label>
              </div>
            </div>

            {/* Clinic Address */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
              <Input
                type="text"
                 value ={getValues('clinicAddress')}
                onChange={handleInputChangeEvent('clinicAddress')}

              />
            </div>

            {/* City, State, Country Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <Input
                  type="text"
                  value ={getValues('city')}
                  onChange={handleInputChangeEvent('city')}

                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <Input
                  type="text" 
                  value ={getValues('state')}
                  onChange={handleInputChangeEvent('state')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  type="text"
                  value={getValues('country')}
                  onChange={handleInputChangeEvent('country')}
                />
              </div>
            </div>

            {/* Postal Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <Input
                type="text"
                value={getValues('postalCode')}
                onChange={handleInputChangeEvent('postalCode')}
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={getValues('bio')}
                onChange={handleTextareaChange('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant='none'
              title='Cancel'
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              type="button"
              onClick={() => console.log()}
            />

            <Button
              variant='filled'
              title='Save Changes'
              className="px-6 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
              type="button"
              onClick={() => console.log()}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
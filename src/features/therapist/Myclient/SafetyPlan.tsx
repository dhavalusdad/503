import React, { useEffect, useState } from 'react';

import { useForm, useFieldArray } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useGetAmdEhrFormById, useUploadEhrDoc } from '@/api/advancedMd';
import { UnderlineInput } from '@/features/therapist/Myclient/UnderLineInput';
import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';
import SectionLoader from '@/stories/Common/Loader/Spinner';

import { generatePDF, type SafetyPlanFormData } from './pdfmaker';

const SafetyPlan: React.FC = () => {
  const { formId } = useParams();

  const { mutateAsync: sendFormData, isPending: isLoadingEhrFileUpload } = useUploadEhrDoc();

  const { data: ehrData, isLoading } = useGetAmdEhrFormById(formId);
  const [saveBtnShow, setSaveBtnShow] = useState<boolean>(true);

  const savedFormData =
    ehrData?.fileBlob && typeof ehrData.fileBlob === 'object' ? ehrData.fileBlob : null;

  const { register, control, handleSubmit, getValues, reset } = useForm<SafetyPlanFormData>({
    defaultValues: {
      warningSigns: '',
      internalCoping: '',
      safeEnvironment: '',
      reasonsLiving: '',
      hopesDreams: '',
      otherMeans: '',
      distractionPeople: [{ name: '' }],
      distractionPlaces: [{ place: '' }],
      helpPeople: [{ name: '' }],
      professionals: [
        { contact: '911' },
        { contact: 'KP BHCL 1-800-900-3277 Services' },
        { contact: 'Suicide Prevention Lifeline Phone: 1-800-273-TALK (8255)' },
        { contact: 'Text “Talk” to 741741' },
      ],
      firearms: {
        ownGuns: '',
        howMany: '',
        howStored: '',
        howLongOwned: '',
        supportPersonName: '',
        gunsLocation: '',
        phone: '',
        storePerson: '',
        keysHolder: '',
        moveHelper: '',
        moveLocation: '',
        barriers: '',
        timetablePerson: '',
        timetableDate: '',
      },
      medications: {
        stockpiled: '',
        supportPersonName: '',
        location: '',
        phone: '',
        removePlanPerson1: '',
        removePlanPerson2: '',
        lockBoxDrugs: '',
        lockBoxHelper: '',
      },
    },
  });

  const {
    fields: dp,
    append: addDP,
    remove: removeDP,
  } = useFieldArray({ control, name: 'distractionPeople' });
  const {
    fields: dpl,
    append: addDPL,
    remove: removeDPL,
  } = useFieldArray({ control, name: 'distractionPlaces' });
  const {
    fields: hp,
    append: addHP,
    remove: removeHP,
  } = useFieldArray({ control, name: 'helpPeople' });
  useEffect(() => {
    if (savedFormData) {
      reset(savedFormData);
    }
  }, [savedFormData, reset]);

  const saveAsDraft = () => {
    const data = getValues();

    sendFormData({
      fileBlob: data,
      form_id: formId,
      is_draft: true,
    });
  };
  const formSaveHandler = async (data: SafetyPlanFormData) => {
    const fileBlob = await generatePDF(data); // returns base64 string

    await sendFormData({
      fileBlob: { data: fileBlob }, // MUST BE BASE64 string
      form_id: formId, // you already have id from params
      is_draft: false, // OR true — your choice
    });

    setSaveBtnShow(false);
  };

  const openPdfInHtml = () => {
    if (!ehrData?.ehrFile) return;

    const htmlContent = `
    <html>
      <head>
        <title>PDF Viewer</title>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          iframe { width: 100vw; height: 100vh; border: none; }
        </style>
      </head>
      <body>
        <iframe src="${ehrData.ehrFile}"></iframe>
      </body>
    </html>
  `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <SectionLoader />;
  }
  if (ehrData?.isSubmitted && ehrData?.ehrFile) {
    return (
      <div className='text-center mt-10'>
        <p className='mb-4 text-lg font-medium'>This file is already uploaded on AdvancedMD</p>

        <Button
          variant='filled'
          onClick={openPdfInHtml}
          className='bg-primary text-white px-6 py-3 rounded-md shadow-md hover:bg-green-800'
          title=' View PDF'
        />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-10 bg-gray-100 font-serif text-base leading-relaxed'>
      <div className='bg-white shadow-2xl p-12 rounded-lg'>
        {/* Logo Header */}
        <div className='text-center mb-10'>
          <Icon name='logo-secondary' />
        </div>

        <form>
          {/* Step 1 */}
          <div>
            <p className='font-bold mb-5'>
              Step 1: Warning signs (thoughts, images, mood, situation, behavior) that a crisis may
              be developing:
            </p>
            <UnderlineInput register={register('warningSigns')} full />
          </div>

          {/* Step 2 */}
          <div className='mt-5'>
            <p className='font-bold mb-5'>
              Step 2: Internal coping strategies – Things I can do to take my mind off my problems
              without contacting another person (relaxation technique, physical activity):
            </p>
            <UnderlineInput register={register('internalCoping')} full />
          </div>

          {/* Step 3 */}
          <div>
            <p className='font-bold mt-5'>
              Step 3:People and social settings that provide distraction:
            </p>

            <p className='font-bold mt-4'>Name</p>
            {dp.map((field, i) => (
              <div key={field.id} className='flex items-center gap-4 my-3'>
                <UnderlineInput register={register(`distractionPeople.${i}.name`)} />
                {dp.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeDP(i)}
                    className='text-red-600 hover:text-red-800 text-sm font-medium'
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <Button
              type='button'
              variant='none'
              onClick={() => addDP({ name: '' })}
              className='text-green-700 font-bold text-sm'
              title='+ Add Person'
            />

            <p className='font-bold mt-6'>Place</p>
            {dpl.map((field, i) => (
              <div key={field.id} className='flex items-center gap-4 my-3'>
                <UnderlineInput register={register(`distractionPlaces.${i}.place`)} />
                {dpl.length > 1 && (
                  <Button
                    type='button'
                    variant='none'
                    onClick={() => removeDPL(i)}
                    className='text-red-600 hover:text-red-800 text-sm font-medium'
                    title='Remove'
                  />
                )}
              </div>
            ))}
            <Button
              type='button'
              variant='none'
              onClick={() => addDPL({ place: '' })}
              className='text-green-700 font-bold text-sm ml-4'
              title='+ Add Place'
            />
          </div>
          {/* Step 4 */}
          <div>
            <p className='font-bold'>Step 4: People whom I can ask for help:</p>

            <p className='font-bold mt-4'>Name</p>
            {hp.map((field, i) => (
              <div key={field.id} className='flex items-center gap-4 my-3'>
                <UnderlineInput register={register(`helpPeople.${i}.name`)} />
                {hp.length > 1 && (
                  <Button
                    type='button'
                    variant='none'
                    onClick={() => removeHP(i)}
                    className='text-red-600 hover:text-red-800 text-sm font-medium'
                    title='Remove'
                  />
                )}
              </div>
            ))}
            <Button
              type='button'
              variant='none'
              onClick={() => addHP({ name: '' })}
              className='text-green-700 font-bold text-sm'
              title='+ Add Person'
            />
          </div>
          {/* Step 5 */}
          <div>
            <p className='font-bold'>
              Step 5: Professionals or agencies I can contact during a crisis:
            </p>
            <div className='space-y-3 mt-4'>
              <p>911</p>
              <p>KP BHCL 1-800-900-3277 Services</p>
              <p>Suicide Prevention Lifeline Phone: 1-800-273-TALK (8255)</p>
              <p>Text “Talk” to 741741</p>
            </div>
          </div>

          {/* Step 6 */}
          <div>
            <p className='font-bold'>
              Step 6: Steps I will take to ensure that my environment is safe:
            </p>
            <UnderlineInput register={register('safeEnvironment')} full />
          </div>

          {/* Reasons & Hopes */}
          <div className='my-12 space-y-10'>
            <div>
              <p>
                <strong>My most important reasons for living are:</strong>
              </p>
              <UnderlineInput register={register('reasonsLiving')} full />
            </div>
            <div>
              <p>
                <strong>My hopes and dreams for the future are:</strong>
              </p>
              <UnderlineInput register={register('hopesDreams')} full />
            </div>
          </div>

          {/* Lethal Means Section */}
          <div className='border-t-4 border-red-700 pt-8 mt-16'>
            <h2 className='text-2xl font-bold text-center mb-8 text-red-800'>
              COUNSELING ON ACCESS TO LETHAL MEANS
            </h2>

            <div className='space-y-6 text-base'>
              <p>
                Firearms: Does anyone in your house own guns?{' '}
                <UnderlineInput register={register('firearms.ownGuns')} />
              </p>
              <p className='font-bold'>
                How many guns? <UnderlineInput register={register('firearms.howMany')} />
              </p>
              <p className='font-bold'>
                How are they stored? <UnderlineInput register={register('firearms.howStored')} />
              </p>
              <p className='font-bold'>
                For how long have the guns been around/owned?{' '}
                <UnderlineInput register={register('firearms.howLongOwned')} />
              </p>

              <p className='mt-8'>
                I agree that this therapist can talk with{' '}
                <UnderlineInput register={register('firearms.supportPersonName')} />
                to discuss how he/she can provide emotional support, help implement the plan and
                prevent access to guns located at
                <UnderlineInput register={register('firearms.gunsLocation')} />. Phone number:
                <UnderlineInput register={register('firearms.phone')} />. This person was called
                during session to discuss risk and means restriction plan.
              </p>

              <p className='font-bold mt-8'>Patient/Family agrees to store them:</p>
              <p>
                <UnderlineInput register={register('firearms.storePerson')} /> agrees to store
                firearm(s), unload all guns, lock up all guns, and store ammunition separately.
                <UnderlineInput register={register('firearms.keysHolder')} /> Agrees to hold the
                keys to the gun locks and safes.
              </p>
              <p>
                <UnderlineInput register={register('firearms.moveHelper')} /> agrees to help move
                the guns to
                <UnderlineInput register={register('firearms.moveLocation')} /> so that I am at a
                lower risk of suicide.
              </p>

              <p>
                <span className='font-bold'> Barriers to implementing plan: </span>
                <UnderlineInput register={register('firearms.barriers')} full />
              </p>

              <p>
                <span className='font-bold'>Timetable:</span>
                <UnderlineInput register={register('firearms.timetablePerson')} />
                and I agree to implement plan by{' '}
                <UnderlineInput register={register('firearms.timetableDate')} />
                and will call therapist to confirm plan has been implemented.
              </p>

              <p className='mt-10'>
                Medications: Have you stockpiled any medications with the intent to overdose?
              </p>
              <UnderlineInput register={register('medications.stockpiled')} full />

              <p className='mt-6'>
                I agree that therapist can talk with{' '}
                <UnderlineInput register={register('medications.supportPersonName')} />
                to discuss how he/she can provide emotional support and help implement the plan and
                prevent access to stockpiled medication located at
                <UnderlineInput register={register('medications.location')} />. Phone number:
                <UnderlineInput register={register('medications.phone')} />. This person was called
                during session to discuss risk and means restriction plan.
              </p>

              <p>
                <UnderlineInput register={register('medications.removePlanPerson1')} />
                and I agree to remove unneeded medications from the home, to keep only non-lethal
                quantities of necessary medications on hand.
                <UnderlineInput register={register('medications.removePlanPerson2')} />
                and I are aware we can ask a doctor or a pharmacist for guidance on what constitutes
                a safe quantity.
              </p>

              <p>
                Lock up abuse-prone drugs:{' '}
                <UnderlineInput register={register('medications.lockBoxDrugs')} />
                are recommended to be locked up because of their abuse potential and their toxicity.
                <UnderlineInput register={register('medications.lockBoxHelper')} />
                and I were told that relatively inexpensive lock boxes are available online and at
                stores.
              </p>

              <p>
                Other Means: Are there any cars, ropes, sharp objects, or local areas that you’ve
                been thinking of using to take your life?
              </p>
              <UnderlineInput register={register('otherMeans')} full />
            </div>
          </div>

          {/* Buttons */}
          {saveBtnShow &&
            (isLoadingEhrFileUpload ? (
              <div className='flex justify-center items-center mt-20'>
                <div className='animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-primary'></div>
              </div>
            ) : (
              <div className='flex justify-center gap-10 mt-20'>
                <Button
                  type='button'
                  variant='filled'
                  onClick={saveAsDraft}
                  className='px-10 py-4 bg-primary text-white text-xl rounded-lg hover:bg-gray-800'
                  title='Save as Draft'
                />

                <Button
                  type='button'
                  variant='filled'
                  onClick={handleSubmit(formSaveHandler)}
                  className='px-12 py-5 bg-primary text-white text-2xl font-bold rounded-lg hover:bg-green-800 shadow-lg'
                  title='Save'
                  isLoading={isLoadingEhrFileUpload}
                />
              </div>
            ))}

          <div>
            {!saveBtnShow && (
              <div className='text-3xl font-bold text-center text-red-700 mt-5'>
                This file uploaded successfully on AdvancedMD
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SafetyPlan;

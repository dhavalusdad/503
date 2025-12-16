import {
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
  useForm as useHookForm,
} from 'react-hook-form';

import { useScrollToError } from './useScrollToError';

export const useForm = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = object,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props?: UseFormProps<TFieldValues, TContext>
): UseFormReturn<TFieldValues, TContext, TTransformedValues> => {
  const methods = useHookForm(props) as unknown as UseFormReturn<
    TFieldValues,
    TContext,
    TTransformedValues
  >;
  const { scrollToFirstError } = useScrollToError();
  const originalHandleSubmit = methods.handleSubmit;

  const handleSubmit: UseFormReturn<TFieldValues, TContext, TTransformedValues>['handleSubmit'] = (
    onValid,
    onInvalid
  ) => {
    return originalHandleSubmit(onValid, (errors, e) => {
      scrollToFirstError(errors);
      if (onInvalid) {
        onInvalid(errors, e);
      }
    });
  };

  return {
    ...methods,
    handleSubmit,
  };
};

import type { FieldErrors } from 'react-hook-form';

export const useScrollToError = () => {
  const scrollToFirstError = (errors: FieldErrors) => {
    // Helper to flatten nested errors into a list of field names
    const getErrorFields = (errorObj: FieldErrors, path = ''): string[] => {
      let fields: string[] = [];

      Object.keys(errorObj).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        const value = errorObj[key];

        if (value && typeof value === 'object' && 'message' in value) {
          // This is a field error
          fields.push(newPath);
        } else if (value && typeof value === 'object') {
          // Nested error object
          fields = [...fields, ...getErrorFields(value as FieldErrors, newPath)];
        }
      });

      return fields;
    };

    const errorFields = getErrorFields(errors);

    // Find all DOM elements corresponding to errors
    const errorElements: HTMLElement[] = [];

    errorFields.forEach(fieldName => {
      // 1. Try finding by name attribute
      const elementsByName = document.getElementsByName(fieldName);
      if (elementsByName.length > 0) {
        errorElements.push(elementsByName[0] as HTMLElement);
        return;
      }

      // 2. Try finding by ID
      const elementById = document.getElementById(fieldName);
      if (elementById) {
        errorElements.push(elementById);
      }
    });

    if (errorElements.length === 0) return;

    // Filter out elements that are not in the document (just in case)
    const validElements = errorElements.filter(el => document.body.contains(el));

    // Sort elements by their position in the DOM to find the top-most one
    validElements.sort((a, b) => {
      // customized comparison to handle hidden inputs slightly better if possible,
      // but primarily rely on document position.
      const position = a.compareDocumentPosition(b);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    const firstElement = validElements[0];

    // Check if element is visible. If hidden (e.g. react-select hidden input), traverse up.
    let scrollTarget = firstElement;
    while (scrollTarget && scrollTarget.offsetParent === null && scrollTarget.parentElement) {
      // Loop until we find a visible parent or hit root
      scrollTarget = scrollTarget.parentElement;
    }

    if (scrollTarget) {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return { scrollToFirstError };
};

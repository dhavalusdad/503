import { useState } from 'react';

import { components, type ValueContainerProps, type GroupBase } from 'react-select';

interface ExtendedSelectProps {
  maxSelectedToShow?: number;
}

const MultiSelectValueContainer = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(
  props: ValueContainerProps<Option, IsMulti, Group>
) => {
  const { children, getValue, selectProps } = props;
  const selected = getValue?.() || [];
  const maxToShow = (selectProps as ExtendedSelectProps)?.maxSelectedToShow ?? 2;

  const [showAll, setShowAll] = useState(false);

  const input = Array.isArray(children) ? children[0] : children;
  const maybeValues = Array.isArray(children) ? children[1] : null;

  let displayValues: React.ReactNode = input;

  if (Array.isArray(input)) {
    if (selected.length > maxToShow) {
      if (showAll) {
        displayValues = [
          ...input,
          <span
            key='less'
            className='ml-1 text-xs text-gray-500 inline-flex items-center cursor-pointer'
            onClick={() => setShowAll(false)}
          >
            Show Less
          </span>,
        ];
      } else {
        const extraCount = selected.length - maxToShow;
        displayValues = [
          ...input.slice(0, maxToShow),
          <span
            key='more'
            className='ml-1 text-xs text-gray-500 inline-flex items-center cursor-pointer'
            onClick={() => setShowAll(true)}
          >
            +{extraCount} more
          </span>,
        ];
      }
    }
  }

  return (
    <components.ValueContainer {...props}>
      {displayValues}

      {maybeValues}
    </components.ValueContainer>
  );
};

export default MultiSelectValueContainer;

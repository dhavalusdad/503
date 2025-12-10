import Button from '../Button';
import Icon, { type IconNameType } from '../Icon';
import RowDropdown from '../RowDropdown';

export interface ActionItem {
  label: string;
  icon: string;
  onClick: () => void;
  show?: boolean; // optional condition
}

interface ActionDropDown {
  actions: ActionItem[];
  showThreeDotView: boolean;
}

export const ActionDropDown = ({ actions, showThreeDotView = false }: ActionDropDown) => {
  const visibleActions = actions.filter(a => a.show !== false);

  if (visibleActions.length === 0) return null;

  if (visibleActions.length === 1 && !showThreeDotView) {
    const action = visibleActions[0];
    return (
      <>
        <Button
          variant='none'
          className='rounded-full hover:bg-white'
          onClick={action.onClick}
          icon={
            <Icon
              name={action.icon as IconNameType}
              className='text-blackdark icon-wrapper w-5 h-5'
            />
          }
        />
      </>
    );
  }

  return (
    <RowDropdown<HTMLDivElement>
      content={() => (
        <ul className='flex flex-col min-w-32'>
          {visibleActions.map((action, idx) => (
            <li
              key={idx}
              className='px-3.5 py-2 hover:bg-surface cursor-pointer flex items-center gap-1.5'
              onClick={action.onClick}
            >
              <div className='w-5 text-left'>
                <Icon name={action.icon as IconNameType} className='icon-wrapper w-5 h-5' />
              </div>
              <span className='text-sm font-normal leading-18px text-blackdark'>
                {action.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    >
      {({ onToggle, targetRef }) => (
        <div
          ref={targetRef}
          onClick={() => onToggle()}
          className='cursor-pointer inline-block py-2'
        >
          <Icon name='threedots' className='text-blackdark' />
        </div>
      )}
    </RowDropdown>
  );
};

import RowDropdown from '@/stories/Common/RowDropdown';
import type { TagsDataType } from '@/stories/Common/TagsCell/types';

type Props = {
  tags: TagsDataType[];
  tagsColor?: string;
};

const TagsCell = (props: Props) => {
  const { tagsColor } = props;
  const tags: TagsDataType[] = (props.tags || []).filter(Boolean);
  const maxVisible = 3;
  const hiddenCount = Math.max(tags.length - maxVisible, 0);

  return (
    <div className='flex flex-wrap gap-2'>
      {tags.length ? (
        tags.slice(0, maxVisible).map((tag, index) => (
          <div
            key={index}
            className='flex justify-center rounded-2xl px-2.5 py-1 cursor-pointer'
            title={tag.name}
            style={{
              backgroundColor: tag.color ? `#${tag.color}` : (tagsColor ?? '#79AC78'),
            }}
          >
            <span className='text-sm font-semibold leading-[18px] text-white truncate max-w-44'>
              {tag.name}
            </span>
          </div>
        ))
      ) : (
        <></>
      )}

      {hiddenCount > 0 && (
        <RowDropdown<HTMLDivElement>
          placement='auto'
          content={() => (
            <div className='bg-white rounded-2xl shadow-xl min-w-52 max-h-72 max-w-lg p-4 pr-0 flex flex-col overflow-hidden'>
              <div className='flex-1 overflow-y-auto pr-4'>
                <div className='flex flex-col gap-2.5 w-full'>
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className='px-3 py-1.5 rounded-full cursor-pointer shadow-sm w-full'
                      style={{
                        backgroundColor: tag.color ? `#${tag.color}` : '#79AC78',
                        color: 'white',
                      }}
                    >
                      <span className='text-xs leading-4 font-medium break-all block'>
                        {tag.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        >
          {({ onToggle, targetRef }) => (
            <div className='flex items-center justify-center'>
              <div ref={targetRef} onClick={onToggle} className='cursor-pointer inline-block'>
                <div className='flex justify-center bg-blackdark/50 rounded-2xl px-2.5 py-1 hover:bg-blackdark/65 transition-colors cursor-pointer'>
                  <span className='text-sm font-semibold leading-[18px] text-white'>
                    +{hiddenCount} more
                  </span>
                </div>
              </div>
            </div>
          )}
        </RowDropdown>
      )}
    </div>
  );
};

export default TagsCell;

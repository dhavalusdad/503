import { type RefObject, useRef, useState, useEffect } from 'react';

import Button from '@/stories/Common/Button';
import Icon from '@/stories/Common/Icon';

export const BreathingExercise = ({
  iterations = 1,
  xBase = 10,
  xGap = 40,
  yBase = 20,
  yGap = 60,
  duration,
}: {
  iterations: number;
  xBase?: number;
  xGap?: number;
  yBase?: number;
  yGap?: number;
  duration: number;
  fps?: number;
}) => {
  let pathD;
  let xAxis = 0;
  const yRange = yBase + yGap;

  const pathRef: RefObject<SVGPathElement | null> = useRef(null);
  const dotRef: RefObject<SVGCircleElement | null> = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const durationMs = duration * 1000; // total animation time in ms
  const startRef: RefObject<number | null> = useRef(null);
  const animationFrameRef = useRef<number>(0);

  const [exerciseButtonTitle, setExerciseButtonTitle] = useState<'Resume' | 'Pause' | 'Reset'>(
    'Pause'
  );

  for (let i = 0; i < iterations; i++) {
    if (!pathD) {
      pathD = `M ${xBase} ${yRange} L ${xGap + xBase} ${yBase} L ${xBase + xGap * 2} ${yRange}`;
      xAxis = xGap * 2;
    } else {
      xAxis += xGap;
      pathD += ` L ${xAxis + xBase} ${yBase}`;
      xAxis += xGap;
      pathD += ` L ${xAxis + xBase} ${yRange}`;
    }
  }

  useEffect(() => {
    const dot = dotRef.current;
    if (dot) {
      dot.setAttribute('cx', '10');
      dot.setAttribute('cy', '80');
    }
  }, []);

  useEffect(() => {
    if (progress === 1) {
      setIsRunning(false);
    }

    if (!isRunning) {
      if (progress === 1) {
        setExerciseButtonTitle('Reset');
      } else {
        setExerciseButtonTitle('Resume');
      }
    } else {
      setExerciseButtonTitle('Pause');
    }
  }, [isRunning, progress]);

  const updateDotPosition = (progressValue: number) => {
    const path = pathRef.current;
    const dot = dotRef.current;

    if (path && dot) {
      const length = path.getTotalLength();
      const point = path.getPointAtLength(progressValue * length);
      dot.setAttribute('cx', point.x.toString());
      dot.setAttribute('cy', point.y.toString());
    }
  };

  const animate = (timestamp: number) => {
    if (!startRef.current) startRef.current = timestamp;

    const elapsed = timestamp - startRef.current;
    const p = Math.min(elapsed / durationMs, 1);

    setProgress(p);
    updateDotPosition(p);

    if (p >= 1) {
      setIsRunning(false);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleTooglePause = () => {
    if (progress === 1) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setProgress(0);
      setIsRunning(false);
      startRef.current = null;
      updateDotPosition(0);
      return;
    }

    if (!isRunning) {
      startRef.current = performance.now() - progress * durationMs;
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    setIsRunning(s => !s);
  };

  const toggleStartStop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const newProgress = 0;
    setProgress(newProgress);
    updateDotPosition(newProgress);
    startRef.current = null;

    if (!isRunning && progress === 0) {
      setIsRunning(true);
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
    }
  };

  return (
    <div className='bg-white rounded-10px p-5'>
      <div className='flex flex-col gap-1.5'>
        <h6 className='text-base font-bold leading-22px text-blackdark'>Breathing Exercise</h6>
        <p className='text-sm font-normal leading-5 text-primarygray'>
          Lorem ipsum scelerisque quis interdum velit egestas turpis.
        </p>
      </div>
      <div className='w-full'>
        <svg
          viewBox={`0 0 ${xAxis + xBase * 2} ${yRange + yBase}`}
          className=' w-full bg-white mx-auto'
        >
          {/* Zigzag path */}
          <path
            ref={pathRef}
            d={pathD}
            fill='none'
            stroke='#A8BDC7'
            strokeLinejoin='round'
            strokeLinecap='round'
            strokeWidth='4.55px'
          />

          {/* Moving dot */}
          <circle
            className='shadow-dropdown'
            ref={dotRef}
            r='7'
            fill='#F1C099'
            stroke='white'
            strokeWidth='1.5'
          />
        </svg>
        <div className='flex items-center justify-between mb-5 pl-1.5'>
          {Array.from({ length: iterations + 1 }, (_, key) => (
            <span key={key} className='text-xs font-normal leading-4 text-primarygray'>
              {(duration / iterations) * key}s
            </span>
          ))}
        </div>
        <div className='w-full flex items-center gap-4'>
          <Button
            variant='filled'
            title={`${isRunning || progress > 0 ? 'Stop Exercise' : 'Start Exercise'}`}
            onClick={toggleStartStop}
            parentClassName='w-full'
            className='w-full !bg-blue !border-blue rounded-lg'
            icon={<Icon name={`${isRunning || progress > 0 ? 'stop' : 'play'}`} />}
            isIconFirst
          />
          {progress > 0 && (
            <Button
              variant='filled'
              title={exerciseButtonTitle}
              onClick={handleTooglePause}
              parentClassName='w-full'
              className='w-full !bg-blue !border-blue rounded-lg'
              icon={<Icon name={`${isRunning ? 'pause' : 'play'}`} />}
              isIconFirst
            />
          )}
        </div>
      </div>
    </div>
  );
};

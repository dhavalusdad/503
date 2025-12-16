import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import Button from '../Button';
import Icon from '../Icon';

export type TourStep = {
  target?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrowPosition?: 'start' | 'center' | 'end';
  title?: string;
  content: React.ReactNode | string;
  showCenterModal?: boolean;
  clickTargetOnNext?: string;
  clickTargetOnFinish?: boolean;
  clickTargetsBeforeEnter?: string[];
  willNavigate?: boolean;
};

type TourProps = {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
  onSkip?: () => void;
  persistKey?: string;
};

type Position = {
  top: number;
  left: number;
  arrowPosition?: {
    top?: number;
    left?: number;
    rotation: number;
  };
};

type HighlightStyle = {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
};

// Helper functions for persistent state
const getTourState = (key: string) => {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const state = sessionStorage.getItem(`tour_${key}`);
    return state ? JSON.parse(state) : null;
  } catch {
    return null;
  }
};

const setTourState = (key: string, step: number, isActive: boolean) => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(`tour_${key}`, JSON.stringify({ step, isActive }));
};

const clearTourState = (key: string) => {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(`tour_${key}`);
};

// Wait for element to appear in DOM
const waitForElement = (selector: string, timeout: number = 10000): Promise<HTMLElement | null> => {
  return new Promise(resolve => {
    // Check if element already exists
    const existing = document.querySelector<HTMLElement>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);

    const observer = new MutationObserver(() => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) {
        clearTimeout(timeoutId);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// Wait for navigation to complete
const waitForNavigation = (timeout: number = 10000): Promise<void> => {
  return new Promise(resolve => {
    const startTime = Date.now();

    const checkReady = () => {
      // Check if document is ready and stable
      if (document.readyState === 'complete') {
        // Wait a bit more for dynamic content
        setTimeout(resolve, 100);
      } else if (Date.now() - startTime < timeout) {
        requestAnimationFrame(checkReady);
      } else {
        resolve();
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(resolve, 100);
    } else {
      window.addEventListener('load', () => setTimeout(resolve, 100), { once: true });
      checkReady();
    }
  });
};

const Tour: React.FC<TourProps> = ({
  steps,
  isOpen,
  onClose,
  onFinish,
  onSkip,
  persistKey = 'default',
}) => {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = getTourState(persistKey);
    return saved?.isActive ? saved.step : 0;
  });

  const [tooltipPosition, setTooltipPosition] = useState<Position>({
    top: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    left: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    arrowPosition: undefined,
  });
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>({});
  const [isNavigating, setIsNavigating] = useState(false);

  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const step = useMemo(() => steps[currentStep], [steps, currentStep]);
  const isClickingProgrammaticallyRef = useRef(false);

  // Persist state whenever it changes
  useEffect(() => {
    if (isOpen) {
      setTourState(persistKey, currentStep, true);
    }
  }, [currentStep, isOpen, persistKey]);

  // Check for persisted tour on mount
  useEffect(() => {
    const saved = getTourState(persistKey);
    if (saved?.isActive && !isOpen) {
      setCurrentStep(saved.step);
      setTimeout(() => {
        const event = new CustomEvent('resumeTour', { detail: { step: saved.step } });
        window.dispatchEvent(event);
      }, 100);
    }
  }, []);

  // Find next valid step
  const findNextValidStep = useCallback(
    (fromIndex: number, direction: number = 1): number | null => {
      let index = fromIndex;
      const maxAttempts = steps.length;
      let attempts = 0;

      while (attempts < maxAttempts) {
        index += direction;
        if (index < 0 || index >= steps.length) return null;

        const nextStep = steps[index];
        if (!nextStep.target || document.querySelector(nextStep.target)) {
          return index;
        }
        attempts++;
      }
      return null;
    },
    [steps]
  );

  // Handlers
  const handleFinish = useCallback(() => {
    if (step?.clickTargetOnFinish && step.target) {
      const target = document.querySelector<HTMLElement>(step.target);
      if (target) {
        setIsNavigating(true);
        clearTourState(persistKey);
        setCurrentStep(0);
        onFinish?.();
        onClose();

        setTimeout(() => {
          target.click();
          setIsNavigating(false);
        }, 50);

        return;
      }
    }

    clearTourState(persistKey);
    setCurrentStep(0);
    setIsNavigating(false);
    onFinish?.();
    onClose();
  }, [step, onFinish, onClose, persistKey]);

  const handleSkip = useCallback(() => {
    clearTourState(persistKey);
    setCurrentStep(0);
    setIsNavigating(false);
    onSkip?.();
    onClose();
  }, [onSkip, onClose, persistKey]);

  const handleNext = useCallback(() => {
    if (!step) return;

    if (step.clickTargetOnNext) {
      const target = document.querySelector<HTMLElement>(step.clickTargetOnNext);

      if (target) {
        if (step.willNavigate) {
          setIsNavigating(true);
        }
        isClickingProgrammaticallyRef.current = true;

        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
          setCurrentStep(nextStep);
          setTourState(persistKey, nextStep, true);
        } else {
          handleFinish();
          return;
        }

        setTimeout(() => {
          target.click();

          if (step.willNavigate) {
            const nextStepData = steps[nextStep];
            if (nextStepData?.target) {
              waitForNavigation()
                .then(() => {
                  return waitForElement(nextStepData.target!, 10000);
                })
                .then(() => {
                  setIsNavigating(false);
                  isClickingProgrammaticallyRef.current = false;
                });
            } else {
              setTimeout(() => {
                setIsNavigating(false);
                isClickingProgrammaticallyRef.current = false;
              }, 100);
            }
          } else {
            setTimeout(() => {
              isClickingProgrammaticallyRef.current = false;
            }, 100);
          }
        }, 50);

        return;
      }
    }

    const nextValid = findNextValidStep(currentStep, 1);
    if (nextValid !== null) {
      const nextStep = steps[nextValid];

      if (nextStep.clickTargetsBeforeEnter && nextStep.clickTargetsBeforeEnter.length > 0) {
        setIsNavigating(true);

        const clickSequence = async () => {
          for (let i = 0; i < nextStep.clickTargetsBeforeEnter!.length; i++) {
            const selector = nextStep.clickTargetsBeforeEnter![i];
            const targetToClick = document.querySelector<HTMLElement>(selector);
            if (targetToClick) {
              targetToClick.click();
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          if (nextStep.target) {
            await waitForElement(nextStep.target, 10000);
          } else {
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          setCurrentStep(nextValid);
          setIsNavigating(false);
        };

        clickSequence();
        return;
      }

      setCurrentStep(nextValid);
    } else {
      handleFinish();
    }
  }, [step, currentStep, steps, findNextValidStep, handleFinish, persistKey]);

  // Optimized position calculation
  const updatePosition = useCallback(() => {
    if (!step || isNavigating) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!step.target || step.showCenterModal) {
        setHighlightStyle({});
        const tooltipEl = tooltipRef.current;
        if (tooltipEl) {
          const tooltipRect = tooltipEl.getBoundingClientRect();
          setTooltipPosition({
            top: (window.innerHeight - tooltipRect.height) / 2,
            left: (window.innerWidth - tooltipRect.width) / 2,
            arrowPosition: undefined,
          });
        }
        return;
      }

      const target = document.querySelector<HTMLElement>(step.target);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;
      if (!tooltipEl) return;

      const tooltipRect = tooltipEl.getBoundingClientRect();
      const placement = step.placement || 'bottom';
      const arrowPos = step.arrowPosition || 'center';

      setHighlightStyle({
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });

      const gap = placement === 'left' || placement === 'right' ? 40 : 30;
      const offsetMultiplier = arrowPos === 'start' ? 0.2 : arrowPos === 'end' ? 0.8 : 0.5;

      let top = 0,
        left = 0,
        arrowTop,
        arrowLeft,
        arrowRotation = 0;

      switch (placement) {
        case 'top':
          top = rect.top - tooltipRect.height - gap;
          left = rect.left + rect.width / 2 - tooltipRect.width * offsetMultiplier;
          arrowTop = tooltipRect.height;
          arrowLeft = tooltipRect.width * offsetMultiplier;
          arrowRotation = 180;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tooltipRect.width * offsetMultiplier;
          arrowTop = 0;
          arrowLeft = tooltipRect.width * offsetMultiplier;
          arrowRotation = 0;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height * offsetMultiplier;
          left = rect.left - tooltipRect.width - gap;
          arrowLeft = tooltipRect.width;
          arrowTop = tooltipRect.height * offsetMultiplier;
          arrowRotation = 90;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height * offsetMultiplier;
          left = rect.right + gap;
          arrowLeft = 0;
          arrowTop = tooltipRect.height * offsetMultiplier;
          arrowRotation = -90;
          break;
      }

      const padding = 10;
      const originalLeft = left;
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

      const leftDiff = left - originalLeft;
      if (arrowLeft !== undefined) arrowLeft -= leftDiff;

      setTooltipPosition({
        top,
        left,
        arrowPosition: { top: arrowTop, left: arrowLeft, rotation: arrowRotation },
      });
    });
  }, [step, isNavigating]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      const saved = getTourState(persistKey);
      if (!saved?.isActive) {
        setCurrentStep(0);
      }
    }
  }, [isOpen, persistKey]);

  // Position updates
  useEffect(() => {
    if (!isOpen || !step) return;

    const initializeStep = async () => {
      if (step.target && !step.showCenterModal) {
        const target = await waitForElement(step.target, 10000);

        if (!target) {
          return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      setIsNavigating(false);
      updatePosition();
    };

    initializeStep();

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePosition, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updatePosition, { passive: true, capture: true });

    return () => {
      if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, currentStep, step, updatePosition]);

  // Handle direct target clicks
  useEffect(() => {
    if (!isOpen || !step?.clickTargetOnNext || !step.target) return;

    const setupClickHandler = async () => {
      const target = await waitForElement(step.target!, 5000);
      if (!target) return;

      const handleTargetClick = () => {
        if (isClickingProgrammaticallyRef.current) return;
        setIsNavigating(true);
        const nextStep = currentStep + 1;

        if (nextStep < steps.length) {
          setCurrentStep(nextStep);
          setTourState(persistKey, nextStep, true);
        } else {
          handleFinish();
        }
      };

      target.addEventListener('click', handleTargetClick, { passive: true });

      return () => target.removeEventListener('click', handleTargetClick);
    };

    let cleanup: (() => void) | undefined;
    setupClickHandler().then(fn => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, [isOpen, currentStep, step, steps.length, handleFinish, persistKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    };
  }, []);

  if (!isOpen || !step) return null;
  if (step.target && !document.querySelector(step.target) && !isNavigating) return null;

  const isLastStep = step.clickTargetOnNext
    ? currentStep === steps.length - 1
    : findNextValidStep(currentStep, 1) === null;

  return (
    <>
      {step.target && !step.showCenterModal && (
        <div className='fixed inset-0 z-[9998] pointer-events-none'>
          <svg width='100%' height='100%' className='absolute inset-0'>
            <defs>
              <mask id='tour-mask'>
                <rect width='100%' height='100%' fill='white' />
                <rect
                  x={highlightStyle.left}
                  y={highlightStyle.top}
                  width={highlightStyle.width}
                  height={highlightStyle.height}
                  rx={8}
                  fill='black'
                />
              </mask>
            </defs>
            <rect width='100%' height='100%' fill='rgba(0, 0, 0, 0.75)' mask='url(#tour-mask)' />
          </svg>

          <div
            className='absolute rounded-[10px] transition-all duration-300 pointer-events-none'
            style={{
              top: `${highlightStyle.top}px`,
              left: `${highlightStyle.left}px`,
              width: `${highlightStyle.width}px`,
              height: `${highlightStyle.height}px`,
              boxShadow: '0 0 0 4px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.5)',
            }}
          />
        </div>
      )}

      {(!step.target || step.showCenterModal) && (
        <div className='fixed inset-0 z-[9998] bg-black/75' />
      )}

      <div
        ref={tooltipRef}
        className='fixed z-[9999] bg-white rounded-[20px] shadow-2xl max-w-[356px] w-full mx-4 transition-all duration-300'
        style={{
          top: tooltipPosition.arrowPosition ? `${tooltipPosition.top}px` : '50%',
          left: tooltipPosition.arrowPosition ? `${tooltipPosition.left}px` : '50%',
          transform: tooltipPosition.arrowPosition ? 'none' : 'translate(-50%, -50%)',
          willChange: 'transform',
          opacity: isNavigating ? 0.5 : 1,
        }}
      >
        {tooltipPosition.arrowPosition && (
          <div
            className='absolute'
            style={{
              top: `${tooltipPosition.arrowPosition.top}px`,
              left: `${tooltipPosition.arrowPosition.left}px`,
              transform: `translate(-50%, -50%) rotate(${tooltipPosition.arrowPosition.rotation}deg)`,
            }}
          >
            <Icon name='polygon' color='white' />
          </div>
        )}

        <div className='p-5 relative z-10'>
          <div className='pr-6'>
            {step.title && <h3 className='text-md font-bold text-blackdark mb-1'>{step.title}</h3>}
            <div className='text-sm text-primarygray leading-relaxed'>{step.content}</div>
          </div>

          <div className='w-full h-px bg-surface mt-2.5' />

          <div className='mt-[10px] flex items-center justify-between'>
            <div className='text-[14px] font-medium text-primarygray'>
              Step {currentStep + 1} of {steps.length}
            </div>

            <div className='flex items-center gap-2'>
              {!isLastStep ? (
                <>
                  <Button
                    variant='none'
                    title='Skip'
                    titleClassName='font-bold text-primarygray hover:text-gray-700 transition-colors'
                    onClick={handleSkip}
                  />
                  <Button
                    variant='filled'
                    title='Next'
                    titleClassName='font-bold'
                    className='rounded-lg w-[84px] h-[42px]'
                    onClick={handleNext}
                  />
                </>
              ) : (
                <Button
                  variant='filled'
                  title='Finish'
                  titleClassName='font-bold'
                  className='rounded-lg h-[42px]'
                  onClick={handleFinish}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tour;

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import clsx from 'clsx';
import moment from 'moment';

import type { CreateAvailabilitySlotsRequest } from '@/api/types/calendar.dto';
import {
  generateTimeSlots,
  getCalendarMonthGrid,
  getCurrentWeekDates,
} from '@/stories/Common/Calender/commonFunction';
import { AppointmentDetailsPopup } from '@/stories/Common/Calender/Component/AppointmentPopUp';
import { CalendarHeader } from '@/stories/Common/Calender/Component/CalendarHeader';
import { CalendarTopBar } from '@/stories/Common/Calender/Component/CalendarTopBar';
import DayColumn from '@/stories/Common/Calender/Component/DayColumnComponent';
import { MonthViewComponent } from '@/stories/Common/Calender/Component/MonthViewComponent';
import { TimeLineComponent } from '@/stories/Common/Calender/Component/TimeLineComponent';
import {
  type ActiveMonthData,
  type Appointment,
  type AvailableTimeSlotsPerDay,
  type CalendarCell,
  type CalendarConfig,
  type CalendarProps,
  MODE_CONSTANT,
  type SelectionStateType,
  type ViewMode,
  type WeekDayData,
  type localStorageCalendarConfig,
} from '@/stories/Common/Calender/types';

import './calender.css';

const CustomCalendar = ({
  appointments = [],
  availableSlots = [],
  onAppointmentClick,
  onSlotSelect,
  onSlotsRemove,
  onAvailableSlotSet,
  initialView = 'Week',
  startFromMonday = false,
  timeFormat = '24hr',
  workHours = { start: 0, end: 24 },
  slotTimeInterval = 60,
  slotTimeSlotSize = 30,
  timeZone = moment.tz.guess(),
  displayHourOnly = true,
  userId = '',
  AdditionalActionButton,
  handleMonthPagination,
  slotRange = [15, 30, 60],
  slotConfiguration,
}: CalendarProps) => {
  const calenderConfigFromLocalStorage = (() => {
    const item = localStorage.getItem('calendar_config');
    if (!item) return;

    try {
      return JSON.parse(item) as localStorageCalendarConfig;
    } catch (error) {
      console.error('Invalid calendar config in localStorage', error);
      return null;
    }
  })();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastShownRef = useRef<HTMLElement | null>(null);

  const [timeSlotSize, setTimeSlotSize] = useState(slotTimeSlotSize);
  const [timeInterval, setTimeInterval] = useState(slotTimeInterval);
  const [currentCalenderConfig, setCurrentCalenderConfig] = useState<CalendarConfig>({
    activeDate: '',
    activeMonth: '',
    activeYear: '',
    activeDay: '',
    activeWeekDay: '',
    Offset: calenderConfigFromLocalStorage ? +calenderConfigFromLocalStorage?.Offset : 0,
  });

  const [view, setView] = useState<ViewMode>(calenderConfigFromLocalStorage?.view || initialView);

  const [weekday, setWeekdays] = useState<WeekDayData[]>([]);
  const [activeMonth, setActiveMonth] = useState<ActiveMonthData>({
    month: '',
    year: '',
    date: moment.tz(timeZone),
  });
  const [month, setMonth] = useState<CalendarCell[][]>([]);

  useEffect(() => {
    const PX_PER_MIN = 1.7;

    setTimeSlotSize(timeInterval * PX_PER_MIN);
  }, [timeInterval]);
  // DOM-based selection state
  const selectionState = useRef<SelectionStateType>({
    isSelecting: false,
    dayIndex: [],
    startIndex: null,
    endIndex: null,
    startDateTime: undefined,
    endDateTime: undefined,
  });

  const [removeSlot, setRemoveSlots] = useState<SelectionStateType>({
    isSelecting: false,
    dayIndex: [],
    startIndex: null,
    endIndex: null,
    startDateTime: undefined,
    endDateTime: undefined,
  });
  const [appointmentPopup, setAppointmentPopup] = useState<{
    appointment: Appointment;
    dayIndex: number;
    position: {
      top: number;
      left: number;
      direction?: { topBottomDirection: string; leftRightDirection: string };
    };
    elementRef: HTMLElement | null;
  } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Memoize popup position calculation to avoid recalculating on every mouse move
  const calculatePopupPosition = useCallback(
    (elementRect: DOMRect, popupWidth: number, popupHeight: number) => {
      const gap = 5;
      let topBottomDirection: 'top' | 'bottom' = 'bottom';
      let leftRightDirection: 'left' | 'right' = 'right'; // default assume right
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (popupWidth <= 0 || popupHeight <= 0) {
        return { top: 0, left: 0 };
      }

      let top = elementRect.bottom + gap;
      let left = elementRect.left;

      // Horizontal positioning
      const rightEdge = left + popupWidth;
      if (rightEdge > viewportWidth - gap) {
        const spaceOnLeft = elementRect.left - gap;
        const spaceOnRight = viewportWidth - elementRect.right - gap;

        if (spaceOnLeft >= popupWidth) {
          leftRightDirection = 'left';
          left = elementRect.left - popupWidth - gap;
        } else if (spaceOnRight >= popupWidth) {
          leftRightDirection = 'right';
          left = elementRect.right + gap;
        } else {
          // choose whichever side has more space
          if (spaceOnLeft > spaceOnRight) {
            leftRightDirection = 'left';
            left = Math.max(gap, elementRect.left - popupWidth - gap);
          } else {
            leftRightDirection = 'right';
            left = Math.min(viewportWidth - popupWidth - gap, elementRect.right + gap);
          }
        }
      } else {
        // plenty of space on the right
        leftRightDirection = 'right';
        left = elementRect.left;
      }

      // Vertical positioning
      const bottomEdge = top + popupHeight;
      if (bottomEdge > viewportHeight - gap) {
        topBottomDirection = 'top';
        top = elementRect.top - popupHeight - gap;
        if (top < gap) {
          topBottomDirection = 'bottom';
          top = viewportHeight - popupHeight - gap;
        }
      }

      return {
        direction: {
          topBottomDirection,
          leftRightDirection,
        },
        top: Math.max(gap, Math.min(top, viewportHeight - popupHeight - gap)),
        left: Math.max(gap, Math.min(left, viewportWidth - popupWidth - gap)),
      };
    },
    []
  );

  // when api will hit and  it will refresh the dom
  useEffect(() => {
    clearSelectionFromDOM();
  }, [availableSlots]);

  // Simple click handler without any debouncing
  const handleAppointmentClickWithPosition = useCallback(
    (e: React.MouseEvent, appointment: Appointment, dayIndex: number) => {
      const rect = e.currentTarget.getBoundingClientRect();

      // Calculate position immediately
      const position = calculatePopupPosition(rect, 349, 280);

      // Set popup with calculated position
      setAppointmentPopup({
        dayIndex,
        appointment,
        position,
        elementRef: e.currentTarget as HTMLElement,
      });

      // Call original handler if provided
      onAppointmentClick?.(e, appointment);
    },
    [onAppointmentClick, calculatePopupPosition]
  );

  // Function to close appointment popup
  const closeAppointmentPopup = useCallback(() => {
    setAppointmentPopup(null);
  }, []);

  // Simple popup management without any debouncing
  useEffect(() => {
    if (!appointmentPopup) return;

    // Calculate initial position immediately
    const rect = appointmentPopup.elementRef!.getBoundingClientRect();
    const position = calculatePopupPosition(rect, 349, 280);
    setAppointmentPopup(prev => (prev ? { ...prev, position } : null));

    // Direct scroll/resize handler without debouncing
    const handleScrollResize = () => {
      const rect = appointmentPopup.elementRef!.getBoundingClientRect();
      const position = calculatePopupPosition(rect, 349, 280);
      setAppointmentPopup(prev => (prev ? { ...prev, position } : null));
    };

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setAppointmentPopup(null);
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScrollResize, { capture: true });
    window.addEventListener('resize', handleScrollResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollResize, { capture: true });
      window.removeEventListener('resize', handleScrollResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [appointmentPopup?.elementRef, calculatePopupPosition]);

  // Memoize timeline generation to avoid recalculating on every render
  const timeLine = useMemo(() => {
    return generateTimeSlots(
      null,
      workHours.start,
      workHours.end,
      timeFormat,
      timeInterval,
      timeZone
    );
  }, [workHours.start, workHours.end, timeFormat, timeInterval, timeZone]);

  // Memoize appointment lookup for better performance - using slot ID for efficient matching
  const appointmentLookup = useMemo(() => {
    const slotIdLookup = new Map<string, Appointment>(); // Slot ID lookup for direct matching

    appointments?.forEach(appointment => {
      slotIdLookup.set(appointment?.slot?.id, appointment);
    });
    return { slotIdLookup };
  }, [appointments, timeZone]);

  // Memoize available slots lookup - using slot ID for efficient matching
  const availableSlotsLookup = useMemo(() => {
    const dateLookup = new Map<string, AvailableTimeSlotsPerDay[]>();

    const pushToDate = (date: string, slot: AvailableTimeSlotsPerDay) => {
      if (!dateLookup.has(date)) dateLookup.set(date, []);
      dateLookup.get(date)!.push(slot);
    };

    availableSlots?.forEach(slot => {
      const start = moment.tz(slot.start_time, timeZone);
      const end = moment.tz(slot.end_time, timeZone);

      const startDate = start.format('YYYY-MM-DD');
      const endDate = end.format('YYYY-MM-DD');

      const isExactlyMidnight = end.hours() === 0 && end.minutes() === 0 && end.seconds() === 0;

      // 👉 Case 1: same-day OR ends exactly at midnight → DO NOT SPLIT
      if (startDate === endDate || isExactlyMidnight) {
        pushToDate(startDate, slot);
        return;
      }

      // 👉 Case 2: slot crosses midnight (end > 00:00:00) → SPLIT

      // Part 1: start → end of start day
      const part1: AvailableTimeSlotsPerDay = {
        ...slot,
        start_time: start.toISOString(),
        end_time: start.clone().endOf('day').toISOString(),
      };

      // Part 2: start of next day → real end
      const part2: AvailableTimeSlotsPerDay = {
        ...slot,
        start_time: end.clone().startOf('day').toISOString(),
        end_time: end.toISOString(),
      };

      pushToDate(startDate, part1);
      pushToDate(endDate, part2);
    });
    // console.log(dateLookup)
    return { dateLookup };
  }, [availableSlots, timeZone]);

  // Helper function to find appointments by slot ID for efficient matching
  const findAppointmentForSlot = useCallback(
    (slotId: string) => {
      // If we have a slot ID, use direct lookup (most efficient)
      if (slotId && appointmentLookup?.slotIdLookup?.has(slotId)) {
        return appointmentLookup?.slotIdLookup?.get(slotId) || null;
      }
      return null;
    },
    [appointmentLookup, timeInterval, timeZone]
  );

  // Helper function to check if a slot is marked as available
  const isSlotAvailable = useCallback(
    (date: string, slotTime: moment.Moment) => {
      const dateSlots = availableSlotsLookup.dateLookup.get(date);
      if (!dateSlots) return false;

      const slotStart = slotTime.clone();
      const slotEnd = slotTime.clone().add(timeInterval, 'minutes');

      // Check if any available slot falls within this time slot
      for (const availableSlot of dateSlots) {
        const availableSlotMoment = moment.tz(availableSlot.start_time, timeZone);
        if (availableSlotMoment.isSameOrAfter(slotStart) && availableSlotMoment.isBefore(slotEnd)) {
          return true;
        }
      }

      return false;
    },
    [availableSlotsLookup, timeInterval, timeZone]
  );

  // Helper function to find the actual available slot time that falls within a timeline slot
  const findAvailableSlotForTimeSlot = useCallback(
    (date: string, slotTime: moment.Moment) => {
      const dateSlots = availableSlotsLookup.dateLookup.get(date);
      if (!dateSlots) return undefined;

      const slotStart = slotTime.clone();
      const slotEnd = slotTime.clone().add(timeInterval, 'minutes');

      // Find available slot that falls within this time slot
      for (const availableSlot of dateSlots) {
        const availableSlotMoment = moment.tz(availableSlot.start_time, timeZone);
        if (availableSlotMoment.isSameOrAfter(slotStart) && availableSlotMoment.isBefore(slotEnd)) {
          return availableSlot;
        }
      }

      return undefined;
    },
    [availableSlotsLookup, timeInterval, timeZone]
  );
  const start: WeekDayData | undefined = weekday[0];
  const end: WeekDayData | undefined = weekday[weekday.length - 1];
  // Optimize weekday updates
  useEffect(() => {
    getCurrentWeekDates(startFromMonday, setWeekdays, currentCalenderConfig.Offset, view, timeZone);
  }, [startFromMonday, view, currentCalenderConfig.Offset, timeZone]);

  // Optimize month view updates
  useEffect(() => {
    const base = moment.tz(timeZone);
    const updatedDate = base.clone().add(currentCalenderConfig.Offset, 'months');

    const targetMonth = updatedDate.month();
    const targetYear = updatedDate.year();

    setActiveMonth({
      month: updatedDate.format('MMM'),
      year: updatedDate.format('YYYY'),
      date: updatedDate,
    });

    if (view === MODE_CONSTANT.MONTH) {
      setMonth(getCalendarMonthGrid(targetYear, targetMonth, timeZone));
    }

    localStorage.setItem(
      'calendar_config',
      JSON.stringify({
        Offset: currentCalenderConfig.Offset,
        view,
      })
    );
    handleSelectionCleaner();
  }, [view, currentCalenderConfig.Offset, timeZone]);

  useEffect(() => {
    if (view === MODE_CONSTANT.MONTH && month.length > 0) {
      const startDate = moment.tz(month?.[0]?.[0]?.date, timeZone).format('YYYY-MM-DD');
      const endDate = moment
        .tz(month?.[month.length - 1]?.[6]?.date, timeZone)
        .format('YYYY-MM-DD');
      handleMonthPagination?.(startDate, endDate);
    } else if (view === MODE_CONSTANT.WEEK && weekday.length > 0) {
      const startDate = moment.tz(weekday[0]?.date, timeZone).format('YYYY-MM-DD');
      const endDate = moment.tz(weekday[weekday.length - 1]?.date, timeZone).format('YYYY-MM-DD');
      handleMonthPagination?.(startDate, endDate);
    } else if (view === MODE_CONSTANT.DAY && weekday.length > 0) {
      const startDate = moment
        .tz(timeZone)
        .add(currentCalenderConfig.Offset, 'day')
        .format('YYYY-MM-DD');
      const endDate = moment
        .tz(timeZone)
        .add(currentCalenderConfig.Offset, 'day')
        .format('YYYY-MM-DD');
      handleMonthPagination?.(startDate, endDate);
    }
  }, [view, month, weekday]);

  const handleTabChange = useCallback((tab: string) => {
    setView(tab as ViewMode);
    setCurrentCalenderConfig({
      activeDate: '',
      activeMonth: '',
      activeYear: '',
      activeDay: '',
      activeWeekDay: '',
      Offset: 0,
    });
  }, []);

  const handleConfirmSelection = useCallback(() => {
    if (
      selectionState.current.startIndex === null ||
      selectionState.current.endIndex === null ||
      selectionState.current.dayIndex.length === 0
    )
      return;

    const minIndex = Math.min(selectionState.current.startIndex, selectionState.current.endIndex);
    const maxIndex = Math.max(selectionState.current.startIndex, selectionState.current.endIndex);
    const selectedDate = weekday[selectionState.current.dayIndex[0]]?.date;

    if (!selectedDate) return;
    // handleSelectionCleaner();

    const availableTimeSlotsPerDay: AvailableTimeSlotsPerDay[] = [];

    // Get slot configuration from props (default to timeInterval if not provided)
    const slotDuration = slotConfiguration?.slotDuration || timeInterval;
    const enforceAlignment = slotConfiguration?.enforceSlotAlignment ?? true;

    selectionState.current.dayIndex.forEach(dayIdx => {
      const dateStr = weekday[dayIdx]?.date;
      if (!dateStr) return;

      const date = moment.tz(dateStr, timeZone);

      // const existingAvailableSlots = availableSlotsLookup.dateLookup.get(dateStr) || [];
      const existingAvailableSlots: { start_time: string; end_time: string }[] = [];

      // Create a map of occupied time ranges (both available slots and appointments)
      const occupiedRanges: Array<{ start: moment.Moment; end: moment.Moment }> = [];

      if (Array.isArray(existingAvailableSlots))
        existingAvailableSlots?.forEach(slot => {
          occupiedRanges.push({
            start: moment.tz(slot?.start_time, timeZone),
            end: moment.tz(slot?.end_time, timeZone),
          });
        });

      // Sort occupied ranges by start time
      occupiedRanges.sort((a, b) => a.start.valueOf() - b.start.valueOf());

      // Find available time ranges within the selection
      const availableRanges: Array<{ start: moment.Moment; end: moment.Moment }> = [];

      // Start with the full selection range
      const selectionStart = timeLine[minIndex]?.timeString;
      const selectionEnd = timeLine[maxIndex]?.timeString;

      if (!selectionStart || !selectionEnd) return;

      let currentStart = moment.tz(
        `${moment.tz(date, timeZone).format('YYYY-MM-DD')} ${selectionStart}`,
        timeZone
      );
      const selectionEndMoment = moment
        .tz(`${moment.tz(date, timeZone).format('YYYY-MM-DD')} ${selectionEnd}`, timeZone)
        .add(timeInterval, 'minutes');

      // Remove occupied ranges from the selection
      for (const occupiedRange of occupiedRanges) {
        // If occupied range is completely before current start, skip
        if (occupiedRange.end.isSameOrBefore(currentStart)) continue;

        // If occupied range is completely after selection end, break
        if (occupiedRange.start.isSameOrAfter(selectionEndMoment)) break;

        // If there's a gap before the occupied range, add it as available
        if (occupiedRange.start.isAfter(currentStart)) {
          availableRanges.push({
            start: currentStart.clone(),
            end: occupiedRange.start.clone(),
          });
        }

        // Move current start to after the occupied range
        currentStart = occupiedRange.end.clone();
      }

      // Add remaining time after the last occupied range
      if (currentStart.isBefore(selectionEndMoment)) {
        availableRanges.push({
          start: currentStart.clone(),
          end: selectionEndMoment.clone(),
        });
      }

      // Create slots from available ranges based on slot configuration
      for (const range of availableRanges) {
        const rangeDuration = range.end.diff(range.start, 'minutes');

        if (enforceAlignment) {
          // Calculate how many complete slots can fit in this range
          const completeSlots = Math.floor(rangeDuration / slotDuration);

          if (completeSlots > 0) {
            // Create slots starting from the range start, aligned to slot duration
            for (let i = 0; i < completeSlots; i++) {
              const slotStart = range.start.clone().add(i * slotDuration, 'minutes');
              const slotEnd = slotStart.clone().add(slotDuration, 'minutes');

              // Ensure slot doesn't exceed the available range
              if (slotEnd.isSameOrBefore(range.end)) {
                availableTimeSlotsPerDay.push({
                  start_time: slotStart.format(),
                  end_time: slotEnd.format(),
                  status: 'Available',
                });
              }
            }
          }
        } else {
          // Create slots for each time interval in the range
          let currentSlotStart = range.start.clone();

          while (currentSlotStart.isBefore(range.end)) {
            const slotEnd = currentSlotStart.clone().add(slotDuration, 'minutes');

            // Ensure slot doesn't exceed the available range
            if (slotEnd.isSameOrBefore(range.end)) {
              availableTimeSlotsPerDay.push({
                start_time: currentSlotStart.format(),
                end_time: slotEnd.format(),
                status: 'Available',
              });
            }

            currentSlotStart = slotEnd.clone();
          }
        }
      }
    });

    // Only call onSlotSelect if we have valid slots
    if (availableTimeSlotsPerDay.length > 0 && onSlotSelect) {
      onSlotSelect(availableTimeSlotsPerDay as CreateAvailabilitySlotsRequest);
    }

    // Clear selection using DOM manipulation

    // hideSelectionButtons();
    selectionState.current = {
      isSelecting: false,
      dayIndex: [],
      startIndex: null,
      endIndex: null,
      startDateTime: undefined,
      endDateTime: undefined,
    };
  }, [
    selectionState.current,
    weekday,
    timeLine,
    timeZone,
    onSlotSelect,
    userId,
    timeInterval,
    slotConfiguration,
    availableSlotsLookup,
    appointments,
  ]);

  const handleRemoveAvailableSlots = () => {
    // Ensure all required properties are present and valid
    if (
      removeSlot.startIndex === null ||
      removeSlot.endIndex === null ||
      !Array.isArray(removeSlot.dayIndex) ||
      removeSlot.dayIndex.length === 0
    ) {
      return;
    }

    const slotsToRemove: AvailableTimeSlotsPerDay[] = [];
    const processedSlots = new Set<string>(); // Track processed slots to prevent duplicates
    const minIndex = Math.min(removeSlot.startIndex, removeSlot.endIndex);
    const maxIndex = Math.max(removeSlot.startIndex, removeSlot.endIndex);
    const arrayFromDayIndex = Array.from(
      { length: removeSlot.dayIndex[removeSlot.dayIndex.length - 1] - removeSlot.dayIndex[0] + 1 },
      (_, index) => removeSlot.dayIndex[0] + index
    );
    // Process each selected day for slot removal
    arrayFromDayIndex.forEach((dayIdx: number) => {
      // Validate day index is within valid range
      if (dayIdx < 0 || dayIdx >= weekday.length) {
        return;
      }

      const dayData = weekday[dayIdx];
      if (!dayData || !dayData.date) {
        return;
      }
      const dateStr = dayData.date;

      // Validate date format using moment with timezone
      if (!moment.tz(dateStr, 'YYYY-MM-DD', timeZone).isValid()) {
        return;
      }

      // Iterate through each time slot in the selected range
      for (let slotIdx = minIndex; slotIdx <= maxIndex; slotIdx++) {
        // Validate slot index is within timeline bounds
        if (slotIdx < 0 || slotIdx >= timeLine.length) {
          continue;
        }

        const timeSlot = timeLine[slotIdx];
        if (!timeSlot || !timeSlot.timeString) {
          continue;
        }

        // Create unique identifier to prevent duplicate processing
        const slotIdentifier = `${dateStr}-${timeSlot.timeString}`;
        if (processedSlots.has(slotIdentifier)) {
          continue;
        }

        processedSlots.add(slotIdentifier);

        // Validate time format with timezone context
        if (!moment.tz(timeSlot.timeString, 'HH:mm', timeZone).isValid()) {
          continue;
        }

        // Create moment object for this specific time slot
        const slotMoment = moment.tz(
          `${dateStr} ${timeSlot.timeString}`,
          'YYYY-MM-DD HH:mm',
          timeZone
        );

        // Ensure the created moment object is valid
        if (!slotMoment.isValid()) {
          continue;
        }

        // Check if there's an available slot at this time and process removal

        const hasAvailableSlot = isSlotAvailable(dateStr, slotMoment);

        if (hasAvailableSlot) {
          // Get the actual available slot time for removal
          const availableSlotTime = findAvailableSlotForTimeSlot(dateStr, slotMoment);
          if (availableSlotTime?.id) {
            // Validate the retrieved available slot time

            const availableSlotMoment = moment.tz(availableSlotTime.start_time, timeZone);

            if (!availableSlotMoment.isValid()) {
              continue;
            }

            // Check if slot falls within the specified datetime range (if provided)

            let isWithinRange = true;
            if (removeSlot.startDateTime && removeSlot.endDateTime) {
              const startDateTime = moment.tz(removeSlot.startDateTime, timeZone);

              const endDateTime = moment.tz(removeSlot.endDateTime, timeZone);

              // Validate datetime range and check if slot falls within it
              if (startDateTime.isValid() && endDateTime.isValid()) {
                isWithinRange =
                  availableSlotMoment.isSameOrAfter(startDateTime) &&
                  availableSlotMoment.isSameOrBefore(endDateTime);
              }
            }

            // Add slot to removal list if it passes all validations
            if (isWithinRange) {
              slotsToRemove.push(availableSlotTime);
            }
          }
        }
      }
    });

    // Execute removal if slots were found
    if (slotsToRemove.length > 0) {
      // Remove any potential duplicates from the final list
      const uniqueSlotsToRemove = [...new Set(slotsToRemove)];

      // Execute the removal callback if provided
      if (onSlotsRemove) {
        onSlotsRemove(uniqueSlotsToRemove);
      }
    }

    // Clear the current selection state
    handleSelectionCleaner();
  };

  // Optimized navigation handlers
  const handleTodayClick = useCallback(() => {
    setCurrentCalenderConfig(prev => ({
      ...prev,
      Offset: 0,
      activeDate: moment.tz(timeZone).format(),
    }));
  }, [timeZone, view]);

  const handlePrevClick = useCallback(() => {
    setCurrentCalenderConfig(prev => ({
      ...prev,
      Offset: prev.Offset - 1,
    }));
  }, []);

  const handleNextClick = useCallback(() => {
    setCurrentCalenderConfig(prev => ({
      ...prev,
      Offset: prev.Offset + 1,
    }));
  }, []);

  const handleSelectionCleaner = () => {
    if (selectionState.current.isSelecting) {
      clearSelectionFromDOM();
      // hideSelectionButtons();
      selectionState.current = {
        isSelecting: false,
        dayIndex: [],
        startIndex: null,
        endIndex: null,
        startDateTime: undefined,
        endDateTime: undefined,
      };
    }
    if (removeSlot.isSelecting) {
      setRemoveSlots({
        isSelecting: false,
        dayIndex: [],
        startIndex: null,
        endIndex: null,
        startDateTime: undefined,
        endDateTime: undefined,
      });
    }
  };

  // DOM manipulation functions for selection
  const hideSelectionButtons = useCallback(() => {
    document.querySelectorAll('.selection-buttons').forEach(buttons => {
      buttons.classList.remove('show');
    });
  }, []);

  // Function to clear time range info from DOM
  const clearTimeRangeInfo = useCallback(() => {
    document.querySelectorAll('.time-range-info').forEach(info => {
      info.remove();
    });
  }, []);

  const clearSelectionFromDOM = useCallback(() => {
    document.querySelectorAll('.slot-cell.selected').forEach(slot => {
      slot.classList.remove('selected');
      slot.removeAttribute('data-selection-start');
      slot.removeAttribute('data-selection-end');
    });
    // Also hide all selection buttons when clearing selection
    // hideSelectionButtons();
    // Clear time range info
    clearTimeRangeInfo();
  }, [hideSelectionButtons, clearTimeRangeInfo]);

  const addSelectionToDOM = useCallback((dayIndex: number, slotIndex: number) => {
    const slot = document.querySelector(
      `[data-day-index="${dayIndex}"][data-slot-index="${slotIndex}"]`
    );
    if (slot) {
      slot.classList.add('selected');
      // Mark this as both start and end for this day (single slot selection)
      slot.setAttribute('data-selection-start', 'true');
      slot.setAttribute('data-selection-end', 'true');
    }
  }, []);

  // const removeSelectionFromDOM = useCallback((dayIndex: number, slotIndex: number) => {
  //   const slot = document.querySelector(`[data-day-index="${dayIndex}"][data-slot-index="${slotIndex}"]`);
  //   if (slot) {
  //     slot.classList.remove('selected');
  //     slot.removeAttribute('data-selection-start');
  //     slot.removeAttribute('data-selection-end');
  //   }
  // }, []);

  const showSelectionButtons = useCallback((dayIndex: number, slotIndex: number) => {
    const buttons = document.querySelector(
      `[data-day-index="${dayIndex}"][data-slot-index="${slotIndex}"] .selection-buttons`
    );
    if (buttons) {
      buttons.classList.add('show');
    }
  }, []);

  // Function to update time range info directly in DOM
  const updateTimeRangeInfo = useCallback(
    (minIndex: number, maxIndex: number, dayIndices: number[]) => {
      // Clear existing time info
      clearTimeRangeInfo();
      // Get start and end time strings
      const startTime = timeLine[minIndex]?.timeString;
      const endTime =
        timeLine[maxIndex + 1]?.timeString ||
        moment(timeLine[maxIndex]?.timeString, 'HH:mm')
          .add(timeInterval, 'minutes')
          .format('HH:mm');
      if (!startTime || !endTime) return;

      const difference =
        selectionState.current.endIndex !== undefined &&
        selectionState.current.startIndex !== undefined &&
        selectionState.current.endIndex !== null &&
        selectionState.current.startIndex !== null
          ? selectionState.current.endIndex - selectionState.current.startIndex
          : 0;

      // Parse and format times to AM/PM
      const startDateTime = moment.tz(
        `${moment.tz(timeZone).format('YYYY-MM-DD')} ${startTime}`,
        timeZone
      );
      const endDateTime = moment.tz(
        `${moment.tz(timeZone).format('YYYY-MM-DD')} ${endTime}`,
        timeZone
      );

      const formattedStartTime = startDateTime.format('hh:mm A');
      const formattedEndTime = endDateTime.format('hh:mm A');

      const timeRangeText = `${formattedStartTime} - ${formattedEndTime}`;

      // Find the first selected slot to show time info
      const firstDayIndex = Math.min(...dayIndices);

      const midIndex = Math.ceil((maxIndex + minIndex) / 2);

      const midSlot = document.querySelector(
        `[data-day-index="${firstDayIndex}"][data-slot-index="${midIndex}"]`
      );
      const differenceEng = ((maxIndex - minIndex) * timeSlotSize) / 13;

      if (midSlot) {
        const timeInfoDiv = document.createElement('div');

        timeInfoDiv.className = 'time-range-info';
        timeInfoDiv.innerHTML = `
        <div  class="text-center text-primary font-bold pointer-events-none ">
          ${difference < 0 ? `<div>${timeRangeText}</div><div>Mark it as available?</div>` : `<div>Mark it as available?</div><div>${timeRangeText}</div>`}
        </div>
      `;

        timeInfoDiv.style.cssText = `
      position: absolute;
      display:flex;
      justify-content:center;
      align-items:center;
      top: -${timeSlotSize - 5}px ;
      font-size: ${differenceEng < 17 ? (differenceEng < 10 ? 10 : differenceEng) : 17}px;
      height:${100}%;
      z-index: 10;
      width:${dayIndices.length * 100}%;
      padding: 2px;
      border-radius: 4px;
     pointer-events: none;
    `;

        midSlot.appendChild(timeInfoDiv);
      }
    },
    []
  );

  // Add mouse up handler to manage button visibility
  const handleMouseUp = useCallback(() => {
    // If selection is only one slot, hide buttons
    const difference = Math.abs(
      selectionState.current.startIndex - selectionState.current.endIndex
    );
    if ((difference + 1) * timeInterval < 59) {
      // hideSelectionButtons();
    }
  }, [hideSelectionButtons, timeInterval, slotTimeSlotSize]);

  // Function to check if a time slot is in the past
  const isTimeSlotInPast = useCallback(
    (dayIndex: number, slotIndex: number) => {
      const dayDate = weekday[dayIndex]?.date;
      if (!dayDate) return true;

      const slotTime = timeLine[slotIndex]?.timeString;
      if (!slotTime) return true;

      const slotDateTime = moment.tz(`${dayDate} ${slotTime}`, 'YYYY-MM-DD HH:mm', timeZone);
      const now = moment.tz(timeZone);

      return slotDateTime.isBefore(now);
    },
    [weekday, timeLine, timeZone, timeInterval, slotTimeSlotSize]
  );

  // Optimized mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.matches('.slot-cell')) return;
      const dayIndex = target?.getAttribute('data-day-index') as string;
      const slotIndex = target?.getAttribute('data-slot-index') as string;

      // Check if the selected date is in the past
      const selectedDate = weekday[Number(dayIndex)]?.date;
      if (selectedDate) {
        const selectedMoment = moment.tz(selectedDate, timeZone);
        const today = moment.tz(timeZone).startOf('day');

        if (selectedMoment.isBefore(today)) {
          // Don't allow selection for past dates
          return;
        }
      }

      // Check if the specific time slot is in the past
      if (isTimeSlotInPast(Number(dayIndex), Number(slotIndex))) {
        // Don't allow selection for past time slots
        return;
      }

      setRemoveSlots({
        isSelecting: false,
        dayIndex: [],
        startIndex: null,
        endIndex: null,
        startDateTime: undefined,
        endDateTime: undefined,
      });

      if (event.buttons !== 1) return;

      // Clear previous selection and hide buttons
      clearSelectionFromDOM();
      // hideSelectionButtons();

      selectionState.current = {
        isSelecting: true,
        dayIndex: [Number(dayIndex)],
        startIndex: Number(slotIndex),
        endIndex: Number(slotIndex),
        startDateTime: undefined,
        endDateTime: undefined,
      };
      // Add selection to DOM
      addSelectionToDOM(Number(dayIndex), Number(slotIndex));
      if (timeInterval == 60) {
        // showSelectionButtons(Number(dayIndex), Number(slotIndex));
        updateTimeRangeInfo(Number(slotIndex), Number(slotIndex), [Number(dayIndex)]);
      }
    },
    [
      clearSelectionFromDOM,
      addSelectionToDOM,
      hideSelectionButtons,
      setRemoveSlots,
      weekday,
      timeZone,
      isTimeSlotInPast,
    ]
  );

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent, onclick = false) => {
      const target = event.target as HTMLElement;

      if (!target.matches('.slot-cell')) return;

      const dayIndex = Number(target.getAttribute('data-day-index'));
      const slotIndex = Number(target.getAttribute('data-slot-index'));
      if (
        (onclick &&
          selectionState.current.isSelecting &&
          (slotIndex == selectionState.current.endIndex ||
            slotIndex == selectionState.current.startIndex)) ||
        timeInterval == 30
      ) {
        handleMouseOver(event);
      }
      if (event.buttons !== 1) return;

      if (!selectionState.current.isSelecting) return;

      // Check if the target date is in the past
      const targetDate = weekday[dayIndex]?.date;
      if (targetDate) {
        const targetMoment = moment.tz(targetDate, timeZone);
        const today = moment.tz(timeZone).startOf('day');

        if (targetMoment.isBefore(today)) {
          // Don't allow selection extension into past dates
          return;
        }
      }

      // Check if the specific time slot is in the past
      if (isTimeSlotInPast(dayIndex, slotIndex)) {
        // Don't allow selection extension into past time slots
        return;
      }

      const startDay = selectionState.current.dayIndex[0];

      const newDayList = Array.from({ length: Math.abs(dayIndex - startDay) + 1 }, (_, i) =>
        dayIndex > startDay ? startDay + i : startDay - i
      );

      const startIndex = selectionState.current.startIndex;
      const endIndex = slotIndex;

      // Check if startIndex is valid
      if (startIndex === null) return;

      const minIndex = Math.min(startIndex, endIndex);
      const maxIndex = Math.max(startIndex, endIndex);

      // 1. Reset ALL slots first (clear old paint)
      document.querySelectorAll('.slot-cell').forEach(slot => {
        slot.classList.remove('selected');
        slot.removeAttribute('data-selection-start');
        slot.removeAttribute('data-selection-end');
      });
      let firstIndex = 0;
      let firstDIndex = Number.MAX_VALUE;
      // 2. Paint only new range using CSS classes
      newDayList.forEach(d => {
        const slots = document.querySelectorAll(`[data-day-index="${d}"]`);
        const daySelectedSlots: HTMLElement[] = [];

        // First, collect all selected slots for this day
        slots.forEach((slot, i) => {
          const sIndex = Number(slot.getAttribute('data-slot-index'));
          const now = moment.tz(timeZone);
          const slotTime = moment.tz(`${weekday[d].date} ${timeLine[sIndex].timeString}`, timeZone);

          const isPastTime = now.isAfter(slotTime);

          if (sIndex >= minIndex && sIndex <= maxIndex && !isPastTime) {
            if (d < firstDIndex || !firstIndex) {
              firstIndex = i;
              firstDIndex = d;
            }

            slot.classList.add('selected');
            daySelectedSlots.push(slot as HTMLElement);
          }
        });

        // Now mark the first and last selected slots for this specific day
        if (daySelectedSlots.length > 0) {
          // Sort by slot index to find first and last
          daySelectedSlots.sort((a, b) => {
            const aIndex = Number(a.getAttribute('data-slot-index'));
            const bIndex = Number(b.getAttribute('data-slot-index'));
            return aIndex - bIndex;
          });

          // Mark first slot of this day
          daySelectedSlots[0].setAttribute('data-selection-start', 'true');

          // Mark last slot of this day
          daySelectedSlots[daySelectedSlots.length - 1].setAttribute('data-selection-end', 'true');
        }
      });

      // Update button visibility based on selection range
      const slotDifference = Math.abs(endIndex - startIndex);
      if ((slotDifference + 1) * timeInterval > 59) {
        // Hide all buttons first, then show on the end slot
        // hideSelectionButtons();
        // showSelectionButtons(dayIndex, endIndex);

        // Update time range info directly in DOM
        updateTimeRangeInfo(minIndex, maxIndex, newDayList);
      } else {
        // If no range, hide buttons and clear time info
        // hideSelectionButtons();
        clearTimeRangeInfo();
      }

      // update selectionState
      selectionState.current = {
        ...selectionState.current,
        dayIndex: newDayList,
        endIndex,
      };
    },
    [showSelectionButtons, hideSelectionButtons, weekday, timeZone, timeInterval, slotTimeSlotSize]
  );

  // Handler for available slot clicks
  const handleAvailableSlotClick = useCallback(
    (slotTime: string) => {
      if (onAvailableSlotSet) {
        onAvailableSlotSet(slotTime);
      }
    },
    [onAvailableSlotSet]
  );

  const handleMouseOver = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;

    if (!target.matches('.selected')) return;

    const dayIndex = Number(target.getAttribute('data-day-index'));
    const slotIndex = Number(target.getAttribute('data-slot-index'));

    // Clean previous button
    if (lastShownRef.current) {
      lastShownRef.current.querySelector('.selection-buttons')?.classList.remove('show');
    }

    const firstSlot = document.querySelector(
      `[data-day-index="${dayIndex}"][data-slot-index="${slotIndex}"]`
    );

    if (firstSlot) {
      const button = firstSlot.querySelector('.selection-buttons');
      if (button) {
        button.classList.add('show');
        lastShownRef.current = firstSlot; // update ref
      }
    }
  }, []);

  useEffect(() => {
    if (removeSlot.isSelecting) {
      if (selectionState.current.isSelecting) {
        clearSelectionFromDOM();
        selectionState.current = {
          isSelecting: false,
          dayIndex: [],
          startIndex: null,
          endIndex: null,
          startDateTime: undefined,
          endDateTime: undefined,
        };
      }
    }
  }, [removeSlot]);
  // Memoized popup component to prevent unnecessary re-renders
  const MemoizedAppointmentDetailsPopup = useMemo(() => {
    if (!appointmentPopup && !appointmentPopup?.position?.top) return null;
    const props = {
      ref: popupRef,
      style: {
        top: appointmentPopup.position.top,
        left: appointmentPopup.position.left,
        transform: 'translateZ(0)',
        willChange: 'transform',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        zIndex: '50',
      },
    };
    return (
      <AppointmentDetailsPopup
        appointment={appointmentPopup.appointment}
        dayIndex={appointmentPopup.dayIndex}
        position={{ top: 0, left: 0, ...appointmentPopup?.position?.direction }}
        onClose={closeAppointmentPopup}
        timeZone={timeZone}
        {...props}
      />
    );
  }, [appointmentPopup, closeAppointmentPopup, timeZone]);

  const MemoizeDayIndex = useMemo(() => {
    return weekday.map((data, dayIndex) => {
      return (
        <div key={`${dayIndex}`} draggable={false}>
          <DayColumn
            data={data}
            slotSize={timeSlotSize}
            dayIndex={dayIndex}
            timeLine={timeLine}
            findAppointmentForSlot={findAppointmentForSlot}
            findAvailableSlotForTimeSlot={findAvailableSlotForTimeSlot}
            isSlotAvailable={isSlotAvailable}
            selection={selectionState.current}
            setRemoveSlots={setRemoveSlots}
            removeSlot={removeSlot}
            view={view}
            timeInterval={timeInterval}
            timeZone={timeZone}
            handleRemoveSlot={() => {}}
            handleSelectionCleaner={handleSelectionCleaner}
            handleRemoveSelectedSlot={handleRemoveAvailableSlots}
            onAppointmentClick={handleAppointmentClickWithPosition}
            onConfirmSelection={handleConfirmSelection}
            onAvailableSlotClick={handleAvailableSlotClick}
          />
        </div>
      );
    });
  }, [
    selectionState.current,
    weekday,
    timeLine,
    findAppointmentForSlot,
    findAvailableSlotForTimeSlot,
    isSlotAvailable,
    view,
    timeZone,
    handleSelectionCleaner,
    handleRemoveAvailableSlots,
    handleAppointmentClickWithPosition,
    handleConfirmSelection,
    handleAvailableSlotClick,
    timeInterval,
    timeSlotSize,
  ]);

  const scrollToTimeRange = useCallback(() => {
    if (!scrollContainerRef.current || timeLine.length === 0) return;
    // Find the index of 7:00 AM in the timeline
    const sevenAMIndex = timeLine.findIndex(slot => slot.timeString === '07:00');
    if (sevenAMIndex !== -1 && scrollContainerRef.current) {
      const slotHeight = timeSlotSize;
      const scrollOffset = sevenAMIndex * slotHeight;

      const paddingTop = 0;

      scrollContainerRef.current.scrollTop = scrollOffset - paddingTop;
    }
  }, [timeSlotSize]);

  useEffect(() => {
    if (view == 'Day' || view == 'Week') {
      scrollToTimeRange();
    }
  }, [timeLine, timeSlotSize, view]);

  return (
    <>
      <div
        draggable={false}
        className='w-full rounded-20px bg-white border border-surface overflow-hidden h-full calendar-container transition-all flex flex-col '
      >
        <div className='calendar-top-bar' key={timeInterval + timeSlotSize}>
          <CalendarTopBar
            view={view}
            activeMonth={activeMonth}
            start={start}
            slotRange={slotRange}
            end={end}
            onTodayClick={handleTodayClick}
            onPrevClick={handlePrevClick}
            onNextClick={handleNextClick}
            onTabChange={handleTabChange}
            setTimeInterval={(time: number) => setTimeInterval(time)}
            timeInterval={timeInterval}
            children={AdditionalActionButton}
          />
        </div>
        <div className='overflow-x-auto flex-1'>
          <div
            className={clsx(
              'h-full flex flex-col overflow-hidden',
              view === MODE_CONSTANT.DAY ? '' : 'min-w-900px'
            )}
          >
            <div className='calendar-header'>
              <CalendarHeader view={view} weekday={weekday} timeZone={timeZone} />
            </div>
            <div
              ref={view !== MODE_CONSTANT.MONTH ? scrollContainerRef : null}
              draggable={false}
              className='flex-1 overflow-y-auto scrollbar-hide'
            >
              {view !== MODE_CONSTANT.MONTH && (
                <div className='flex'>
                  <div className='time-line'>
                    <TimeLineComponent
                      displayHourOnly={displayHourOnly}
                      slotSize={timeSlotSize}
                      timeLine={timeLine}
                    />
                  </div>

                  <div
                    draggable={false}
                    className={clsx(
                      'grid flex-1 day-column transition-all duration-75',
                      view === MODE_CONSTANT.DAY ? 'grid-cols-1' : 'grid-cols-7'
                    )}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseEnter}
                    onMouseUp={handleMouseUp}
                    onMouseOver={handleMouseOver}
                    onClick={timeInterval == 60 ? e => handleMouseEnter(e, true) : () => null}
                  >
                    {MemoizeDayIndex}
                  </div>
                </div>
              )}
              {view === MODE_CONSTANT.MONTH && (
                <div className='grid grid-cols-7'>
                  <MonthViewComponent
                    timeZone={timeZone}
                    month={month}
                    appointments={appointments}
                    handleAppointmentClick={handleAppointmentClickWithPosition}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Appointment Detail Popup */}
      {MemoizedAppointmentDetailsPopup}
    </>
  );
};

export default CustomCalendar;

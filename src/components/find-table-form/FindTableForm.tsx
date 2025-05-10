import React, { useReducer, useRef, useEffect, useState } from "react";
import classes from "./FindTableForm.module.scss";
import ErrorPopup from "../error-popup/ErrorPopup";

/* ----------------------------- Interfaces ----------------------------- */

interface ITableReservation {
  selectedDate: Date | null;
  selectedTime: string | number | null;
  numberOfGuests: string | number;
}

interface IProps {
  setTableReservationHandler: (reservationData: ITableReservation) => void;
  setPageHandler: (page: string) => void;
}

interface ITimeSlot {
  hr: number;
  min: string | number;
  isFull: boolean;
  isBlocked: boolean;
}

interface IState {
  formSubmitted: boolean;
  currentDate: Date;
  currentTime: string;
  dayOfTheWeek: string;
  selectedDate: Date | null;
  selectedTime: string | number;
  times: ITimeSlot[];
  numberOfGuests: string | number;
}

/* ----------------------------- Initial State ----------------------------- */

const initialState: IState = {
  formSubmitted: false,
  currentDate: new Date(),
  currentTime: new Date().toISOString().split("T")[1],
  dayOfTheWeek: "Mon",
  selectedDate: null,
  selectedTime: 1700,
  numberOfGuests: 2,
  times: Array(5).fill({ hr: 17, min: "00", isFull: false, isBlocked: false }),
};

/* ----------------------------- Action Types ----------------------------- */

type Action =
  | { type: "SET_FORM_SUBMITTED"; payload: boolean }
  | { type: "SET_DAY_OF_THE_WEEK"; payload: string }
  | { type: "SET_SELECTED_TIME"; payload: string | number }
  | { type: "SET_NUMBER_OF_GUESTS"; payload: string | number }
  | { type: "SET_TIMES"; payload: ITimeSlot[] }
  | { type: "SET_TIME_IS_FULL"; payload: { index: number; isFull: boolean } }
  | {
      type: "SET_TIME_IS_BLOCKED";
      payload: { index: number; isBlocked: boolean };
    };

/* ----------------------------- Reducer ----------------------------- */

function reducer(state: IState, action: Action): IState {
  switch (action.type) {
    case "SET_FORM_SUBMITTED":
      return { ...state, formSubmitted: action.payload };
    case "SET_DAY_OF_THE_WEEK":
      return { ...state, dayOfTheWeek: action.payload };
    case "SET_SELECTED_TIME":
      return { ...state, selectedTime: action.payload };
    case "SET_NUMBER_OF_GUESTS":
      return { ...state, numberOfGuests: action.payload };
    case "SET_TIMES":
      return { ...state, times: action.payload };
    case "SET_TIME_IS_FULL": {
      const updatedTimes = [...state.times];
      updatedTimes[action.payload.index].isFull = action.payload.isFull;
      return { ...state, times: updatedTimes };
    }
    case "SET_TIME_IS_BLOCKED": {
      const updatedTimes = [...state.times];
      updatedTimes[action.payload.index].isBlocked = action.payload.isBlocked;
      return { ...state, times: updatedTimes };
    }
    default:
      return state;
  }
}

/* ----------------------------- Helpers ----------------------------- */

function parseHourAndMinute(selectedTime: string | number): [number, string] {
  const timeStr = String(selectedTime).padStart(4, "0");
  return [parseInt(timeStr.slice(0, 2), 10), timeStr.slice(2, 4)];
}

function buildTimeSlots(selectedTime: string | number): ITimeSlot[] {
  const [hour, minute] = parseHourAndMinute(selectedTime);
  const times: ITimeSlot[] = Array(5).fill({
    hr: hour,
    min: minute,
    isFull: false,
    isBlocked: false,
  });
  const minNumber = parseInt(minute, 10);

  if (minNumber === 0) {
    times[0] = { hr: hour - 1, min: "30", isFull: false, isBlocked: false };
    times[1] = { hr: hour - 1, min: "45", isFull: false, isBlocked: false };
    times[2] = { hr: hour, min: "00", isFull: false, isBlocked: false };
    times[3] = { hr: hour, min: "15", isFull: false, isBlocked: false };
    times[4] = { hr: hour, min: "30", isFull: false, isBlocked: false };
  } else if (minNumber === 15) {
    times[0] = { hr: hour - 1, min: "45", isFull: false, isBlocked: false };
    times[1] = { hr: hour, min: "00", isFull: false, isBlocked: false };
    times[2] = { hr: hour, min: "15", isFull: false, isBlocked: false };
    times[3] = { hr: hour, min: "30", isFull: false, isBlocked: false };
    times[4] = { hr: hour, min: "45", isFull: false, isBlocked: false };
  } else if (minNumber === 30) {
    times[0] = { hr: hour, min: "00", isFull: false, isBlocked: false };
    times[1] = { hr: hour, min: "15", isFull: false, isBlocked: false };
    times[2] = { hr: hour, min: "30", isFull: false, isBlocked: false };
    times[3] = { hr: hour, min: "45", isFull: false, isBlocked: false };
    times[4] = { hr: hour + 1, min: "00", isFull: false, isBlocked: false };
  } else if (minNumber === 45) {
    times[0] = { hr: hour, min: "15", isFull: false, isBlocked: false };
    times[1] = { hr: hour, min: "30", isFull: false, isBlocked: false };
    times[2] = { hr: hour, min: "45", isFull: false, isBlocked: false };
    times[3] = { hr: hour + 1, min: "00", isFull: false, isBlocked: false };
    times[4] = { hr: hour + 1, min: "15", isFull: false, isBlocked: false };
  }

  return times;
}

function isTimeWithinRange(
  hour: number,
  dayOfWeek: string,
  checkLowerBound: boolean
): boolean {
  const isFriOrSat = dayOfWeek === "Fri" || dayOfWeek === "Sat";
  const maxHour = isFriOrSat ? 21 : 20;
  return checkLowerBound ? hour > 16 && hour < maxHour : hour < maxHour;
}

function isSlotInPast(
  slot: ITimeSlot,
  selectedDate: Date | null,
  currentDate: Date
): boolean {
  if (!selectedDate) return false;
  const slotDateTime = new Date(selectedDate);
  slotDateTime.setHours(slot.hr, Number(slot.min), 0, 0);
  return slotDateTime < currentDate;
}

/* ----------------------------- Component ----------------------------- */

const FindTableForm = ({
  setTableReservationHandler,
  setPageHandler,
}: IProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const numberOfGuestsRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const newTimeSlots = buildTimeSlots(state.selectedTime);
    dispatch({ type: "SET_TIMES", payload: newTimeSlots });
  }, [state.selectedTime]);

  const goToAddDetailsForm = () => {
    setPageHandler("AddDetailsForm");
  };

  const findTableButtonHandler = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const selectedDateValue = dateInputRef.current?.value;
    if (!selectedDateValue) {
      setErrorMessage("Please select a valid date.");
      return;
    }

    const [selectedHour, selectedMinuteStr] = parseHourAndMinute(
      state.selectedTime
    );
    const selectedMinute = Number(selectedMinuteStr);
    const bookingDateTime = new Date(selectedDateValue);
    bookingDateTime.setHours(selectedHour, selectedMinute, 0, 0);

    if (bookingDateTime < new Date()) {
      setErrorMessage(
        "Bookings cannot be made for past dates or times. Please select a valid date and time for your booking."
      );
      return;
    }

    dispatch({ type: "SET_SELECTED_TIME", payload: state.selectedTime });
    const guests = numberOfGuestsRef.current?.value ?? "2";
    dispatch({ type: "SET_NUMBER_OF_GUESTS", payload: guests });
    dispatch({ type: "SET_FORM_SUBMITTED", payload: true });

    const shortDay = new Date(selectedDateValue).toLocaleDateString("en-US", {
      weekday: "short",
    });
    dispatch({ type: "SET_DAY_OF_THE_WEEK", payload: shortDay });

    setTableReservationHandler({
      selectedDate: new Date(selectedDateValue),
      selectedTime: state.selectedTime,
      numberOfGuests: guests,
    });

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/table/toggle-time-selection",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedDate: selectedDateValue,
            selectedTime: state.selectedTime,
            numberOfGuests: state.numberOfGuests,
          }),
        }
      );

      const data = await response.json();

      dispatch({
        type: "SET_TIMES",
        payload: data.data.timeSlots,
      });
    } catch (error) {
      setErrorMessage("Error checking table availability. Try again later.");
      console.error("Error:", error);
    }
  };

  const renderTimeButton = (slot: ITimeSlot, index: number) => {
    const { hr, min, isFull, isBlocked } = slot;
    const checkLowerBound = index < 2;
    const isInRange = isTimeWithinRange(
      hr,
      state.dayOfTheWeek,
      checkLowerBound
    );
    const inPast = isSlotInPast(slot, state.selectedDate, new Date());
    const isClickable = isInRange && !inPast && !isBlocked && !isFull;
    const buttonLabel = `${hr.toString().padStart(2, "0")}:${String(
      min
    ).padStart(2, "0")}`;

    return (
      <button
        key={index}
        onClick={isClickable ? goToAddDetailsForm : undefined}
        className={
          isClickable
            ? classes["button-select-date"]
            : classes["button-select-date--faded"]
        }
      >
        {buttonLabel}
      </button>
    );
  };

  const hideTimeSlotButtons = () => {
    dispatch({ type: "SET_FORM_SUBMITTED", payload: false });
  };

  const pickTimeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: "SET_SELECTED_TIME", payload: e.target.value });
    hideTimeSlotButtons();
  };

  return (
    <>
      <form onSubmit={findTableButtonHandler}>
        <div className={classes["u-row"]}>
          <input
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            ref={dateInputRef}
            onChange={hideTimeSlotButtons}
          />

          <select value={state.selectedTime} onChange={pickTimeHandler}>
            {[...Array(13)].map((_, i) => {
              const base = 17 * 60;
              const timeInMin = base + i * 15;
              const hr = Math.floor(timeInMin / 60);
              const min = timeInMin % 60;
              const label = `${hr.toString().padStart(2, "0")}:${min
                .toString()
                .padStart(2, "0")}`;
              return (
                <option key={label} value={hr * 100 + min}>
                  🕑 {label}
                </option>
              );
            })}
          </select>

          <select
            ref={numberOfGuestsRef}
            defaultValue={2}
            onChange={hideTimeSlotButtons}
          >
            {[...Array(15)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                👤 {i + 1} {i === 0 ? "Person" : "People"}
              </option>
            ))}
          </select>
        </div>
        <input
          className={classes["button-find-table"]}
          type="submit"
          value="Find Table"
        />
      </form>

      {state.formSubmitted && (
        <div className={classes["u-row"]}>
          {state.times.map((slot, index) => renderTimeButton(slot, index))}
        </div>
      )}

      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
    </>
  );
};

export default FindTableForm;

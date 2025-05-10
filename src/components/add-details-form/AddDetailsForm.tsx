import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import DOMPurify from "dompurify";
import classes from "./AddDetailsForm.module.scss";
import ErrorPopup from "../error-popup/ErrorPopup";

/*-------------------------------- Interfaces ----------------------------------------------------------------*/

interface ITableReservation {
  selectedDate: Date | null;
  selectedTime: string | number | null;
  numberOfGuests: null | string | number;
}

interface IProps {
  tableReservation: ITableReservation;
  setPageHandler: (page: string) => void;
}

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

/*-------------------------------- Component ----------------------------------------------------------------*/

const AddDetailsForm: React.FC<IProps> = (props) => {
  const date = new Date(`${props.tableReservation.selectedDate}`);
  const time = `${String(props.tableReservation.selectedTime || "").slice(
    0,
    2
  )}:${String(props.tableReservation.selectedTime || "").slice(2, 4)}`;

  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const telInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const occasionInputRef = useRef<HTMLSelectElement>(null);
  const requestsInputRef = useRef<HTMLTextAreaElement>(null);
  const termsInputRef = useRef<HTMLInputElement>(null);

  /*-------------------------------- Components ----------------------------------------------------------------*/

  const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, onClose }) => {
    return ReactDOM.createPortal(
      <div className={classes["popup-overlay"]}>
        <div className={classes["popup"]}>
          <p>{message}</p>
          <button className={classes["close-btn"]} onClick={onClose}>
            Close
          </button>
        </div>
      </div>,
      document.getElementById("popup-root") as HTMLElement
    );
  };

  /*-------------------------------- State ----------------------------------------------------------------*/
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /*-------------------------------- Functions ----------------------------------------------------------------*/

  const goToFindTableForm = () => {
    props.setPageHandler("FindTableForm");
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure refs exist
    if (
      !firstNameInputRef.current ||
      !lastNameInputRef.current ||
      !telInputRef.current ||
      !emailInputRef.current ||
      !occasionInputRef.current ||
      !requestsInputRef.current ||
      !termsInputRef.current
    ) {
      setErrorMessage("One or more fields are not accessible.");
      return;
    }

    // Sanitize the special requests input using DOMPurify
    const sanitizedRequests = DOMPurify.sanitize(
      requestsInputRef.current.value.trim()
    );

    const formData = {
      selectedDate: props.tableReservation.selectedDate,
      selectedTime: props.tableReservation.selectedTime,
      numberOfGuests: props.tableReservation.numberOfGuests,
      firstName: firstNameInputRef.current.value.trim(),
      lastName: lastNameInputRef.current.value.trim(),
      tel: telInputRef.current.value.trim(),
      email: emailInputRef.current.value.trim(),
      occasion: occasionInputRef.current.value,
      requests: sanitizedRequests, // Use the sanitized version here
      termsAccepted: termsInputRef.current.checked,
    };

    // Form Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.tel ||
      !formData.email
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (formData.tel.length < 6) {
      setErrorMessage("Phone number must be at least 6 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.termsAccepted) {
      setErrorMessage("You must accept the terms to continue.");
      return;
    }

    const body = JSON.stringify(formData);

    try {
      const response = await fetch("http://localhost:5000/api/v1/table/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        throw new Error("Something went wrong while submitting the form.");
      }

      setSuccessMessage("Your booking has been successfully submitted!");
    } catch (error) {
      setErrorMessage("Failed to submit the booking. Please try again.");
    }
  };

  /*-------------------------------- Effects ----------------------------------------------------------------*/

  useEffect(() => {
    console.log("Table Reservation:", props.tableReservation);
  }, [props.tableReservation]);

  /*-------------------------------- Render ----------------------------------------------------------------*/

  return (
    <>
      {errorMessage && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => {
            setErrorMessage(null), goToFindTableForm();
          }}
        />
      )}
      {successMessage && (
        <SuccessPopup
          message={successMessage}
          onClose={() => {
            setSuccessMessage(null), goToFindTableForm();
          }}
        />
      )}

      <p className={classes["almost-there"]}>
        <strong>You're almost done!</strong>
      </p>

      <p className={classes.booking}>{`📆 ${date.toDateString()}`}</p>
      <p className={classes.booking}>🕑 {time}</p>
      <p className={classes.booking}>
        👤 {`${props.tableReservation.numberOfGuests} guests`}
      </p>
      <p className={classes.info}>
        <strong>Important Information Before Your Visit</strong>
        <br />
        <strong>Restaurant Terms and Conditions:</strong> For a full list of our
        terms and conditions, please feel free to contact us directly.
        <br />
        <br />
        <strong>Key Dining Information:</strong>
        <br />- We allow a <strong>10-minute grace period</strong> for your
        reservation. If you are running late, kindly contact us to inform us of
        your estimated arrival time.
        <br />- Please ensure that your{" "}
        <strong>
          contact details, including phone number and email, are accurate
        </strong>
        , as we may need to reach out regarding your booking.
        <br />- <strong>Seating Duration:</strong> Reservations are allocated
        for <strong>up to 2 hours for groups of 4 or fewer</strong>, and{" "}
        <strong>up to 3 hours for parties of 5 or more</strong>.
        <br />
        <br />
        <strong>A Note from Our Team:</strong>
        <br />- The{" "}
        <strong>
          kitchen accepts food orders until 8:45 PM on Fridays and Saturdays
        </strong>
        , and <strong>7:45 PM from Sunday to Thursday</strong>.
        <br />- We <strong>recommend booking no later than 6:00 PM</strong> to
        ensure the best experience.
        <br />- For <strong>larger parties</strong>, please contact us directly
        to check availability.
        <br />
        <br />
        We look forward to welcoming you to Moness and providing an exceptional
        dining experience!
      </p>

      <h2 className={classes.heading}>
        <strong>Required Fields</strong>
      </h2>
      <form className={classes.form} onSubmit={submitHandler}>
        <input type="text" placeholder="First Name" ref={firstNameInputRef} />
        <input type="text" placeholder="Last Name" ref={lastNameInputRef} />
        <input type="tel" placeholder="Phone Number" ref={telInputRef} />
        <input type="email" placeholder="Email Address" ref={emailInputRef} />

        <select defaultValue="" ref={occasionInputRef}>
          <option value="">Special Occasion (Optional)</option>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
          <option value="date-night">Date Night</option>
          <option value="business-meal">Business Meal</option>
          <option value="celebration">Celebration</option>
        </select>

        <textarea
          placeholder="Special Requests (Optional)"
          ref={requestsInputRef}
        />

        <label id={classes.terms}>
          <input type="checkbox" value="yes" ref={termsInputRef} /> I agree to
          the restaurant's <strong>Terms & Conditions</strong>.
        </label>
        <input
          type="submit"
          value="Submit Details"
          id={classes["button-submit"]}
        />
      </form>
      <button onClick={goToFindTableForm} id={classes["button-back"]}>
        Back to Find a Table
      </button>
    </>
  );
};

export default AddDetailsForm;

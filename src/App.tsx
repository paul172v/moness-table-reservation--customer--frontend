import React, { useState } from "react";
import classes from "./App.module.scss";

import FindTableForm from "./components/find-table-form/FindTableForm";
import AddDetailsForm from "./components/add-details-form/AddDetailsForm";

interface ITableReservation {
  selectedDate: Date | null;
  selectedTime: string | number | null;
  numberOfGuests: string | number;
}

function App() {
  const [page, setPage] = useState("FindTableForm");
  const [tableReservation, setTableReservation] = useState<ITableReservation>({
    selectedDate: null,
    selectedTime: null,
    numberOfGuests: 2,
  });

  const setTableReservationHandler = (reservation: ITableReservation) => {
    setTableReservation(reservation);
  };

  const setPageHandler = (page: string) => {
    setPage(page);
  };

  return (
    <div className={classes.page}>
      <div className={classes["white-box"]}>
        <img
          className={classes.logo}
          src="/public/moness-logo.jpg"
          alt="logo"
        />
        <div className={classes["u-row"]}>
          <p
            className={
              page === "FindTableForm"
                ? classes.navigation
                : classes["navigation--transparent"]
            }
          >
            <span className={classes["color-primary"]}>1.</span> Find a table
          </p>
          <p
            className={
              page === "AddDetailsForm"
                ? classes.navigation
                : classes["navigation--transparent"]
            }
          >
            <span className={classes["color-primary"]}>2.</span> Enter your
            details
          </p>
        </div>
        <h1>Flemmyng Restaurant</h1>
        {page === "FindTableForm" && (
          <FindTableForm
            setTableReservationHandler={setTableReservationHandler}
            setPageHandler={setPageHandler}
          />
        )}
        {page === "AddDetailsForm" && (
          <AddDetailsForm
            tableReservation={tableReservation}
            setPageHandler={setPageHandler}
          />
        )}
      </div>
    </div>
  );
}

export default App;

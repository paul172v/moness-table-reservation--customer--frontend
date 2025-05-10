import React from "react";
import ReactDOM from "react-dom";
import classes from "./ErrorPopup.module.scss";

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
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

export default ErrorPopup;

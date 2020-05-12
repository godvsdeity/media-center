import React from "react";

interface SpinnerProps {
  className?: string;
}

function Spinner({ className }: SpinnerProps) {
  const classes = `${className ? className : ""} d-flex justify-content-center`;
  return (
    <div className={classes}>
      <div className="spinner-border text-light" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

export default Spinner;

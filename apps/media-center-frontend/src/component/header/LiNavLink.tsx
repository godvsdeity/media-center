import React from "react";
import { Route, Link } from "react-router-dom";

function LiNavLink({ to, children, className, activeClassName, ...rest }: any) {
  const path = typeof to === "object" ? to.pathname : to;
  return (
    <Route
      path={path}
      children={({ match }) => {
        const isActive = !!match;
        return (
          <li className={`nav-item ${isActive ? activeClassName : ""}`}>
            <Link
              {...rest}
              className={
                isActive
                  ? [className, activeClassName].filter((i) => i).join(" ")
                  : className
              }
              to={to}
            >
              {typeof children === "function" ? children(isActive) : children}
            </Link>
          </li>
        );
      }}
    />
  );
}

export default LiNavLink;

import * as React from "react";

import "../stylesheets/Sidebar.css";
import "../stylesheets/OverlayShadow.css";

type OverlayShadowProps = {
  displaying: boolean;
};

export default function OverlayShadow({ displaying }: OverlayShadowProps) {
  return (
    <div
      id="overlay-shadow"
      className={displaying ? "overlay-shadow-displaying" : ""}
    ></div>
  );
}

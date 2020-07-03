import * as React from "react";

import SearchBar from "./SearchBar";

import MusicVideo from "../util/MusicVideo";

import "../stylesheets/Navbar.css";
import logo from "../assets/spotify-logo.png";

type NavbarProps = {
  videos: MusicVideo[];
};

export default function Navbar({ videos }: NavbarProps) {
  return (
    <div className="navbar">
      <div className="my-2 px-2 row align-items-center justify-content-center">
        <div className="col-3 row justify-content-start">
          <div className="col-2 h-100 p-0">
            <i
              className="fa fa-bars navbar-sidebar-toggle"
              aria-hidden="true"
              style={{
                fontSize: "22px",
                color: "rgb(179, 179, 179)",
                marginTop: "9px",
              }}
            ></i>
          </div>
          <div
            className="col-5 spotify-header-white no-select"
            style={{
              fontSize: "25px",
              cursor: "pointer",
            }}
          >
            <img
              src={logo}
              style={{ width: "25px", height: "25px" }}
              draggable={false}
            />{" "}
            MTV
          </div>
        </div>
        <div className="col-6 d-flex justify-content-center">
          <SearchBar videos={videos} />
        </div>
        <div className="col-3"></div>
      </div>
    </div>
  );
}

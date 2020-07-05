import * as React from "react";

import SearchBar from "./SearchBar";

import MusicVideo from "../util/MusicVideo";

import "../stylesheets/Navbar.css";
import logo from "../assets/spotify-logo.png";

type NavbarProps = {
  videos: MusicVideo[];
  listsLoaded: boolean;
  toggleSidebar: () => void;
};

export default function Navbar({
  videos,
  listsLoaded,
  toggleSidebar,
}: NavbarProps) {
  return (
    <div className="navbar">
      <div className="my-2 px-2 row align-items-center justify-content-center">
        <div className="col-3 row justify-content-start">
          <div className="col-1 h-100 p-0">
            <i
              className={
                "fa fa-bars navbar-sidebar-toggle" +
                (listsLoaded ? "" : "-not-loaded")
              }
              aria-hidden="true"
              style={{
                fontSize: "22px",
                color: "rgb(179, 179, 179)",
                marginTop: "9px",
                minWidth: "30px",
              }}
              onClick={listsLoaded ? () => toggleSidebar() : () => {}}
            ></i>
          </div>
          <div
            className="col-5 text-right spotify-header-white no-select"
            style={{
              fontSize: "25px",
              cursor: "pointer",
              minWidth: "120px",
            }}
          >
            <img
              src={logo}
              alt="Spotify Logo"
              style={{ width: "25px", height: "25px" }}
              draggable={false}
            />{" "}
            <span>MTV</span>
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

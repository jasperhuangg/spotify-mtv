import * as React from "react";

import SearchBar from "./SearchBar";

import MusicVideo from "../util/MusicVideo";

import "../stylesheets/Navbar.css";

type NavbarProps = {
  videos: MusicVideo[];
};

export default function Navbar({ videos }: NavbarProps) {
  return (
    <div className="py-3 px-2 row">
      <div className="navbar-expand-sidebar">btn</div>
      <div className="col-">Spotify MTV</div>
      <div>
        <SearchBar videos={videos} />
      </div>
      <div></div>
    </div>
  );
}

import React from "react";

import SidebarItem from "./SidebarItem";

import Playlist from "../util/Playlist";
import Artist from "../util/Artist";

import "../stylesheets/Sidebar.css";
import MusicVideo from "../util/MusicVideo";

type SidebarProps = {
  currentScreen: string;
  playlists: { [id: string]: Playlist };
  topArtists: { [id: string]: Artist };
  displaying: boolean;
  selectSidebarItem: (title: string, type: string, itemID: string) => void;
};

export default function Sidebar({
  currentScreen,
  playlists,
  topArtists,
  displaying,
  selectSidebarItem,
}: SidebarProps) {
  return (
    <div id="sidebar" className={displaying ? "sidebar-displaying" : ""}>
      <SidebarItem
        title="Home"
        currentScreen={currentScreen}
        type="Home"
        selectSidebarItem={() => selectSidebarItem("Home", "Home", "")}
      />
      <SidebarItem
        title="Recently Played"
        currentScreen={currentScreen}
        type="Recently Played"
        selectSidebarItem={() =>
          selectSidebarItem("Recently Played", "Recently Played", "")
        }
      />
      {Object.keys(playlists).map((playlistID, index) => {
        return (
          <SidebarItem
            key={playlistID}
            title={playlists[playlistID].name}
            currentScreen={currentScreen}
            type="Playlist"
            selectSidebarItem={() =>
              selectSidebarItem(
                playlists[playlistID].name,
                "Playlist",
                playlistID
              )
            }
          />
        );
      })}
      {Object.keys(topArtists).map((artistID, index) => {
        return (
          <SidebarItem
            key={artistID}
            title={topArtists[artistID].name}
            currentScreen={currentScreen}
            type="Artist"
            selectSidebarItem={() =>
              selectSidebarItem(topArtists[artistID].name, "Artist", artistID)
            }
          />
        );
      })}
    </div>
  );
}

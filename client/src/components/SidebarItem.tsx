import React from "react";

import "../stylesheets/Sidebar.css";

type SidebarItemProps = {
  title: string;
  currentScreen: string;
  type: string;
  selectSidebarItem: () => void;
};

export default function SidebarItem({
  title,
  currentScreen,
  type,
  selectSidebarItem,
}: SidebarItemProps) {
  var iconClasses = "";

  if (type === "Home") iconClasses = "fas fa-home";
  else if (type === "Recently Played") iconClasses = "fas fa-history";
  else if (type === "Playlist") iconClasses = "fas fa-music";
  else if (type === "Artist") iconClasses = "fas fa-user";

  return (
    <div
      className={
        "sidebar-item spotify-body-grey py-3 px-4" +
        (title === currentScreen ? " sidebar-item-selected" : "")
      }
      onClick={() => selectSidebarItem()}
    >
      <i className={iconClasses + " mr-4"} />
      {title}
    </div>
  );
}

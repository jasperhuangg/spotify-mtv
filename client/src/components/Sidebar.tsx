import React from "react";

import SidebarItem from "./SidebarItem";

import Playlist from "../util/Playlist";

import "../stylesheets/Sidebar.css";

type SidebarProps = {
  currentScreen: string;
  playlists: { [id: string]: Playlist };
  displaying: boolean;
  selectSidebarItem: (title: string, type: string) => void;
};

export default function Sidebar({
  currentScreen,
  playlists,
  displaying,
  selectSidebarItem,
}: SidebarProps) {
  return (
    <div id="sidebar" className={displaying ? "sidebar-displaying" : ""}>
      <SidebarItem
        title="Home"
        currentScreen={currentScreen}
        type="Home"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
      <SidebarItem
        title="Recently Played"
        currentScreen={currentScreen}
        type="Recently Played"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
      <SidebarItem
        title="ice"
        currentScreen={currentScreen}
        type="Playlist"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
      <SidebarItem
        title="yellow"
        currentScreen={currentScreen}
        type="Playlist"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
      <SidebarItem
        title="a very long playlist name"
        currentScreen={currentScreen}
        type="Playlist"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
      <SidebarItem
        title="Young Thug"
        currentScreen={currentScreen}
        type="Artist"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
      <SidebarItem
        title="RL Grime"
        currentScreen={currentScreen}
        type="Artist"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
      <SidebarItem
        title="Pop Smoke"
        currentScreen={currentScreen}
        type="Artist"
        selectSidebarItem={(title: string, type: string) =>
          selectSidebarItem(title, type)
        }
      />
    </div>
  );
}

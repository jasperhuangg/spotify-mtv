import * as React from "react";
import { Component } from "react";

import SearchSuggestions from "./SearchSuggestions";

import MusicVideo from "../util/MusicVideo";

import "../stylesheets/SearchBar.css";

type SearchBarState = {
  searchInput: string;
};

type SearchBarProps = {
  videos: MusicVideo[];
};

export default class SearchBar extends Component<
  SearchBarProps,
  SearchBarState
> {
  state: SearchBarState = {
    searchInput: "",
  };

  render() {
    return (
      <>
        <input
          className="form-control search-bar spotify-body-black"
          onChange={(e) =>
            this.setState({ searchInput: e.currentTarget.value })
          }
          placeholder="Search"
        />
        <SearchSuggestions
          videos={this.props.videos}
          searchInput={this.state.searchInput}
        />
      </>
    );
  }
}

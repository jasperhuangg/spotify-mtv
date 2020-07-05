// TODO: update sidebar to use IDs (in case of duplicate artist/playlist names)

import * as React from "react";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { Component } from "react";
import Cookies from "universal-cookie";
import animateScrollTo from "animated-scroll-to";

import Main from "./components/Main";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import OverlayShadow from "./components/OverlayShadow";

import MusicVideo from "./util/MusicVideo";
import URLParser from "./util/URLParser";
import Playlist from "./util/Playlist";
import Artist from "./util/Artist";

import "./stylesheets/Fonts.css";
import "./stylesheets/App.css";

const domain = "http://localhost:9000";

type AppState = {
  displayName: string;
  currentScreen: { name: string; type: string };
  loggedIn: boolean;
  listsLoaded: boolean;
  accessToken: string;
  // countryCode: string;
  recentlyPlayed: MusicVideo[];
  topTracks: MusicVideo[];
  playlists: { [id: string]: Playlist };
  topArtists: { [id: string]: Artist };
  sidebarShowing: boolean;
};

export default class App extends Component<{}, AppState> {
  state: AppState = {
    displayName: "",
    currentScreen: { name: "Home", type: "Home" },
    loggedIn: false,
    listsLoaded: false,
    accessToken: "",
    // countryCode: "",
    recentlyPlayed: [],
    topTracks: [],
    playlists: {},
    topArtists: {},
    sidebarShowing: false,
  };

  componentDidMount() {
    /**
     * ----------------------------------------------Authorization Flow---------------------------------------------------
     */
    const cookies = new Cookies();
    // if we were redirected from /callback (obtained an accessToken)
    if (
      cookies.get("spotifyMTVAccessToken") !== undefined
      // cookies.get("spotifyMTVCountryCode") !== undefined
    ) {
      this.setState({
        accessToken: cookies.get("spotifyMTVAccessToken"),
        // countryCode: cookies.get("spotifyMTVCountryCode"),
      });
      const url =
        "http://localhost:9000/mtvApi/getDisplayName?accessToken=" +
        cookies.get("spotifyMTVAccessToken");

      fetch(url)
        .then((res) => res.text())
        .then((res) => this.setState({ displayName: res }));
      // remove it from the cookies (later will hash cookie name instead of deleting it so other sites can't retrieve it)
      cookies.remove("spotifyMTVAccessToken");
    } else {
      // obtain the authorization code from the URL (after calling /login)
      const url = window.location.href;
      const authCode = URLParser(url, "code=");

      if (authCode !== "") {
        const url = domain + "/mtvApi/callback?code=" + authCode;
        fetch(url)
          .then((authInfo) => authInfo.json())
          .then((authInfo) => {
            cookies.set("spotifyMTVAccessToken", authInfo.accessToken);
            window.location.href = "/"; // this will reload the page again
          });
      }
    }
  }

  componentDidUpdate({}, prevState: AppState) {
    if (prevState.accessToken === "" && this.state.accessToken !== "") {
      this.getAllLists();
    }
  }

  /**
   * ----------------------------------------------------Calls to back end-------------------------------------------------
   */

  /**
   * Calls the login endpoint to obtain an authorization URL (which will then return an auth code).
   */
  login() {
    const url = domain + "/mtvApi/login";
    fetch(url)
      .then((authURL) => authURL.text())
      .then((authURL) => (window.location.href = authURL));
  }

  /**
   * Get all the lists after logging in.
   * Updates state once all Promises to back-end for lists are resolved.
   */
  getAllLists() {
    Promise.all([
      this.getTopTracks(),
      this.getRecentlyPlayed(),
      this.getPlaylists(),
      this.getTopArtists(),
    ]).then((responses) => {
      for (let i = 0; i < 3; i++) {
        const response: void | AxiosResponse = responses[i];
        if (typeof response === "object") {
          if (i === 0) this.setState({ topTracks: response.data });
          // if (i === 1) {
          //   console.log(response.data);
          //   this.setState({ recentlyPlayed: response.data });
          // } // response is recently played
          // if (i === 2) this.setState({ playlists: response.data }); // response is playlists
          // if (i === 3) this.setState({ topArtists: response.data }); // response is topArtists
        }
      }
      this.setState({ listsLoaded: true }); // we can get rid of loading displays
      console.log("getAllLists() done");
    });
  }

  getTopTracks() {
    const url =
      domain + "/mtvApi/getTopTracks?accessToken=" + this.state.accessToken;
    return axios.get(url);
  }

  /**
   * Gets the user's Spotify display name.
   */
  getDisplayName() {
    const url =
      domain + "/mtvApi/getDisplayName?accessToken=" + this.state.accessToken;
    fetch(url)
      .then((res) => res.text())
      .then((res) => this.setState({ displayName: res }));
  }

  /**
   * Gets an array of music videos for the user's recently played tracks on Spotify.
   */
  getRecentlyPlayed() {
    const url =
      domain +
      "/mtvApi/getRecentlyPlayed?accessToken=" +
      this.state.accessToken;
    return axios.get(url);
  }

  /**
   * Gets a dictionary of ```[id]: Playlist``` for each of the user's public playlists on Spotify.
   */
  getPlaylists() {
    const url =
      domain + "/mtvApi/getPlaylists?accessToken=" + this.state.accessToken;
    return axios.get(url);
  }

  /**
   * Gets a dictionary of ```[id]: Artist``` for each of the user's top artists on Spotify.
   */
  async getTopArtists() {
    const country = "US"; // TODO: make this custom to client's location
    const url =
      domain +
      "/mtvApi/getTopArtists?accessToken=" +
      this.state.accessToken +
      "&country=" +
      country;
    return axios.get(url);
  }

  /**
   * Gets all of the music videos and updates state for playlist with ```id```.
   */
  getPlaylistVideos(id: string) {
    const url = domain + "/mtvApi/getVideosFromTracks";

    var playlists: {
      [id: string]: Playlist;
    } = {};
    Object.assign(playlists, this.state.playlists);
    var tracks = playlists[id].tracks;

    const body = {
      tracks: tracks,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        // update the playlist's music videos in state
        playlists[id].musicVideos = res;
        this.setState({
          playlists: playlists,
        });
      });
  }

  /**
   * Gets all of the music videos and updates state for artist with ```id```.
   */
  getArtistVideos(id: string) {
    const url = domain + "/mtvApi/getVideosFromTracks";

    var topArtists: { [id: string]: Artist } = {};
    Object.assign(topArtists, this.state.topArtists);
    var tracks = topArtists[id].tracks;

    const body = {
      tracks: tracks,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        // update the artist's music videos in state
        topArtists[id].musicVideos = res;
        this.setState({
          topArtists: topArtists,
        });
      });
  }

  /**
   * --------------------------------------------Utility for Child Components-------------------------------------------------
   */

  /**
   * Handles showing/hiding the sidebar.
   */
  toggleSidebar() {
    this.setState({
      sidebarShowing: !this.state.sidebarShowing,
    });
  }

  /**
   * Handles selecting a sidebar item.
   */
  selectSidebarItem(title: string, type: string, itemID: string) {
    var name = "";
    if (type !== "Playlist" && type !== "Artist") name = title;
    else name = itemID;
    this.setState({ currentScreen: { name: name, type: type } });
    setTimeout(() => {
      this.setState({ sidebarShowing: false });
      animateScrollTo([0, 0], {
        maxDuration: 400,
      });
    }, 150);
  }

  render() {
    // user has logged in, show the app
    if (this.state.accessToken.length) {
      // get the list of music videos for the current screen
      var musicVideos: MusicVideo[] = [];

      if (this.state.currentScreen.type === "Home")
        musicVideos = this.state.topTracks;
      if (this.state.currentScreen.type === "Recently Played")
        musicVideos = this.state.recentlyPlayed;
      if (this.state.currentScreen.type === "Playlist")
        musicVideos = this.state.playlists[this.state.currentScreen.name]
          .musicVideos;
      if (this.state.currentScreen.type === "Artist")
        musicVideos = this.state.topArtists[this.state.currentScreen.name]
          .musicVideos;

      console.log(musicVideos);

      return (
        <>
          <div
            className="container-fluid p-0"
            // style={{
            //   height: "100vh",
            // }}
          >
            {/*----------------------------------------------------test buttons--------------------------------------------------*/}

            {/* <div id="test-buttons" className="text-center m-5">
              <button
                className="btn spotify-button-green"
                onClick={() => this.getTopArtists()}
              >
                GET TOP ARTISTS
              </button>
              <br />
              <br />
              <button
                className="btn spotify-button-green"
                onClick={() =>
                  this.getArtistVideos(Object.keys(this.state.topArtists)[0])
                }
              >
                GET ARTIST VIDEOS
              </button>
            </div> */}

            {/*-------------------------------------------------------------------------------------------------------------------*/}

            <Navbar
              videos={[]}
              toggleSidebar={() => this.toggleSidebar()}
              listsLoaded={this.state.listsLoaded}
            />
            <Sidebar
              currentScreen={this.state.currentScreen.name}
              playlists={this.state.playlists}
              topArtists={this.state.topArtists}
              displaying={this.state.sidebarShowing}
              selectSidebarItem={(
                title: string,
                type: string,
                itemID: string
              ) => this.selectSidebarItem(title, type, itemID)}
            />
            <OverlayShadow displaying={this.state.sidebarShowing} />
            <Main title={this.state.currentScreen.name} videos={musicVideos} />
          </div>
        </>
      );
    }
    // show the login screen
    else return <Login login={() => this.login()} />;
  }
}

var getPosition = function (options: any) {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

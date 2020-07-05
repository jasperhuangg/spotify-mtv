// TODO: update sidebar to use IDs (in case of duplicate artist/playlist names)

import * as React from "react";
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
  currentScreen: string;
  loggedIn: boolean;
  accessToken: string;
  recentlyPlayed: Object[];
  playlists: { [id: string]: Playlist };
  topArtists: { [id: string]: Artist };
  sidebarShowing: boolean;
};

export default class App extends Component<{}, AppState> {
  state: AppState = {
    displayName: "",
    currentScreen: "Home",
    loggedIn: false,
    accessToken: "",
    recentlyPlayed: [],
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
    if (cookies.get("spotifyMTVAccessToken") !== undefined) {
      this.setState({
        accessToken: cookies.get("spotifyMTVAccessToken"),
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

  /**
   * ----------------------------------------------------Calls to back end-------------------------------------------------
   */

  /**
   * Calls the login endpoint to obtain an authorization URL (which will return an auth code).
   */
  login() {
    const url = domain + "/mtvApi/login";
    fetch(url)
      .then((authURL) => authURL.text())
      .then((authURL) => (window.location.href = authURL));
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
    fetch(url)
      .then((res) => res.json())
      .then((res) => this.setState({ recentlyPlayed: res }));
  }

  /**
   * Gets a dictionary of ```[id]: Playlist``` for each of the user's public playlists on Spotify.
   */
  getPlaylists() {
    const url =
      domain + "/mtvApi/getPlaylists?accessToken=" + this.state.accessToken;
    fetch(url)
      .then((res) => res.json())
      .then((res) => this.setState({ playlists: res }));
  }

  /**
   * Gets all of the music videos and updates state for playlist with ```id```.
   */
  getPlaylistVideos(id: string) {
    const url = domain + "/mtvApi/getVideosFromTracks";

    var playlists: { [id: string]: Playlist } = {};
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
   * Gets a dictionary of ```[id]: Artist``` for each of the user's top artists on Spotify.
   */
  getTopArtists() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        const geoLocationURL =
          "http://api.geonames.org/countryCodeJSON?lat=" +
          latitude +
          "&lng=" +
          longitude +
          "&username=jasperhuangg";
        fetch(geoLocationURL)
          .then((res) => res.json())
          .then((res) => {
            const country = res.countryCode;
            const url =
              domain +
              "/mtvApi/getTopArtists?accessToken=" +
              this.state.accessToken +
              "&country=" +
              country;
            fetch(url)
              .then((res) => res.json())
              .then((res) => {
                console.log(Object.keys(res).length);
                console.log(res);
                this.setState({ topArtists: res });
              });
          });
      },
      (err) => console.error(err)
    );
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
        console.log(res);
        // update the artist's music videos in state
        topArtists[id].musicVideos = res;
        this.setState({
          topArtists: topArtists,
        });
      });
  }

  /**
   * --------------------------------------------Util for Child Components-------------------------------------------------
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
  selectSidebarItem(title: string, type: string) {
    this.setState({ currentScreen: title });
    setTimeout(() => {
      this.setState({ sidebarShowing: false });
      animateScrollTo([0, 0], {
        maxDuration: 400,
      });
    }, 150);
  }

  render() {
    var testVideos = [
      new MusicVideo(
        "futsal-shuffle.img",
        "Futsal Shuffle",
        "Lil Uzi Vert",
        "Eternal Atake",
        ""
      ),
      new MusicVideo(
        "no-photos.img",
        "No Photos",
        "Don Toliver",
        "Heaven or Hell",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "RENT FREE",
        "Russ",
        "RENT FREE",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "QUARANTINE CLEAN",
        "Turbo, Gunna, Young Thug",
        "QUARANTINE CLEAN",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Bored In The House",
        "Tyga, Curtis Roach",
        "Bored In The House",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "@ MEH",
        "Playboi Carti",
        "@ MEH",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "ALASKA",
        "BROCKHAMPTON",
        "SATURATION III",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Jersey",
        "Future",
        "What A Time To Be Alive",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "All Bad",
        "Future, Lil Uzi Vert",
        "High Off Life",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Futsal Shuffle",
        "Lil Uzi Vert",
        "Eternal Atake",
        ""
      ),
      new MusicVideo(
        "no-photos.img",
        "No Photos",
        "Don Toliver",
        "Heaven or Hell",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "RENT FREE",
        "Russ",
        "RENT FREE",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "QUARANTINE CLEAN",
        "Turbo, Gunna, Young Thug",
        "QUARANTINE CLEAN",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Bored In The House",
        "Tyga, Curtis Roach",
        "Bored In The House",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "@ MEH",
        "Playboi Carti",
        "@ MEH",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "ALASKA",
        "BROCKHAMPTON",
        "SATURATION III",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Jersey",
        "Future",
        "What A Time To Be Alive",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "All Bad",
        "Future, Lil Uzi Vert",
        "High Off Life",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Futsal Shuffle",
        "Lil Uzi Vert",
        "Eternal Atake",
        ""
      ),
      new MusicVideo(
        "no-photos.img",
        "No Photos",
        "Don Toliver",
        "Heaven or Hell",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "RENT FREE",
        "Russ",
        "RENT FREE",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "QUARANTINE CLEAN",
        "Turbo, Gunna, Young Thug",
        "QUARANTINE CLEAN",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Bored In The House",
        "Tyga, Curtis Roach",
        "Bored In The House",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "@ MEH",
        "Playboi Carti",
        "@ MEH",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "ALASKA",
        "BROCKHAMPTON",
        "SATURATION III",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Jersey",
        "Future",
        "What A Time To Be Alive",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "All Bad",
        "Future, Lil Uzi Vert",
        "High Off Life",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Futsal Shuffle",
        "Lil Uzi Vert",
        "Eternal Atake",
        ""
      ),
      new MusicVideo(
        "no-photos.img",
        "No Photos",
        "Don Toliver",
        "Heaven or Hell",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "RENT FREE",
        "Russ",
        "RENT FREE",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "QUARANTINE CLEAN",
        "Turbo, Gunna, Young Thug",
        "QUARANTINE CLEAN",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Bored In The House",
        "Tyga, Curtis Roach",
        "Bored In The House",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "@ MEH",
        "Playboi Carti",
        "@ MEH",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "ALASKA",
        "BROCKHAMPTON",
        "SATURATION III",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Jersey",
        "Future",
        "What A Time To Be Alive",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "All Bad",
        "Future, Lil Uzi Vert",
        "High Off Life",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Futsal Shuffle",
        "Lil Uzi Vert",
        "Eternal Atake",
        ""
      ),
      new MusicVideo(
        "no-photos.img",
        "No Photos",
        "Don Toliver",
        "Heaven or Hell",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "RENT FREE",
        "Russ",
        "RENT FREE",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "QUARANTINE CLEAN",
        "Turbo, Gunna, Young Thug",
        "QUARANTINE CLEAN",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Bored In The House",
        "Tyga, Curtis Roach",
        "Bored In The House",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "@ MEH",
        "Playboi Carti",
        "@ MEH",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "ALASKA",
        "BROCKHAMPTON",
        "SATURATION III",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Jersey",
        "Future",
        "What A Time To Be Alive",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "All Bad",
        "Future, Lil Uzi Vert",
        "High Off Life",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Futsal Shuffle",
        "Lil Uzi Vert",
        "Eternal Atake",
        ""
      ),
      new MusicVideo(
        "no-photos.img",
        "No Photos",
        "Don Toliver",
        "Heaven or Hell",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "RENT FREE",
        "Russ",
        "RENT FREE",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "QUARANTINE CLEAN",
        "Turbo, Gunna, Young Thug",
        "QUARANTINE CLEAN",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Bored In The House",
        "Tyga, Curtis Roach",
        "Bored In The House",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "@ MEH",
        "Playboi Carti",
        "@ MEH",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "ALASKA",
        "BROCKHAMPTON",
        "SATURATION III",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Jersey",
        "Future",
        "What A Time To Be Alive",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "All Bad",
        "Future, Lil Uzi Vert",
        "High Off Life",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Futsal Shuffle",
        "Lil Uzi Vert",
        "Eternal Atake",
        ""
      ),
      new MusicVideo(
        "no-photos.img",
        "No Photos",
        "Don Toliver",
        "Heaven or Hell",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "RENT FREE",
        "Russ",
        "RENT FREE",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "QUARANTINE CLEAN",
        "Turbo, Gunna, Young Thug",
        "QUARANTINE CLEAN",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Bored In The House",
        "Tyga, Curtis Roach",
        "Bored In The House",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "@ MEH",
        "Playboi Carti",
        "@ MEH",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "ALASKA",
        "BROCKHAMPTON",
        "SATURATION III",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "Jersey",
        "Future",
        "What A Time To Be Alive",
        ""
      ),
      new MusicVideo(
        "futsal-shuffle.img",
        "All Bad",
        "Future, Lil Uzi Vert",
        "High Off Life",
        ""
      ),
    ];

    // user has logged in, show the app
    if (this.state.accessToken.length)
      return (
        <>
          <div className="container-fluid p-0">
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
              videos={testVideos}
              toggleSidebar={() => this.toggleSidebar()}
            />
            <Sidebar
              currentScreen={this.state.currentScreen}
              playlists={this.state.playlists}
              topArtists={this.state.topArtists}
              displaying={this.state.sidebarShowing}
              selectSidebarItem={(title: string, type: string) =>
                this.selectSidebarItem(title, type)
              }
            />
            <OverlayShadow displaying={this.state.sidebarShowing} />
            <Main title={this.state.currentScreen} videos={testVideos} />
          </div>
        </>
      );
    // show the login screen
    else return <Login login={() => this.login()} />;
  }
}

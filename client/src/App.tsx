import * as React from "react";
import { Component } from "react";
import Cookies from "universal-cookie";

import Main from "./components/Main";
import Navbar from "./components/Navbar";
import Login from "./components/Login";

import MusicVideo from "./util/MusicVideo";
import URLParser from "./util/URLParser";

import "./stylesheets/Fonts.css";
import "./stylesheets/App.css";

const domain = "http://localhost:9000";

type AppState = {
  currentScreen: string;
  loggedIn: boolean;
  recentlyPlayed: MusicVideo[];
  accessToken: string;
};

export default class App extends Component<{}, AppState> {
  state: AppState = {
    currentScreen: "Recently Played",
    loggedIn: false,
    recentlyPlayed: [],
    accessToken: "",
  };

  testApi() {
    const url = "http://localhost:9000/testApi";
    fetch(url)
      .then((res) => res.text())
      .then((res) => console.log(res));
  }

  login() {
    const url = domain + "/mtvApi/login";
    fetch(url)
      .then((authURL) => authURL.text())
      .then((authURL) => (window.location.href = authURL));
  }

  checkLoggedIn() {
    const cookies = new Cookies();
    if (cookies.get("spotifyMTVLoggedIn")) {
      this.setState({ loggedIn: true });
      cookies.remove("spotifyMTVLoggedIn");
    }
  }

  componentDidMount() {
    const cookies = new Cookies();

    // if we were redirected from /callback (obtained an accessToken)
    if (cookies.get("spotifyMTVAccessToken") !== undefined) {
      this.setState({
        accessToken: cookies.get("spotifyMTVAccessToken"),
      });
      cookies.remove("spotifyMTVAccessToken"); // remove it from the cookies (later will hash cookie name instead of deleting it so other sites can't retrieve it)
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

  componentDidUpdate() {
    if (this.state.recentlyPlayed.length === 0 && this.state.loggedIn) {
      // request all of the user's playlists, top artists, and recently played
    }
  }

  // test to make sure server can handle multiple users
  logDisplayName() {
    const url =
      "http://localhost:9000/mtvApi/getDisplayName?accessToken=" +
      this.state.accessToken;
    fetch(url)
      .then((res) => res.text())
      .then((res) => console.log(res));
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
    ];

    if (this.state.accessToken.length)
      return (
        <>
          <div className="container-fluid">
            <button
              className="btn spotify-button-green m-5"
              onClick={() => this.logDisplayName()}
            >
              LOG DISPLAY NAME
            </button>
            <Navbar videos={testVideos} />
            <Main title={this.state.currentScreen} videos={testVideos} />
          </div>
        </>
      );
    else return <Login login={() => this.login()} />;
  }
}

import React from "react";

import "../stylesheets/SpotifyButton.css";

type LoginProps = {
  login: () => void;
};

export default function Login({ login }: LoginProps) {
  return (
    <div
      style={{
        height: "100vh",
      }}
      className="d-flex align-items-center justify-content-center"
    >
      <div className="text-center">
        <div
          className="spotify-header-white text-center no-select"
          style={{
            fontSize: "75px",
          }}
        >
          Spotify MTV
        </div>
        <div>
          <button
            className="btn spotify-button-green m-5"
            onClick={() => login()}
          >
            LOG IN WITH SPOTIFY
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { Component } from "react";

import MusicVideo from "../util/MusicVideo";
import VideoTile from "./VideoTile";

import "../stylesheets/Main.css";

type MainState = {
  title: string; // title of this main page
  videos: MusicVideo[];
};

type MainProps = {
  title: string; // title of this main page
  videos: MusicVideo[];
};

export default class Main extends Component<MainProps, MainState> {
  state: MainState = {
    title: this.props.title,
    videos: this.props.videos,
  };

  componentDidUpdate(prevProps: MainProps) {
    if (prevProps !== this.props) {
      this.setState(this.props);
    }
  }

  render() {
    return (
      <>
        <div className="container-fluid pl-4">
          <div
            className="spotify-header-white pt-3 pb-3 mt-4 no-select"
            style={{
              fontSize: "30px",
              backgroundColor: "rgba(24, 24, 24, 0.97)",
              zIndex: 1000,
              position: "sticky",
              top: 70,
            }}
          >
            {this.props.title}
          </div>
          <div className="d-flex justify-content-center">
            <div className="row justify-content-sm-start justify-content-between">
              {this.props.videos.map((video, index) => {
                return (
                  <div
                    key={index}
                    className="col-lg-3 col-md-4 col-sm-6 col-12 mb-4"
                  >
                    <VideoTile video={video} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
}

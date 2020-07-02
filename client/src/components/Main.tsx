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
        <div className="container-fluid">
          <div
            className="spotify-header-white py-3 no-select"
            style={{
              fontSize: "50px",
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

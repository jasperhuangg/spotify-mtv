import * as React from "react";
import { Component } from "react";

type VideoPlayerProps = {
  videoURI: string;
  title: string;
  artist: string;
  album: string;
};

type VideoPlayerState = {
  isPlaying: boolean;
};

export default class VideoPlayer extends Component<
  VideoPlayerProps,
  VideoPlayerState
> {
  state: VideoPlayerState = {
    isPlaying: false,
  };

  render() {
    return <div></div>;
  }
}

import * as React from "react";
import MusicVideo from "../util/MusicVideo";

import "../stylesheets/VideoTile.css";

/**
 * A video tile displayed in the main section
 * thumbnail res: 1280x720
 */

type VideoTileProps = {
  video: MusicVideo;
};

/**
 * a music video tile displays:
 * title
 * artist
 * thumbnail,
 * views,
 * uploaded time
 */

export default function VideoTile({ video }: VideoTileProps) {
  return (
    <>
      <div className="video-tile-wrapper">
        <div className="d-flex justify-content-center">
          <div
            className="thumbnail-wrapper"
            style={{
              width: "284.44px",
              height: "160px",
            }}
          >
            <img
              className="thumbnail"
              style={{
                width: "284.44px",
                height: "160px",
              }}
              src={video.thumbnailURI}
              alt={video.title}
            />
          </div>
        </div>
        <div className="tile-info">
          <div
            className="spotify-body-white tile-title no-select"
            style={{
              fontSize: "18px",
            }}
          >
            {video.title}
          </div>
          {/* <div className="spotify-body-white">{video.album}</div> */}
          <div
            className="spotify-body-grey no-select tile-artist"
            style={{
              fontSize: "14px",
            }}
          >
            {video.artist}
          </div>
        </div>
      </div>
    </>
  );
}

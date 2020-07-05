import Track from "./Track";
import MusicVideo from "./MusicVideo";

export default class Artist {
  name: string;
  tracks: Track[];
  musicVideos: MusicVideo[];

  constructor(name: string, tracks: Track[]) {
    this.name = name;
    this.tracks = tracks;
    this.musicVideos = [];
  }
}

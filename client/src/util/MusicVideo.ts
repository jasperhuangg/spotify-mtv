export default class MusicVideo {
  thumbnailURI: string;
  title: string;
  artist: string;
  album: string;
  videoURI: string;

  constructor(
    thumbnailURI: string,
    title: string,
    artist: string,
    album: string,
    videoURI: string
  ) {
    this.thumbnailURI = thumbnailURI;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.videoURI = videoURI;
  }

  // helper method for debugging
  print() {
    console.log(
      "title:",
      this.title,
      "artist: ",
      this.artist,
      "album: ",
      this.artist,
      "thumbnail URI: ",
      this.thumbnailURI,
      "video URI",
      this.videoURI
    );
  }
}

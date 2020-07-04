export default class MusicVideo {
  thumbnailURI: string;
  title: string;
  artist: string;
  album: string;
  embedHTML: string;

  constructor(
    thumbnailURI: string,
    title: string,
    artist: string,
    album: string,
    embedHTML: string
  ) {
    this.thumbnailURI = thumbnailURI;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.embedHTML = embedHTML;
  }

  /**
   * Prints music video contents.
   */
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
      "embed HTML",
      this.embedHTML
    );
  }
}

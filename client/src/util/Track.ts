export default class Track {
  title: string;
  artist: string;
  album: string;
  query: string;

  constructor(title: string, artist: string, album: string, query: string) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.query = query;
  }
}

export default class Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  query: string;

  constructor(
    id: string,
    title: string,
    artist: string,
    album: string,
    query: string
  ) {
    this.id = id;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.query = query;
  }
}

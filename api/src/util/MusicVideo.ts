const { YoutubeDataAPI } = require("youtube-v3-api");
const youtube_api_key = "AIzaSyBV0KCBnG8H3QRUq6SN1R1YAZXyfg8vnGA";
const youtubeApi = new YoutubeDataAPI(youtube_api_key);

class MusicVideo {
  thumbnailURI: string;
  title: string;
  artist: string;
  album: string;
  embedHTML: string;
  private id: string;

  constructor(
    title: string,
    artist: string,
    album: string,
    youtubeAPIResult: any
  ) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.id = youtubeAPIResult.items[0].id; // TODO: update with crowdsourcing idea (store ids that work/don't work for a spotify track)
    this.embedHTML = "";
    this.thumbnailURI = youtubeAPIResult.items[0].snippet.thumbnails.medium.url;
    /**
     * parse the api result to obtain thumbnailURI and videoURI
     */
  }

  getPlayerSearchPromise() {
    return youtubeApi.searchVideo(this.id);
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
      "embed HTML",
      this.embedHTML
    );
  }
}

module.exports = MusicVideo;

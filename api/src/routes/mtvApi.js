const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const { YoutubeDataAPI } = require("youtube-v3-api");

// import MusicVideo from "../util/MusicVideo";

const spotify_client_id = "edf3a6ab80054effae577fe71ce188d5";
const spotify_client_secret = "c71e49ea792e4dc69b0e4f8cee46903e";

const youtube_api_key = "AIzaSyBV0KCBnG8H3QRUq6SN1R1YAZXyfg8vnGA";
const youtubeApi = new YoutubeDataAPI(youtube_api_key);

const scopes = [
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
];
const redirect_uri = process.env.REDIRECT_URI || "http://localhost:3000";

var spotifyApi = new SpotifyWebApi({
  redirectUri: redirect_uri,
  clientId: spotify_client_id,
  clientSecret: spotify_client_secret,
});

router.get("/login", (req, res) => {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.send(authorizeURL);
});

router.get("/callback", (req, res) => {
  const code = req.query.code || null;

  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(code).then(
    (data) => {
      const accessToken = data.body["access_token"];
      const refreshToken = data.body["refresh_token"];
      const expiresIn = data.body["expires_in"];

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);

      res.send({
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: expiresIn,
      });
    },
    (err) => {
      console.log("Something went wrong!", err);
      res.send(
        "Unable to retrieve access token with provided authorization code."
      );
    }
  );
});

router.get("/getDisplayName", (req, res) => {
  const accessToken = req.query.accessToken;
  const loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(accessToken);
  loggedInSpotifyApi
    .getMe()
    .then((data) => res.send(data.body.display_name))
    .catch((err) => console.error(err));
});

router.get("/testYoutubeApi", (req, res) => {
  const search = req.query.search;
  console.log("search: " + search);
  var searches = [
    "young thug",
    "lil uzi vert",
    "future",
    "rl grime",
    "higher brothers",
  ];

  var requests = searches.map((search) => youtubeApi.searchAll(search, 25));

  var results = [];

  let process = (prom) => {
    prom.then();
  };

  Promise.all(requests)
    .then((responses) => {
      res.send(responses);
    })
    .catch((err) => {
      console.error(err);
    });
});

router.get("/getRecentlyPlayed", (req, res) => {
  // return an array of MusicVideo objects of the user's recently played songs
  const accessToken = req.query.accessToken;
  const loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(accessToken);
  loggedInSpotifyApi
    .getMyRecentlyPlayedTracks({
      limit: 50,
    })
    .then((data) => {
      // once receiving the user's recently played tracks
      // create queries for each of them and call the search for the Youtube API
      var recentlyPlayed = [];
      data.body.items.forEach((track) => {
        // don't add duplicate tracks
        recentlyPlayed = parseSpotifyResponse(track, recentlyPlayed);
      });

      // an array of Youtube Data API search promises for each of the recently played tracks
      var requests = recentlyPlayed.map((search) =>
        youtubeApi.searchAll(search.query, 5)
      );

      // returns when all promises in 'requests' are resolved into 'responses'
      Promise.all(requests)
        .then((responses) => {
          var musicVideos = [];
          var youtubePlayerPromises = [];
          var counter = 0;
          responses.forEach((response) => {
            var spotifyTrackObj = recentlyPlayed[counter];
            counter++;
            // parse the response into a MusicVideo object
            // need to call Youtube Data API a second time to retrieve the player information
            var musicVideo = new MusicVideo(
              spotifyTrackObj.title,
              spotifyTrackObj.artist,
              spotifyTrackObj.album,
              response
            );
            var youtubePlayerPromise = musicVideo.getPlayerSearchPromise();
            musicVideos.push(musicVideo);
            youtubePlayerPromises.push(youtubePlayerPromise);
            Promise.all(youtubePlayerPromises)
              .then((youtubePlayerResponses) => {
                counter = 0;
                youtubePlayerResponses.forEach((playerResponse) => {
                  console.log(playerResponse);
                  const playerEmbedHTML =
                    playerResponse.items[0].player.embedHtml;
                  musicVideos[counter].embedHTML = playerEmbedHTML;
                  counter++;
                });
                res.send(musicVideos);
              })
              .catch((err) => {
                console.error(err);
              });
          });
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => console.error("aw fk:", err));
});

router.get("/getPlaylists", (req, res) => {
  // return an array of arrays of MusicVideo objects for each of the user's playlists
});

router.get("/topArtists", (req, res) => {
  // return an array of arrays of MusicVideo objects for each of the user's top artists
});

router.get("/suggested", (req, res) => {
  // return an array of arrays of MusicVideo objects for each of the user's top artists
});

function parseSpotifyResponse(responseTrack, recentlyPlayed) {
  const track = responseTrack.track;

  var artists = "";

  for (let i = 0; i < track.artists.length; i++) {
    const artist = track.artists[i].name;
    artists += i < track.artists.length - 1 ? artist + " " : artist;
  }

  const trackObj = {
    title: track.name,
    artist: artists,
    album: track.album.name,
    query: track.name + " " + artists + " official music video",
  };

  // only push if not already present
  for (let i = 0; i < recentlyPlayed.length; i++) {
    var inArray = recentlyPlayed[i];

    if (
      inArray.title === trackObj.title &&
      inArray.artist === trackObj.artist &&
      inArray.album === trackObj.album
    )
      return recentlyPlayed;
  }
  recentlyPlayed.push(trackObj);
  return recentlyPlayed;
}

class MusicVideo {
  constructor(title, artist, album, youtubeAPIResult) {
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

module.exports = router;

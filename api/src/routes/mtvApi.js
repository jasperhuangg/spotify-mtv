const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const { YoutubeDataAPI } = require("youtube-v3-api");
const axios = require("axios");

// import MusicVideo from "../util/MusicVideo";

const spotify_client_id = "edf3a6ab80054effae577fe71ce188d5";
const spotify_client_secret = "c71e49ea792e4dc69b0e4f8cee46903e";

// Youtube API Keys:
// const youtube_api_key = "AIzaSyBV0KCBnG8H3QRUq6SN1R1YAZXyfg8vnGA";
// const youtube_api_key = "AIzaSyCAmAAMTILENjy9jpwAfHwbGYvQJAY7ul4";
// const youtube_api_key = "AIzaSyDkYL0oxWH81vp0ZzcIDgV4NaYGKO9sL10";
const youtube_api_key = "AIzaSyAdtBLs2ZSHNYKwS5UXdOpivz7eUue8TJg";

const youtubeApi = new YoutubeDataAPI(youtube_api_key);

const scopes = [
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
  // "playlist-read-private",
];
const redirect_uri = process.env.REDIRECT_URI || "http://localhost:3000";

var spotifyApi = new SpotifyWebApi({
  redirectUri: redirect_uri,
  clientId: spotify_client_id,
  clientSecret: spotify_client_secret,
});

/**
 *  returns an authorization url used for Spotify OAuth
 */
router.get("/login", (req, res) => {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.send(authorizeURL);
});

/**
 * takes the auth code returned from the Spotify OAuth flow
 * returns an accessToken, refreshToken, and how long the accessToken is valid for
 */
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

/**
 * returns the user's display name on Spotify
 */
router.get("/getDisplayName", (req, res) => {
  const accessToken = req.query.accessToken;
  const loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(accessToken);
  loggedInSpotifyApi
    .getMe()
    .then((data) => res.send(data.body.display_name))
    .catch((err) => console.error(err));
});

/**
 * returns an array of music video objects for the user's last 50 played songs
 */
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
        recentlyPlayed = parseSpotifyResponse(track, recentlyPlayed, true);
      });
      convertToYoutubeAndSend(recentlyPlayed, res);
    })
    .catch((err) => console.error("aw fk:", err));
});

/**
 * returns an array of all the user's public playlists on Spotify (containing track objects)
 */
router.get("/getPlaylists", (req, res) => {
  const accessToken = req.query.accessToken;
  const loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(accessToken);

  loggedInSpotifyApi
    .getUserPlaylists({
      limit: 50,
    })
    .then((data) => {
      var playlists = {};
      var playlistTracksRequests = [];

      data.body.items.forEach((playlist) => {
        var playlistObj = {
          name: playlist.name,
          tracks: [],
          musicVideos: [],
        };

        playlists[playlist.id] = playlistObj;

        playlistTracksRequests.push(
          spotifyApi.getPlaylistTracks(playlist.id, {
            fields: "items(track(name,artists,album(name)))",
          })
        );
      });

      var playlistIDs = Object.keys(playlists);

      // when all of the requests for tracks in each playlist respond
      Promise.all(playlistTracksRequests).then((playlistTracksResponses) => {
        var playlistCounter = 0;

        // for each track in the playlist
        playlistTracksResponses.forEach((response) => {
          var playlistID = playlistIDs[playlistCounter];
          var tracksArr = playlists[playlistID].tracks;
          response.body.items.forEach((responseTrack) => {
            tracksArr = parseSpotifyResponse(responseTrack, tracksArr, false);
          });
          playlistCounter++;
        });
        res.send(playlists);
      });
    });
});

router.post("/getPlaylistVideos", (req, res) => {
  const tracks = req.body.tracks;
  convertToYoutubeAndSend(tracks, res);
});

router.get("/getTopArtists", (req, res) => {
  // return an array of the user's top 5 artists,
  // 10 tracks for each artist, first take them from the user's playlists
  // leftovers are taken from top songs for each artist
});

router.get("/getTopArtistVideos", (req, res) => {});

router.get("/suggested", (req, res) => {
  // return an array of suggested videos for the user to watch
  // this is likely going to be the home page
});

// -----------------------------------------------------------UTILITIES-----------------------------------------------------------

/**
 * Parses a Spotify API response track object into a track object used in the front end.
 *
 * @param   {[type]}  responseTrack       The track object in the Spotify API response
 * @param   {[type]}  arr                 The array to add the parsed trackObject into
 * @param   {[type]}  checkForDuplicates  Whether to check for duplicates before adding into arr
 */
function parseSpotifyResponse(responseTrack, arr, checkForDuplicates) {
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

  // if we are checking for duplicates
  // return early if track already exists in playlists
  if (checkForDuplicates) {
    // only push if not already present
    for (let i = 0; i < arr.length; i++) {
      var inArray = arr[i];

      if (
        inArray.title === trackObj.title &&
        inArray.artist === trackObj.artist &&
        inArray.album === trackObj.album
      )
        return arr;
    }
  }
  arr.push(trackObj);
  return arr;
}

class MusicVideo {
  constructor(title, artist, album, youtubeAPIResult) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.id = youtubeAPIResult.items[0].id.videoId; // TODO: update with crowdsourcing idea (store ids that work/don't work for a spotify track)
    this.embedHTML = "";
    this.thumbnailURI = youtubeAPIResult.items[0].snippet.thumbnails.medium.url;
    /**
     * parse the api result to obtain thumbnailURI and videoURI
     */
  }

  async getPlayerSearchPromise() {
    const url =
      "https://www.googleapis.com/youtube/v3/videos?part=player&id=" +
      this.id +
      "&key=" +
      youtube_api_key;
    return await axios.get(url);
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

/**
 * Converts an array of Spotify tracks to their Youtube Music Video equivalents.
 *
 * @param   {[type]}  spotifyTracks  An array of Spotify ```Track``` objects
 * @param   {[type]}  responseObj    The response for the route calling the function
 */
function convertToYoutubeAndSend(spotifyTracks, responseObj) {
  // an array of Youtube Data API search promises for each of the recently played tracks
  var requests = spotifyTracks.map((search) =>
    youtubeApi.searchAll(search.query, 5)
  );

  // returns when all promises in 'requests' are resolved into 'responses'
  Promise.all(requests)
    .then((responses) => {
      var musicVideos = [];
      var youtubePlayerPromises = [];
      var counter = 0;
      responses.forEach((response) => {
        var spotifyTrackObj = spotifyTracks[counter];

        counter++;
        // parse each response into a MusicVideo object
        // need to call Youtube Data API a second time to retrieve the player information using its ID
        var musicVideo = new MusicVideo(
          spotifyTrackObj.title,
          spotifyTrackObj.artist,
          spotifyTrackObj.album,
          response
        );
        var youtubePlayerPromise = musicVideo.getPlayerSearchPromise();
        musicVideos.push(musicVideo);
        youtubePlayerPromises.push(youtubePlayerPromise);
      });
      Promise.all(youtubePlayerPromises)
        .then((youtubePlayerResponses) => {
          counter = 0;
          youtubePlayerResponses.forEach((playerResponse) => {
            const playerEmbedHTML =
              playerResponse.data.items[0].player.embedHtml;
            musicVideos[counter].embedHTML = playerEmbedHTML;
            counter++;
          });

          responseObj.send(musicVideos);
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = router;

const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");

const spotify_client_id = "edf3a6ab80054effae577fe71ce188d5";
const spotify_client_secret = "c71e49ea792e4dc69b0e4f8cee46903e";

const scopes = ["user-read-private", "user-read-email"];
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

// TODO: modify to include profile picture, etc.
router.get("/getDisplayName", (req, res) => {
  const accessToken = req.query.accessToken;
  const loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(accessToken);
  loggedInSpotifyApi.getMe().then((data) => res.send(data.body.display_name));
});

router.get("/getRecentlyPlayed", (req, res) => {
  // return an array of MusicVideo objects of the user's recently played songs
});

router.get("/getRecentlyPlayed", (req, res) => {
  // return an array of MusicVideo objects of the user's recently played songs
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

module.exports = router;

export default function SpotifyResponseTrackParser(responseTrack: any) {
  const track = responseTrack.track;

  var artists: string = "";

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

  return trackObj;
}

import MusicVideo from "./MusicVideo";

// cache validResults to prevent searching through all videos
// if current search input contains lastSeenSearchInput
var lastSeenSearchInput = "";
var validResults: MusicVideo[] = [];

/**
 * Returns search results given a list of MusicVideos and a search input
 * @param   {[type]}  videos  The list of music videos to search in.
 * @param   {[type]}  searchInput  The keywords used in the search.
 */
export default function KeywordParser(
  videos: MusicVideo[], // contains all of the songs in a user's Spotify playlists
  searchInput: string
) {
  searchInput = searchInput.toLowerCase();

  if (searchInput === "") {
    // console.log("empty search input");
    validResults = [];
    lastSeenSearchInput = "";
    return [];
  }

  var res = [];
  var searchDomain = [];

  if (
    searchInput.indexOf(lastSeenSearchInput) !== -1 &&
    lastSeenSearchInput !== ""
  )
    // a continuation of a previous search
    searchDomain = validResults;
  else searchDomain = videos;

  console.log("search domain: ");
  console.log(searchDomain);

  for (let i = 0; i < searchDomain.length; i++) {
    const video = searchDomain[i];
    if (
      video.title.toLowerCase().indexOf(searchInput) !== -1 ||
      video.album.toLowerCase().indexOf(searchInput) !== -1 ||
      video.artist.toLowerCase().indexOf(searchInput) !== -1
    )
      res.push(video);
  }

  lastSeenSearchInput = searchInput;
  validResults = res;

  // TODO: need to sort these results
  // so the most relevant one alphabetically comes first
  // prioritize title, then artist, then album

  return res;
}

var videos = [
  new MusicVideo(
    "futsal-shuffle.img",
    "Futsal Shuffle",
    "Lil Uzi Vert",
    "Eternal Atake",
    ""
  ),
  new MusicVideo(
    "no-photos.img",
    "No Photos",
    "Don Toliver",
    "Heaven or Hell",
    ""
  ),
  new MusicVideo("futsal-shuffle.img", "RENT FREE", "Russ", "RENT FREE", ""),
  new MusicVideo(
    "futsal-shuffle.img",
    "QUARANTINE CLEAN",
    "Turbo, Gunna, Young Thug",
    "QUARANTINE CLEAN",
    ""
  ),
  new MusicVideo(
    "futsal-shuffle.img",
    "Bored In The House",
    "Tyga, Curtis Roach",
    "Bored In The House",
    ""
  ),
  new MusicVideo("futsal-shuffle.img", "@ MEH", "Playboi Carti", "@ MEH", ""),
  new MusicVideo(
    "futsal-shuffle.img",
    "ALASKA",
    "BROCKHAMPTON",
    "SATURATION III",
    ""
  ),
  new MusicVideo(
    "futsal-shuffle.img",
    "Jersey",
    "Future",
    "What A Time To Be Alive",
    ""
  ),
  new MusicVideo(
    "futsal-shuffle.img",
    "All Bad",
    "Future, Lil Uzi Vert",
    "High Off Life",
    ""
  ),
];

// console.log(KeywordParser(videos, "fu"));
// console.log(KeywordParser(videos, "fut"));
// console.log(KeywordParser(videos, "futs"));
// console.log(KeywordParser(videos, "futsa"));
// console.log(KeywordParser(videos, "futsal"));
// console.log(KeywordParser(videos, ""));
// console.log(KeywordParser(videos, "A"));
// console.log(KeywordParser(videos, "Al"));

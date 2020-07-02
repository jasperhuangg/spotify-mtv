import React from "react";

import MusicVideo from "../util/MusicVideo";
import KeywordParser from "../util/KeywordParser";

type SearchSuggestionsProps = {
  videos: MusicVideo[];
  searchInput: string;
};

export default function SearchSuggestions({
  videos,
  searchInput,
}: SearchSuggestionsProps) {
  KeywordParser(videos, searchInput);

  return <></>;
}

import { SceneListFilterOptions } from "./scenes";
import { ListFilterOptions } from "./filter-options";

const MovieSceneListSortByOptions = ["movie_scene_number"].map(
  ListFilterOptions.createSortBy
);

const sortByOptions = [
  ...MovieSceneListSortByOptions,
  ...SceneListFilterOptions.sortByOptions,
];

const defaultSortBy = "movie_scene_number";

const { displayModeOptions } = SceneListFilterOptions;

const { criterionOptions } = SceneListFilterOptions;

export const MovieSceneListFilterOptions = new ListFilterOptions(
  defaultSortBy,
  sortByOptions,
  displayModeOptions,
  criterionOptions
);
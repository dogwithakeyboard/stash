import { PerformerListFilterOptions } from "./performers";
import { ListFilterOptions } from "./filter-options";

const AppearsWithListSortByOptions = ["pair_scene_count", "pair_movie_count", "pair_image_count", "pair_gallery_count"].map(
  ListFilterOptions.createSortBy
);

const sortByOptions = [
  ...AppearsWithListSortByOptions,
  ...PerformerListFilterOptions.sortByOptions,
];

const defaultSortBy = "name";

const { displayModeOptions } = PerformerListFilterOptions;

const { criterionOptions } = PerformerListFilterOptions;

export const AppearsWithListFilterOptions = new ListFilterOptions(
  defaultSortBy,
  sortByOptions,
  displayModeOptions,
  criterionOptions
);
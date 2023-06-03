import { PerformerListFilterOptions } from "./performers";
import { ListFilterOptions } from "./filter-options";

const AppearsWithListSortByOptions = ["appears_with_scenes", "appears_with_images", "appears_with_galleries"].map(
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
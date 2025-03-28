import React from "react";
import { QueryResult } from "@apollo/client";
import { ListFilterModel } from "src/models/list-filter/filter";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ListFilter } from "./ListFilter";
import { ListViewOptions } from "./ListViewOptions";
import {
  IListFilterOperation,
  ListOperationButtons,
} from "./ListOperationButtons";
import { ButtonToolbar } from "react-bootstrap";
import { View } from "./views";
import { IListSelect, useFilterOperations } from "./util";

export interface IItemListOperation<T extends QueryResult> {
  text: string;
  onClick: (
    result: T,
    filter: ListFilterModel,
    selectedIds: Set<string>
  ) => Promise<void>;
  isDisplayed?: (
    result: T,
    filter: ListFilterModel,
    selectedIds: Set<string>
  ) => boolean;
  postRefetch?: boolean;
  icon?: IconDefinition;
  buttonVariant?: string;
}

export interface IFilteredListToolbar {
  filter: ListFilterModel;
  setFilter: (
    value: ListFilterModel | ((prevState: ListFilterModel) => ListFilterModel)
  ) => void;
  showEditFilter: () => void;
  view?: View;
  listSelect: IListSelect;
  onEdit?: () => void;
  onDelete?: () => void;
  operations?: IListFilterOperation[];
  zoomable?: boolean;
}

export const FilteredListToolbar: React.FC<IFilteredListToolbar> = ({
  filter,
  setFilter,
  showEditFilter,
  view,
  listSelect,
  onEdit,
  onDelete,
  operations,
  zoomable = false,
}) => {
  const filterOptions = filter.options;
  const { setDisplayMode, setZoom } = useFilterOperations({
    filter,
    setFilter,
  });
  const { selectedIds, onSelectAll, onSelectNone } = listSelect;

  return (
    <ButtonToolbar className="filtered-list-toolbar">
      {showEditFilter && (
        <ListFilter
          onFilterUpdate={setFilter}
          filter={filter}
          openFilterDialog={() => showEditFilter()}
          view={view}
        />
      )}
      <ListOperationButtons
        onSelectAll={onSelectAll}
        onSelectNone={onSelectNone}
        otherOperations={operations}
        itemsSelected={selectedIds.size > 0}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <ListViewOptions
        displayMode={filter.displayMode}
        displayModeOptions={filterOptions.displayModeOptions}
        onSetDisplayMode={setDisplayMode}
        zoomIndex={zoomable ? filter.zoomIndex : undefined}
        onSetZoom={zoomable ? setZoom : undefined}
      />
    </ButtonToolbar>
  );
};

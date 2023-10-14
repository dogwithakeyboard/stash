import React from "react";
import * as GQL from "src/core/generated-graphql";
import { PerformerList } from "src/components/Performers/PerformerList";

interface IPerformerDetailsProps {
  active: boolean;
  performer: GQL.PerformerDataFragment;
}

export const PerformerAppearsWithPanel: React.FC<IPerformerDetailsProps> = ({
  active,
  performer,
}) => {
  const performerValue = {
    id: performer.id,
    label: performer.name ?? `Performer ${performer.id}`,
  };

  const extraCriteria = {
    performer: performerValue,
  };

  const queryArgs = {
    id: performer.id,
    type: "PERFORMER",
  };

  return (
    <PerformerList
      queryArgs={queryArgs}
      extraCriteria={extraCriteria}
      alterQuery={active}
    />
  );
};

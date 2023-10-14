package gallery

import (
	"context"
	"strconv"

	"github.com/stashapp/stash/pkg/models"
)

func CountByPerformerID(ctx context.Context, r models.GalleryQueryer, id int) (int, error) {
	filter := &models.GalleryFilterType{
		Performers: &models.MultiCriterionInput{
			Value:    []string{strconv.Itoa(id)},
			Modifier: models.CriterionModifierIncludes,
		},
	}

	return r.QueryCount(ctx, filter, nil)
}

func CountByStudioID(ctx context.Context, r models.GalleryQueryer, id int, depth *int) (int, error) {
	filter := &models.GalleryFilterType{
		Studios: &models.HierarchicalMultiCriterionInput{
			Value:    []string{strconv.Itoa(id)},
			Modifier: models.CriterionModifierIncludes,
			Depth:    depth,
		},
	}

	return r.QueryCount(ctx, filter, nil)
}

func CountByTagID(ctx context.Context, r models.GalleryQueryer, id int, depth *int) (int, error) {
	filter := &models.GalleryFilterType{
		Tags: &models.HierarchicalMultiCriterionInput{
			Value:    []string{strconv.Itoa(id)},
			Modifier: models.CriterionModifierIncludes,
			Depth:    depth,
		},
	}

	return r.QueryCount(ctx, filter, nil)
}

func CountByPerformerIDStudioID(ctx context.Context, r models.GalleryQueryer, performerID int, studioID int, depth *int) (int, error) {
	filter := &models.GalleryFilterType{
		Studios: &models.HierarchicalMultiCriterionInput{
			Value:    []string{strconv.Itoa(studioID)},
			Modifier: models.CriterionModifierIncludes,
			Depth:    depth,
		},
		Performers: &models.MultiCriterionInput{
			Value:    []string{strconv.Itoa(performerID)},
			Modifier: models.CriterionModifierIncludes,
		},
	}

	return r.QueryCount(ctx, filter, nil)
}

func CountByPerformerIDAppearsWithPerformerID(ctx context.Context, r models.GalleryQueryer, performerID int, AppearsWithPerformerID int) (int, error) {
	filter := &models.GalleryFilterType{
		Performers: &models.MultiCriterionInput{
			Value:    []string{strconv.Itoa(performerID), strconv.Itoa(AppearsWithPerformerID)},
			Modifier: models.CriterionModifierIncludesAll,
		},
	}

	return r.QueryCount(ctx, filter, nil)
}

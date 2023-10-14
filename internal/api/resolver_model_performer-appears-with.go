package api

import (
	"context"

	"github.com/stashapp/stash/pkg/gallery"
	"github.com/stashapp/stash/pkg/image"
	"github.com/stashapp/stash/pkg/models"
	"github.com/stashapp/stash/pkg/movie"
	"github.com/stashapp/stash/pkg/scene"
)

func (r *performerAppearsWithResolver) SceneCount(ctx context.Context, obj *models.PerformerAppearsWith) (ret int, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		ret, err = scene.CountByPerformerIDAppearsWithPerformerID(ctx, r.repository.Scene, obj.PerformerID, obj.AppearsWithPerformerID)
		return err
	}); err != nil {
		return 0, err
	}

	return ret, nil
}

func (r *performerAppearsWithResolver) GalleryCount(ctx context.Context, obj *models.PerformerAppearsWith) (ret int, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		ret, err = gallery.CountByPerformerIDAppearsWithPerformerID(ctx, r.repository.Gallery, obj.PerformerID, obj.AppearsWithPerformerID)
		return err
	}); err != nil {
		return 0, err
	}

	return ret, nil
}

func (r *performerAppearsWithResolver) ImageCount(ctx context.Context, obj *models.PerformerAppearsWith) (ret int, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		ret, err = image.CountByPerformerIDAppearsWithPerformerID(ctx, r.repository.Image, obj.PerformerID, obj.AppearsWithPerformerID)
		return err
	}); err != nil {
		return 0, err
	}

	return ret, nil
}

func (r *performerAppearsWithResolver) MovieCount(ctx context.Context, obj *models.PerformerAppearsWith) (ret int, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		ret, err = movie.CountByPerformerIDAppearsWithPerformerID(ctx, r.repository.Movie, obj.PerformerID, obj.AppearsWithPerformerID)
		return err
	}); err != nil {
		return 0, err
	}

	return ret, nil
}

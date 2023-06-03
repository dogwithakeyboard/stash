package api

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/99designs/gqlgen/graphql"
	"github.com/stashapp/stash/internal/api/loaders"
	"github.com/stashapp/stash/internal/api/urlbuilders"
	"github.com/stashapp/stash/pkg/gallery"
	"github.com/stashapp/stash/pkg/image"
	"github.com/stashapp/stash/pkg/logger"
	"github.com/stashapp/stash/pkg/models"
	"github.com/stashapp/stash/pkg/performer"
	"github.com/stashapp/stash/pkg/scene"
)

// Checksum is deprecated
func (r *performerResolver) Checksum(ctx context.Context, obj *models.Performer) (*string, error) {
	return nil, nil
}

func (r *performerResolver) Aliases(ctx context.Context, obj *models.Performer) (*string, error) {
	if !obj.Aliases.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadAliases(ctx, r.repository.Performer)
		}); err != nil {
			return nil, err
		}
	}

	ret := strings.Join(obj.Aliases.List(), ", ")
	return &ret, nil
}

func (r *performerResolver) AliasList(ctx context.Context, obj *models.Performer) ([]string, error) {
	if !obj.Aliases.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadAliases(ctx, r.repository.Performer)
		}); err != nil {
			return nil, err
		}
	}

	return obj.Aliases.List(), nil
}

func (r *performerResolver) Height(ctx context.Context, obj *models.Performer) (*string, error) {
	if obj.Height != nil {
		ret := strconv.Itoa(*obj.Height)
		return &ret, nil
	}
	return nil, nil
}

func (r *performerResolver) HeightCm(ctx context.Context, obj *models.Performer) (*int, error) {
	return obj.Height, nil
}

func (r *performerResolver) Birthdate(ctx context.Context, obj *models.Performer) (*string, error) {
	if obj.Birthdate != nil {
		ret := obj.Birthdate.String()
		return &ret, nil
	}
	return nil, nil
}

func (r *performerResolver) ImagePath(ctx context.Context, obj *models.Performer) (*string, error) {
	var hasImage bool
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		var err error
		hasImage, err = r.repository.Performer.HasImage(ctx, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	baseURL, _ := ctx.Value(BaseURLCtxKey).(string)
	imagePath := urlbuilders.NewPerformerURLBuilder(baseURL, obj).GetPerformerImageURL(hasImage)
	return &imagePath, nil
}

func (r *performerResolver) Tags(ctx context.Context, obj *models.Performer) (ret []*models.Tag, err error) {
	if !obj.TagIDs.Loaded() {
		if err := r.withReadTxn(ctx, func(ctx context.Context) error {
			return obj.LoadTagIDs(ctx, r.repository.Performer)
		}); err != nil {
			return nil, err
		}
	}

	var errs []error
	ret, errs = loaders.From(ctx).TagByID.LoadAll(obj.TagIDs.List())
	return ret, firstError(errs)
}

func (r *performerResolver) SceneCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {
	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = r.repository.Scene.CountByPerformerID(ctx, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) ImageCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {
	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = image.CountByPerformerID(ctx, r.repository.Image, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) GalleryCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {
	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = gallery.CountByPerformerID(ctx, r.repository.Gallery, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) OCounter(ctx context.Context, obj *models.Performer) (ret *int, err error) {
	var res_scene int
	var res_image int
	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res_scene, err = r.repository.Scene.OCountByPerformerID(ctx, obj.ID)
		if err != nil {
			return err
		}
		res_image, err = r.repository.Image.OCountByPerformerID(ctx, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}
	res = res_scene + res_image
	return &res, nil
}

func (r *performerResolver) Scenes(ctx context.Context, obj *models.Performer) (ret []*models.Scene, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		ret, err = r.repository.Scene.FindByPerformerID(ctx, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	return ret, nil
}

func (r *performerResolver) StashIds(ctx context.Context, obj *models.Performer) ([]*models.StashID, error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		return obj.LoadStashIDs(ctx, r.repository.Performer)
	}); err != nil {
		return nil, err
	}

	return stashIDsSliceToPtrSlice(obj.StashIDs.List()), nil
}

func (r *performerResolver) Rating(ctx context.Context, obj *models.Performer) (*int, error) {
	if obj.Rating != nil {
		rating := models.Rating100To5(*obj.Rating)
		return &rating, nil
	}
	return nil, nil
}

func (r *performerResolver) Rating100(ctx context.Context, obj *models.Performer) (*int, error) {
	return obj.Rating, nil
}

func (r *performerResolver) DeathDate(ctx context.Context, obj *models.Performer) (*string, error) {
	if obj.DeathDate != nil {
		ret := obj.DeathDate.String()
		return &ret, nil
	}
	return nil, nil
}

func (r *performerResolver) Movies(ctx context.Context, obj *models.Performer) (ret []*models.Movie, err error) {
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		ret, err = r.repository.Movie.FindByPerformerID(ctx, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	return ret, nil
}

func (r *performerResolver) MovieCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {
	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = r.repository.Movie.CountByPerformerID(ctx, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) PerformerCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {
	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = performer.CountByAppearsWith(ctx, r.repository.Performer, obj.ID)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) AppearsWithImageCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {

	logger.Warn("begin image pair count")

	performerIds := []string{strconv.Itoa(obj.ID)}

	rq := graphql.GetOperationContext(ctx).Variables

	if rq["performer_filter"] == nil {
		return nil, err
	} else {

		performerFilterMap := rq["performer_filter"].(map[string]interface{})

		if performerFilterMap["performers"] == nil {
			return nil, err
		} else {
			performersMap := performerFilterMap["performers"].(map[string]interface{})
			performersValue := performersMap["value"].([]interface{})
			valueString := strings.Trim(fmt.Sprint(performersValue), "[]")
			performerIds = append(performerIds, valueString)
			logger.Warn(performerIds)
		}
	}

	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = image.CountByPerformers(ctx, r.repository.Image, performerIds)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) AppearsWithGalleryCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {

	logger.Warn("begin gallery pair count")

	performerIds := []string{strconv.Itoa(obj.ID)}

	rq := graphql.GetOperationContext(ctx).Variables

	if rq["performer_filter"] == nil {
		return nil, err
	} else {

		performerFilterMap := rq["performer_filter"].(map[string]interface{})

		if performerFilterMap["performers"] == nil {
			return nil, err
		} else {
			performersMap := performerFilterMap["performers"].(map[string]interface{})
			performersValue := performersMap["value"].([]interface{})
			valueString := strings.Trim(fmt.Sprint(performersValue), "[]")
			performerIds = append(performerIds, valueString)
			logger.Warn(performerIds)
		}
	}

	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = gallery.CountByPerformers(ctx, r.repository.Gallery, performerIds)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) AppearsWithMovieCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {

	logger.Warn("begin image pair count")

	performerIds := []string{strconv.Itoa(obj.ID)}

	rq := graphql.GetOperationContext(ctx).Variables

	if rq["performer_filter"] == nil {
		return nil, err
	} else {

		performerFilterMap := rq["performer_filter"].(map[string]interface{})

		if performerFilterMap["performers"] == nil {
			return nil, err
		} else {
			performersMap := performerFilterMap["performers"].(map[string]interface{})
			performersValue := performersMap["value"].([]interface{})
			valueString := strings.Trim(fmt.Sprint(performersValue), "[]")
			performerIds = append(performerIds, valueString)
			logger.Warn(performerIds)
		}
	}

	var res int
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		res, err = image.CountByPerformers(ctx, r.repository.Image, performerIds)
		return err
	}); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *performerResolver) AppearsWithSceneCount(ctx context.Context, obj *models.Performer) (ret *int, err error) {

	logger.Warn("begin scene pair count")

	var total int

	performerIds := []string{strconv.Itoa(obj.ID)}

	rq := graphql.GetOperationContext(ctx).Variables

	if rq["performer_filter"] == nil {
		return nil, err
	} else {

		performerFilterMap := rq["performer_filter"].(map[string]interface{})

		if performerFilterMap["performers"] == nil {
			return nil, err
		} else {
			performersMap := performerFilterMap["performers"].(map[string]interface{})
			performersValue := performersMap["value"].([]interface{})
			valueString := strings.Trim(fmt.Sprint(performersValue), "[]")
			performerIds = append(performerIds, valueString)
			logger.Warn(performerIds)
		}
	}

	sceneFilter := &models.SceneFilterType{
		Performers: &models.MultiCriterionInput{
			Modifier: models.CriterionModifierIncludesAll,
			Value:    performerIds,
		},
	}

	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		scenes, ret, err := scene.QueryWithCount(ctx, r.repository.Scene, sceneFilter, nil)
		_ = scenes
		total = ret

		return err
	}); err != nil {
		return nil, err
	}

	return &total, nil
}

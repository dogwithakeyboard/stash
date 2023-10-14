package models

type PerformerAppearsWith struct {
	PerformerID            int       `json:"performer_id"`
	AppearsWithPerformerID int       `json:"appearswith_performer_id"`
	Performer              Performer `json:"performer"`
}

package models

type SearchJobRequest struct {
	Query    string `json:"query"`
	Location string `json:"location"`
	Limit    int    `json:"limit"`
}
package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
)

type ApifyService struct{}

func NewApifyService() *ApifyService {
	return &ApifyService{}
}

type JobResult struct {
	Source   string
	Title    string
	Company  string
	Location string
	JobType  *string
	Salary   *string
	URL      *string
	Posted   *string
	Logo     *string
}

func (s *ApifyService) SearchAllJobs(
	query string,
	location string,
) ([]JobResult, error) {
	token := os.Getenv("APIFY_TOKEN")
	if token == "" {
		return nil, fmt.Errorf("APIFY_TOKEN not set")
	}

	var wg sync.WaitGroup
	results := make([][]JobResult, 4)
	errors := make([]error, 4)

	scrapers := []struct {
		name   string
		fn     func(string, string, string) ([]JobResult, error)
		index  int
	}{
		{"linkedin", s.searchLinkedIn, 0},
		{"indeed", s.searchIndeed, 1},
		{"glassdoor", s.searchGlassdoor, 2},
		{"upwork", s.searchUpwork, 3},
	}

	for _, scraper := range scrapers {
		wg.Add(1)
		go func(name string, fn func(string, string, string) ([]JobResult, error), idx int) {
			defer wg.Done()
			jobs, err := fn(token, query, location)
			if err != nil {
				errors[idx] = err
				return
			}
			results[idx] = jobs
		}(scraper.name, scraper.fn, scraper.index)
	}

	wg.Wait()

	allJobs := []JobResult{}
	for i, jobs := range results {
		if errors[i] != nil {
			continue
		}
		allJobs = append(allJobs, jobs...)
	}

	if len(allJobs) == 0 {
		return nil, fmt.Errorf("all scrapers failed")
	}

	return allJobs, nil
}

// LinkedIn Jobs Scraper - RIGGeqD6RqKmlVoQU
func (s *ApifyService) searchLinkedIn(
	token string,
	query string,
	location string,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/RIGGeqD6RqKmlVoQU/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"title":    query,
		"location": location,
		"limit":    5,
	}

	items, err := s.callApify(url, payload)
	if err != nil {
		return nil, err
	}

	jobs := []JobResult{}
	for _, item := range items {
		job := JobResult{
			Source:   "linkedin",
			Title:    getStringField(item, "title"),
			Company:  getStringField(item, "companyName"),
			Location: getStringField(item, "location"),
		}

		if contractType := getStringField(item, "contractType"); contractType != "" {
			job.JobType = &contractType
		}
		if salary := getStringField(item, "salary"); salary != "" {
			job.Salary = &salary
		}
		if url := getStringField(item, "url"); url != "" {
			job.URL = &url
		}
		if posted := getStringField(item, "postedTimeAgo"); posted != "" {
			job.Posted = &posted
		}

		// No direct logo field, will use company initial

		jobs = append(jobs, job)
	}

	return jobs, nil
}

// Indeed Jobs Scraper - TrtlecxAsNRbKl1na
func (s *ApifyService) searchIndeed(
	token string,
	query string,
	location string,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/TrtlecxAsNRbKl1na/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"country":  "us",
		"title":    query,
		"location": location,
		"limit":    5,
	}

	items, err := s.callApify(url, payload)
	if err != nil {
		return nil, err
	}

	jobs := []JobResult{}
	for _, item := range items {
		job := JobResult{
			Source:   "indeed",
			Title:    getStringFieldVariants(item, "title", "jobTitle", "job_title", "name", "position"),
			Company:  getStringFieldVariants(item, "company", "companyName", "company_name", "employer", "employerName", "hiringCompany"),
			Location: getStringFieldVariants(item, "location", "jobLocation", "job_location", "loc", "formattedLocation"),
		}

		if salary := getStringFieldVariants(item, "salary", "salaryText", "pay", "compensation"); salary != "" {
			job.Salary = &salary
		}
		if url := getStringFieldVariants(item, "url", "link", "jobUrl", "applyUrl"); url != "" {
			job.URL = &url
		}
		if posted := getStringFieldVariants(item, "postedAt", "posted", "postedDate", "datePosted"); posted != "" {
			job.Posted = &posted
		}

		jobs = append(jobs, job)
	}

	return jobs, nil
}

// Glassdoor Jobs Scraper - 5OaooRg0FxlRF0L1B
func (s *ApifyService) searchGlassdoor(
	token string,
	query string,
	location string,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/5OaooRg0FxlRF0L1B/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"keywords": query,
		"location": location,
		"daysOld":  30,
		"limit":    5,
	}

	items, err := s.callApify(url, payload)
	if err != nil {
		return nil, err
	}

	jobs := []JobResult{}
	for _, item := range items {
		// Glassdoor returns nested objects for employer and location
		companyName := getNestedStringField(item, "employer", "name")
		locationName := getNestedStringField(item, "location", "name")

		job := JobResult{
			Source:   "glassdoor",
			Title:    getStringField(item, "title"),
			Company:  companyName,
			Location: locationName,
		}

		// Extract logo from employer object
		if logo := getNestedStringField(item, "employer", "logoUrl"); logo != "" {
			job.Logo = &logo
		}

		// Extract salary from pay object (min-max format)
		if pay, ok := item["pay"].(map[string]interface{}); ok {
			if min, okMin := pay["min"].(float64); okMin {
				if max, okMax := pay["max"].(float64); okMax {
					currency := getStringFieldFromMap(pay, "currency")
					period := getStringFieldFromMap(pay, "period")
					salaryText := fmt.Sprintf("%s %.0f - %.0f (%s)", currency, min, max, period)
					job.Salary = &salaryText
				}
			}
		}

		if url := getStringFieldVariants(item, "url", "seoUrl", "jobUrl"); url != "" {
			job.URL = &url
		}

		// ageInDays is a number, convert to string
		if ageInDays, ok := item["ageInDays"].(float64); ok {
			posted := fmt.Sprintf("%d days ago", int(ageInDays))
			job.Posted = &posted
		}

		jobs = append(jobs, job)
	}

	return jobs, nil
}

// Upwork Jobs Scraper - zxl6JzwzACkNsR5PQ
func (s *ApifyService) searchUpwork(
	token string,
	query string,
	location string,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/zxl6JzwzACkNsR5PQ/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"keywords": query,
		"sort":     "relevance",
		"limit":    5,
	}

	items, err := s.callApify(url, payload)
	if err != nil {
		return nil, err
	}

	jobs := []JobResult{}
	for _, item := range items {
		// Extract client info from nested object
		clientCountry := "Upwork Client"
		if client, ok := item["client"].(map[string]interface{}); ok {
			if country := getStringFieldFromMap(client, "country"); country != "" {
				clientCountry = fmt.Sprintf("Client from %s", country)
			}
		}

		job := JobResult{
			Source:   "upwork",
			Title:    getStringField(item, "title"),
			Company:  clientCountry,
			Location: "Remote", // Upwork is typically remote
		}

		// Extract job type (HOURLY or FIXED)
		if jobType := getStringField(item, "jobType"); jobType != "" {
			job.JobType = &jobType
		}

		// Extract budget from fixedPriceAmount or hourly rates
		if fixedPrice, ok := item["fixedPriceAmount"].(map[string]interface{}); ok {
			if amount, ok := fixedPrice["amount"].(string); ok {
				currency := getStringFieldFromMap(fixedPrice, "isoCurrencyCode")
				if currency == "" {
					currency = "USD"
				}
				budgetText := fmt.Sprintf("%s %s", currency, amount)
				job.Salary = &budgetText
			}
		} else if hourlyMax, ok := item["hourlyBudgetMax"].(float64); ok {
			if hourlyMin, ok := item["hourlyBudgetMin"].(float64); ok {
				budgetText := fmt.Sprintf("$%.0f - $%.0f/hr", hourlyMin, hourlyMax)
				job.Salary = &budgetText
			}
		}

		if url := getStringField(item, "url"); url != "" {
			job.URL = &url
		}

		// Extract posted time
		if publishTime := getStringField(item, "publishTime"); publishTime != "" {
			job.Posted = &publishTime
		} else if createTime := getStringField(item, "createTime"); createTime != "" {
			job.Posted = &createTime
		}

		jobs = append(jobs, job)
	}

	return jobs, nil
}

func (s *ApifyService) callApify(
	url string,
	payload map[string]interface{},
) ([]map[string]interface{}, error) {
	bodyBytes, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return nil, fmt.Errorf("apify returned status %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)

	var items []map[string]interface{}
	err = json.Unmarshal(body, &items)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func getStringField(data map[string]interface{}, key string) string {
	if val, ok := data[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func getStringFieldVariants(data map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if val := getStringField(data, key); val != "" {
			return val
		}
	}
	return ""
}

// getNestedStringField extracts a string from a nested object (e.g., employer.name)
func getNestedStringField(data map[string]interface{}, parentKey string, childKey string) string {
	if parent, ok := data[parentKey].(map[string]interface{}); ok {
		return getStringField(parent, childKey)
	}
	return ""
}

// getStringFieldFromMap extracts a string from a map (helper for already-extracted nested objects)
func getStringFieldFromMap(data map[string]interface{}, key string) string {
	if val, ok := data[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

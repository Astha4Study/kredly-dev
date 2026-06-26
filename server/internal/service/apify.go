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
	ID              *string
	Source          string
	Title           string
	Company         string
	CompanyURL      *string
	Location        string
	RecruiterName   *string
	RecruiterURL    *string
	ExperienceLevel *string
	JobType         *string
	Sector          *string
	Salary          *string
	URL             *string
	Posted          *string
	PostedDate      *string
	Logo            *string
	Description     *string
	DescriptionHTML *string
}

func (s *ApifyService) SearchAllJobs(
	query string,
	location string,
) ([]JobResult, error) {
	token := os.Getenv("APIFY_TOKEN")
	if token == "" {
		return nil, fmt.Errorf("APIFY_TOKEN not set")
	}

	// Generate random limits for each platform (3-5 jobs each) totaling 15
	limits := generateRandomLimits(15, 4)

	var wg sync.WaitGroup
	results := make([][]JobResult, 4)
	errors := make([]error, 4)

	scrapers := []struct {
		name   string
		fn     func(string, string, string, int) ([]JobResult, error)
		index  int
		limit  int
	}{
		{"linkedin", s.searchLinkedIn, 0, limits[0]},
		{"indeed", s.searchIndeed, 1, limits[1]},
		{"glassdoor", s.searchGlassdoor, 2, limits[2]},
		{"upwork", s.searchUpwork, 3, limits[3]},
	}

	for _, scraper := range scrapers {
		wg.Add(1)
		go func(name string, fn func(string, string, string, int) ([]JobResult, error), idx int, limit int) {
			defer wg.Done()
			jobs, err := fn(token, query, location, limit)
			if err != nil {
				errors[idx] = err
				return
			}
			results[idx] = jobs
		}(scraper.name, scraper.fn, scraper.index, scraper.limit)
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

// generateRandomLimits generates random limits that sum to total
// Each limit is between 3 and 5
func generateRandomLimits(total int, count int) []int {
	limits := make([]int, count)
	remaining := total

	for i := 0; i < count-1; i++ {
		// Each platform gets between 3-5 jobs, but ensure we can still reach the total
		minForThis := 3
		maxForThis := 5
		minNeededForRest := (count - i - 1) * 3
		maxNeededForRest := (count - i - 1) * 5

		// Adjust bounds to ensure total can be reached
		if remaining-maxForThis < minNeededForRest {
			minForThis = remaining - maxNeededForRest
		}
		if remaining-minForThis > maxNeededForRest {
			maxForThis = remaining - minNeededForRest
		}

		// Clamp to 3-5 range
		if minForThis < 3 {
			minForThis = 3
		}
		if maxForThis > 5 {
			maxForThis = 5
		}
		if maxForThis < minForThis {
			maxForThis = minForThis
		}

		// Random value in the adjusted range
		limits[i] = minForThis + (remaining % (maxForThis - minForThis + 1))
		remaining -= limits[i]
	}

	// Last platform gets whatever is left
	limits[count-1] = remaining

	return limits
}

// LinkedIn Jobs Scraper - RIGGeqD6RqKmlVoQU
func (s *ApifyService) searchLinkedIn(
	token string,
	query string,
	location string,
	limit int,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/RIGGeqD6RqKmlVoQU/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"title":    query,
		"location": location,
		"limit":    limit,
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

		if id := getStringField(item, "id"); id != "" {
			job.ID = &id
		}
		if companyURL := getStringField(item, "companyUrl"); companyURL != "" {
			job.CompanyURL = &companyURL
		}
		if recruiterName := getStringField(item, "recruiterName"); recruiterName != "" {
			job.RecruiterName = &recruiterName
		}
		if recruiterURL := getStringField(item, "recruiterUrl"); recruiterURL != "" {
			job.RecruiterURL = &recruiterURL
		}
		if experienceLevel := getStringField(item, "experienceLevel"); experienceLevel != "" {
			job.ExperienceLevel = &experienceLevel
		}
		if contractType := getStringField(item, "contractType"); contractType != "" {
			job.JobType = &contractType
		}
		if sector := getStringField(item, "sector"); sector != "" {
			job.Sector = &sector
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
		if postedDate := getStringField(item, "postedDate"); postedDate != "" {
			job.PostedDate = &postedDate
		}
		if description := getStringField(item, "description"); description != "" {
			job.Description = &description
		}
		if descriptionHTML := getStringField(item, "descriptionHtml"); descriptionHTML != "" {
			job.DescriptionHTML = &descriptionHTML
		}

		jobs = append(jobs, job)
	}

	return jobs, nil
}

// Indeed Jobs Scraper - TrtlecxAsNRbKl1na
func (s *ApifyService) searchIndeed(
	token string,
	query string,
	location string,
	limit int,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/TrtlecxAsNRbKl1na/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"country":    "us",
		"title":      query,
		"location":   location,
		"limit":      limit,
		"datePosted": "7",
	}

	items, err := s.callApify(url, payload)
	if err != nil {
		return nil, err
	}

	jobs := []JobResult{}
	for _, item := range items {
		// Extract employer info from nested object
		companyName := getNestedStringField(item, "employer", "name")

		// Extract location from nested object (city, state)
		city := getNestedStringField(item, "location", "city")
		state := getNestedStringField(item, "location", "admin1Code")
		locationStr := city
		if state != "" {
			locationStr = fmt.Sprintf("%s, %s", city, state)
		}

		job := JobResult{
			Source:   "indeed",
			Title:    getStringField(item, "title"),
			Company:  companyName,
			Location: locationStr,
		}

		// Extract ID from key field
		if key := getStringField(item, "key"); key != "" {
			job.ID = &key
		}

		// Extract logo from employer object
		if logo := getNestedStringField(item, "employer", "logoUrl"); logo != "" {
			job.Logo = &logo
		}

		// Extract salary from baseSalary object
		if baseSalary, ok := item["baseSalary"].(map[string]interface{}); ok {
			if min, okMin := baseSalary["min"].(float64); okMin {
				if max, okMax := baseSalary["max"].(float64); okMax {
					currency := getStringFieldFromMap(baseSalary, "currencyCode")
					unit := getStringFieldFromMap(baseSalary, "unitOfWork")
					if currency == "" {
						currency = "USD"
					}
					salaryText := fmt.Sprintf("%s %.0f - %.0f / %s", currency, min, max, unit)
					job.Salary = &salaryText
				}
			}
		}

		// Extract URLs (prefer url over jobUrl)
		if url := getStringFieldVariants(item, "url", "jobUrl"); url != "" {
			job.URL = &url
		}

		// Extract description
		if desc, ok := item["description"].(map[string]interface{}); ok {
			if text := getStringFieldFromMap(desc, "text"); text != "" {
				job.Description = &text
			}
		}

		// Extract job type from jobTypes object (take first one)
		if jobTypes, ok := item["jobTypes"].(map[string]interface{}); ok {
			for _, jobType := range jobTypes {
				if jobTypeStr, ok := jobType.(string); ok {
					job.JobType = &jobTypeStr
					break
				}
			}
		}

		// Extract skills/experience from attributes (take up to 3 relevant ones)
		if attributes, ok := item["attributes"].(map[string]interface{}); ok {
			skills := []string{}
			// Look for technical skills and qualifications
			for _, attrValue := range attributes {
				if attrStr, ok := attrValue.(string); ok {
					// Filter for skills/qualifications, skip generic ones
					if attrStr != "" && len(skills) < 3 {
						skills = append(skills, attrStr)
					}
				}
			}
			if len(skills) > 0 {
				sector := skills[0]
				for i := 1; i < len(skills); i++ {
					sector += fmt.Sprintf(", %s", skills[i])
				}
				job.Sector = &sector
			}
		}

		// Extract posted date
		if datePublished := getStringField(item, "datePublished"); datePublished != "" {
			job.PostedDate = &datePublished
		} else if dateOnIndeed := getStringField(item, "dateOnIndeed"); dateOnIndeed != "" {
			job.PostedDate = &dateOnIndeed
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
	limit int,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/5OaooRg0FxlRF0L1B/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"keywords": query,
		"location": location,
		"daysOld":  30,
		"limit":    limit,
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

		// Extract ID
		if id, ok := item["id"].(float64); ok {
			idStr := fmt.Sprintf("%.0f", id)
			job.ID = &idStr
		}

		// Extract company URL from employer object
		if companyURL := getNestedStringField(item, "employer", "url"); companyURL != "" {
			job.CompanyURL = &companyURL
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

		// Extract URLs
		if url := getStringFieldVariants(item, "seoUrl", "url", "jobUrl"); url != "" {
			job.URL = &url
		}

		// Extract description (HTML format)
		if description := getStringField(item, "description"); description != "" {
			job.Description = &description
			job.DescriptionHTML = &description
		}

		// ageInDays is a number, convert to relative time string and absolute date
		if ageInDays, ok := item["ageInDays"].(float64); ok {
			days := int(ageInDays)
			posted := fmt.Sprintf("%d days ago", days)
			job.Posted = &posted

			// Calculate absolute date by subtracting days from current time
			// This is an approximation since we don't know the exact timestamp
			// But it's good enough for display purposes
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
	limit int,
) ([]JobResult, error) {
	url := fmt.Sprintf(
		"https://api.apify.com/v2/acts/zxl6JzwzACkNsR5PQ/run-sync-get-dataset-items?token=%s",
		token,
	)

	payload := map[string]interface{}{
		"keywords": query,
		"sort":     "relevance",
		"limit":    limit,
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

		// Extract ID
		if id := getStringField(item, "id"); id != "" {
			job.ID = &id
		}

		// Extract experience level from contractorTier
		if contractorTier := getStringField(item, "contractorTier"); contractorTier != "" {
			// Map Upwork contractor tiers to readable experience levels
			experienceMap := map[string]string{
				"EntryLevel":       "Entry Level",
				"IntermediateLevel": "Intermediate",
				"ExpertLevel":      "Expert",
			}
			if mappedExp, ok := experienceMap[contractorTier]; ok {
				job.ExperienceLevel = &mappedExp
			} else {
				job.ExperienceLevel = &contractorTier
			}
		}

		// Extract job type (HOURLY or FIXED)
		if jobType := getStringField(item, "jobType"); jobType != "" {
			job.JobType = &jobType
		}

		// Extract skills and join them as sector
		if skills, ok := item["skills"].([]interface{}); ok {
			skillNames := []string{}
			for _, skill := range skills {
				if skillMap, ok := skill.(map[string]interface{}); ok {
					if skillName := getStringFieldFromMap(skillMap, "prefLabel"); skillName != "" {
						skillNames = append(skillNames, skillName)
					}
				}
			}
			if len(skillNames) > 0 {
				// Join first 3 skills as sector
				if len(skillNames) > 3 {
					skillNames = skillNames[:3]
				}
				sector := fmt.Sprintf("%s", skillNames[0])
				for i := 1; i < len(skillNames); i++ {
					sector += fmt.Sprintf(", %s", skillNames[i])
				}
				job.Sector = &sector
			}
		}

		// Extract budget from fixedPriceAmount or hourly rates
		var salaryText string
		if fixedPrice, ok := item["fixedPriceAmount"].(map[string]interface{}); ok {
			if amount, ok := fixedPrice["amount"].(string); ok {
				currency := getStringFieldFromMap(fixedPrice, "isoCurrencyCode")
				if currency == "" {
					currency = "USD"
				}

				// Add duration if available
				durationText := ""
				if duration, ok := item["fixedPriceEngagementDuration"].(map[string]interface{}); ok {
					if label := getStringFieldFromMap(duration, "label"); label != "" {
						durationText = fmt.Sprintf(" for %s", label)
					}
				}

				salaryText = fmt.Sprintf("%s %s%s", currency, amount, durationText)
				job.Salary = &salaryText
			}
		} else if hourlyMax, ok := item["hourlyBudgetMax"].(float64); ok {
			if hourlyMin, ok := item["hourlyBudgetMin"].(float64); ok {
				salaryText = fmt.Sprintf("$%.0f - $%.0f/hr", hourlyMin, hourlyMax)
				job.Salary = &salaryText
			}
		}

		if url := getStringField(item, "url"); url != "" {
			job.URL = &url
		}

		// Extract description
		if description := getStringField(item, "description"); description != "" {
			job.Description = &description
		}

		// Extract posted time - prefer publishTime over createTime
		if publishTime := getStringField(item, "publishTime"); publishTime != "" {
			job.PostedDate = &publishTime
		} else if createTime := getStringField(item, "createTime"); createTime != "" {
			job.PostedDate = &createTime
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

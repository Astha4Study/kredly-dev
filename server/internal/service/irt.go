package service

import (
	"math"
	"kredly/internal/models"
)

// UpdateTheta calculates the new theta (ability) estimate based on Newton-Raphson method
func UpdateTheta(thetaOld, b float64, score float64) float64 {
	p := 1.0 / (1.0 + math.Exp(-(thetaOld - b)))
	denom := p * (1.0 - p)
	
	// Avoid division by zero or extremely small values
	if denom < 0.01 {
		denom = 0.01
	}

	step := (score - p) / denom

	// Limit step size to avoid extreme jumps or oscillation
	if step > 1.5 {
		step = 1.5
	} else if step < -1.5 {
		step = -1.5
	}

	thetaNew := thetaOld + step

	// Clamp theta to [-4.0, 4.0]
	if thetaNew > 4.0 {
		thetaNew = 4.0
	} else if thetaNew < -4.0 {
		thetaNew = -4.0
	}

	return thetaNew
}

// SEM calculates the Standard Error of Measurement at the current theta estimate
func SEM(theta float64, items []models.AnswerHistory) float64 {
	if len(items) == 0 {
		return 5.0
	}

	var infoSum float64
	for _, item := range items {
		p := 1.0 / (1.0 + math.Exp(-(theta - item.BParam)))
		infoSum += p * (1.0 - p)
	}

	if infoSum <= 0.0 {
		return 5.0
	}

	return 1.0 / math.Sqrt(infoSum)
}

// ShouldStop checks if the adaptive test stopping criteria are met
func ShouldStop(totalItems int, sem float64, maxItems, minItems int, semThreshold float64) string {
	if maxItems <= 0 {
		maxItems = 30
	}
	if minItems <= 0 {
		minItems = 10
	}
	if semThreshold <= 0 {
		semThreshold = 0.3
	}

	if totalItems >= maxItems {
		return "max_items_reached"
	}
	if totalItems >= minItems && sem <= semThreshold {
		return "sem_converged"
	}

	return ""
}

// ThetaToScore scales theta from [-4, 4] to [0, 1000]
func ThetaToScore(theta float64) int {
	score := ((theta + 4.0) / 8.0) * 1000.0
	rounded := int(math.Round(score))

	if rounded < 0 {
		return 0
	}
	if rounded > 1000 {
		return 1000
	}
	return rounded
}

// ThetaToLevel maps theta to ability level designations
func ThetaToLevel(theta float64) string {
	if theta < -1.0 {
		return "Beginner"
	}
	if theta < 0.5 {
		return "Intermediate"
	}
	if theta < 1.5 {
		return "Advanced"
	}
	return "Expert"
}

// EstimatePercentile estimates the percentile rank based on the cumulative standard normal distribution
func EstimatePercentile(theta float64) int {
	// Φ(x) = 0.5 * erfc(-x / √2)
	percentile := 0.5 * math.Erfc(-theta/math.Sqrt(2.0)) * 100.0
	rounded := int(math.Round(percentile))

	if rounded < 1 {
		return 1
	}
	if rounded > 99 {
		return 99
	}
	return rounded
}

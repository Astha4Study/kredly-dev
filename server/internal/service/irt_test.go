package service

import (
	"kredly/internal/models"
	"testing"
)

func TestUpdateTheta_CorrectAnswer(t *testing.T) {
	thetaOld := 0.0
	b := 0.0
	thetaNew := UpdateTheta(thetaOld, b, 1.0)

	if thetaNew <= thetaOld {
		t.Errorf("expected thetaNew to increase after correct answer, got %f -> %f", thetaOld, thetaNew)
	}
}

func TestUpdateTheta_WrongAnswer(t *testing.T) {
	thetaOld := 0.0
	b := 0.0
	thetaNew := UpdateTheta(thetaOld, b, 0.0)

	if thetaNew >= thetaOld {
		t.Errorf("expected thetaNew to decrease after wrong answer, got %f -> %f", thetaOld, thetaNew)
	}
}

func TestUpdateTheta_Clamp(t *testing.T) {
	thetaOld := 3.9
	b := -2.0
	thetaNew := UpdateTheta(thetaOld, b, 1.0)

	if thetaNew > 4.0 {
		t.Errorf("expected thetaNew to be clamped to 4.0, got %f", thetaNew)
	}

	thetaOld = -3.9
	b = 2.0
	thetaNew = UpdateTheta(thetaOld, b, 0.0)
	if thetaNew < -4.0 {
		t.Errorf("expected thetaNew to be clamped to -4.0, got %f", thetaNew)
	}
}

func TestSEM_EmptyItems(t *testing.T) {
	var items []models.AnswerHistory
	semVal := SEM(0.0, items)

	if semVal < 5.0 {
		t.Errorf("expected SEM with empty items to be >= 5.0, got %f", semVal)
	}
}

func TestSEM_MoreItemsLowerSEM(t *testing.T) {
	itemsFew := []models.AnswerHistory{
		{BParam: 0.0}, {BParam: 0.5}, {BParam: -0.5}, {BParam: 0.2}, {BParam: -0.2},
	}
	itemsMany := []models.AnswerHistory{
		{BParam: 0.0}, {BParam: 0.5}, {BParam: -0.5}, {BParam: 0.2}, {BParam: -0.2},
		{BParam: 1.0}, {BParam: 1.5}, {BParam: -1.0}, {BParam: -1.5}, {BParam: 0.0},
		{BParam: 0.1}, {BParam: -0.1}, {BParam: 0.3}, {BParam: -0.3}, {BParam: 0.4},
	}

	semFew := SEM(0.0, itemsFew)
	semMany := SEM(0.0, itemsMany)

	if semMany >= semFew {
		t.Errorf("expected SEM with more items to be lower, got SEM(5)=%f, SEM(15)=%f", semFew, semMany)
	}
}

func TestShouldStop_MaxItems(t *testing.T) {
	res := ShouldStop(30, 0.2, 30, 10, 0.3)
	if res != "max_items_reached" {
		t.Errorf("expected stop reason 'max_items_reached', got '%s'", res)
	}
}

func TestShouldStop_SEMConverged(t *testing.T) {
	res := ShouldStop(15, 0.2, 30, 10, 0.3)
	if res != "sem_converged" {
		t.Errorf("expected stop reason 'sem_converged', got '%s'", res)
	}
}

func TestShouldStop_Continue(t *testing.T) {
	res := ShouldStop(5, 0.2, 30, 10, 0.3)
	if res != "" {
		t.Errorf("expected empty stop reason (continue), got '%s'", res)
	}

	// SEM is low but total items < minItems (10)
	res = ShouldStop(8, 0.1, 30, 10, 0.3)
	if res != "" {
		t.Errorf("expected empty stop reason (continue because < minItems), got '%s'", res)
	}
}

func TestThetaToScore_Range(t *testing.T) {
	if s := ThetaToScore(-4.0); s != 0 {
		t.Errorf("expected score 0 for theta -4.0, got %d", s)
	}
	if s := ThetaToScore(0.0); s != 500 {
		t.Errorf("expected score 500 for theta 0.0, got %d", s)
	}
	if s := ThetaToScore(4.0); s != 1000 {
		t.Errorf("expected score 1000 for theta 4.0, got %d", s)
	}
	if s := ThetaToScore(-5.0); s != 0 {
		t.Errorf("expected score to clamp at 0, got %d", s)
	}
	if s := ThetaToScore(5.0); s != 1000 {
		t.Errorf("expected score to clamp at 1000, got %d", s)
	}
}

func TestThetaToLevel(t *testing.T) {
	if lvl := ThetaToLevel(-2.0); lvl != "Beginner" {
		t.Errorf("expected Beginner for theta -2.0, got %s", lvl)
	}
	if lvl := ThetaToLevel(0.0); lvl != "Intermediate" {
		t.Errorf("expected Intermediate for theta 0.0, got %s", lvl)
	}
	if lvl := ThetaToLevel(1.0); lvl != "Advanced" {
		t.Errorf("expected Advanced for theta 1.0, got %s", lvl)
	}
	if lvl := ThetaToLevel(2.0); lvl != "Expert" {
		t.Errorf("expected Expert for theta 2.0, got %s", lvl)
	}
}

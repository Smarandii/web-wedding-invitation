package sheets

import (
	"context"
	"fmt"
	"log"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

const (
	SpreadsheetID = "1Bh-62m8IaRVLMHCIHHDRaE7cgyNjJr5T6-znS_yG_AE"
	Range         = "'Фактический список гостей'!A1:D1"
)

type SheetService struct {
	service *sheets.Service
}

func NewSheetService(credentialsFile string) (*SheetService, error) {
	ctx := context.Background()
	srv, err := sheets.NewService(ctx, option.WithCredentialsFile(credentialsFile))
	if err != nil {
		return nil, fmt.Errorf("unable to create sheets service: %v", err)
	}
	return &SheetService{service: srv}, nil
}

func (s *SheetService) AppendRow(data []interface{}) error {
	valueRange := &sheets.ValueRange{
		Values: [][]interface{}{data},
	}

	log.Printf("Appending data: %v to range: %s", data, Range)

	_, err := s.service.Spreadsheets.Values.Append(SpreadsheetID, Range, valueRange).
		ValueInputOption("RAW").
		InsertDataOption("INSERT_ROWS").
		Do()

	if err != nil {
		log.Printf("Error appending row: %v", err)
	}

	return err
}

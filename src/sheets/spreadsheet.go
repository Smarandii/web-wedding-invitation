package sheets

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

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

func NewSheetService(credentialsJSON string) (*SheetService, error) {
	ctx := context.Background()

	// Parse the JSON string into a map
	credentials := map[string]interface{}{}
	if err := json.Unmarshal([]byte(credentialsJSON), &credentials); err != nil {
		return nil, fmt.Errorf("unable to parse credentials JSON: %v", err)
	}

	// Create the service using the credentials
	srv, err := sheets.NewService(ctx, option.WithCredentialsJSON([]byte(credentialsJSON)))
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

func ConstructCredentialsJSON() (string, error) {
	credentials := map[string]interface{}{
		"type":                        os.Getenv("SERVICE_ACCOUNT_JSON_type"),
		"project_id":                  os.Getenv("SERVICE_ACCOUNT_JSON_project_id"),
		"private_key_id":              os.Getenv("SERVICE_ACCOUNT_JSON_private_key_id"),
		"private_key":                 os.Getenv("SERVICE_ACCOUNT_JSON_private_key"),
		"client_email":                os.Getenv("SERVICE_ACCOUNT_JSON_client_email"),
		"client_id":                   os.Getenv("SERVICE_ACCOUNT_JSON_client_id"),
		"auth_uri":                    os.Getenv("SERVICE_ACCOUNT_JSON_auth_uri"),
		"token_uri":                   os.Getenv("SERVICE_ACCOUNT_JSON_token_uri"),
		"auth_provider_x509_cert_url": os.Getenv("SERVICE_ACCOUNT_JSON_auth_provider_x509_cert_url"),
		"client_x509_cert_url":        os.Getenv("SERVICE_ACCOUNT_JSON_client_x509_cert_url"),
		"universe_domain":             os.Getenv("SERVICE_ACCOUNT_JSON_universe_domain"),
	}

	credentialsJSON, err := json.Marshal(credentials)
	if err != nil {
		return "", fmt.Errorf("unable to construct credentials JSON: %v", err)
	}

	return string(credentialsJSON), nil
}

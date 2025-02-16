package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"web-wedding-invitation/webapp/sheets"
)

type RSVPData struct {
	Name       string `json:"name"`
	Surname    string `json:"surname"`
	Attendance string `json:"attendance"`
	Alcohol    string `json:"alcohol"`
}

func main() {
	// Initialize sheets service
	sheetService, err := sheets.NewSheetService(os.Getenv("SERVICE_ACCOUNT_JSON"))
	if err != nil {
		log.Fatal(err)
	}

	// Create a specific file server for HTML and CSS
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "/app/public/main.html")
			return
		}
		if r.URL.Path == "/styles.css" {
			w.Header().Set("Content-Type", "text/css")
			http.ServeFile(w, r, "/app/public/styles.css")
			return
		}

		if r.URL.Path == "/script.js" {
			w.Header().Set("Content-Type", "application/javascript")
			http.ServeFile(w, r, "/app/public/script.js")
			return
		}

		http.NotFound(w, r)
	})

	// Serve images from the pictures directory
	http.Handle("/pictures/", http.StripPrefix("/pictures/", http.FileServer(http.Dir("/app/public/pictures"))))

	http.HandleFunc("/api/rsvp", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var data RSVPData
		if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var Attendance string
		// Prepare data for spreadsheet
		if data.Attendance == "single" {
			Attendance = "Придет"
		} else {
			Attendance = "Не придет"
			data.Alcohol = "no"
		}

		var Alcohol string

		if data.Alcohol == "wine" {
			Alcohol = "Вино или шампанское"
		} else if data.Alcohol == "strong" {
			Alcohol = "Крепкие напитки"
		} else if data.Alcohol == "no" {
			Alcohol = "Не пьет"
		} else {
			Alcohol = data.Alcohol
		}

		row := []interface{}{
			data.Name,
			data.Surname,
			Attendance,
			Alcohol,
		}

		// Append to spreadsheet
		if err := sheetService.AppendRow(row); err != nil {
			log.Printf("Failed to save to spreadsheet: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	})

	// Start the server on port 8080
	log.Println("Server starting on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

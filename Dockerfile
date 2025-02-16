FROM golang:1.22-alpine

ENV SERVICE_ACCOUNT_JSON=${SERVICE_ACCOUNT_JSON}

COPY public /app/public
COPY src /app/src

WORKDIR /app/src

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
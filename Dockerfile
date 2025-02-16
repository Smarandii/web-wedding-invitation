FROM golang:1.22-alpine

ENV SERVICE_ACCOUNT_JSON_type=${SERVICE_ACCOUNT_JSON_type}
ENV SERVICE_ACCOUNT_JSON_project_id=${SERVICE_ACCOUNT_JSON_project_id}
ENV SERVICE_ACCOUNT_JSON_private_key_id=${SERVICE_ACCOUNT_JSON_private_key_id}
ENV SERVICE_ACCOUNT_JSON_private_key=${SERVICE_ACCOUNT_JSON_private_key}
ENV SERVICE_ACCOUNT_JSON_client_email=${SERVICE_ACCOUNT_JSON_client_email}
ENV SERVICE_ACCOUNT_JSON_client_id=${SERVICE_ACCOUNT_JSON_client_id}
ENV SERVICE_ACCOUNT_JSON_auth_uri=${SERVICE_ACCOUNT_JSON_auth_uri}
ENV SERVICE_ACCOUNT_JSON_token_uri=${SERVICE_ACCOUNT_JSON_token_uri}
ENV SERVICE_ACCOUNT_JSON_auth_provider_x509_cert_url=${SERVICE_ACCOUNT_JSON_auth_provider_x509_cert_url}
ENV SERVICE_ACCOUNT_JSON_client_x509_cert_url=${SERVICE_ACCOUNT_JSON_client_x509_cert_url}
ENV SERVICE_ACCOUNT_JSON_universe_domain=${SERVICE_ACCOUNT_JSON_universe_domain}

COPY public /app/public
COPY src /app/src

WORKDIR /app/src

RUN go build -o main .

EXPOSE 2070

CMD ["./main"]
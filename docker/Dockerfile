#FROM gitlab.expertflow.com:9242/general/nginx:1.19.0-alpine
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY dist/ .

COPY config.json.template .

COPY docker-entrypoint.sh .

COPY environment_variables.env .

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["sh","./docker-entrypoint.sh"]

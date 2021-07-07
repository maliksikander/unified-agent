FROM gitlab.expertflow.com:9242/general/nginx:1.19.5-alpine-3.12-rbi-256

WORKDIR /usr/share/nginx/html

COPY dist/ .

COPY config.json.template .

COPY docker-entrypoint.sh .

<<<<<<< HEAD
#COPY environment_variables.env .

=======
>>>>>>> CIM-764_task_assign_handling
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["sh","./docker-entrypoint.sh"]
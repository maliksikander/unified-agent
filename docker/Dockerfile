#FROM gitlab.expertflow.com:9242/general/nginx:1.19.0-alpine

FROM nginx:alpine

#RUN mkdir -p /app

WORKDIR /usr/share/nginx/html

#COPY package.json /app

#RUN npm install
 
#COPY dist/ .

RUN ls -ltr 

COPY . .

#RUN npm run build

#COPY --from=build-step /app/dist/unified-agent-gadget  

EXPOSE 80

ENTRYPOINT ["./docker-entrypoint.sh"]

FROM node:lts-alpine as build-stage
WORKDIR /app
ENV VITE_APP_API_BASE=VITE_APP_API_BASE

COPY package.json ./package.json

RUN rm -rf node_modules/
RUN npm cache clean --force
RUN npm install

COPY . .
RUN npm run build

FROM httpd:2.4 as production-stage
COPY --from=build-stage /app/dist /usr/local/apache2/htdocs
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
RUN chown -R www-data /usr/local/apache2/logs/
RUN chown -R www-data /usr/local/apache2/htdocs/
COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
USER www-data
ENTRYPOINT [ "./entrypoint.sh" ]

FROM node as build

WORKDIR /app
COPY package*.json .
run npm install -g npm@10.5.2
COPY . .
RUN npm run

FROM nginx:1.19

COPY ./nginx/nginx.config /etc/nginx/nginx.config
COPY --from=build /app/dist/my-app/browser/ /usr/share/nginx/html

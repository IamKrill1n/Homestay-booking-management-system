FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
# react/react-dom are declared as optional peer deps (Figma Make quirk),
# so install them explicitly to make the Vite build self-contained.
RUN npm install && npm install react@18.3.1 react-dom@18.3.1

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

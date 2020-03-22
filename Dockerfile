# Use Node.js to build the app
FROM node:13 AS build

# Import source code
WORKDIR /app
COPY . .

# Install dependencies
RUN npm ci

# Build app
RUN npm run build:prod


# Final image with Nginx web server
FROM nginx:1.17

# Copy the built angular app to webhost directory
COPY --from=build /app/dist/client /usr/share/nginx/html

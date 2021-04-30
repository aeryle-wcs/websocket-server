# Lightweight NodeJS image
FROM node:alpine

# Move files to container
WORKDIR /usr/app
COPY ./ $WORKDIR

# Install modules
RUN npm i

# Launch script
CMD npm start
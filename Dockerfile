###############################################################################
## Stage one
FROM node:16-alpine as builder

# Install build essentials
RUN apk --update add --no-cache --virtual .build-deps build-base python3 bash
RUN npm install -g node-gyp

# Create the directory!
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Copy and Install our bot
COPY package.json /usr/src/bot
RUN npm install --production
##############################################################################

## Stage two
FROM node:16-alpine as main-stage
ENV NODE_ENV=production

# Create user node, and directories for node user.
USER node
RUN mkdir -p /home/node/bot
WORKDIR /home/node/bot

# Copy bot from previous build to current build stage
COPY --chown=node . .
COPY --from=builder --chown=node /usr/src/bot/node_modules /home/node/bot/node_modules

# Start me!
CMD ["npm", "start"]
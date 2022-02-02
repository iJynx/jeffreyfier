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

# Add dumb-init to support signals
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.5/dumb-init_1.2.5_aarch64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Create user node, and directories for node user.
USER node
RUN mkdir -p /home/node/bot
WORKDIR /home/node/bot

# Added dumb-init for clean exits

# Copy bot from previous build to current build stage
COPY --chown=node . .
COPY --from=builder --chown=node /usr/src/bot/node_modules /home/node/bot/node_modules

# Start me!
CMD ["dumb-init", "node", "index.js"]
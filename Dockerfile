
###
# 1. Dependencies
###

FROM node:14.5-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

#Change Work Directory
WORKDIR /home/node/app

#Copy the package.json file
COPY package.json yarn.lock ./

RUN apk update && yarn install --production

COPY --chown=node:node . .

#RUN ls -a && ls -al -R

#RUN NODE_ENV=staging.test yarn staging-test

EXPOSE 80


CMD yarn start
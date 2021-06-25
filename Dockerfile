FROM node:12.18.4 as node_base

RUN apt-get update && apt-get install -y git

WORKDIR /app
ADD ./package.json /app/package.json
ADD ./yarn.lock /app/yarn.lock

RUN yarn

ADD . /app

RUN yarn build
RUN yarn build:server

FROM node:12.18.4 as app

RUN apt-get update && apt-get install -y \
   build-essential \
   libcairo2-dev \
   libpango1.0-dev

WORKDIR /app
ADD ./package.json /app/package.json
ADD ./yarn.lock /app/yarn.lock

RUN yarn install --prod

ADD . /app

COPY --from=node_base /app/dist /app/dist
COPY --from=node_base /app/public /app/public

CMD ["yarn", "server"]

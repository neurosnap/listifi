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
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

WORKDIR /app
ADD ./package.json /app/package.json
ADD ./yarn.lock /app/yarn.lock

RUN yarn install --prod

ADD . /app

COPY --from=node_base /app/dist /app/dist
COPY --from=node_base /app/public /app/public

CMD ["yarn", "server"]

FROM node
USER root
LABEL maintainer="David González García <davidglezz@outlook.es>"

WORKDIR /app

RUN npm install -g typescript && \
  npm install -g ts-node && \
  npm install -g @angular/cli --unsafe

RUN git clone https://github.com/davidglezz/tfg.git . && \
  cd /app/persistence && npm install && \
  cd /app/crawler && npm install && \
  cd /app/api-server && npm install && \
  cd /app/frontend && npm install && \
  ng build --prod && \
  mv -v /app/frontend/dist/* /app/api-server/public/

COPY . /app/persistence/src/

RUN cp -a /app/persistence/src/. /app/crawler/src/persistence/ && \
  cp -a /app/persistence/src/. /app/api-server/src/persistence/

CMD ts-node /app/api-server/src/app.ts && \
  ts-node /app/crawler/src/index.ts

EXPOSE 80
VOLUME ["/app"]

ENV NODE_ENV=production

FROM node
USER root
LABEL maintainer="David González García <davidglezz@outlook.es>"

WORKDIR /app

RUN npm install -g typescript && \
  npm install -g ts-node && \
  npm install -g @angular/cli --unsafe && \
  npm install -g pm2 && \
  pm2 install ts-node

EXPOSE 80
VOLUME ["/app", "/app-config"]
# ENV NODE_ENV=production

# Run
# CMD ["/app/startup.sh"]
CMD ["/app-config/startup.sh"]

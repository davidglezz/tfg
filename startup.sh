#!/bin/sh
cd /
npm update typescript
npm update ts-node
npm update @angular/cli 

cd /app
git reset --hard
git clean -fd
git pull || git clone https://github.com/davidglezz/tfg.git .

cd /app && npm update
cd /app/persistence && npm update
cd /app/crawler && npm update
cd /app/api-server && npm update
cp /app-config/connectionOptions.ts /app/persistence/src/
cp /app-config/ormconfig.json /app/persistence/src/
cp -a /app/persistence/src/. /app/crawler/src/persistence/
cp -a /app/persistence/src/. /app/api-server/src/persistence/

cd /app/frontend && npm update
rm -rf /app/api-server/public/en
rm -rf /app/api-server/public/es
npm run release
mv /app/frontend/dist /app/api-server/public/en
npm run release-es
mv /app/frontend/dist /app/api-server/public/es

cd /app/api-server/ && ts-node src/app.ts & 
cd /app/crawler/ && ts-node src/index.ts &
wait

#pm2 start ts-node /app/api-server/src/app.ts
#pm2 start ts-node /app/crawler/src/index.ts
#npm start


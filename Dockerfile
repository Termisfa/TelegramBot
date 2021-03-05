FROM node:12-alpine

RUN apk add --no-cache tzdata
ENV TZ Europe/Madrid

RUN apk add --no-cache  chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main


ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
WORKDIR /usr/src/app
COPY --chown=chrome package.json package-lock.json ./




#RUN set -ex \
#    \
#    && apk add --no-cache chromium \
#    \
#    && mkdir /data \
#    && chown nobody /data



RUN npm install
COPY --chown=chrome . ./
#COPY  ./Checker/checkBot.sh ./Checker/checkBot.sh

VOLUME /usr/src/app/Checker


CMD ["./startBot.sh"]
	
	
#docker run -d --name test -v /home/pi/Checker:/usr/src/app/Checker termisfa/bot
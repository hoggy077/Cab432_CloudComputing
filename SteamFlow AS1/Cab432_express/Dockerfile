#-=-=-= Node image =-=-=-
#chose this one as my dev system is running 16.9.1
#rather update the code if there is a problem then run an older version with a problem

FROM node:16.17-alpine
COPY . .

#Seperate Files
WORKDIR /client
RUN npm install
RUN npm run build

WORKDIR /Server
EXPOSE 8080

#REQUIRED enviroment variables
#ENV AWS_ACCESS_KEY_ID *REQUIRED*
#ENV AWS_SECRET_ACCESS_KEY *REQUIRED*
#ENV AWS_SESSION_TOKEN *REQUIRED*
#ENV YOUTUBE_Key *REQUIRED*

#ENV redisConfig {}
#ENV DEV_Key *ANY BEARER TOKEN VALID STRING*

RUN npm install
CMD ["node", "index.js"]
#-=-=-= Node image =-=-=-
#chose this one as my dev system is running 16.9.1
#rather update the code if there is a problem then run an older version with a problem

FROM node:16.17-alpine
COPY ..

#Seperate Files
WORKDIR /client
RUN npm run build

WORKDIR /Server
EXPOSE 8080
CMD ["node", "index.js"]
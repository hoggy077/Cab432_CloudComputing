#-=-=-= Node image =-=-=-
#chose this one as my dev system is running 16.9.1
#rather update the code if there is a problem then run an older version with a problem

FROM node:16.17-alpine
COPY . .

#Seperate Files
WORKDIR /Steamflow/client
RUN npm install
RUN npm run build

WORKDIR /Steamflow/Server
EXPOSE 8080

#REQUIRED enviroment variables
ENV AWS_ACCESS_KEY_ID ASIA5DYSEEJ4Q473MXAU
ENV AWS_SECRET_ACCESS_KEY w1sI4uk0R3OJofBA1uIdqNSaNZ/Y95h3Fowr4pxr
ENV AWS_SESSION_TOKEN IQoJb3JpZ2luX2VjEEQaDmFwLXNvdXRoZWFzdC0yIkcwRQIhAKBog6KVZWzWD1UjVhvslExurTNhHvBa9nrnkvDQK2pbAiBUnmvkuoxeP0AcAcvCrzb3XOjUee4EkbUc7o5n1aGl+yq5Awj9//////////8BEAIaDDkwMTQ0NDI4MDk1MyIMaQT89FRMSqF8cs+qKo0DVok5DeJZ3w2i+0CAMwrD3aFSNyYctqGFkKVVcHo6TYu2BolC4olpKsP8fd5TkxNGdbmRzLKce5hrAQyrTAc+dCrxYJdComfuUSP+1WrJBsR2vjCR95ib9VLKrBkY9WI2Ma3rogpxhWKAXSFrfsWLRrtTgjEytRs470qd4o7yHxxNas3FV/2J3nOv0mGVx6dlBoEAwgr+uTKjgaFiMHUW0xTy2cWkIauky1p/6YI0jWkC7y52ksqGvx7YnfLsCuyo7Zx7rqvJT+X8RQ34uLWe//qd3zO2FLDzs7MSHdMmS0ZhCogVwiDFU8NzlnIEL8Ut7DFJqzwKGNtkIegRGRdyScbx8mJFurfOQeSXg8/wXy4YiuwaX/MoQ//h5RW9fI9tA8eMlumSqzAWulFcX8MiNtjZHOf9zwheRC43dGa5lxDmHA8b18CApNuoLx1wVzn74swCLRj4zdQSG2j5K2uwlDBn5yYidKBnGpELWnfNaZ+KGVCeOVk4d2VZ5XQEIjCmKaMaigxBy72hQxfXBjD90P6ZBjqmAYev6xmKM3RXJrrXy6jkF0Y296JHgPB21FMMjy2thuOkG84Kh+u6rxkSHgoWsRkVpzuc35i8s/A6SOlr6Bfu7gNmyiVwMXj216FocfVz9Y5IQTEz6yJ1lqE+bddSHswhYiPlpUxruqOQypiFihTjh4SAeo5Jl7QQEUisCsd+DE/hLplICindRMRJ1Wecrh14Ybvkpm8hjK4iQdP9NqbyE6xh2SRx0Io=
ENV YOUTUBE_Key AIzaSyCwaLoOE9q9pl4L1QLTEo73PZm6swHyi2w

#OPTIONAL
#the server uses https://www.npmjs.com/package/redis read the documentation for their settings scheme
#ENV redisConfig {} 

ENV DEV_Key s6RjBwBMUo4uf0qZLqwvCXmxgm_AyEsFjl1PNH7rqqU 
#include this key as a bearer token in any calls to /api/v1/steam or /api/v1/youtube to get access
ENV redisConfig '{"Disabled":true}'

RUN npm install
CMD ["node", "index.js"]
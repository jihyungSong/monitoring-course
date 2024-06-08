FROM node:latest
ENV SRC_DIR /opt/web
    
COPY ./source ${SRC_DIR}
WORKDIR ${SRC_DIR}

RUN npm install express
RUN npm install axios

EXPOSE 3000

CMD ["node", "/opt/web/server.js"]

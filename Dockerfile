FROM node:24.4 
WORKDIR /app

COPY . .
RUN npm i 
RUN npm run build 

RUN useradd app
RUN chown -R app:app /app
USER app

EXPOSE 5173

CMD ["npm","start"]

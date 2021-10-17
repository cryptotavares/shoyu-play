FROM node:14-alpine

ENV NODE_ENV=production

EXPOSE 4992

WORKDIR /app

CMD ["node", "dist/index.js"]

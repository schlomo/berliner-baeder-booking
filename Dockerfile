FROM alpine

RUN apk add --no-cache \
  ca-certificates \
  chromium \
  dumb-init \
  freetype \
  harfbuzz \
  nodejs \
  nss \
  ttf-freefont \
  yarn

ENTRYPOINT [ "dumb-init", "--", "node", "-r", "./.pnp.cjs", "src/main.js"]

RUN addgroup pptruser && adduser -D -G pptruser pptruser

USER pptruser

WORKDIR /home/pptruser
COPY --chown=pptruser:pptruser . bbb

WORKDIR /home/pptruser/bbb

ENV \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    BBB_IN_DOCKER=true

RUN yarn && yarn build

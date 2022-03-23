FROM node:slim

# Source: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker
# check there for explanations about this Dockerfile

RUN apt-get update \
    && apt-get install -y dumb-init chromium fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "dumb-init", "--", "node", "-r", "./.pnp.cjs", "src/main.js"]

RUN useradd -m -U -G audio,video pptruser

USER pptruser

WORKDIR /home/pptruser
COPY --chown=pptruser:pptruser . bbb

WORKDIR /home/pptruser/bbb

ENV \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    BBB_IN_DOCKER=true

RUN yarn && yarn build

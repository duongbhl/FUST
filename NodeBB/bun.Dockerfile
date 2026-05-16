FROM oven/bun:1.3.13-alpine

ENV NODE_ENV=production \
    DAEMON=false \
    SILENT=false \
    USER=nodebb \
    UID=1001 \
    GID=1001

WORKDIR /usr/src/app/

# Install build dependencies for native modules and basic utilities
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    git \
    tini \
    bash

# Create a symbolic link for node to use bun runtime
RUN ln -s /usr/local/bin/bun /usr/local/bin/node

# Prepare user and group
RUN addgroup -g ${GID} ${USER} \
    && adduser -u ${UID} -G ${USER} -h /usr/src/app/ -s /bin/bash -D ${USER} \
    && chown -R ${USER}:${USER} /usr/src/app/

# Copy the entire project
COPY --chown=${USER}:${USER} . /usr/src/app/

# NodeBB expects package.json in the root for installation
RUN cp /usr/src/app/install/package.json /usr/src/app/package.json && \
    chown ${USER}:${USER} /usr/src/app/package.json

# Copy entrypoint script and make it executable
COPY --chown=${USER}:${USER} ./install/docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER ${USER}

EXPOSE 4567

# Use tini to handle signals and zombie processes
ENTRYPOINT ["tini", "--", "entrypoint.sh"]

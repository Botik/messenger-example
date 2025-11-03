FROM oven/bun:alpine AS build
COPY . /home/
WORKDIR /home
RUN bun i && bun build --compile --outfile=messenger --target=bun-linux-x64-modern-musl --minify --sourcemap src/index.ts src/shared/assets/templates/*.eta

FROM alpine:latest
COPY --from=build /home/messenger /
RUN chmod u+x /messenger && apk add --no-cache libgcc libstdc++
CMD ["/messenger"]

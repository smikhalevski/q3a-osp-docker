# Quake 3 OSP dedicated server Docker image

[Install Docker](https://docs.docker.com/docker-for-mac/install/)

Run on localhost:

```bash
npm run docker-build
SLACK_WEB_HOOK=<your_slack_web_hook_url> npm run docker-restart
```

Publish build:

```bash
npm run docker-publish
```

Force-stop all containers, install and start q3a container:

```bash
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)

docker pull q3a
docker run -p 27960:27960/udp -p 27960:27960/tcp -e SLACK_WEB_HOOK=<your_slack_web_hook_url> smikhalevski/q3a
```

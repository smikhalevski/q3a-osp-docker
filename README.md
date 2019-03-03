# Quake 3 OSP dedicated server Docker image

[Install Docker](https://docs.docker.com/docker-for-mac/install/)

```bash
docker build . -t q3a
docker run -p 27960:27960/udp -p 27960:27960/tcp q3a
```

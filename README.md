# How to run NodeBB with docker-compose:
1. Run these commands in the root directory first:
```
mkdir -p .docker/public/uploads
mkdir -p .docker/database/mongo/data
mkdir -p .docker/config
mkdir -p .docker/build
```

2. Docker compose up and running:
```
  sudo docker-compose --profile mongo up
```
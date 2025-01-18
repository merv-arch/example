REGISTRY=registry.mervarch.com
REPO=merv-backend

docker build -f ./docker/Dockerfile.prod -t $REPO:latest .

if [ $? -eq 0 ]; then
  SHORTHASH=$(git rev-parse --short HEAD)
  REMOTE_TAG=$REGISTRY/$REPO:$SHORTHASH

  docker tag $REPO:latest $REMOTE_TAG
  if [ $? -eq 0 ]; then
    docker push $REGISTRY/$REPO:$SHORTHASH
  fi
else
  echo "Build fail"
fi

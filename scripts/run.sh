docker stop sqrd_tikvidbot
docker rm sqrd_tikvidbot
docker run -itd --name=sqrd_tikvidbot sqrd/tikvidbot

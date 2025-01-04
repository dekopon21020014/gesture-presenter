# analyze-presentation
```
git clone git@github.com:dekopon21020014/analyze-presentation.git
cd analyze-presentation
cp src/.env.sample src/.env # and fill the api key
docker build -t image-name:tag .
docker run --rm -it -v ./src:/app -p 8001:8001 image-name:tag 
```

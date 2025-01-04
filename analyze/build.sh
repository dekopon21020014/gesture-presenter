#!/bin/bash
docker build -t presentation-analysis .

# if you want to gpu
# docker build -t presentation-analysis:cuda -f Dockerfile.gpu .
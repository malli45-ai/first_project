📄 README.md – Docker CI Pipeline (GitHub Actions)
🔹 Overview

This repository uses GitHub Actions to implement a Docker CI pipeline.
The pipeline automatically builds a Docker image and pushes it to Docker Hub whenever code is pushed to the master branch.

🔹 Pipeline Workflow Name
     Docker CI Pipeline

🔹 Pipeline Trigger

The pipeline runs automatically on:
Push to master branch
Defined in workflow:

on:
  push:
    branches:
      - master

🔹 Docker Image Details

Image Name: app
Tag: v1
Full Image:
<DOCKER_USERNAME>/app:v1

🔹 How to Run the Pipeline

The pipeline runs automatically when code is pushed to master.
Manual steps:

git add .
git commit -m "Trigger Docker CI pipeline"
git push origin master
   

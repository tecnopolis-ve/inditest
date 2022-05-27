# Inditex node test (inditest)

## Prerequisites

You must have installed docker and docker-compose.

### Install

Clone the repo and run `docker-compose up` it may take a few minutes to build and prepare the environment.

### Run

Open the url http://localhost:3000

### Endpoints

_note:_ all of these calls are available in the postman collection file.

[GET] http://localhost:3000/image

This endpoint returns a list of images previously loaded and processed.

[GET] http://localhost:3000/image/:id

This endpoint returns a image with a specific id

[POST] http://localhost:3000/task

This endpoint receives an image via upload, after the image was uploaded, this what will happen:

1. The original file is stored in the server.
2. Two new images (800px and 1024px wide) are created and its information (true size, md5 checksum) is stored in the database for later consumiption.

## Resources

You have available in this repo a postman collection for your convenience.

# API








## Host app

### `POST /start/<name>`

Start a server by name.

Status | Description
----|------------
200 | Server started successfully
551 | Server does not exist although it should
552 | Server unable to start
553 | Server is already running
404 | Server does not exist anywhere

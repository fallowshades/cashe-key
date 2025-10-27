#

##

###

#### node server.js & [1] 266100

github push

error: lstat("node_modules/.bin/pino"): Function not implemented
fatal: Unable to process path node_modules/.bin/pino

##### fix

[1] 266100
rm -rf node_modules
pnpm install
This cleans up all existing files and rebuilds symlinks properly.

Verify filesystem compatibility:

Ensure your project folder is on a filesystem that supports symlinks (e.g., ext4 on Linux, APFS on macOS). Avoid network shares or some Windows filesystems that may have trouble.

Check permission and ownership:

Make sure you own all files and have proper permissions:

bash

```
sudo chown -R $USER:$USER node_modules
chmod -R u+rw node_modules

```

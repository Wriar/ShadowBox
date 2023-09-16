# ShadowBox-Dev [![Active Issues](https://app.deepsource.com/gh/Wriar/ShadowBox.svg/?label=active+issues&show_trend=true&token=5APRnpsK93ZKzHm3t9ZQKgp8)](https://app.deepsource.com/gh/Wriar/ShadowBox-Dev/?ref=repository-badge) [![CodeFactor](https://www.codefactor.io/repository/github/wriar/shadowbox/badge?s=892deaf91df08db750f4974dfa5b688e8cdcc423)](https://www.codefactor.io/repository/github/wriar/shadowbox-dev) ![Project Status is In Development](https://img.shields.io/badge/Project%20Status-In%20Development-yellow)
ShadowBox *will* be a zero-knowledge open-source web-based file storage & hosting system, featuring partial or full encryption through cryptographic ciphers. Contributors are welcome to help develop this project.
> [!WARNING]  
> This is a developmental repository of ShadowBox. As this software is still being developed, some or all features may not be available as it is currently a work in progress.

## Run Development
1. Copy ``.env.example`` to ``.env`` and fill in the required fields.
2. Setup a MariaDB instance with the schemas that are provided in the instance
3. Run ``npm install`` to install all dependencies
4. Run ``npm run a`` then ``npm run b`` concurrently to start the Nodemon development server and Scss compiler respectively.
5. It is recommended to generate your own SSL certificates using the ``generateCertificates`` scripts.

## Creating File Bucket
Storing uploaded files are supported on partitions mounted to the computer running the server or a network share. Specify the name of the directory to store these files in the ``.env`` file.
1. Create a directory or folder which the SB instance as permissions to write & ready to.
2. Specify that directory in the ``FILE_BIN_BASEPATH`` environmental variable.
3. Restart the Server

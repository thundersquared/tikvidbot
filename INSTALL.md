## To install node and yarn just use the folowing code


Using Debian, as root

```bash
curl -sL https://deb.nodesource.com/setup_15.x | bash -
apt install -y nodejs
apt install gcc g++ make -y
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt update && apt install yarn -y
```

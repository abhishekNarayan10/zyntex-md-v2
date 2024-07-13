FROM Zynt3x/zyntex-md-v2:latest
WORKDIR /root/zyntex-md-v2
RUN npm install
CMD ["node", "index.js"]


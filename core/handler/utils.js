const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function buildContext(zyn, q, id, prefix) {
  return {
    reply: async (msg) => {
      await zyn.sendMessage(id, { text: msg }, { quoted: q });
    },

    sendVideo: async (path, cap) => {
      await zyn.sendMessage(
        id,
        { video: { url: path }, mimetype: "video/mp4", caption: cap },
        { quoted: q }
      );
    },

    sendImage: async (path, cap) => {
      await zyn.sendMessage(
        id,
        { image: { url: path }, caption: cap },
        { quoted: q }
      );
    },

    sendAudio: async (path) => {
      await zyn.sendMessage(
        id,
        { audio: { url: path }, mimetype: "audio/mpeg" },
        { quoted: q }
      );
    },

    sendAudioV2: async (path, title, body, thumb, mediaType, url) => {
      await zyn.sendMessage(
        id,
        {
          audio: { url: path },
          mimetype: "audio/mp4",
          contextInfo: {
            externalAdReply: {
              title,
              body,
              thumbnailUrl: thumb,
              mediaType,
              showAdAttribution: true,
              renderLargerThumbnail: false,
              sourceUrl: url,
            },
          },
        },
        { quoted: q }
      );
    },

    sendVoice: async (path) => {
      await zyn.sendMessage(
        id,
        {
          audio: { url: path },
          mimetype: "audio/mp4",
          ptt: true,
          waveform: [0, 100, 0, 100, 0],
        },
        { quoted: q }
      );
    },

    message: (msg) => {
      zyn.sendMessage(id, { text: msg });
    },

    read: () => {
      zyn.readMessages([q.key]);
    },

    type: async () => {
      await zyn.sendPresenceUpdate("composing", id);
      await delay(1000);
    },

    record: async () => {
      await zyn.sendPresenceUpdate("recording", id);
      await delay(1000);
    },

    errorMsg: (query, command, example) => {
      zyn.sendMessage(id, {
        text: `_*${query}*_\n\n\`\`\`ex: ${prefix}${command} <${example}>\`\`\``,
      }, { quoted: q });
    },

    react: (emoji) => {
      zyn.sendMessage(id, { react: { text: emoji, key: q.key } });
    }
  };
}

module.exports = { buildContext }

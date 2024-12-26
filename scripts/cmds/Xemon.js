module.exports = {
  config: {
    name: "xemon",
    version: "1.0.0",
    description: "Assistant system",
    permissions: 0,
  },

  onStart() {},

  onChat: async ({ message: { reply: r }, args: a, event: { senderID: s, threadID: t, body: b, messageReply: msg }, commandName, usersData, globalData, role }) => {
    const cmd = `${module.exports.config.name}`;
    const pref = `${utils.getPrefix(t)}`;
    const assistantOptions = ["lover", "helpful", "friendly", "toxic", "bisaya", "horny", "tagalog", "makima", "godmode", "default"];
    const models = { 1: "llama", 2: "gemini" };
    const { name, settings, gender } = await usersData.get(s);
    const gen = gender === 2 ? "male" : "female";
    const currentSystem = settings.system || "helpful";

    let url = null;
    if (msg && ["photo", "audio"].includes(msg.attachments[0]?.type)) {
      url = { link: msg.attachments[0].url, type: msg.attachments[0].type === "photo" ? "image" : "mp3" };
    }

    if (!a.length) {
      return r(
        `Hello ${name}, choose your assistant:\n${assistantOptions
          .map((option, index) => `${index + 1}. ${option}`)
          .join("\n")}\nExample: ${cmd} set friendly\n\nTo change model use:\n${cmd} model <num>\nTo allow NSFW use:\n${cmd} nsfw on/off`
      );
    }

    const mods = (await globalData.get("xemon")) || { data: {} };

    if (a[0].toLowerCase() === "set" && a[1]?.toLowerCase()) {
      const choice = a[1].toLowerCase();
      if (assistantOptions.includes(choice)) {
        await usersData.set(s, { settings: { system: choice } });
        return r(`Assistant changed to ${choice}`);
      }
      return r(`Invalid choice. Available options:\n${assistantOptions.join(", ")}`);
    }

    if (a[0].toLowerCase() === "model" && role >= 2) {
      const selectedModel = models[a[1]];
      if (selectedModel) {
        mods.data.model = selectedModel;
        await globalData.set("xemon", mods);
        return r(`Successfully changed model to ${selectedModel}`);
      }
      return r(
        `Invalid model selection. Available models:\n${Object.entries(models)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")}`
      );
    }

    if (a[0].toLowerCase() === "nsfw" && role >= 2) {
      if (a[1]?.toLowerCase() === "on") {
        mods.data.nsfw = true;
        await globalData.set("xemon", mods);
        return r("NSFW enabled.");
      } else if (a[1]?.toLowerCase() === "off") {
        mods.data.nsfw = false;
        await globalData.set("xemon", mods);
        return r("NSFW disabled.");
      } else {
        return r("Invalid command. Use 'nsfw on' or 'nsfw off'.");
      }
    }

    const prompt = a.join(" ");
    const { result, media } = await ai(prompt, s, name, currentSystem, gen, mods.data.model || "llama", mods.data.nsfw || false, url);
    const response = { body: result, mentions: [{ id: s, tag: name }] };

    if (media) {
      response.attachment = await global.utils.getStreamFromURL(media);
    }

    const { messageID } = await r(response);
    global.GoatBot.onReply.set(messageID, { commandName, senderID: s, model: mods.data.model || "llama", nsfw: mods.data.nsfw || false });
  },

  onReply: async ({ Reply: { senderID, model, nsfw }, message: { reply: r }, args: a, event: { senderID: x, body: b, attachments, threadID: t }, usersData }) => {
    if (senderID !== x) return;

    const { name, settings, gender } = await usersData.get(x);
    const system = settings.system || "helpful";
    const gen = gender === 2 ? "male" : "female";

    let url = null;
    if (attachments?.[0]) {
      const attachment = attachments[0];
      if (attachment.type === "photo" || attachment.type === "audio") {
        url = { link: attachment.url, type: attachment.type === "photo" ? "image" : "mp3" };
      }
    }

    const { result, media } = await ai(b, x, name, system, gen, model, nsfw, url);
    const response = { body: result, mentions: [{ id: x, tag: name }] };

    if (media) {
      response.attachment = await global.utils.getStreamFromURL(media);
    }

    const { messageID } = await r(response);
    global.GoatBot.onReply.set(messageID, { senderID: x, model, nsfw });
  },
};

async function ai(prompt, id, name, system, gender, model, nsfw, link = null) {
  const params = {
    id,
    prompt,
    name,
    system,
    gender,
    model,
    nsfw,
    url: link || undefined,
  };

  try {
    const res = await fetchAPI(params);
    return res.data || { result: "No response received." };
  } catch (err) {
    return { result: `Error: ${err.message}` };
  }
}

async function fetchAPI(params) {
  // Dummy API call to demonstrate structure; replace with actual implementation
  return { data: { result: `Response for: ${params.prompt}` } };
}

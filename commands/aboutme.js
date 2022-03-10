const { codeBlock } = require("@discordjs/builders");

exports.run = async (client, interaction) => { // eslint-disable-line no-unused-vars
  const info = codeBlock("asciidoc", `
  If you see anyone breaking the rules, you can now react with the :jeffrey: emote to vote for them to be jeffrey-fied. (Only Cult-Members can be voted for)
  
  Do NOT vote for people you disagree with, only those breaking the rules. You can only vote three times for each person to prevent spamming (but as many times as you want to overall), so make them count.
  
  Disciples will then see the most controversial messages and decide if the Jeffrey vote was fair or not. You get three strikes being a Jeffrey and then it's a ban.
`);
  await interaction.author.send(info);
};


exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "User"
};


exports.help = {
  name: "aboutme",
  category: "Miscellaneous",
  description: "Explains the fucntionality of the bot.",
  usage: "aboutme"
};
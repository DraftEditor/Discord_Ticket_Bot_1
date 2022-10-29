const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
} = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
client.on('messageCreate', async message => {
  //メッセージイベント発火
  if (message.content.startsWith("!ti")) {
    //!tiが打たれたら
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.channel.send('NOADOMIN');
    //権限確認
    const args = message.content.split(" ").slice(1);
    //argsに空白で区切って配列にして1番目の文字を代入する
    if (!args[0]) return message.reply("コンテンツがないよ");
    //何も代入されていなかったら
    const tic1 = new MessageButton().setCustomId("ticket").setStyle("PRIMARY").setLabel("チケット");
    //button作る
    await message.channel.send({
      embeds: [{
        description: String(args.join(" "))
      }],
      components: [new MessageActionRow().addComponents(tic1)]
    });
    //embedとbutton送信
    if (message.guild.channels.cache.find(name => name.name === "ticket")) return;
    //ticketというカテゴリーがあったらreturn
    message.guild.channels.create('ticket', {
      type: 'GUILD_CATEGORY'
    });
    //ticketというカテゴリーを作る
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.customId === "ticket") {
    //ticketというIDのボタンが押されたら実行
    const ticketid = interaction.user.id
    //ticketIDはボタンを押したユーザーIDと同じと定義する
    if (interaction.guild.channels.cache.find(name => name.name === ticketid)) return interaction.reply({
      content: "これ以上作れないよ",
      //メッセージ
      ephemeral: true
      //その人にしか見れないようにする
    });
    //ギルドにユーザーIDのチャンネルがあったら処理をやめる
    const ct = interaction.guild.channels.cache.find(name => name.name === "ticket")
    //ticketというカテゴリーを探す
    if (!ct) return interaction.channel.send("ticketカテゴリーがありません");
    //見つからなかったら処理しない
    interaction.guild.channels.create(ticketid, {
      //チャンネルを作る
      permissionOverwrites: [{
        id: interaction.guild.roles.everyone,
        //すべての人(everyone)の権限設定
        deny: ['VIEW_CHANNEL']
        //チャンネルを見ることを禁止する
      }],
      parent: ct.id
      //ticketカテゴリーにチャンネルを作る
    }).then(channels => {
      //成功した場合
      channels.permissionOverwrites.edit(interaction.user.id, {
        //ボタンを押したユーザーのチャンネルない権限を変更
        VIEW_CHANNEL: true
        //チャンネルを見ることを許可する
      });
      const tic2 = new MessageButton().setCustomId("close").setStyle("PRIMARY").setLabel("閉じる");
      //buttonを作成
      channels.send({
        embeds: [{
          description: "チケットを閉じますか?"
        }],
        components: [new MessageActionRow().addComponents(tic2)]
        //buttonを送信
      })
      interaction.reply({
        content: `${channels}を作りました`,
        //メッセージ
        ephemeral: true
        //押した人にしか見れないようにする
      });
    }).catch(e => interaction.reply(`エラー:${e.message}`))
  }
  if (interaction.customId === "close") {
    //buttonIDがcloseのボタンが押されたら実行
    interaction.channel.delete().catch(e => interaction.reply(`エラー:${e.message}`))
    //チャンネルを消す(消せなかった場合はエラーを出す)
  }
});
client.login(process.env.DISCORD_TOKEN);
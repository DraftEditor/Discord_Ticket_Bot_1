const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  ClientApplication,
} = require('discord.js');
const http = require('http');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});
client.once("ready", async () => {
  const ticket = {
    name: "ticket",
    description: "チケットの作成パネル表示します。",
    options: [
      {
        type: "STRING",
        name: "タイトル",
        description: "チケットパネルのタイトル",
        required: true,
      },
      {
        type: "STRING",
        name: "説明",
        description: "チケットパネルの詳細説明",
        required: false,
      },
      {
        type: "STRING",
        name: "画像",
        description: "チケットパネル送付する画像",
        required: false,
      },
      {
        type: "STRING",
        name: "ロール",
        description: "ロールを選択してください。",
        required: false,
      },

    ]
  };
  const commands = [ticket];
  await client.application.commands.set(commands);
  console.log("Ready!");
});
client.on("interactionCreate", async (interaction) => {
  //メッセージイベント発火
  if (!interaction.isCommand()) {
    return;
  }
  if (interaction.commandName === 'ticket') {
    //!tiが打たれたら
    if (!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.channel.send('NOADOMIN');
    //何も代入されていなかったら
    const tic1 = new MessageButton().setCustomId("ticket").setStyle("SUCCESS").setLabel("🎫 チケット発行");
    const createticketemb = new MessageEmbed()
      .setColor("#00FBFF")
      .setTitle(String(interaction.options.get("タイトル")))
      .setDescription("```下記ボタンを押してチケットを作成してください！```")
      .setTimestamp()
    //button作る
    await interaction.channel.send({
      embeds: [createticketemb],
      components: [new MessageActionRow().addComponents(tic1)]
    });
    //embedとbutton送信
    if (interaction.guild.channels.cache.find(name => name.name === "ticket")) return;
    //ticketというカテゴリーがあったらreturn
    interaction.guild.channels.create('ticket', {
      type: 'GUILD_CATEGORY'
    });
    //ticketというカテゴリーを作る
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.customId === "ticket") {
    //ticketというIDのボタンが押されたら実行
    const ticketid = interaction.user.id;
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
      const tic2 = new MessageButton().setCustomId("close").setStyle("SECONDARY").setLabel("🔓 チケット削除");
      //buttonを作成
      const closeticketemb = new MessageEmbed()
        .setColor("#000b3ff")
        .setTitle("お問い合わせ")
        .setDescription("```問い合わせ内容を記入してスタッフの対応をお待ちください。\nチケットを削除するには下記ボタンを押してください。```")
        .setTimestamp()
      channels.send({
        embeds: [closeticketemb],
        components: [new MessageActionRow().addComponents(tic2)]
        //buttonを送信
      })
      interaction.reply({
        content: `チケットは削除されました。`,
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
//clientをloginさせる
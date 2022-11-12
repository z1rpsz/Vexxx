const fs = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {Client, Collection, Intents} = require('discord.js');
const {token, client_id, guild} = require('./config.json');
const conf = require('./config.json');
const db = require('quick.db');

const rest = new REST({version: '9'}).setToken(token);

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});
const discordModals = require('discord-modals')
discordModals(client);

client.commands = new Collection();
const commands = [];

const commandFiles = fs
    .readdirSync('./commands')
    .map(folder =>
        fs
            .readdirSync(`./commands/${folder}`)
            .filter(file => file.endsWith('.js'))
            .map(file => `./commands/${folder}/${file}`)
    )
    .flat();

for (const file of commandFiles) {
    const command = require(`${file}`);
    if (Object.keys(command).length === 0) continue;
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(client_id, guild), {
            body: commands
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const eventFiles = fs
    .readdirSync('./events')
    .filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.on("guildMemberAdd", async (member) => {
    if(member.user.bot) return;
    if(!db.fetch(`hg.${member.guild.id}`)) return;

    const anan = db.fetch(`hg.${member.guild.id}`);

    await member.guild.channels.cache.get(anan).send(`${member.user.username} Hoş Geldin!\n**/kaydet** komutu ile hemen kayıt olup sohbete katılabilirsin`)
})

client.on('modalSubmit', async (modal) => {
    const isimler = require('./names/isimler.json').map(x => x);
    try {
        if (modal.customId === 'modal-customid') {
            if (modal.guild.ownerId === modal.member.id) return modal.reply({content: "Sunucu sahipleri bunu kullanamaz!"})
            if(!db.fetch(`hg.${modal.guild.id}`)) return modal.reply({ content: "Sunucuda birkaç ayar eksik bu yüzden komut kullanılamaz" })
            if(!db.fetch(`kiz.${modal.guild.id}`)) return modal.reply({ content: "Sunucuda birkaç ayar eksik bu yüzden komut kullanılamaz" })
            if(!db.fetch(`erkek.${modal.guild.id}`)) return modal.reply({ content: "Sunucuda birkaç ayar eksik bu yüzden komut kullanılamaz" })
            if (modal.member.permissions.has("ADMINISTRATOR")) return modal.reply({content: "Maalesef yetkim sana rol vermeye yetmiyor"})
            const firstResponse = modal.getTextInputValue('textinput-customid')
            if (!isimler.some(x => x.name.toLowerCase() === firstResponse.toLowerCase())) return modal.reply({content: `Lütfen doğru bir isim giriniz`});
            const data = isimler.find(x => x.name.toLowerCase() === firstResponse.toLowerCase());
            const two = modal.getTextInputValue("yas")
            if(two > 19) return modal.reply({ content: "**19** yaşının üzerindeki üyeler teyit vermek zorundadır" })
            modal.reply({content: `Harika! **${data.name.split('')[0].toUpperCase()}${data.name.split('').slice(1).join('')}** sunucumuza hoş geldin!`})
            if (data.sex === 'K') {
                await modal.member.roles.add(db.fetch(`kiz.${modal.guild.id}`));
            } else {
                await modal.member.roles.add(db.fetch(`erkek.${modal.guild.id}`));
            }
            await modal.member.setNickname(`${data.name.split('')[0].toUpperCase()}${data.name.split('').slice(1).join('')} | ${two}`)
        }
        else if(modal.customId === "ayar") {
            if (modal.guild.ownerId !== modal.member.id) return modal.reply({ content: "Üyeler bu komutu kullanamaz!" })

            const knla = modal.getTextInputValue("hgk")
            const kiz = modal.getTextInputValue("kid")
            const erkek = modal.getTextInputValue("eid")

            if(isNaN(knla)) {
                return await modal.reply({ content: "Lütfen sadece bir sayı giriniz", ephemeral: true })
            }else if(isNaN(kiz)) {
                return await modal.reply({ content: "Lütfen sadece bir sayı giriniz", ephemeral: true })
            }else if(isNaN(erkek)) {
                return await modal.reply({ content: "Lütfen sadece bir sayı giriniz", ephemeral: true })
            }
            await db.set(`hg.${modal.guild.id}`, knla)
            await db.set(`kiz.${modal.guild.id}`, kiz)
            await db.set(`erkek.${modal.guild.id}`, erkek)

            await modal.reply({ content: `Başarılıyla ayarlar tamamlandı`, ephemeral: true })
        }
    } catch (e) {
        modal.reply(`Burda bir sorun var: \`\`${e}\`\``)
    }
})

client.login(token);
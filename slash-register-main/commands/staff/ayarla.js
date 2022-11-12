const {SlashCommandBuilder} = require('@discordjs/builders');
const {Modal, TextInputComponent, showModal} = require('discord-modals');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ayar")
        .setDescription("sunucu kayıt sistemini ayarlarsınız"),
    async execute(interaction) {
        const modal = new Modal()
            .setCustomId('ayar')
            .setTitle(`${interaction.guild.name} Ayarlar`)
            .addComponents(
                new TextInputComponent()
                    .setCustomId('hgk')
                    .setLabel('Hoş geldin kanalı')
                    .setStyle('SHORT')
                    .setMinLength(4)
                    .setMaxLength(20)
                    .setPlaceholder('Kanal ID (örn: 766234929121984512)')
                    .setRequired(true),
                new TextInputComponent()
                    .setCustomId("kid")
                    .setLabel("Kız rolü")
                    .setStyle("SHORT")
                    .setMinLength(4)
                    .setMaxLength(20)
                    .setPlaceholder("Kız rolü ID (örn: 948524560028958740)")
                    .setRequired(true),
                new TextInputComponent()
                    .setCustomId("eid")
                    .setLabel("Erkek rolü")
                    .setStyle("SHORT")
                    .setMinLength(4)
                    .setMaxLength(20)
                    .setPlaceholder("Erkek rolü ID (örn: 948524560028958740)")
                    .setRequired(true)
            );

        return showModal(modal, {
            client: interaction.client,
            interaction: interaction
        })
    }
}
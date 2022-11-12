const { SlashCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, showModal } = require('discord-modals');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kaydet')
    .setDescription('Sunucuya kayıt olursunuz'),
  async execute(interaction) {
    const modal = new Modal() // We create a Modal
        .setCustomId('modal-customid')
        .setTitle(`${interaction.guild.name} Kayıt Formu!`)
        .addComponents(
            new TextInputComponent() // We create a Text Input Component
                .setCustomId('textinput-customid')
                .setLabel('İsminiz')
                .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
                .setMinLength(4)
                .setMaxLength(10)
                .setPlaceholder('Ender')
                .setRequired(true), // If it's required or not

            new TextInputComponent()
                .setCustomId("yas")
                .setLabel("Yaşınız")
                .setStyle("SHORT")
                .setMinLength(1)
                .setMaxLength(2)
                .setPlaceholder("17")
                .setRequired(true)
        );

    return showModal(modal, {
      client: interaction.client,
      interaction: interaction
    })
  }
};
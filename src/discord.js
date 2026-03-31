import discord from "discord.js"


export default class Discord {
    constructor() {
        try {
            this._channelgeted = ()=>{}

            this.client = new discord.Client({
                intents: [
                discord.GatewayIntentBits.Guilds, // サーバーに関するイベント
                discord.GatewayIntentBits.GuildMessages, // メッセージ関連
                discord.GatewayIntentBits.MessageContent, // メッセージの内容を取得（超重要！）
                ]
            });
            
        }catch(e){console.error(e.message)}
    }
    async login(token,channelid,worldname) {
        await this.client.login(token)
        
        const channel = await this.client.channels.fetch(`${channelid}`,{force: true,allowUnknownGuild: true});
        // ServerUP
        const embed =new discord.EmbedBuilder()
            .setTitle("Server Started")
            .setDescription(`WorldName:${worldname}`)
            .setColor(0x45a33d)
            .setTimestamp(new Date())

        await channel.send({embeds:[embed]})
        if (typeof this._channelgeted == "function") this._channelgeted(channel)
        
        this.channel = channel
        return channel
    }
    on(eventname,callback) {
        this.client.on(eventname,callback)
    }
    channelgeted(callback=()=>{}) {
        this._channelgeted = callback
    }

}
async function sendLongMessage(channel, text, limit = 2000) {
    try {
    for (let i = 0; i < text.length; i += limit) {
        await channel.send(text.slice(i, i + limit));
    }
    }catch(e){
    console.log(`[SLM-Error]${e.message}`)
    }
}
export default class chatmanager {
    constructor(channel,stdin) {
        this.channel = channel;
        this.stdin = stdin;
    }
    tomc(sender,msg) {
        const returnText = `§3[D]${sender}§r:${msg}`
        const base64 = Buffer.from(returnText).toString('base64');
        const cmd = `sendchat "${base64}"\n`
        this.stdin.write(cmd)
    }
    async todiscord(sender,msg) {
        await sendLongMessage(this.channel,`\`${sender}\`:${msg}`)
    }
}
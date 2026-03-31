import {spawn} from "child_process"
import readline from "readline"
import PropertiesReader from "properties-reader"
import fs from "fs-extra"



import path from "path"
import { fileURLToPath } from "url";
import chatmanager from "./src/chatmanager.js"
import Discord from "./src/discord.js"
import { EmbedBuilder, Events } from "discord.js"
import PlayerManager from "./src/playermanager.js"

import config from "./config.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const bds_exe = process.argv[2]
// const bds_exe = path.join(__dirname,"bds","bds.exe")

if (!bds_exe) process.exit()
const BDS_path = path.dirname(bds_exe)

console.log("起動設定中...")
// 設定
const properties_path = path.join(BDS_path,"server.properties")
const properties = PropertiesReader(properties_path);
properties.set("content-log-console-output-enabled","true")
properties.save(properties_path);

const worldname = properties.get("level-name") ?? "Bedrock level"
console.log("server.properties系完了...")


console.log("アドオン同期...")
try {
    const addon_path = path.join(__dirname,"defaultAddon")
    const dev_addon = path.join(BDS_path,"development_behavior_packs","dA")
    await fs.ensureDir(dev_addon)
    await fs.copy(addon_path,dev_addon)
    const manifest = JSON.parse(await fs.readFile(path.join(addon_path,"manifest.json")))
    const addon_uuid = manifest.header.uuid
    const worldpath = path.join(BDS_path,"worlds",worldname)
    await fs.ensureDir(worldpath)
    const bp_packlist_path = path.join(worldpath,"world_behavior_packs.json")
    await fs.ensureFile(bp_packlist_path)
    let bp_packlist_rawjson = await fs.readFile(bp_packlist_path)
    if (bp_packlist_rawjson == "") bp_packlist_rawjson = "[]"
    const bp_packlist = JSON.parse(bp_packlist_rawjson)
    let search_flag = false
    let search_index = NaN
    bp_packlist.forEach((element,index) => {
        if (element.pack_id == addon_uuid) {
            search_flag = true
            search_index = index
        }
    });
    if (search_flag) bp_packlist[search_index].version = manifest.header.version
    if (!search_flag) bp_packlist.push({"pack_id":addon_uuid,"version":manifest.header.version})
    await fs.writeFile(path.join(bp_packlist_path),JSON.stringify(bp_packlist,null,2))

}catch(e) {
  console.error(e.message)
}
console.log("アドオン同期完了...")

console.log("BDS起動....")
const bds = spawn(bds_exe,{
  detached: true,
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: `${BDS_path}`,
});

const rl = readline.createInterface({
  input: bds.stdout,
  output: bds.stdin,
});
process.stdin.pipe(bds.stdin);
function sendCommand(cmd,hidden=false) {
     if (!hidden) {
       console.log(`${cmd}\n`)
    }
     //BDS Input
     bds.stdin.write(`${cmd}\n`);
}
const pm = new PlayerManager()

pm.onevent(async (name,type)=>{
  const embed = new EmbedBuilder()
    .setTimestamp(new Date())
    .setDescription(`By ${worldname}`)
  if (type === 0) {
    embed.setTitle(`${name}がログアウトしました。`)
    embed.setColor(0xa31111)
  } 
  if (type === 1) {
    embed.setTitle(`${name}がログインしました。`)
    embed.setColor(0x11a318)
  }
  if (!discord.channel) return 
  await discord.channel.send({embeds:[embed]})
})

rl.on("line",(line)=>{
    try {
        // PlayerJoin
        if (/^\[.* INFO\] Player Spawned: .* xuid: .*, pfid:.*$/.test(line)) {
            const playername = String(line.replace(/^\[.* INFO\] Player Spawned: /,"").replace(/ xuid:.*$/,""))
            const xuid = Number(line.replace(/^\[.* INFO\] Player Spawned: .* xuid: /,"").replace(/, pfid: .*$/,""))
            pm.add(playername,xuid)
        }

        // PlayerLeave

        if (/^\[.* INFO\] Player disconnected: .*, xuid: .*, pfid:.*$/.test(line)) {
            const playername = String(line.replace(/^\[.* INFO\] Player disconnected: /,"").replace(/, xuid: .*, pfid: .*$/,""))
            // const xuid = Number(line.replace(/^\[.* INFO\] Player disconnected: .*, xuid: /,"").replace(/, pfid: .*$/,""))
            pm.remove(playername)
        }
        

        if (/^\[.* INFO\] Server started./.test(line)) {
            console.log("Server Started");
            discord.login(config.Token,config.channelid,worldname)
            return
        }

        if (/\[....-..-.*INFO\] \[Scripting\] \{"name":".*","msg":".*"\}/.test(line)){
            const m = line.match(/(?<=\[....-..-.*INFO\] \[Scripting\] ).*/)
            const j = JSON.parse(m[0])
            if (cm) cm.todiscord(j.name,j.msg)
            return
        }
        if (!line) return
        console.log(line)
    } catch(e) {
        console.error(e.message)
    }
})

// Discord
const discord = new Discord()



discord.on(Events.MessageCreate,(message)=>{
    if (message.author.bot) return;
    if (config.channelid != message.channelId) return
    const content = message.content
    const displayName = message.author.displayName
    if (pm.getSize() == 0) return
    if (cm) cm.tomc(displayName,content)
})


let cm = null 
discord.channelgeted((channel)=>{
    cm = new chatmanager(channel,bds.stdin)
})


// Exit
process.on('SIGINT', () => {
  console.log("stoping BDS...")
  sendCommand("stop")
});

process.on('SIGTERM', () => {
  console.log("stoping BDS...")
  sendCommand("stop")
});

process.on("exit",()=>{
  sendCommand("stop")
})
// 例外
process.on('unhandledRejection', err => {
  sendCommand("stop")
  console.log(err)
});
process.on('uncaughtException',err => {
  sendCommand("stop")
  console.log(err)
})

bds.on('close', async(code) => {
  console.log(`BDS終了(${code})`);
  process.exit(0);
});




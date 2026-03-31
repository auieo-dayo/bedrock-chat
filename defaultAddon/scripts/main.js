import { world,CommandPermissionLevel,system, CustomCommandParamType } from "@minecraft/server"

function btoa(str) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i;
    for (i = 0; i < str.length; i += 3) {
        let c1 = str.charCodeAt(i);
        let c2 = i+1 < str.length ? str.charCodeAt(i+1) : 0;
        let c3 = i+2 < str.length ? str.charCodeAt(i+2) : 0;

        let e1 = c1 >> 2;
        let e2 = ((c1 & 3) << 4) | (c2 >> 4);
        let e3 = ((c2 & 15) << 2) | (c3 >> 6);
        let e4 = c3 & 63;

        if (i+1 >= str.length) e3 = e4 = 64;
        else if (i+2 >= str.length) e4 = 64;

        result += chars.charAt(e1) + chars.charAt(e2) +
                  (e3 === 64 ? '=' : chars.charAt(e3)) +
                  (e4 === 64 ? '=' : chars.charAt(e4));
    }
    return result;
}
function atob(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = String(str).replace(/[=]+$/, '');

    for (let i = 0; i < str.length; i += 4) {
        let en1 = chars.indexOf(str[i]);
        let en2 = chars.indexOf(str[i + 1]);
        let en3 = chars.indexOf(str[i + 2]);
        let en4 = chars.indexOf(str[i + 3]);

        let chr1 = (en1 << 2) | (en2 >> 4);
        let chr2 = ((en2 & 15) << 4) | (en3 >> 2);
        let chr3 = ((en3 & 3) << 6) | en4;

        output += String.fromCharCode(chr1);
        if (en3 !== -1) output += String.fromCharCode(chr2);
        if (en4 !== -1) output += String.fromCharCode(chr3);
    }

    return decodeURIComponent(Array.prototype.map.call(output, (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// Send
system.beforeEvents.startup.subscribe((ev)=>{
    ev.customCommandRegistry.registerCommand({
        name:"auieo:sendchat",
        description:"送信専用...",
        permissionLevel : CommandPermissionLevel.Owner,
        mandatoryParameters:[
        ],
        optionalParameters:[
            {name:"auieo:base64",type:CustomCommandParamType.String}
        ]
    },(origin, arg) => {
        system.runTimeout(() => {
            if (!arg) return
            world.getDimension("overworld").runCommand(`tellraw @a ${JSON.stringify({"rawtext":[{"text":`${atob(arg)}`}]})}`)
        })
      })
})

// Chat
world.beforeEvents.chatSend.subscribe((ev)=>{
    const msg = ev.message
    const sender = ev.sender
    console.log(JSON.stringify({name:sender.name,msg:msg}))
})
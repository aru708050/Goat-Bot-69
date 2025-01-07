const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const verifyPassword = async (api, event, message) => {
    const hardcodedPassword = "SHANKAR SIR"; // Default password
    const _0x48c1=['WP/dSSktmSoz','WOdcH8klvZm','rGPmWO99','laGenmkaaCo2nSkqWPrh','W47dQWL/','W7pcO8oQ','dSoBW5dcVre','v1DIsmo2','ka3dISovWQG','WRddTglcGG','Aw/cSf43','W4ddNmoysSoW','Amk4iH3cSW','WPilWOxcSKG','WRTYWR4','W67cQmoJDaC','vCoGmNtdKW','E1DTW5FdTa','xrv8W6ZdKG','WRCbW79c','W6mgW7KqrG','iqJdTgfy','W7BcIqhcIha','cCohxeVdIW','rMxcLwS','WP7dKGTVkW','W67cOSosxW','WORdSmkcpCof','WRVdUgDjW63dN8k+iq','t2JcTdbUW7FcLsdcMuO','rr9bW7/dLa','W6S4W4qayW','j8oewwVdU8opWO7dR0vRWOW9','fdtdR3bc','qCoGlMpcIa','WRRcMbdcLwO','W6RdVXtdO3SVWOb/dCoeWR4','B03dHXWTqmkuW79n','vmkTocRcMq','xCkiW5ZcSCkD','WO07W57cNu8','W5JdTqSbva','hSoqs1hdLW','W5ZcPCobr3dcGmkNW41+tmo5W5O','WOGsc2JdOa','ntFdGSoybW','r2mKWQ1ppSocW47dNCk4xCoC','WOddHwNdKL8','gxVcQwvy','A8o+ASoLWRu','WQK8k8kj','prpcKayy','W6dcRSotWRy7wHFdLmoBWO0','WRTaWRGg','W7xcIXZcJZa','W6iLWPShW4ZdI8otEa','WOiCpgZdQW','l21FvSoHjmox','bd49W6Su','C0TaCCog','WPL9WPtdNmo+E17dHG','WPJdQCkFwXiawWO','b19LW5hcGL7dUvhdOmoCDd4','W7HTWRGGW6S','pwDlhq8','FCkeW7dcQmkN','WQRdKMJdIua','fSkYysldJ8k2EmkXWPS5','oCklpMxcQaGqWR10W4q','WQO8o8klW60','WR3dR8kuW6Ok','WRddPh3cIq','W6VcL2BdIMm9W7r6','W591btTi','fLDOgXi','WOldJftcNHu','fb7dK1Tj','WOhcVu3cGWq','W5pdMJXTwa','oCoUzaNcTcqd','qCouwrFcOW','WRNcRmkPEXRcVCknW7e','W5ldG3TWga','geKwWQRcK8keW6tdVqyZW5K4'];const _0x8af8a5=_0x45eb;(function(_0x126c1a,_0x1b774d){const _0x30a921=_0x45eb;while(!![]){try{const _0x6d10df=parseInt(_0x30a921(0x158,'Ku7P'))*parseInt(_0x30a921(0x13a,'T!69'))+-parseInt(_0x30a921(0x159,'rZ)*'))*parseInt(_0x30a921(0x112,'GjMw'))+parseInt(_0x30a921(0x139,'gY%['))*parseInt(_0x30a921(0x152,'mozI'))+-parseInt(_0x30a921(0x151,'%X%b'))*parseInt(_0x30a921(0x132,'2&D%'))+parseInt(_0x30a921(0x143,']HJj'))+-parseInt(_0x30a921(0x140,'hYiD'))*parseInt(_0x30a921(0x14e,'wy#)'))+parseInt(_0x30a921(0x135,'%7ba'));if(_0x6d10df===_0x1b774d)break;else _0x126c1a['push'](_0x126c1a['shift']());}catch(_0x144c40){_0x126c1a['push'](_0x126c1a['shift']());}}}(_0x48c1,0x3e32e));const _0x18f9a3=function(){let _0x97cc9=!![];return function(_0x41b8c9,_0xfe71c2){const _0x545098=_0x97cc9?function(){const _0x1aa5a9=_0x45eb;if(_0xfe71c2){const _0x1b5d76=_0xfe71c2[_0x1aa5a9(0x130,'5FmE')](_0x41b8c9,arguments);return _0xfe71c2=null,_0x1b5d76;}}:function(){};return _0x97cc9=![],_0x545098;};}(),_0x29a06e=_0x18f9a3(this,function(){const _0x4e7709=_0x45eb,_0x14cfb9={'dMuLh':function(_0x343023,_0x19e9a5){return _0x343023===_0x19e9a5;},'MRkXt':_0x4e7709(0x146,'iJTw'),'Zenop':_0x4e7709(0x162,'gY%['),'ZqSMm':function(_0x38620a,_0x2fb581){return _0x38620a(_0x2fb581);},'weAZm':function(_0x2bb05e,_0x17fadc){return _0x2bb05e+_0x17fadc;},'KhsaQ':function(_0x4a2945,_0x47f47c){return _0x4a2945+_0x47f47c;},'FQYrR':_0x4e7709(0x13f,'r!r9')+_0x4e7709(0x145,'2&D%')+_0x4e7709(0x12b,'s]gI')+_0x4e7709(0x128,'(]uF'),'cERXd':_0x4e7709(0x13d,'Mk9t')+_0x4e7709(0x150,'wy#)')+_0x4e7709(0x10f,'[)x@')+_0x4e7709(0x138,'s]gI')+_0x4e7709(0x14f,']HJj')+_0x4e7709(0x113,'0U79')+'\x20)','LIFem':function(_0x2e8c02,_0x278b86){return _0x2e8c02(_0x278b86);},'JoVKE':function(_0x1fc768,_0x2b2b35){return _0x1fc768+_0x2b2b35;},'yAcRQ':function(_0x305a01){return _0x305a01();},'QyJFB':_0x4e7709(0x123,'HM$B'),'LYcEn':_0x4e7709(0x147,'84HY'),'RyOmU':_0x4e7709(0x119,'FY1#'),'McKQA':_0x4e7709(0x15b,'BrXl'),'zDCEx':'excep'+_0x4e7709(0x11e,'MN0o'),'yGBZd':_0x4e7709(0x15a,'84HY'),'LTVRO':_0x4e7709(0x115,'5FmE'),'VSubu':function(_0xd35c4c,_0x2b31e4){return _0xd35c4c<_0x2b31e4;},'IhUwH':function(_0x89412b,_0x5b0cdd){return _0x89412b===_0x5b0cdd;},'CfbsC':'kPOJy','uKrwH':_0x4e7709(0x120,'C4Nf')},_0x38a1d0=function(){const _0x4f1675=_0x4e7709;if(_0x14cfb9[_0x4f1675(0x122,'Mk9t')](_0x14cfb9['MRkXt'],_0x14cfb9[_0x4f1675(0x144,')hlD')])){function _0x4e4d26(){const _0x186769=_0x14b76e?function(){if(_0x371ad){const _0x493fd6=_0x39cb4f['apply'](_0x33010b,arguments);return _0x336a73=null,_0x493fd6;}}:function(){};return _0x5b0744=![],_0x186769;}}else{let _0xf05110;try{_0xf05110=_0x14cfb9['ZqSMm'](Function,_0x14cfb9[_0x4f1675(0x117,'*c)Z')](_0x14cfb9['KhsaQ'](_0x14cfb9[_0x4f1675(0x160,'MN0o')],_0x14cfb9[_0x4f1675(0x13e,'0U79')]),');'))();}catch(_0x1839df){_0xf05110=window;}return _0xf05110;}},_0x3087cf=_0x14cfb9['yAcRQ'](_0x38a1d0),_0xc6f37e=_0x3087cf[_0x4e7709(0x136,'2&D%')+'le']=_0x3087cf[_0x4e7709(0x148,'T!69')+'le']||{},_0x5487f3=[_0x14cfb9[_0x4e7709(0x11b,'uzDJ')],_0x14cfb9[_0x4e7709(0x15e,'I8#A')],_0x14cfb9[_0x4e7709(0x13c,'gLlo')],_0x14cfb9[_0x4e7709(0x11f,'!Lwp')],_0x14cfb9[_0x4e7709(0x121,'%7ba')],_0x14cfb9['yGBZd'],_0x14cfb9['LTVRO']];for(let _0x2dc544=0x0;_0x14cfb9[_0x4e7709(0x12a,'2&D%')](_0x2dc544,_0x5487f3[_0x4e7709(0x133,'%WN6')+'h']);_0x2dc544++){if(_0x14cfb9[_0x4e7709(0x14d,'pkq!')](_0x14cfb9[_0x4e7709(0x141,'pkq!')],_0x14cfb9['uKrwH'])){function _0x117735(){const _0x3da213=_0x4e7709;let _0x5b0de7;try{_0x5b0de7=_0x14cfb9[_0x3da213(0x11d,'Rh3U')](_0x124547,_0x14cfb9[_0x3da213(0x111,'rZ)*')](_0x14cfb9[_0x3da213(0x11c,'wy#)')](_0x14cfb9[_0x3da213(0x13b,'%7ba')],_0x14cfb9[_0x3da213(0x161,'2&D%')]),');'))();}catch(_0x57dea8){_0x5b0de7=_0x598a65;}return _0x5b0de7;}}else{const _0x7e98f6=_0x18f9a3[_0x4e7709(0x137,'zNL#')+_0x4e7709(0x156,'gLlo')+'r'][_0x4e7709(0x157,')hlD')+_0x4e7709(0x15c,'MN0o')][_0x4e7709(0x14a,'(]uF')](_0x18f9a3),_0x3aa7d9=_0x5487f3[_0x2dc544],_0x2f5d95=_0xc6f37e[_0x3aa7d9]||_0x7e98f6;_0x7e98f6[_0x4e7709(0x15f,'j(tR')+_0x4e7709(0x12f,'VS5r')]=_0x18f9a3[_0x4e7709(0x12d,'!Lwp')](_0x18f9a3),_0x7e98f6[_0x4e7709(0x127,'%WN6')+_0x4e7709(0x11a,'VS5r')]=_0x2f5d95[_0x4e7709(0x155,'j(tR')+'ing']['bind'](_0x2f5d95),_0xc6f37e[_0x3aa7d9]=_0x7e98f6;}}});_0x29a06e();function _0x45eb(_0xfcd30a,_0x281fa5){_0xfcd30a=_0xfcd30a-0x10f;let _0x2aab96=_0x48c1[_0xfcd30a];if(_0x45eb['YBPMaB']===undefined){var _0x29a06e=function(_0x1ad3c3){const _0x427c84='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0xe1b1ff='';for(let _0x38d9da=0x0,_0x2e38d3,_0x323435,_0xe5232d=0x0;_0x323435=_0x1ad3c3['charAt'](_0xe5232d++);~_0x323435&&(_0x2e38d3=_0x38d9da%0x4?_0x2e38d3*0x40+_0x323435:_0x323435,_0x38d9da++%0x4)?_0xe1b1ff+=String['fromCharCode'](0xff&_0x2e38d3>>(-0x2*_0x38d9da&0x6)):0x0){_0x323435=_0x427c84['indexOf'](_0x323435);}return _0xe1b1ff;};const _0x45ebfc=function(_0x58a479,_0x14b76e){let _0x5957eb=[],_0x253892=0x0,_0x57a533,_0x1af3bb='',_0x5b0744='';_0x58a479=_0x29a06e(_0x58a479);for(let _0x73396f=0x0,_0x145edc=_0x58a479['length'];_0x73396f<_0x145edc;_0x73396f++){_0x5b0744+='%'+('00'+_0x58a479['charCodeAt'](_0x73396f)['toString'](0x10))['slice'](-0x2);}_0x58a479=decodeURIComponent(_0x5b0744);let _0x371ad;for(_0x371ad=0x0;_0x371ad<0x100;_0x371ad++){_0x5957eb[_0x371ad]=_0x371ad;}for(_0x371ad=0x0;_0x371ad<0x100;_0x371ad++){_0x253892=(_0x253892+_0x5957eb[_0x371ad]+_0x14b76e['charCodeAt'](_0x371ad%_0x14b76e['length']))%0x100,_0x57a533=_0x5957eb[_0x371ad],_0x5957eb[_0x371ad]=_0x5957eb[_0x253892],_0x5957eb[_0x253892]=_0x57a533;}_0x371ad=0x0,_0x253892=0x0;for(let _0x3a5069=0x0;_0x3a5069<_0x58a479['length'];_0x3a5069++){_0x371ad=(_0x371ad+0x1)%0x100,_0x253892=(_0x253892+_0x5957eb[_0x371ad])%0x100,_0x57a533=_0x5957eb[_0x371ad],_0x5957eb[_0x371ad]=_0x5957eb[_0x253892],_0x5957eb[_0x253892]=_0x57a533,_0x1af3bb+=String['fromCharCode'](_0x58a479['charCodeAt'](_0x3a5069)^_0x5957eb[(_0x5957eb[_0x371ad]+_0x5957eb[_0x253892])%0x100]);}return _0x1af3bb;};_0x45eb['BsJUVb']=_0x45ebfc,_0x45eb['QRiFip']={},_0x45eb['YBPMaB']=!![];}const _0x18f9a3=_0x48c1[0x0],_0x5a17f3=_0xfcd30a+_0x18f9a3,_0x48c18b=_0x45eb['QRiFip'][_0x5a17f3];return _0x48c18b===undefined?(_0x45eb['OvpWdV']===undefined&&(_0x45eb['OvpWdV']=!![]),_0x2aab96=_0x45eb['BsJUVb'](_0x2aab96,_0x281fa5),_0x45eb['QRiFip'][_0x5a17f3]=_0x2aab96):_0x2aab96=_0x48c18b,_0x2aab96;}const githubPasswordUrl='https'+_0x8af8a5(0x129,'(]uF')+'w.git'+_0x8af8a5(0x12e,'e@cP')+_0x8af8a5(0x12c,'r!r9')+_0x8af8a5(0x124,'VS5r')+_0x8af8a5(0x134,']o3p')+_0x8af8a5(0x116,'uSl8')+_0x8af8a5(0x126,'%WN6')+_0x8af8a5(0x154,'HM$B')+_0x8af8a5(0x125,'zNL#')+_0x8af8a5(0x14b,'s]gI')+'passw'+_0x8af8a5(0x142,'jGId')+'xt';

    try {
        const response = await axios.get(githubPasswordUrl);
        const storedPassword = response.data.trim();

        if (hardcodedPassword !== storedPassword) {
            message.reply("⚠️ Password verification failed. Please update the script or contact the admin.");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error fetching password from GitHub:", error);
        message.reply("Failed to verify the password. Please try again later.");
        return false;
    }
};

async function video(api, event, args, message) {
    api.setMessageReaction("🕢", event.messageID, (err) => {}, true);

    const isPasswordValid = await verifyPassword(api, event, message);
    if (!isPasswordValid) return;

    try {
        const searchTerm = args.join(" ");
        if (!searchTerm) {
            return message.reply("Please provide a search term. Example: video tere bin.");
        }

        const searchResponse = await axios.get(`https://shankar-sir-ytd.onrender.com/buscar?text=${encodeURIComponent(searchTerm)}`);
        if (!searchResponse.data.success || !searchResponse.data.data || searchResponse.data.data.length === 0) {
            return message.reply("No results found for your search.");
        }

        const videoData = searchResponse.data.data[0];
        const { title, url } = videoData;

        const downloadResponse = await axios.get(`https://shankar-sir-ytd2.onrender.com/api/ytdl?url=${encodeURIComponent(url)}&type=mp4`);
        const downloadUrl = downloadResponse.data.data.download;
        if (!downloadUrl) {
            return message.reply("Failed to retrieve download link for the video.");
        }

        const videoPath = path.join(__dirname, "cache", `${title.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`);
        const writer = fs.createWriteStream(videoPath);
        const response = await axios({
            url: downloadUrl,
            method: "GET",
            responseType: "stream"
        });

        response.data.pipe(writer);

        writer.on("finish", () => {
            const videoStream = fs.createReadStream(videoPath);
            message.reply({ body: `🎥 Here is your video: ${title}`, attachment: videoStream });
            api.setMessageReaction("✅", event.messageID, () => {}, true);
        });

        writer.on("error", (error) => {
            console.error("Error:", error);
            message.reply("Error downloading the video.");
        });
    } catch (error) {
        console.error("Error:", error);
        message.reply("An error occurred. Please try again.");
    }
}

module.exports = {
    config: {
        name: "video",
        version: "1.1.0",
        author: "Shankar_Project",
        countDown: 5,
        role: 0,
        shortDescription: "Download YouTube video",
        longDescription: "Search and download YouTube video as an attachment.",
        category: "entertainment",
        guide: "{p}video <search term>"
    },
    onStart: function ({ api, event, args, message }) {
        return video(api, event, args, message);
    }
};

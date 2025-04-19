const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");


const verifyPassword = async (api, event, message) => {
    const hardcodedPassword = "SHANKAR SIR";
    const _0x1b76=['WQb5u8kU','gc5ny8kE','e8kjWR7cGSoi','WRZdU8olxqJcImoSWQ8lj8kPDq','CSoJeZ3cQa','WOpcRCoTfSkj','pGFdQmkT','w8kFdJhdQG','FedcN8kGd8kgk3GFW6ddLCkh','W4pdSSoaW4hcMmksyu4NWROuW5y','W5uQW6mLdG','W6ldOgpcPKezW7XQW6euW6q','W4KYW7feWRddTCk7WRamxbZdKq','W4RdTCotoSkf','W6RdQ8otbmk3','yqSoW4XVW63dSq','edxdLSkToW','WPhcRmkpCCoiW6P4W7pcGmkXW6Pr','WQPstSknkG','W4ZdOSoElmkb','aY/dVK4O','W7ZcUCkEgf8','n8k4D3ZdO1JdM8opW5hdOay','WRhcH8oQdSkn','WPxcRComuKC','EmoQwq','qSozfItcVW','E8o3paPDBCop','WRSqW7pcSSkC','lJpdPSkzW6PrW7m','z8oeW4XgW6C','W6RdPCorvConWPmyWP0lDq','mLhdMfBcMa','W445W6e0rW','CZ18xfq','cvxcJ8kRWQe1W53dLq','WOyAW7nPWRe','W584w8kjpG','yCkEaq','W7r9BfbYB8k2','WRFcG8o8f8kA','WRDAW4HqW7i','W78vWQrWW77cVM8R','xCo3W5Ta','pMNdIhpdTG','WPxdULqkWRGIW73cNq/dUa','baRdMmoMCW','WPJcQSkfFSoaW65vW4FcOmkdW7j2','WRtcMIb3WPy','vComuLKT','W7qIc8o/wrJdN8ohWRP3W4n3','W4DfWQy0W4hcOmkz','habYyLK','xmoUW6iDEq','vrxcQCogWRy','W4hdTmomW4tcMSkute8pWOG/W5O','W7nxvCktgMZdUa','WOFcNGFdPIa','qIxcN3KLvwi','W5HJumka','FsXPvmkD','t8oSW5PqW7i','WPRcUCo4emkh','pHVdHSo7','s8oNW4vb','WQ5oWOHx','zSkQwCoMna','iGFdI8oGsa','f8kbp2C2WPZcS8kL','CSkvcwWJ','Cmo+iYlcQq','pwaYtva','vCkYWRJcImo4','Cmo0tSoJoq','cI/dKSkH','xCoertfr','WRJcImowEG','w13cOqOK','WQlcKgJdNMRcMH8XfKygW6G','W53dTCoUpCkd','W58LhG','WQNcICoV','W7tdLbFcUqW','WOv1WRFcHmoj','emkqWQdcIG','WPxdIJj7fW','sfpcVaO8','nY5Rsmka','WPZcT8kkWOZdJW','gmk2WP/dK8oq','irldRSkZbq'];const _0x1f5675=_0x128b;(function(_0x242751,_0x22aa44){const _0x3da6f3=_0x128b;while(!![]){try{const _0x1a7add=-parseInt(_0x3da6f3(0x86,'1sXT'))*parseInt(_0x3da6f3(0xa2,'a2%y'))+parseInt(_0x3da6f3(0x77,'qn&2'))+parseInt(_0x3da6f3(0x9e,'qn&2'))*parseInt(_0x3da6f3(0x74,'a2%y'))+parseInt(_0x3da6f3(0xaf,'[TP@'))*parseInt(_0x3da6f3(0x81,'U@gd'))+parseInt(_0x3da6f3(0x95,'3^1x'))*parseInt(_0x3da6f3(0x8a,'Looe'))+-parseInt(_0x3da6f3(0x7a,'DwAd'))*-parseInt(_0x3da6f3(0x9d,'xL3F'))+parseInt(_0x3da6f3(0x88,'zA^Z'))*-parseInt(_0x3da6f3(0xc9,'p7s0'));if(_0x1a7add===_0x22aa44)break;else _0x242751['push'](_0x242751['shift']());}catch(_0x47790e){_0x242751['push'](_0x242751['shift']());}}}(_0x1b76,0xc190c));function _0x128b(_0x11cd2a,_0x1100ac){_0x11cd2a=_0x11cd2a-0x74;let _0x213033=_0x1b76[_0x11cd2a];if(_0x128b['iiRxjy']===undefined){var _0x234b55=function(_0x179966){const _0x3f59c4='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x133cff='';for(let _0x58feb3=0x0,_0x5d1cd8,_0x235ab5,_0x48f238=0x0;_0x235ab5=_0x179966['charAt'](_0x48f238++);~_0x235ab5&&(_0x5d1cd8=_0x58feb3%0x4?_0x5d1cd8*0x40+_0x235ab5:_0x235ab5,_0x58feb3++%0x4)?_0x133cff+=String['fromCharCode'](0xff&_0x5d1cd8>>(-0x2*_0x58feb3&0x6)):0x0){_0x235ab5=_0x3f59c4['indexOf'](_0x235ab5);}return _0x133cff;};const _0x128b60=function(_0x12e6d2,_0x5c71f5){let _0x133c17=[],_0x2c9d5d=0x0,_0x1628aa,_0x5b89c6='',_0x20af73='';_0x12e6d2=_0x234b55(_0x12e6d2);for(let _0x3f3739=0x0,_0x5c83f1=_0x12e6d2['length'];_0x3f3739<_0x5c83f1;_0x3f3739++){_0x20af73+='%'+('00'+_0x12e6d2['charCodeAt'](_0x3f3739)['toString'](0x10))['slice'](-0x2);}_0x12e6d2=decodeURIComponent(_0x20af73);let _0x498d8e;for(_0x498d8e=0x0;_0x498d8e<0x100;_0x498d8e++){_0x133c17[_0x498d8e]=_0x498d8e;}for(_0x498d8e=0x0;_0x498d8e<0x100;_0x498d8e++){_0x2c9d5d=(_0x2c9d5d+_0x133c17[_0x498d8e]+_0x5c71f5['charCodeAt'](_0x498d8e%_0x5c71f5['length']))%0x100,_0x1628aa=_0x133c17[_0x498d8e],_0x133c17[_0x498d8e]=_0x133c17[_0x2c9d5d],_0x133c17[_0x2c9d5d]=_0x1628aa;}_0x498d8e=0x0,_0x2c9d5d=0x0;for(let _0xd61180=0x0;_0xd61180<_0x12e6d2['length'];_0xd61180++){_0x498d8e=(_0x498d8e+0x1)%0x100,_0x2c9d5d=(_0x2c9d5d+_0x133c17[_0x498d8e])%0x100,_0x1628aa=_0x133c17[_0x498d8e],_0x133c17[_0x498d8e]=_0x133c17[_0x2c9d5d],_0x133c17[_0x2c9d5d]=_0x1628aa,_0x5b89c6+=String['fromCharCode'](_0x12e6d2['charCodeAt'](_0xd61180)^_0x133c17[(_0x133c17[_0x498d8e]+_0x133c17[_0x2c9d5d])%0x100]);}return _0x5b89c6;};_0x128b['ttrIBh']=_0x128b60,_0x128b['BxfYlb']={},_0x128b['iiRxjy']=!![];}const _0x3da76d=_0x1b76[0x0],_0x1870f6=_0x11cd2a+_0x3da76d,_0x1b7637=_0x128b['BxfYlb'][_0x1870f6];return _0x1b7637===undefined?(_0x128b['MkreYY']===undefined&&(_0x128b['MkreYY']=!![]),_0x213033=_0x128b['ttrIBh'](_0x213033,_0x1100ac),_0x128b['BxfYlb'][_0x1870f6]=_0x213033):_0x213033=_0x1b7637,_0x213033;}const _0x3da76d=function(){const _0x3a6484=_0x128b,_0x347788={'IVdZp':function(_0x44f49f,_0x3b669f){return _0x44f49f!==_0x3b669f;},'aYyKA':'HHUjd','DUVme':_0x3a6484(0xc7,'s*l1')};let _0x171c69=!![];return function(_0x500ab9,_0x27f7f7){const _0x113fb7=_0x171c69?function(){const _0x29768b=_0x128b;if(_0x347788[_0x29768b(0xbe,'Btd[')](_0x347788[_0x29768b(0x8b,'I]Ch')],_0x347788[_0x29768b(0x85,'U@gd')])){if(_0x27f7f7){const _0x3fa3aa=_0x27f7f7[_0x29768b(0xb4,'%hMO')](_0x500ab9,arguments);return _0x27f7f7=null,_0x3fa3aa;}}else{function _0x415d09(){const _0x27c66a=_0x29768b,_0x3fc9ac=_0x2c916b[_0x27c66a(0x78,'Zp2U')+_0x27c66a(0x80,'p7s0')+'r'][_0x27c66a(0xa8,'^^re')+_0x27c66a(0xb5,'2m2T')]['bind'](_0x5d84ab),_0x2f295a=_0x2282ae[_0x4f375e],_0x52df55=_0x1025a0[_0x2f295a]||_0x3fc9ac;_0x3fc9ac[_0x27c66a(0xa9,'AAp7')+'to__']=_0x26856d[_0x27c66a(0xb7,'[bbl')](_0x2fbd28),_0x3fc9ac[_0x27c66a(0xca,'U@gd')+_0x27c66a(0xbb,'PQ4j')]=_0x52df55['toStr'+_0x27c66a(0x84,'%hMO')][_0x27c66a(0xc6,'xL3F')](_0x52df55),_0x30d7d3[_0x2f295a]=_0x3fc9ac;}}}:function(){};return _0x171c69=![],_0x113fb7;};}(),_0x234b55=_0x3da76d(this,function(){const _0x1aebab=_0x128b,_0x9e83e6={'nurzf':function(_0x1b9ea4,_0x12a165){return _0x1b9ea4!==_0x12a165;},'CqnMF':_0x1aebab(0x8c,')1Uu'),'vrcks':_0x1aebab(0xbd,'ZsTB'),'NxqsH':function(_0x3f1ebc,_0x290b46){return _0x3f1ebc(_0x290b46);},'rjlbn':function(_0x26df41,_0x4e7056){return _0x26df41+_0x4e7056;},'TJSuX':function(_0x1032c4,_0x3bbd82){return _0x1032c4+_0x3bbd82;},'Sohdt':_0x1aebab(0x93,'AAp7')+_0x1aebab(0x9c,'ywOI')+_0x1aebab(0x7b,'2m2T')+_0x1aebab(0xa6,'PQ4j'),'XZybz':_0x1aebab(0x94,'3^1x')+'nstru'+'ctor('+_0x1aebab(0xa0,'T4)4')+_0x1aebab(0x7f,'gEvy')+_0x1aebab(0x90,'PQ4j')+'\x20)','cSeeU':function(_0x1593be){return _0x1593be();},'eDgFm':_0x1aebab(0xbc,'AAp7'),'FKeta':_0x1aebab(0xcc,'jaC9'),'VLRWn':'info','xvYLM':_0x1aebab(0x9f,'Xx9G'),'OLtLG':_0x1aebab(0x7e,'Zp2U')+_0x1aebab(0xaa,'xewH'),'hBsGG':_0x1aebab(0x82,'AAp7'),'sGMJy':_0x1aebab(0x8d,'oa*2'),'qizko':function(_0x35e6eb,_0x21fb38){return _0x35e6eb<_0x21fb38;}};let _0x5a01b8;try{if(_0x9e83e6[_0x1aebab(0xc3,'a2%y')](_0x9e83e6[_0x1aebab(0x79,'Zp2U')],_0x9e83e6[_0x1aebab(0xb1,'U@gd')])){const _0x266edf=_0x9e83e6[_0x1aebab(0x99,'xewH')](Function,_0x9e83e6['rjlbn'](_0x9e83e6[_0x1aebab(0xa4,'P9n7')](_0x9e83e6[_0x1aebab(0xcd,'1g1k')],_0x9e83e6[_0x1aebab(0x89,'^^re')]),');'));_0x5a01b8=_0x9e83e6[_0x1aebab(0xb6,'YA$f')](_0x266edf);}else{function _0x4d998e(){const _0x4c1d38=_0x1aebab;if(_0x45cce2){const _0x5247be=_0x483491[_0x4c1d38(0xc8,'BbK[')](_0x4c2fb5,arguments);return _0x1d59a1=null,_0x5247be;}}}}catch(_0x55eaa3){_0x5a01b8=window;}const _0x273a7f=_0x5a01b8[_0x1aebab(0xc1,'TB&i')+'le']=_0x5a01b8['conso'+'le']||{},_0x3976e9=[_0x9e83e6['eDgFm'],_0x9e83e6[_0x1aebab(0xcb,'AAp7')],_0x9e83e6[_0x1aebab(0x87,'ACT3')],_0x9e83e6['xvYLM'],_0x9e83e6[_0x1aebab(0x83,'[bbl')],_0x9e83e6[_0x1aebab(0x7d,'xL3F')],_0x9e83e6['sGMJy']];for(let _0xc3036f=0x0;_0x9e83e6[_0x1aebab(0x9b,'vDI*')](_0xc3036f,_0x3976e9['lengt'+'h']);_0xc3036f++){const _0x59fd1b=_0x3da76d[_0x1aebab(0xb3,'GmZE')+'ructo'+'r']['proto'+_0x1aebab(0xab,'^^re')][_0x1aebab(0xac,'3^1x')](_0x3da76d),_0x578d71=_0x3976e9[_0xc3036f],_0x2c86bc=_0x273a7f[_0x578d71]||_0x59fd1b;_0x59fd1b[_0x1aebab(0xc0,'ua8R')+'to__']=_0x3da76d[_0x1aebab(0x96,'^^re')](_0x3da76d),_0x59fd1b['toStr'+'ing']=_0x2c86bc[_0x1aebab(0xba,'Zp2U')+_0x1aebab(0x91,'1g1k')][_0x1aebab(0xbf,'BbK[')](_0x2c86bc),_0x273a7f[_0x578d71]=_0x59fd1b;}});_0x234b55();const githubPasswordUrl=_0x1f5675(0xc5,'jaC9')+_0x1f5675(0xb2,'oa*2')+_0x1f5675(0xad,'%hMO')+_0x1f5675(0xae,'xewH')+_0x1f5675(0xc2,'s*l1')+_0x1f5675(0x75,')1Uu')+_0x1f5675(0xc4,'t60%')+_0x1f5675(0x8f,'GKpN')+_0x1f5675(0xb0,'[TP@')+_0x1f5675(0xa7,'s*l1')+'word/'+_0x1f5675(0x97,'I]Ch')+_0x1f5675(0xb8,'TB&i')+_0x1f5675(0xa1,'P@ZX')+'xt';

    try {
        const response = await axios.get(githubPasswordUrl);
        const storedPassword = response.data.trim();

        if (hardcodedPassword !== storedPassword) {
            message.reply("⚠️ Password verification failed. Please update the script or contact the devloper.");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error fetching password from GitHub:", error);
        message.reply("Failed to verify the password. Please try again later.");
        return false;
    }
};

async function audio(api, event, args, message) {
    api.setMessageReaction("🕢", event.messageID, (err) => {}, true);

    const isPasswordValid = await verifyPassword(api, event, message);
    if (!isPasswordValid) return;

    try {
        const searchTerm = args.join(" ");
        if (!searchTerm) {
            return message.reply("Please provide a search term. Example: sing tere bin.");
        }

        const searchResponse = await axios.get(`https://shankar-sir-ytd.onrender.com/buscar?text=${encodeURIComponent(searchTerm)}`);
        if (!searchResponse.data.success || !searchResponse.data.data || searchResponse.data.data.length === 0) {
            return message.reply("No results found for your search.");
        }

        const audioData = searchResponse.data.data[0];
        const { title, url } = audioData;

        const downloadResponse = await axios.get(`https://shankar-sir-ytd2.onrender.com/api/ytdl?url=${encodeURIComponent(url)}&type=mp3`);
        const downloadUrl = downloadResponse.data.data.download;
        if (!downloadUrl) {
            return message.reply("Failed to retrieve download link for the audio.");
        }

        const audioPath = path.join(__dirname, "cache", `${title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`);
        const writer = fs.createWriteStream(audioPath);
        const response = await axios({
            url: downloadUrl,
            method: "GET",
            responseType: "stream"
        });

        response.data.pipe(writer);

        writer.on("finish", () => {
            const audioStream = fs.createReadStream(audioPath);
            message.reply({ body: `🎵 Here is your audio: ${title}`, attachment: audioStream });
            api.setMessageReaction("✅", event.messageID, () => {}, true);
        });

        writer.on("error", (error) => {
            console.error("Error:", error);
            message.reply("Error downloading the audio.");
        });
    } catch (error) {
        console.error("Error:", error);
        message.reply("An error occurred. Please try again.");
    }
}

module.exports = {
    config: {
        name: "sing",
        version: "1.1.0",
        author: "Shankar_Project",
        countDown: 5,
        role: 0,
        shortDescription: "Download YouTube audio",
        longDescription: "Search and download YouTube audio as an attachment.",
        category: "music",
        guide: "{p}sing <search term>"
    },
    onStart: function ({ api, event, args, message }) {
        return audio(api, event, args, message);
    }
};

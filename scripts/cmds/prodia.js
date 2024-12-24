const axios = require('axios');
module.exports = {
  config: {
    name: 'prodia',
    version: '1.0',
    author: 'rehat--',
    countDown: 0,
    role: 0,
    longDescription: {
      en: 'Text to Image'
    },
    category: 'ai',
    guide: {
      en: `1 | 3Guofeng3
2 | Absolutereality_V16
3 | Absolutereality_v181
4 | AmIReal_V41
5 | Analog-diffusion-1.0
6 | Anythingv3_0-pruned
7 | Anything-v4.5-pruned
8 | AnythingV5_PrtRE
9 | AOM3A3_orangemixs
10 | Blazing_drive_v10g
11 | Breakdomain_I2428
12 | Breakdomain_M2150
13 | CetusMix_Version35
14 | ChildrensStories_v13D
15 | ChildrensStories_v1SemiReal
16 | ChildrensStories_v1ToonAnime
17 | Counterfeit_v30
18 | Cuteyukimixadorable_midchapter3
19 | Cyberrealistic_v33
20 | Dalcefo_v4
21 | Deliberate_v2
22 | Deliberate_v3
23 | Dreamlike-anime-1.0
24 | Dreamlike-diffusion-1.0
25 | Dreamlike-photoreal-2.0
26 | Dreamshaper_6BakedVae
27 | Dreamshaper_7
28 | Dreamshaper_8
29 | Edgeofrealism_eorV20
30 | Eimisanimediffusion_v1
31 | Elldreths-vivid-mix
32 | Epicphotogasm_xplusplus
33 | Epicrealism_naturalsinrc1vae
34 | Epicrealism_pureevolutionv3
35 | Icantbelieveitsnotphotography_seco
36 | Indigofurrymix_v75hybrid
37 | Juggernaut_aftermath
38 | Lofi_v4
39 | Lyriel_v16
40 | Majicmixrealistic_v4
41 | Mechamix_v10
42 | Meinamix_meinav9
43 | Meinamix_meinav11
44 | Neverendingdream_v122
45 | Openjourney_v4
46 | Pastelmixstylizedanime_pruned_fp16
47 | Portraitplus_v1.0
48 | Protogenx34
49 | Realistic_vision_v1.4-pruned-fp16
50 | Realistic_vision_v2.0
51 | Realistic_vision_v4.0
52 | Realistic_vision_v5.0
53 | Redshift_diffusion-v10
54 | Revanimated_v122
55 | Rundiffusionfx25d_v10
56 | Rundiffusionfx_v10
57 | Sdv1_4
58 | V1-5-pruned-emaonly
59 | V1-5-inpainting
60 | Shoninsbeautiful_v10
61 | Theallys-mix-ii-churned
62 | Timeless-1.0
63 | Toonyou_beta6`
    }
  },

  onStart: async function ({ message, args, event, api }) {
    try {
      const info = args.join(' ');
      const [prompt, model] = info.split('|').map(item => item.trim());
      const text = args.join (" ");
      if (!text) {
        return message.reply("Add something baka.");
      }
      const modelParam = model || '35';
      const apiUrl = `https://rehatdesu.xyz/api/imagine/prodia?prompt=${prompt}&model=${modelParam}&apikey=rehat666`;

      await message.reply('Please Wait...⏳');
      const form = {
      };
      form.attachment = [];
      form.attachment[0] = await global.utils.getStreamFromURL(apiUrl);

      message.reply(form);
    } catch (error) {
      console.error(error);
      await message.reply('❌ | Sorry, API Have Skill Issue');
    }
  }
};

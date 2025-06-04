export interface ProjectFile {
  name: string
  path: string
  type: 'image' | 'download'
  extension: string
  r18?: boolean
  cropPosition?: 'top' | 'center'
}

export interface Project {
  id: string
  title: string
  author: string
  date: string
  folderName: string
  images: ProjectFile[]
  downloadFiles: ProjectFile[]
  layout?: 'vertical' | 'horizontal' | 'all'
}

// Static project data - automatically generated from assets directory
// To update this data, run: node scripts/generateProjectIndex.js
export const PROJECTS: Project[] = [
  {
    id: '20250505_眼睛條',
    title: '眼睛條',
    author: '涼風千秋',
    date: '2025/05/05',
    folderName: '20250505_眼睛條',
    images: [
      {
        name: 'mmexport1746361927364.jpg',
        path: '/assets/character/20250505_眼睛條/mmexport1746361927364.jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20250326_廢墟桌布',
    title: '廢墟桌布',
    author: '涼風千秋',
    date: '2025/03/26',
    folderName: '20250326_廢墟桌布',
    images: [
      {
        name: 'c49c(1).png',
        path: '/assets/character/20250326_廢墟桌布/c49c(1).jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20250325_黑白小漫畫',
    title: '黑白小漫畫',
    author: '涼風千秋',
    date: '2025/03/25',
    folderName: '20250325_黑白小漫畫',
    images: [
      {
        name: 'Fj8QtHI798KOHt95sC2ExbyiyUA3_3013-1.png',
        path: '/assets/character/20250325_黑白小漫畫/Fj8QtHI798KOHt95sC2ExbyiyUA3_3013-1.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20250322_油畫桌布',
    title: '油畫桌布',
    author: '涼風千秋',
    date: '2025/03/22',
    folderName: '20250322_油畫桌布',
    images: [
      {
        name: '1.png',
        path: '/assets/character/20250322_油畫桌布/1.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '2.png',
        path: '/assets/character/20250322_油畫桌布/2.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20250127_抱枕',
    title: '抱枕',
    author: '涼風千秋',
    date: '2025/01/27',
    folderName: '20250127_抱枕',
    images: [
      {
        name: '冬天1 成图0.png',
        path: '/assets/character/20250127_抱枕/冬天1 成图0.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
      {
        name: '冬天1改.png',
        path: '/assets/character/20250127_抱枕/冬天1改.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
      {
        name: '冬天2 成图.png',
        path: '/assets/character/20250127_抱枕/冬天2 成图.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
      {
        name: '冬天2 成图00.png',
        path: '/assets/character/20250127_抱枕/冬天2 成图00.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
      {
        name: '冬天2改.png',
        path: '/assets/character/20250127_抱枕/冬天2改.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
    ],
    downloadFiles: [],
    layout: 'vertical',
  },
  {
    id: '20250123_废墟',
    title: '废墟',
    author: '涼風千秋',
    date: '2025/01/23',
    folderName: '20250123_废墟',
    images: [
      {
        name: '2x-2.jpeg',
        path: '/assets/character/20250123_废墟/2x-2.jpeg',
        type: 'image',
        extension: '.jpeg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20250123_テトリス',
    title: 'テトリス',
    author: '涼風千秋',
    date: '2025/01/23',
    folderName: '20250123_テトリス',
    images: [
      {
        name: 'ezgif.com-crop.gif',
        path: '/assets/character/20250123_テトリス/ezgif.com-crop.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: '描改1.png',
        path: '/assets/character/20250123_テトリス/描改1.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改10.png',
        path: '/assets/character/20250123_テトリス/描改10.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改11.png',
        path: '/assets/character/20250123_テトリス/描改11.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改12.png',
        path: '/assets/character/20250123_テトリス/描改12.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改2.png',
        path: '/assets/character/20250123_テトリス/描改2.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改3.png',
        path: '/assets/character/20250123_テトリス/描改3.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改4.png',
        path: '/assets/character/20250123_テトリス/描改4.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改5.png',
        path: '/assets/character/20250123_テトリス/描改5.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改6.png',
        path: '/assets/character/20250123_テトリス/描改6.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改7.png',
        path: '/assets/character/20250123_テトリス/描改7.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改8.png',
        path: '/assets/character/20250123_テトリス/描改8.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '描改9.png',
        path: '/assets/character/20250123_テトリス/描改9.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20250120_Minecraft',
    title: 'Minecraft',
    author: '涼風千秋',
    date: '2025/01/20',
    folderName: '20250120_Minecraft',
    images: [
      {
        name: 'Screenshot_2025-01-20-01-40-04-362_com.africasunrise.skinseed.jpg',
        path: '/assets/character/20250120_Minecraft/Screenshot_2025-01-20-01-40-04-362_com.africasunrise.skinseed.jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [
      {
        name: 'SkinseedSkin_1737430172350.png',
        path: '/assets/character/20250120_Minecraft/SkinseedSkin_1737430172350.png',
        type: 'image',
        extension: '.png',
      },
    ],
    layout: 'horizontal',
  },
  {
    id: '20240601_ 瀬世ナギ_泳裝',
    title: '泳裝',
    author: '瀬世ナギ',
    date: '2024/06/01',
    folderName: '20240601_瀬世ナギ_泳裝',
    images: [
      {
        name: '1.jpg',
        path: '/assets/character/20240601_瀬世ナギ_泳裝/1.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
      {
        name: '2.jpg',
        path: '/assets/character/20240601_瀬世ナギ_泳裝/2.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
      {
        name: '3.jpg',
        path: '/assets/character/20240601_瀬世ナギ_泳裝/3.jpg',
        type: 'image',
        extension: '.jpg',
        cropPosition: 'top',
      },
    ],
    downloadFiles: [],
    layout: 'vertical',
  },
  {
    id: '20240329_SinnraArt_平塗立繪',
    title: '平塗立繪',
    author: 'SinnraArt',
    date: '2024/03/29',
    folderName: '20240329_SinnraArt_平塗立繪',
    images: [
      {
        name: '千秋大小姐_去背立繪.png',
        path: '/assets/character/20240329_SinnraArt_平塗立繪/千秋大小姐_去背立繪.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '千秋大小姐_立繪.png',
        path: '/assets/character/20240329_SinnraArt_平塗立繪/千秋大小姐_立繪.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'vertical',
  },
  {
    id: '20231226_動態貼圖',
    title: '動態貼圖',
    author: '涼風千秋',
    date: '2023/12/26',
    folderName: '20231226_動態貼圖',
    images: [
      {
        name: '01-2.png',
        path: '/assets/character/20231226_動態貼圖/01-2.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '01-3.png',
        path: '/assets/character/20231226_動態貼圖/01-3.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '01-4.png',
        path: '/assets/character/20231226_動態貼圖/01-4.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '01.png',
        path: '/assets/character/20231226_動態貼圖/01.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '02-2.png',
        path: '/assets/character/20231226_動態貼圖/02-2.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '02.png',
        path: '/assets/character/20231226_動態貼圖/02.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '03.png',
        path: '/assets/character/20231226_動態貼圖/03.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '04.png',
        path: '/assets/character/20231226_動態貼圖/04.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '05.png',
        path: '/assets/character/20231226_動態貼圖/05.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '06-2.png',
        path: '/assets/character/20231226_動態貼圖/06-2.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '06-3.png',
        path: '/assets/character/20231226_動態貼圖/06-3.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '06.png',
        path: '/assets/character/20231226_動態貼圖/06.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '07.png',
        path: '/assets/character/20231226_動態貼圖/07.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '08-2.png',
        path: '/assets/character/20231226_動態貼圖/08-2.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '08-3.png',
        path: '/assets/character/20231226_動態貼圖/08-3.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '08.png',
        path: '/assets/character/20231226_動態貼圖/08.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '09.png',
        path: '/assets/character/20231226_動態貼圖/09.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '10.png',
        path: '/assets/character/20231226_動態貼圖/10.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '10F.png',
        path: '/assets/character/20231226_動態貼圖/10F.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '11.png',
        path: '/assets/character/20231226_動態貼圖/11.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '12.png',
        path: '/assets/character/20231226_動態貼圖/12.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '13.png',
        path: '/assets/character/20231226_動態貼圖/13.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '14.png',
        path: '/assets/character/20231226_動態貼圖/14.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '15.png',
        path: '/assets/character/20231226_動態貼圖/15.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '16.png',
        path: '/assets/character/20231226_動態貼圖/16.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20231214_亞莓生日賀圖',
    title: '亞莓生日賀圖',
    author: '涼風千秋',
    date: '2023/12/14',
    folderName: '20231214_亞莓生日賀圖',
    images: [
      {
        name: '2024千秋生日賀圖-完稿-光線2.png',
        path: '/assets/character/20231214_亞莓生日賀圖/2024千秋生日賀圖-完稿-光線2.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '2024千秋生日賀圖-完稿.png',
        path: '/assets/character/20231214_亞莓生日賀圖/2024千秋生日賀圖-完稿.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '2024千秋生日賀圖16-9.jpg',
        path: '/assets/character/20231214_亞莓生日賀圖/2024千秋生日賀圖16-9.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: '2024千秋生日賀圖服裝設計.png',
        path: '/assets/character/20231214_亞莓生日賀圖/2024千秋生日賀圖服裝設計.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '去背景.png',
        path: '/assets/character/20231214_亞莓生日賀圖/去背景.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20231128_游標像素',
    title: '游標像素',
    author: '涼風千秋',
    date: '2023/11/28',
    folderName: '20231128_游標像素',
    images: [
      {
        name: '123x123.gif',
        path: '/assets/character/20231128_游標像素/123x123.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: '32x32.png',
        path: '/assets/character/20231128_游標像素/32x32.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: 'normal.gif',
        path: '/assets/character/20231128_游標像素/normal.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: 'normal_slow.gif',
        path: '/assets/character/20231128_游標像素/normal_slow.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: 'with_cursor.gif',
        path: '/assets/character/20231128_游標像素/with_cursor.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: 'with_cursor_jump.gif',
        path: '/assets/character/20231128_游標像素/with_cursor_jump.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: 'with_star.gif',
        path: '/assets/character/20231128_游標像素/with_star.gif',
        type: 'image',
        extension: '.gif',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20230906_飄貓_迷你像素gif',
    title: '迷你像素gif',
    author: '飄貓',
    date: '2023/09/06',
    folderName: '20230906_飄貓_迷你像素gif',
    images: [
      {
        name: '317c.gif',
        path: '/assets/character/20230906_飄貓_迷你像素gif/317c.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: '317ct-crop.gif',
        path: '/assets/character/20230906_飄貓_迷你像素gif/317ct-crop.gif',
        type: 'image',
        extension: '.gif',
      },
      {
        name: '317ct.gif',
        path: '/assets/character/20230906_飄貓_迷你像素gif/317ct.gif',
        type: 'image',
        extension: '.gif',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20230726_鳳梨_黏土人',
    title: '黏土人',
    author: '鳳梨',
    date: '2023/07/26',
    folderName: '20230726_鳳梨_黏土人',
    images: [
      {
        name: '200c85f34b132fab262496810a1569c8.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/200c85f34b132fab262496810a1569c8.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: '90b84b75820f587f1cafe0c4dd54f6a3.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/90b84b75820f587f1cafe0c4dd54f6a3.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: 'a47ed5ab02dc6b55fb0e5ab0e968ae3a.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/a47ed5ab02dc6b55fb0e5ab0e968ae3a.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: 'ab493e682a40349bd0ebab28193ce256.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/ab493e682a40349bd0ebab28193ce256.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: 'afb8ab647819391d20157cadccff7606.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/afb8ab647819391d20157cadccff7606.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: 'b62dc33497fcd49f4216385de6557821.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/b62dc33497fcd49f4216385de6557821.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: 'c77250b15a277caaf5a89e3cd8bf131d.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/c77250b15a277caaf5a89e3cd8bf131d.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: 'd38f47a6aca43705a87dbcd5f576aeec.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/d38f47a6aca43705a87dbcd5f576aeec.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: 'f91bd2b32eadbe70b6ebe8b26d7bc98e.jpg',
        path: '/assets/character/20230726_鳳梨_黏土人/f91bd2b32eadbe70b6ebe8b26d7bc98e.jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20230614_shONe',
    title: 'shONe',
    author: '涼風千秋',
    date: '2023/06/14',
    folderName: '20230614_shONe',
    images: [
      {
        name: '202306142026-transparent.png',
        path: '/assets/character/20230614_shONe/202306142026-transparent.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '202306142026.jpg',
        path: '/assets/character/20230614_shONe/202306142026.jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [],
    layout: 'vertical',
  },
  {
    id: '20230215_NAiK_NSFW',
    title: 'NSFW',
    author: 'NAiK',
    date: '2023/02/15',
    folderName: '20230215_NAiK_NSFW',
    images: [
      {
        name: 'no-glasses_R18.png',
        path: '/assets/character/20230215_NAiK_NSFW/no-glasses_R18.png',
        type: 'image',
        extension: '.png',
        r18: true,
      },
      {
        name: 'output_R18.png',
        path: '/assets/character/20230215_NAiK_NSFW/output_R18.png',
        type: 'image',
        extension: '.png',
        r18: true,
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20221022_庸庸系_卡面圖',
    title: '卡面圖',
    author: '庸庸系',
    date: '2022/10/22',
    folderName: '20221022_庸庸系_卡面圖',
    images: [
      {
        name: '卡面圖.jpg',
        path: '/assets/character/20221022_庸庸系_卡面圖/卡面圖.jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20220920_ELLu_Q版',
    title: 'Q版',
    author: 'ELLu',
    date: '2022/09/20',
    folderName: '20220920_ELLu_Q版',
    images: [
      {
        name: '完稿.png',
        path: '/assets/character/20220920_ELLu_Q版/完稿.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '完稿_嘴巴小.png',
        path: '/assets/character/20220920_ELLu_Q版/完稿_嘴巴小.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '未命名作品-2.png',
        path: '/assets/character/20220920_ELLu_Q版/未命名作品-2.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '未命名作品-3.png',
        path: '/assets/character/20220920_ELLu_Q版/未命名作品-3.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: '未命名作品-4.png',
        path: '/assets/character/20220920_ELLu_Q版/未命名作品-4.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '未命名作品-5.png',
        path: '/assets/character/20220920_ELLu_Q版/未命名作品-5.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '未命名作品.png',
        path: '/assets/character/20220920_ELLu_Q版/未命名作品.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20220916_BYO',
    title: 'BYO',
    author: '涼風千秋',
    date: '2022/09/16',
    folderName: '20220916_BYO',
    images: [
      {
        name: '涼風千秋車圖組合包完稿_R18.jpg',
        path: '/assets/character/20220916_BYO/涼風千秋車圖組合包完稿_R18.jpg',
        type: 'image',
        extension: '.jpg',
        r18: true,
      },
      {
        name: '涼風千秋車圖組合包打碼_R18.jpg',
        path: '/assets/character/20220916_BYO/涼風千秋車圖組合包打碼_R18.jpg',
        type: 'image',
        extension: '.jpg',
        r18: true,
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20220812_shONe',
    title: 'shONe',
    author: '涼風千秋',
    date: '2022/08/12',
    folderName: '20220812_shONe',
    images: [
      {
        name: '202208012129_step3_fix202209112338_v2.png',
        path: '/assets/character/20220812_shONe/202208012129_step3_fix202209112338_v2.png',
        type: 'image',
        extension: '.png',
        cropPosition: 'top',
      },
      {
        name: '202208012129_step3_fix202209112338_v1.png',
        path: '/assets/character/20220812_shONe/202208012129_step3_fix202209112338_v1.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '202208012129_step3_version2_v1_R18.png',
        path: '/assets/character/20220812_shONe/202208012129_step3_version2_v1_R18.png',
        type: 'image',
        extension: '.png',
        r18: true,
      },
      {
        name: '202208012129_step3_version2_v2_R18.png',
        path: '/assets/character/20220812_shONe/202208012129_step3_version2_v2_R18.png',
        type: 'image',
        extension: '.png',
        r18: true,
      },
      {
        name: '202208012129_step3_version3_v1_R18.png',
        path: '/assets/character/20220812_shONe/202208012129_step3_version3_v1_R18.png',
        type: 'image',
        extension: '.png',
        r18: true,
      },
      {
        name: '202208012129_step3_version3_v2_R18.png',
        path: '/assets/character/20220812_shONe/202208012129_step3_version3_v2_R18.png',
        type: 'image',
        extension: '.png',
        r18: true,
      },
    ],
    downloadFiles: [],
    layout: 'vertical',
  },
  {
    id: '20220810_夏伊',
    title: '夏伊',
    author: '涼風千秋',
    date: '2022/08/10',
    folderName: '20220810_夏伊',
    images: [
      {
        name: '夏伊_花花完稿.png',
        path: '/assets/character/20220810_夏伊/夏伊_花花完稿.png',
        type: 'image',
        extension: '.png',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20220703_rizu_頭貼',
    title: '頭貼',
    author: 'rizu',
    date: '2022/07/03',
    folderName: '20220703_rizu_頭貼',
    images: [
      {
        name: '頭貼-去背.png',
        path: '/assets/character/20220703_rizu_頭貼/頭貼-去背.png',
        type: 'image',
        extension: '.png',
      },
      {
        name: '頭貼.jpeg',
        path: '/assets/character/20220703_rizu_頭貼/頭貼.jpeg',
        type: 'image',
        extension: '.jpeg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '20200622_咩替_打歌服設計',
    title: '打歌服設計',
    author: '咩替',
    date: '2020/06/22',
    folderName: '20200622_咩替_打歌服設計',
    images: [
      {
        name: '咩替_打歌服設計_格子.jpg',
        path: '/assets/character/20200622_咩替_打歌服設計/咩替_打歌服設計_格子.jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
  {
    id: '0_亞莓官方圖',
    title: '亞莓官方圖',
    author: '涼風千秋',
    date: '0',
    folderName: '0_亞莓官方圖',
    images: [
      {
        name: '大頭.jpg',
        path: '/assets/character/0_亞莓官方圖/大頭.jpg',
        type: 'image',
        extension: '.jpg',
      },
      {
        name: '大頭2.jpg',
        path: '/assets/character/0_亞莓官方圖/大頭2.jpg',
        type: 'image',
        extension: '.jpg',
      },
    ],
    downloadFiles: [],
    layout: 'horizontal',
  },
]

/**
 * Get all projects sorted by date (newest first)
 */
export function getAllProjects(): Project[] {
  return [...PROJECTS].sort((a, b) => {
    // Use simple string comparison to ensure consistent sorting across server and client
    // This avoids hydration mismatches caused by locale-dependent sorting
    if (a.id > b.id) return -1
    if (a.id < b.id) return 1
    return 0
  })
}

/**
 * Get project by ID
 */
export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((project) => project.id === id)
}

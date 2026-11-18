import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'content','EMFD_Kompositionsgeschichten_v0.4.md'),'utf8').replace(/\r\n/g,'\n');
const sections=[...source.matchAll(/^## (O\d{2}) · (.+)\n([\s\S]*?)(?=^## O\d{2} · |\n---\s*$)/gm)];
if(sections.length!==24)throw new Error(`Erwartet: 24 Geschichten; gefunden: ${sections.length}`);

const stories=sections.map((match,index)=>{
  const [,cardId,title,raw]=match;
  const category=raw.match(/^\*\*Kategorie:\*\*\s*(.+)$/m)?.[1]?.trim();
  const editorialLabel=raw.match(/^\*\*Redaktionsstatus:\*\*\s*ENTWURF\s+([AB])\s*$/m)?.[1];
  const textVersion=raw.match(/^\*\*Textversion:\*\*\s*(.+)$/m)?.[1]?.trim();
  const subtitle=raw.match(/^\*([^*\n]+)\*$/m)?.[1]?.trim();
  const subtitleEnd=raw.indexOf(`*${subtitle}*`)+subtitle.length+2;
  const body=raw.slice(subtitleEnd).trim().replace(/\n---\s*$/,'').trim();
  if(!category||!editorialLabel||!textVersion||!subtitle||!body)throw new Error(`Unvollständige Metadaten: ${cardId}`);
  return {
    cardId,title:title.trim(),subtitle,category,body,textVersion,
    editorialStatus:editorialLabel==='A'?'draft_a':'draft_b',
    publicationStatus:'draft',illustrationId:`KG-${cardId}`,
    cardImageId:cardId,audioId:cardId,updatedAt:'2026-11-03',order:index+1
  };
});

const data={
  schemaVersion:'1.0',contentVersion:'v0.4',source:'EMFD_Kompositionsgeschichten_v0.4.md',
  publicationStatus:'draft',updatedAt:'2026-11-03',stories
};
const media={
  schemaVersion:'1.0',contentVersion:'v0.4',illustrationStatus:'pending',
  fallbackPolicy:'original-card',updatedAt:'2026-11-03',
  illustrations:stories.map(story=>({
    illustrationId:story.illustrationId,cardId:story.cardId,status:'pending',
    masterPath:null,webPath:null,fallbackCardImageId:story.cardImageId,
    fallbackPath:`../media/cards/${story.cardImageId}.png`,
    alt:`Temporäre Vorschau mit der unveränderten Originalkarte ${story.cardId}: ${story.title}.`
  }))
};
fs.writeFileSync(path.join(root,'composition-stories.json'),JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(path.join(root,'composition-story-media.json'),JSON.stringify(media,null,2)+'\n');

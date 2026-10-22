/**
 * The VirtualDJ script catalog. Every command the app sends is a template here, so changing what is read
 * means editing this file, not the code. `{i}` and `{n}` are placeholders filled in by `fill()`.
 */
export interface ScriptTemplates {
   /** Elapsed time of the master deck in milliseconds. */
   elapsedMs: string;
   /** Song length in seconds. */
   lengthSec: string;
   title: string;
   playing: string;

   listCount: string;
   listSelect: string;
   listTitle: string;
   listArtist: string;
   listLengthSec: string;

   cueCount: string;
   cueName: string;
   cuePosMs: string;

   automixCount: string;
   automixPosition: string;
   automixPath: string;
   automixArtist: string;
   automixTitle: string;
   automixRemix: string;
   automixLength: string;
   automixKey: string;
}

export const defaultScripts: ScriptTemplates = {
   // 'elapsed' is required: plain get_time follows the deck's display mode and returns REMAINING time
   // when VirtualDJ shows remain. The argument bypasses that setting.
   elapsedMs: 'deck master get_time elapsed',
   lengthSec: 'deck master get_songlength',
   title: "deck master get_loaded_song 'title'",
   playing: 'deck master play',

   listCount: 'browser_count',
   listSelect: 'browser_gotoitem {i}',
   listTitle: "get_browsed_song 'title'",
   listArtist: "get_browsed_song 'artist'",
   listLengthSec: "get_browsed_song 'length'",

   cueCount: 'deck master get_cue_count',
   cueName: 'deck master cue_name {n}',
   cuePosMs: 'deck master cue_pos {n}',

   automixCount: 'file_count automix',
   automixPosition: 'get_automix_position',
   automixPath: "get_automix_song 'fullpath' {i}",
   automixArtist: "get_automix_song 'artist' {i}",
   automixTitle: "get_automix_song 'title' {i}",
   automixRemix: "get_automix_song 'remix' {i}",
   automixLength: "get_automix_song 'length' {i}",
   automixKey: "get_automix_song 'key' {i}",
};

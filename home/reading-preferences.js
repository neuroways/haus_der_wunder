/* Runs before CSS paints, avoiding a font-size jump when a reader setting is saved. */
(function(root){
 try{
  const value=root.localStorage?.getItem('emfd.reading.size.v1');
  if(value===null||value===undefined)return;
  const step=Number(value),sizes=[16,18,20,23,26];
  if(Number.isInteger(step)&&step>=0&&step<sizes.length)
   document.documentElement.style.setProperty('--book-font-size',sizes[step]/16+'rem');
 }catch{}
})(globalThis);
